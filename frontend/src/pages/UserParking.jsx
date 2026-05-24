import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import MapWidget from '../components/MapWidget';

export default function UserParking() {
  const [parking, setParking] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const pk = await api.get('/mobility/parking');
      setParking(pk.data.data.map(p => ({ ...p, occupied: p.occupied || Math.floor(p.capacity * 0.6) })));
    } catch (e) { toast('Parking data sync failed', 'error'); }
    finally { setLoading(false); }
  };

  const bookSpot = async (zone) => {
    try {
      await api.post('/user/book-parking', { zone });
      setParking(parking.map(p => p.name === zone ? { ...p, occupied: p.occupied + 1 } : p));
      toast(`Reservation confirmed at ${zone}! Ticket sent to mobile.`, 'success');
    } catch (e) { toast('Booking error. Zone may be full.', 'error'); }
  };

  if (loading) return <LoadingSpinner text="Finding available spots..." />;

  return (
    <div className="container-fluid p-0">
      <div className="row g-4">
        {/* Reservation Panel */}
        <div className="col-md-5">
          <div className="card-smart h-100">
            <div className="section-header">
              <span>🅿️</span> Smart Parking Reservation
            </div>
            <p className="text-muted small mb-4">Book a spot in advance to avoid congestion. AI predicts 85% occupancy in 30 minutes.</p>
            
            <div className="d-flex flex-column gap-3 mb-4">
              {parking.map((p, i) => {
                const avail = p.capacity - p.occupied;
                const pct = (avail / p.capacity) * 100;
                let status = 'Available';
                let color = 'success';
                if (avail === 0) { status = 'Full'; color = 'danger'; }
                else if (pct < 15) { status = 'Almost Full'; color = 'warning'; }

                return (
                  <div key={i} className="p-3 border rounded d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-dark">{p.name}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className={`badge-status badge-${color}`}>{status}</span>
                        <span className="text-muted x-small">{avail} / {p.capacity} spots free</span>
                      </div>
                    </div>
                    <button className={`btn-smart ${avail === 0 ? 'btn-outline-smart opacity-50' : 'btn-primary-smart'} py-1 px-4`} 
                            disabled={avail === 0} 
                            onClick={() => bookSpot(p.name)}>
                      {avail === 0 ? 'Closed' : 'Book'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-primary-light rounded">
              <div className="fw-bold text-primary small mb-1">💡 Smart Tip</div>
              <p className="text-dark small mb-0">Use "Andheri Station" parking for the lowest carbon footprint and fastest metro access.</p>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="col-md-7">
          <div className="card-smart h-100 p-0 overflow-hidden">
            <div className="p-4 map-header-smart d-flex justify-content-between align-items-center">
              <div className="section-header mb-0">
                <span>📍</span> Live Parking Map Grid
              </div>
              <div className="d-flex gap-2">
                <span className="badge-status badge-success">Open</span>
                <span className="badge-status badge-warning">Filling</span>
              </div>
            </div>
            <div style={{ height: 'calc(100% - 75px)' }}>
              <MapWidget parkingData={parking} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
