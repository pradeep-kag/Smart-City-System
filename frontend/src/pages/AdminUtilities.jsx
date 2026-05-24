import { useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { exportToCSV } from '../utils/exportUtils';

const INITIAL_WATER_SENSORS = [
  { id: 'W-101', loc: 'Dharavi Main', psi: 45, ph: 7.2, status: 'Stable' },
  { id: 'W-104', loc: 'Bandra Pipeline', psi: 12, ph: 6.8, status: 'Critical' },
  { id: 'W-202', loc: 'Worli Reservoir', psi: 38, ph: 7.1, status: 'Stable' },
];

const ENERGY_GRIDS = [
  { id: 'GRID-A', load: 92, theft: '0.4%', temp: '42°C', status: 'High Load' },
  { id: 'GRID-B', load: 45, theft: '2.1%', temp: '34°C', status: 'Stable' },
];

const INITIAL_WASTE_BINS = [
  { id: 'BIN-44', loc: 'Juhu Beach', fill: 88, status: 'Full' },
  { id: 'BIN-12', loc: 'Dadar Market', fill: 42, status: 'Normal' },
  { id: 'BIN-89', loc: 'BKC Plaza', fill: 15, status: 'Empty' },
];

export default function AdminUtilities() {
  const [activeTab, setActiveTab] = useState('water');
  const [waterSensors, setWaterSensors] = useState(INITIAL_WATER_SENSORS);
  const [wasteBins, setWasteBins] = useState(INITIAL_WASTE_BINS);
  const toast = useToast();

  const handleInspect = (id) => {
    toast(`Initiating remote inspection for ${id}... Technical diagnostic in progress.`, 'success');
  };

  const handleDispatch = (id) => {
    toast(`Dispatching collection truck to ${id}. Estimated Arrival: 12 mins.`, 'success');
    setWasteBins(wasteBins.map(b => b.id === id ? { ...b, fill: 0, status: 'Empty' } : b));
  };

  const handleExport = () => {
    let data = [];
    let filename = '';
    if (activeTab === 'water') {
      data = waterSensors;
      filename = 'Water_Network_Report';
    } else if (activeTab === 'energy') {
      data = ENERGY_GRIDS;
      filename = 'Energy_Grid_Report';
    } else {
      data = wasteBins;
      filename = 'Waste_Management_Report';
    }
    exportToCSV(data, filename);
    toast(`${filename} exported successfully.`, 'success');
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <button className={`btn-smart ${activeTab === 'water' ? 'btn-primary-smart' : 'btn-outline-smart'}`} onClick={() => setActiveTab('water')}>💧 Water</button>
          <button className={`btn-smart ${activeTab === 'energy' ? 'btn-primary-smart' : 'btn-outline-smart'}`} onClick={() => setActiveTab('energy')}>⚡ Energy</button>
          <button className={`btn-smart ${activeTab === 'waste' ? 'btn-primary-smart' : 'btn-outline-smart'}`} onClick={() => setActiveTab('waste')}>🗑️ Waste</button>
        </div>
        <button className="btn-smart btn-outline-smart py-2 px-4 shadow-xs bg-white" onClick={handleExport}>
          📥 Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} CSV
        </button>
      </div>

      <div className="row g-4">
        {/* Main Grid View */}
        <div className="col-md-8">
          <div className="card-smart h-100 shadow-sm border-0">
            <div className="section-header text-primary mb-4 d-flex justify-content-between align-items-center">
              <div>
                <span>{activeTab === 'water' ? '💧' : activeTab === 'energy' ? '⚡' : '🗑️'}</span> 
                Real-time {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Network Monitoring
              </div>
            </div>

            {activeTab === 'water' && (
              <div className="table-responsive">
                <table className="table-smart">
                  <thead>
                    <tr>
                      <th>Sensor ID</th>
                      <th>Location</th>
                      <th>Pressure (PSI)</th>
                      <th>pH Level</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterSensors.map(s => (
                      <tr key={s.id}>
                        <td className="fw-800 text-dark">{s.id}</td>
                        <td>{s.loc}</td>
                        <td className={s.psi < 20 ? 'text-danger fw-bold' : 'text-primary fw-600'}>{s.psi} PSI</td>
                        <td>{s.ph}</td>
                        <td><span className={`badge-status ${s.status === 'Critical' ? 'badge-danger' : 'badge-success'}`}>{s.status}</span></td>
                        <td><button className="btn-smart btn-outline-smart py-1 px-3 small" onClick={() => handleInspect(s.id)}>Inspect</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'energy' && (
              <div className="row g-4">
                {ENERGY_GRIDS.map(g => (
                  <div key={g.id} className="col-md-6">
                    <div className="p-4 rounded shadow-xs" style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
                      <div className="d-flex justify-content-between mb-4">
                        <h5 className="fw-800 mb-0 text-dark">{g.id}</h5>
                        <span className={`badge-status ${g.load > 90 ? 'badge-danger' : 'badge-success'}`}>{g.status}</span>
                      </div>
                      <div className="row g-3 mb-4">
                        <div className="col-6">
                          <div className="text-muted x-small uppercase fw-bold mb-1">Theft Probability</div>
                          <div className="fw-800 text-danger fs-5">{g.theft}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted x-small uppercase fw-bold mb-1">Core Temp</div>
                          <div className="fw-800 text-dark fs-5">{g.temp}</div>
                        </div>
                      </div>
                      <div className="mb-2 d-flex justify-content-between x-small fw-bold text-muted uppercase">
                        <span>Current Load</span>
                        <span>{g.load}%</span>
                      </div>
                      <div className="progress-smart"><div className={`bar ${g.load > 90 ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${g.load}%`, boxShadow: '0 0 5px rgba(37, 99, 235, 0.3)' }}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'waste' && (
              <div className="row g-4">
                {wasteBins.map(b => (
                  <div key={b.id} className="col-md-4">
                    <div className="p-4 rounded text-center shadow-xs" style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
                      <div className="fs-1 mb-2">🗑️</div>
                      <h6 className="fw-800 mb-1 text-dark">{b.id}</h6>
                      <div className="text-muted x-small mb-4 uppercase fw-bold">{b.loc}</div>
                      <div className="progress-smart mb-3" style={{ height: '14px' }}>
                        <div className={`bar ${b.fill > 80 ? 'bg-danger' : b.fill > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${b.fill}%`, boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}></div>
                      </div>
                      <div className="fw-800 text-dark fs-5">{b.fill}% <span className="x-small text-muted fw-normal">Capacity</span></div>
                      <button 
                        className={`btn-smart w-100 mt-4 py-2 shadow-sm ${b.fill > 70 ? 'btn-primary-smart' : 'btn-outline-smart opacity-50'}`}
                        disabled={b.fill <= 70}
                        onClick={() => handleDispatch(b.id)}
                      >
                        {b.fill > 70 ? 'Dispatch Truck' : 'Level Normal'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Analytics Sidebar */}
        <div className="col-md-4">
          <div className="card-smart h-100 shadow-sm border-0 d-flex flex-column">
            <div className="section-header text-primary mb-4">
              <span>📉</span> AI Infrastructure Analytics
            </div>
            <div className="d-flex flex-column gap-4 flex-grow-1">
              <div className="p-3 bg-primary-light rounded border border-primary border-opacity-10 shadow-xs">
                <div className="fw-bold text-primary small mb-1">Optimized Resource Path</div>
                <p className="text-dark small mb-0 opacity-75">AI suggests rerouting water supply from Dadar Main to Bandra Sector 4 to prevent pressure drop.</p>
              </div>

              <div>
                <h6 className="fw-bold text-muted x-small uppercase letter-spacing-1 mb-3">Efficiency Index</h6>
                <div className="text-center py-5 rounded position-relative shadow-inner" style={{backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
                  <div className="display-4 fw-800 text-primary">94.2%</div>
                  <div className="text-muted small fw-bold">SYSTEM HEALTH</div>
                  {/* Abstract ring */}
                  <div className="position-absolute top-50 start-50 translate-middle rounded-circle border border-primary opacity-5" style={{ width: '160px', height: '160px', maxWidth: '160px', maxHeight: '160px' }}></div>
                </div>
              </div>

              <div className="mt-2">
                <h6 className="fw-bold text-muted x-small uppercase letter-spacing-1 mb-3">Maintenance Forecast</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="p-3 rounded d-flex justify-content-between align-items-center hover-bg-light transition-all border border-light-subtle" style={{backgroundColor: '#f8fafc'}}>
                    <span className="small fw-600 text-dark">Grid-A Transformer</span>
                    <span className="badge bg-danger px-2 py-1">2 Days</span>
                  </div>
                  <div className="p-3 rounded d-flex justify-content-between align-items-center hover-bg-light transition-all border border-light-subtle" style={{backgroundColor: '#f8fafc'}}>
                    <span className="small fw-600 text-dark">Main Pipeline-04</span>
                    <span className="badge bg-warning px-2 py-1">5 Days</span>
                  </div>
                  <div className="p-3 rounded d-flex justify-content-between align-items-center hover-bg-light transition-all border border-light-subtle" style={{backgroundColor: '#f8fafc'}}>
                    <span className="small fw-600 text-dark">Waste Route 12</span>
                    <span className="badge bg-success px-2 py-1">Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .x-small { font-size: 11px; }
        .letter-spacing-1 { letter-spacing: 1px; }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .shadow-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
        .hover-bg-light:hover { background: #f1f5f9 !important; }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}
