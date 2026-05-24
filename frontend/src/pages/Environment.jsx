import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Environment() {
  const [aqiData, setAqiData] = useState([]);
  const [heatIslands, setHeatIslands] = useState([]);
  const [wasteBins, setWasteBins] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aq, hi, wb] = await Promise.all([
        api.get('/environment/aqi'),
        api.get('/environment/heat-islands'),
        api.get('/environment/waste-bins')
      ]);
      setAqiData(aq.data.data);
      setHeatIslands(hi.data.data);
      setWasteBins(wb.data.data);
    } catch (e) { console.error(e); }
  };

  const getAqiColor = (val) => {
    if (val <= 50) return 'text-success';
    if (val <= 100) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="dashboard-title text-success">🌿 Environment & AQI Dashboard</h2>
        <button className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#incidentModal">
          ⚠️ Report Incident
        </button>
      </div>

      <div className="row g-4 mb-4">
        {/* AQI Monitoring */}
        {aqiData.map((d, i) => (
          <div key={i} className="col-md-4">
            <div className="glass-card p-4 h-100 text-center">
              <h5 className="text-light">{d.zone}</h5>
              <div className={`display-3 fw-bold ${getAqiColor(d.aqi)}`}>{d.aqi}</div>
              <p className="text-muted mb-1">Current AQI</p>
              <div className="mt-3 p-2 rounded bg-dark border border-secondary">
                <small className="text-info">48h Forecast: {d.predicted_aqi_48h} AQI (LSTM)</small>
              </div>
              <div className="d-flex justify-content-between mt-3 text-muted small">
                <span>Temp: {d.temp}°C</span>
                <span>Noise: {d.noise_db} dB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Urban Heat Islands */}
        <div className="col-md-6">
          <div className="glass-card p-4 h-100 border-danger">
            <h5 className="text-light mb-3">🔥 Urban Heat Islands (Satellite Clustering)</h5>
            <ul className="list-group list-group-flush bg-transparent">
              {heatIslands.map((h, i) => (
                <li key={i} className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center">
                  <span>{h.zone}</span>
                  <div>
                    <span className="text-danger fw-bold me-3">{h.temp_anomaly}</span>
                    <span className={`badge ${h.status.includes('Critical') ? 'bg-danger' : 'bg-warning text-dark'}`}>{h.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Waste Management */}
        <div className="col-md-6">
          <div className="glass-card p-4 h-100 border-success">
            <h5 className="text-light mb-3">🗑️ Smart Waste Bin Fill-Levels</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover table-borderless bg-transparent">
                <thead><tr><th>Bin ID</th><th>Location</th><th>Fill Level</th></tr></thead>
                <tbody>
                  {wasteBins.map((b, i) => (
                    <tr key={i}>
                      <td>{b.id}</td>
                      <td>{b.location}</td>
                      <td>
                        <div className="progress bg-dark border border-secondary" style={{height: '20px'}}>
                          <div 
                            className={`progress-bar ${b.fill_percentage > 85 ? 'bg-danger' : 'bg-success'}`} 
                            style={{width: `${b.fill_percentage}%`}}
                          >{b.fill_percentage}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Modal */}
      <div className="modal fade" id="incidentModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content glass-card bg-dark text-light border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Report Civic Incident</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label>Incident Type</label>
                  <select className="form-select bg-dark text-light border-secondary">
                    <option>Pothole</option>
                    <option>Broken Streetlight</option>
                    <option>Water Leak</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label>Location</label>
                  <input type="text" className="form-control bg-dark text-light border-secondary" placeholder="E.g. Main St" />
                </div>
              </form>
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => alert("Incident Reported!")}>Submit Report</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
