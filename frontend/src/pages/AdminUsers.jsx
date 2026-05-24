import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToCSV } from '../utils/exportUtils';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) { 
      toast('Failed to load user database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (username) => {
    try {
      const res = await api.post('/admin/block-user', { username });
      toast(res.data.msg, 'success');
      setUsers(users.map(u => u.username === username ? { ...u, is_blocked: res.data.is_blocked } : u));
    } catch (e) {
      toast('Failed to update user status', 'error');
    }
  };

  const viewHistory = async (user) => {
    setSelectedUser(user);
    setHistoryLoading(true);
    setHistory(null);
    try {
      const res = await api.get(`/admin/user-history/${user.username}`);
      setHistory(res.data);
    } catch (e) {
      toast('Failed to fetch user history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Querying citizen database..." />;

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon">👥</div>
            <div className="kpi-label">Total Citizens</div>
            <div className="kpi-value">{users.length}</div>
            <div className="kpi-change text-info">Verified Accounts</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-card kpi-green">
            <div className="kpi-icon">🛡️</div>
            <div className="kpi-label">Active Portals</div>
            <div className="kpi-value">{users.filter(u => !u.is_blocked).length}</div>
            <div className="kpi-change text-success">Secure Access</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-card kpi-red">
            <div className="kpi-icon">🚫</div>
            <div className="kpi-label">Blocked Citizens</div>
            <div className="kpi-value">{users.filter(u => u.is_blocked).length}</div>
            <div className="kpi-change text-danger">Restricted Access</div>
          </div>
        </div>
      </div>

      <div className="card-smart">
        <div className="section-header d-flex justify-content-between align-items-center">
          <span>📋</span> Master Citizen Registry
          <button className="btn-smart btn-outline-smart py-1 px-3 small" onClick={() => exportToCSV(users, 'Citizen_Registry')}>
            📥 Export CSV
          </button>
        </div>
        <div className="table-responsive">
          <table className="table-smart">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Contact Details</th>
                <th>Registered Address</th>
                <th>Vehicles</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className={u.is_blocked ? 'opacity-50 grayscale' : ''}>
                  <td className="fw-bold text-dark">
                    {u.name}
                    {u.is_blocked && <span className="ms-2 badge bg-danger x-small">BLOCKED</span>}
                  </td>
                  <td><span className="badge-status badge-info">@{u.username}</span></td>
                  <td>
                    <div className="small fw-600">📞 {u.mobile}</div>
                    <div className="x-small text-muted">{u.email}</div>
                  </td>
                  <td className="small text-muted" style={{maxWidth: '200px'}}>{u.address}</td>
                  <td>
                    {u.vehicles && u.vehicles.length > 0 ? (
                      u.vehicles.map((v, i) => <span key={i} className="badge bg-light text-dark border me-1 x-small">{v}</span>)
                    ) : (
                      <span className="text-muted x-small">No vehicle</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-smart btn-outline-smart py-1 px-2 small me-2" onClick={() => viewHistory(u)}>History</button>
                    <button 
                      className={`btn-smart py-1 px-2 small ${u.is_blocked ? 'btn-success-smart' : 'btn-outline-smart text-danger border-danger border-opacity-25'}`}
                      onClick={() => toggleBlock(u.username)}
                    >
                      {u.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {selectedUser && (
        <div className="modal-overlay d-flex align-items-center justify-content-center">
          <div className="card-smart shadow-lg animate-slide-in p-0" style={{ width: '800px', maxHeight: '90vh', overflow: 'hidden' }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
              <div>
                <h4 className="fw-800 mb-1">{selectedUser.name} // Citizen History</h4>
                <div className="text-muted small">Viewing all city-wide interactions for @{selectedUser.username}</div>
              </div>
              <button className="btn-close" onClick={() => setSelectedUser(null)}></button>
            </div>

            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {historyLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <div className="mt-2 small text-muted">Retrieving city logs...</div>
                </div>
              ) : history ? (
                <div className="row g-4">
                  {/* Challans */}
                  <div className="col-12">
                    <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                      <span>🎫</span> E-Challan History
                    </h6>
                    {history.challans.length === 0 ? (
                      <div className="p-3 bg-light rounded small text-muted">No traffic violations recorded.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover small">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Vehicle</th>
                              <th>Violation</th>
                              <th>Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.challans.map((c, i) => (
                              <tr key={i}>
                                <td>{c.date}</td>
                                <td>{c.vehicle}</td>
                                <td>{c.violation}</td>
                                <td className="fw-bold">₹{c.amount}</td>
                                <td><span className={`badge ${c.status === 'Paid' ? 'bg-success' : 'bg-warning'} x-small`}>{c.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Complaints */}
                  <div className="col-12">
                    <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                      <span>📝</span> Grievance History
                    </h6>
                    {history.complaints.length === 0 ? (
                      <div className="p-3 bg-light rounded small text-muted">No grievances filed.</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {history.complaints.map((c, i) => (
                          <div key={i} className="p-3 border rounded hover-bg-light transition-all">
                            <div className="d-flex justify-content-between mb-1">
                              <div className="fw-bold small">{c.title}</div>
                              <span className={`badge x-small ${c.status === 'Resolved' ? 'bg-success' : 'bg-info'}`}>{c.status}</span>
                            </div>
                            <div className="x-small text-muted">{c.dept} • {c.date}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">Failed to load history.</div>
              )}
            </div>
            
            <div className="p-3 border-top text-end bg-light">
              <button className="btn-smart btn-primary-smart px-4" onClick={() => setSelectedUser(null)}>Close History</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1050;
        }
        .grayscale { filter: grayscale(1); }
        .x-small { font-size: 11px; }
        .animate-slide-in { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
