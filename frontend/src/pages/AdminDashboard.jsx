import { useState, useEffect } from 'react';
import api from '../api/axios';
import TrafficChart from '../components/TrafficChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastProvider';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

export default function AdminDashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const [stats, setStats] = useState({ traffic: 0, incidents: 0, safety: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const [optimizing, setOptimizing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      const data = response.data;

      setTrafficData(data.traffic);
      setLogs(data.logs);
      
      const avgTraffic = Math.round(data.traffic.reduce((acc, curr) => acc + curr.traffic, 0) / (data.traffic.length || 1));
      const activeIncidents = data.active_emergencies;
      const safetyScore = 100 - (activeIncidents * 5);
      
      setStats({
        traffic: avgTraffic,
        incidents: activeIncidents,
        safety: Math.max(0, safetyScore),
        users: data.user_count
      });
    } catch (err) {
      console.error('Master Dashboard Fetch Error:', err);
      toast('Failed to synchronize city vitals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLogColor = (sev) => {
    if (sev === 'High') return 'danger';
    if (sev === 'Medium') return 'warning';
    return 'success';
  };

  const optimizeSignals = () => {
    setOptimizing(true);
    toast('AI: Analyzing real-time congestion patterns...', 'info');
    
    setTimeout(() => {
      // Simulate traffic optimization by smoothing the peaks
      setTrafficData(prev => prev.map(p => ({
        ...p,
        traffic: p.traffic > 70 ? p.traffic - 15 : p.traffic + 5
      })));
      setOptimizing(false);
      toast('Success: Traffic signals optimized for Mumbai BKC Junction!', 'success');
    }, 2500);
  };

  const LogModal = () => (
    <div className="modal-backdrop-smart animate-fade-in" onClick={() => setShowLogModal(false)} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="modal-content-smart shadow-lg border-0 bg-white rounded-4 p-4" onClick={e => e.stopPropagation()} style={{
        maxWidth: '700px', width: '100%', maxHeight: '85vh', overflowY: 'auto'
      }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-800 text-primary mb-0">System Activity Archive</h4>
          <button className="btn btn-link text-dark fs-4 text-decoration-none" onClick={() => setShowLogModal(false)}>×</button>
        </div>
        <div className="log-list-scroll">
          {logs.length === 0 ? (
            <div className="text-center py-5 text-muted">No logs recorded in the last 24 hours.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className={`p-3 border-start border-4 border-${getLogColor(log.severity)} bg-light rounded mb-3`}>
                <div className="d-flex justify-content-between mb-1">
                  <span className={`fw-bold text-${getLogColor(log.severity)} small uppercase letter-spacing-1`}>{log.category}: {log.title}</span>
                  <span className="xx-small text-muted font-monospace">{log.timestamp}</span>
                </div>
                <div className="text-dark small opacity-75">{log.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner text="Analyzing city data..." />;

  return (
    <div className="container-fluid p-0 position-relative">
      {showLogModal && <LogModal />}
      {/* Top Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="dashboard-title mb-0">Analytics Hub</h2>
        <div className="d-flex gap-2">
          <button className="btn-smart btn-outline-smart py-2 px-4 shadow-xs bg-white" onClick={() => exportToCSV(trafficData, 'City_Traffic_Flow')}>
            📥 Traffic CSV
          </button>
          <button className="btn-smart btn-primary-smart py-2 px-4 shadow-sm" onClick={exportToPDF}>
            📄 Full PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon">🚗</div>
            <div className="kpi-label">Avg. Traffic Density</div>
            <div className="kpi-value">{stats.traffic}%</div>
            <div className="kpi-change text-success">↓ 4.2% from last hour</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-card kpi-red">
            <div className="kpi-icon">🚨</div>
            <div className="kpi-label">Active Incidents</div>
            <div className="kpi-value">{stats.incidents}</div>
            <div className="kpi-change text-danger">↑ 2 new reported</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-card kpi-green">
            <div className="kpi-icon">🛡️</div>
            <div className="kpi-label">City Safety Score</div>
            <div className="kpi-value">{stats.safety}%</div>
            <div className="kpi-change text-success">Optimal Levels</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-card kpi-amber">
            <div className="kpi-icon">👥</div>
            <div className="kpi-label">Registered Citizens</div>
            <div className="kpi-value">{stats.users}</div>
            <div className="kpi-change text-info">Verified Accounts</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Chart */}
        <div className="col-md-8">
          <div className="card-smart h-100">
            <div className="section-header">
              <span>📈</span> City Traffic & Mobility Trends
            </div>
            <div style={{ height: '350px' }}>
              <TrafficChart data={trafficData} area="Mumbai BKC Junction" />
            </div>
            <div className="mt-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-dark small">AI Prediction Analysis {optimizing && <span className="badge bg-primary ms-2 animate-pulse">Running AI...</span>}</div>
                <div className="text-muted small">
                  {optimizing 
                    ? "Calculating optimal green-light duration for BKC Sector 4..." 
                    : "Expecting 15% increase in traffic volume near BKC Junction in the next 45 minutes."}
                </div>
              </div>
              <button 
                className={`btn-smart py-2 px-4 shadow-sm ${optimizing ? 'btn-secondary opacity-50' : 'btn-primary-smart'}`} 
                onClick={optimizeSignals}
                disabled={optimizing}
              >
                {optimizing ? 'Optimizing...' : 'Optimize Signals'}
              </button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="col-md-4">
          <div className="card-smart h-100">
            <div className="section-header">
              <span>🔔</span> Real-time System Alerts
            </div>
            <div className="d-flex flex-column gap-3">
              {logs.slice(0, 3).map(log => (
                <div key={log.id} className={`p-3 border-start border-4 border-${getLogColor(log.severity)} bg-light rounded shadow-xs`}>
                  <div className="fw-bold small" style={{color: `var(--bs-${getLogColor(log.severity)})`}}>{log.title}</div>
                  <div className="text-dark x-small my-1 opacity-75">{log.message}</div>
                  <div className="text-muted xx-small font-monospace">{log.timestamp.split(' ')[1]}</div>
                </div>
              ))}
              {logs.length === 0 && <div className="text-center py-4 text-muted small">Monitoring system active...</div>}
              <button className="btn-smart btn-outline-smart w-100 mt-2 py-2" onClick={() => setShowLogModal(true)}>
                View All Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="row g-4 mt-2">
        <div className="col-md-6">
          <div className="card-smart">
            <div className="section-header">
              <span>💧</span> Critical Utilities Status
            </div>
            <div className="d-flex flex-column gap-4">
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-600">Water Supply Network</span>
                  <span className="badge-status badge-success">Stable</span>
                </div>
                <div className="progress-smart"><div className="bar bg-primary" style={{width: '82%'}}></div></div>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-600">Electric Grid Load</span>
                  <span className="badge-status badge-warning">High Load</span>
                </div>
                <div className="progress-smart"><div className="bar bg-warning" style={{width: '94%'}}></div></div>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-600">Waste Management Fill Rate</span>
                  <span className="badge-status badge-info">Collecting</span>
                </div>
                <div className="progress-smart"><div className="bar bg-secondary" style={{width: '45%'}}></div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card-smart">
            <div className="section-header">
              <span>👁️</span> Surveillance AI Insights
            </div>
            <div className="table-responsive">
              <table className="table-smart">
                <thead>
                  <tr>
                    <th>Camera ID</th>
                    <th>Zone</th>
                    <th>Detection</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CAM-01</td>
                    <td>Bandra West</td>
                    <td>Crowd Detection</td>
                    <td><span className="badge-status badge-warning">Watch</span></td>
                  </tr>
                  <tr>
                    <td>CAM-03</td>
                    <td>Marine Drive</td>
                    <td>Traffic Surge</td>
                    <td><span className="badge-status badge-danger">Alert</span></td>
                  </tr>
                  <tr>
                    <td>CAM-05</td>
                    <td>Charminar</td>
                    <td>Tourist Inflow</td>
                    <td><span className="badge-status badge-success">Clear</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
