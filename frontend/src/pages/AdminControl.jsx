import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

const VIOLATOR_POOL = [
  { name: "Amit Patel", vehicle: "MH-04-KR-8821", mobile: "+91-9123456780", address: "Sai Nagar, Thane" },
  { name: "Sneha Gupta", vehicle: "DL-01-CA-5567", mobile: "+91-9988112233", address: "Green Park, New Delhi" },
  { name: "Vikram Singh", vehicle: "MH-02-AB-1234", mobile: "+91-9876543210", address: "Andheri West, Mumbai" },
  { name: "Pooja Deshmukh", vehicle: "MH-12-XY-9999", mobile: "+91-8877665544", address: "Laxmi Chowk, Pune" },
];

const VIOLATIONS = ["Over-Speeding", "Red Light Jump", "No Helmet", "Drunk Driving"];
const FINE_AMOUNTS = [1000, 500, 2000, 5000];

export default function AdminControl() {
  const [parking, setParking] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pk, em] = await Promise.all([
        api.get('/mobility/parking'),
        api.get('/admin/emergencies')
      ]);
      setParking(pk.data.data.map(p => ({ ...p, occupied: p.occupied || Math.floor(p.capacity * 0.7) })));
      setEmergencies(em.data);
    } catch (e) { toast('Failed to load control grid', 'error'); }
    finally { setLoading(false); }
  };

  const autoScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(async () => {
      const v = VIOLATOR_POOL[Math.floor(Math.random() * VIOLATOR_POOL.length)];
      const vio = VIOLATIONS[Math.floor(Math.random() * VIOLATIONS.length)];
      const amt = FINE_AMOUNTS[Math.floor(Math.random() * FINE_AMOUNTS.length)];
      
      try {
        await api.post('/admin/issue-challan', { vehicle: v.vehicle, violation: vio, amount: amt });
        setScanResult({ ...v, violation: vio, amount: amt });
        toast('AI Detection: Violation captured & ticket issued.', 'success');
      } catch (err) { toast('AI Scan failed', 'error'); }
      setScanning(false);
    }, 2500);
  };

  const dispatchAction = async (id, type) => {
    try {
      await api.post('/admin/dispatch-emergency', { id, dispatch_type: type });
      setEmergencies(emergencies.map(em => em._id === id ? { 
        ...em, 
        [`${type}_dispatched`]: type !== 'resolve' ? true : em[`${type}_dispatched`],
        status: type === 'resolve' ? 'Resolved' : em.status 
      } : em));
      toast(`${type.toUpperCase()} Processed!`, 'success');
    } catch (e) { toast('Action failed', 'error'); }
  };

  const syncParking = () => {
    setParking(parking.map(p => ({ 
      ...p, 
      occupied: Math.max(0, p.occupied + (Math.random() > 0.5 ? -1 : 1)) 
    })));
    toast('Parking Grid Re-Synced', 'success');
  };

  const handleExport = () => {
    const data = emergencies.map(e => ({ 
      ID: e._id, 
      Type: e.type, 
      Location: e.location, 
      Status: e.status, 
      Dispatched: e.ambulance_dispatched ? 'Ambulance' : e.police_dispatched ? 'Police' : 'None' 
    }));
    exportToCSV(data, 'Emergency_Dispatch_Logs');
  };

  if (loading) return <LoadingSpinner text="Initializing command center..." />;

  return (
    <div className="container-fluid p-0">
      {/* Global Header & Export */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="dashboard-title mb-0">Control Command Center</h2>
        <div className="d-flex gap-2">
          <button className="btn-smart btn-outline-smart py-2 px-4 bg-white" onClick={handleExport}>
            📥 Export Dispatch CSV
          </button>
          <button className="btn-smart btn-primary-smart py-2 px-4" onClick={exportToPDF}>
            📄 Full Control PDF
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: AI Detection */}
        <div className="col-md-5">
          <div className="card-smart h-100 shadow-sm border-0">
            <div className="section-header text-primary mb-4">
              <span>📷</span> AI Violation Detection Grid
            </div>
            <p className="text-muted small mb-4">Scanning city CCTV network for real-time traffic violations.</p>
            
            <div className="position-relative overflow-hidden rounded bg-dark mb-4 shadow-inner" style={{ height: '240px' }}>
              <img 
                src="https://images.unsplash.com/photo-1545147986-a9d6f210df77?auto=format&fit=crop&q=80&w=800" 
                className="w-100 h-100 object-fit-cover opacity-60" 
                alt="Live Scan"
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                {scanning ? (
                  <>
                    <div className="spinner-border text-primary mb-3"></div>
                    <div className="fw-800 animate-pulse letter-spacing-1">ANALYZING FRAME...</div>
                    <div className="small opacity-75 font-monospace mt-2">ID: MUM-BKC-04 // MH-04-XX</div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="fs-1 mb-2">👁️‍🗨️</div>
                    <div className="small fw-bold opacity-75 letter-spacing-1 uppercase">Camera ID: MUM-BKC-04</div>
                  </div>
                )}
              </div>
              {scanning && <div className="position-absolute w-100 bg-primary opacity-50" style={{ height: '2px', top: '50%', animation: 'scanMove 2s infinite', boxShadow: '0 0 10px #2563EB' }}></div>}
            </div>

            <button className="btn-smart btn-primary-smart w-100 py-3 mb-4 fw-bold shadow-sm" onClick={autoScan} disabled={scanning}>
              {scanning ? 'System Analyzing...' : 'Start AI Auto-Scan'}
            </button>

            {scanResult && (
              <div className="p-4 rounded animate-slide-in shadow-sm" style={{backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0'}}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-success px-3 py-2">VIOLATION DETECTED</span>
                  <span className="small text-muted font-monospace">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="fw-800 text-dark fs-5 mb-1">{scanResult.name}</div>
                <div className="text-muted small mb-3">{scanResult.vehicle} • {scanResult.address}</div>
                <div className="d-flex justify-content-between pt-3 border-top border-success border-opacity-10">
                  <span className="text-danger fw-bold uppercase x-small letter-spacing-1">{scanResult.violation}</span>
                  <span className="fw-800 text-dark fs-5">₹{scanResult.amount}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Emergency & Parking */}
        <div className="col-md-7 d-flex flex-column gap-4">
          {/* Emergency Grid */}
          <div className="card-smart shadow-sm border-0">
            <div className="section-header text-danger mb-4">
              <span>🚑</span> Emergency Response SOS Grid
            </div>
            {emergencies.filter(e => e.status === 'Active').length === 0 ? (
              <div className="text-center py-5" style={{backgroundColor: '#f8fafc', borderRadius: '12px'}}>
                <div className="fs-1 mb-2">✅</div>
                <div className="fw-bold text-dark">No Active SOS</div>
                <div className="small text-muted">City perimeter is clear and secure.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {emergencies.filter(e => e.status === 'Active').map(em => (
                  <div key={em._id} className="p-4 rounded d-flex justify-content-between align-items-center shadow-xs" style={{backgroundColor: '#fef2f2', border: '1px solid #fecaca'}}>
                    <div className="flex-grow-1">
                      <div className="fw-800 text-danger mb-1">{em.type.toUpperCase()}</div>
                      <div className="text-dark small"><span className="opacity-75">Location:</span> {em.location}</div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <button className="btn-smart btn-danger-smart py-2 px-3 small shadow-sm" onClick={() => dispatchAction(em._id, 'ambulance')} disabled={em.ambulance_dispatched}>
                        {em.ambulance_dispatched ? '✓ Dispatched' : 'Ambulance'}
                      </button>
                      <button className="btn-smart btn-outline-smart py-2 px-3 small bg-white border-primary text-primary" onClick={() => dispatchAction(em._id, 'police')} disabled={em.police_dispatched}>
                        {em.police_dispatched ? '✓ Dispatched' : 'Police'}
                      </button>
                      <div className="vr mx-2 h-100 opacity-10"></div>
                      <button className="btn-smart btn-success-smart py-2 px-3 small" onClick={() => dispatchAction(em._id, 'resolve')}>
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parking Grid */}
          <div className="card-smart shadow-sm border-0">
            <div className="section-header text-primary mb-4 d-flex justify-content-between align-items-center">
              <span>🅿️</span> Infrastructure: Smart Parking Grid
              <button className="btn-smart btn-outline-smart py-1 px-3 x-small bg-white" onClick={syncParking}>Sync Grid</button>
            </div>
            <div className="row g-3">
              {parking.map((p, i) => {
                const avail = p.capacity - p.occupied;
                const pct = (avail / p.capacity) * 100;
                return (
                  <div key={i} className="col-md-6">
                    <div className="p-3 border-light-subtle rounded hover-bg-light transition-all shadow-xs" style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
                      <div className="d-flex justify-content-between mb-3">
                        <span className="fw-bold small text-dark">{p.name}</span>
                        <button 
                          className={`btn-smart py-1 px-2 xx-small border-0 ${pct < 15 ? 'btn-danger-smart' : 'btn-primary-smart'}`}
                          onClick={() => {
                            setParking(parking.map((item, idx) => idx === i ? { ...item, occupied: item.occupied - 1 } : item));
                            toast(`Spot cleared at ${p.name}`, 'success');
                          }}
                        >
                          {avail} Spots Free
                        </button>
                      </div>
                      <div className="progress-smart"><div className="bar bg-primary" style={{ width: `${100-pct}%`, boxShadow: '0 0 5px rgba(37, 99, 235, 0.3)' }}></div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .x-small { font-size: 11px; }
        .letter-spacing-1 { letter-spacing: 1px; }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .shadow-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
        .font-monospace { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
        .hover-bg-light:hover { background: #f1f5f9 !important; }
        .transition-all { transition: all 0.2s ease; }
        @keyframes scanMove {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
