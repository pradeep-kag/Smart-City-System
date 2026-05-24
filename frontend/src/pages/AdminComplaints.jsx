import { useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { exportToCSV } from '../utils/exportUtils';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([
    { id: 'CMP-20260420-001', user: 'Rajesh Kumar', category: 'water', title: 'No water supply since 2 days', location: 'Andheri West', status: 'Pending', priority: 'High', dept: 'Municipal Water Dept', date: '2026-04-20' },
    { id: 'CMP-20260419-004', user: 'Priya Sharma', category: 'electricity', title: 'Frequent power cuts in area', location: 'Golf Links, Delhi', status: 'In Progress', priority: 'High', dept: 'Electricity Board', date: '2026-04-19' },
    { id: 'CMP-20260418-002', user: 'Rajesh Kumar', category: 'road', title: 'Deep pothole near school', location: 'Dadar TT Circle', status: 'Resolved', priority: 'Critical', dept: 'PWD', date: '2026-04-18' },
    { id: 'CMP-20260417-005', user: 'Amit Patel', category: 'garbage', title: 'Garbage not collected for 5 days', location: 'Sai Nagar, Thane', status: 'Pending', priority: 'Medium', dept: 'Sanitation Dept', date: '2026-04-17' },
    { id: 'CMP-20260415-003', user: 'Rahul Verma', category: 'streetlight', title: 'Streetlight broken for 1 week', location: 'Marine Drive', status: 'Pending', priority: 'Medium', dept: 'Electrical Maintenance', date: '2026-04-15' },
  ]);
  const toast = useToast();

  const updateStatus = (id, newStatus) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast(`Complaint ${id} marked as "${newStatus}"`, 'success');
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon">📋</div>
            <div className="kpi-label">Total Complaints</div>
            <div className="kpi-value">{complaints.length}</div>
            <div className="kpi-change text-info">Live Queue</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-card kpi-amber">
            <div className="kpi-icon">⏳</div>
            <div className="kpi-label">Pending Response</div>
            <div className="kpi-value">{complaints.filter(c => c.status === 'Pending').length}</div>
            <div className="kpi-change text-warning">Requires Action</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-card kpi-green">
            <div className="kpi-icon">✅</div>
            <div className="kpi-label">Resolved Today</div>
            <div className="kpi-value">{complaints.filter(c => c.status === 'Resolved').length}</div>
            <div className="kpi-change text-success">Efficiency 100%</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-card kpi-red">
            <div className="kpi-icon">🚨</div>
            <div className="kpi-label">Critical Priority</div>
            <div className="kpi-value">{complaints.filter(c => c.priority === 'Critical').length}</div>
            <div className="kpi-change text-danger">Immediate Attention</div>
          </div>
        </div>
      </div>

      <div className="card-smart">
        <div className="section-header d-flex justify-content-between align-items-center">
          <span>📁</span> Citizen Grievance Database
          <button className="btn-smart btn-outline-smart py-1 px-3 small" onClick={() => exportToCSV(complaints, 'Grievance_Database')}>
            📥 Export CSV
          </button>
        </div>
        <div className="table-responsive">
          <table className="table-smart">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Citizen</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td><small className="text-muted">{c.id.slice(-8)}</small></td>
                  <td className="fw-bold">{c.user}</td>
                  <td>{c.title}</td>
                  <td>
                    <span className={`badge-status ${c.priority === 'Critical' ? 'badge-danger' : c.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td><span className="small text-muted">{c.dept}</span></td>
                  <td>
                    <span className={`badge-status ${c.status === 'Resolved' ? 'badge-success' : c.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'Pending' && (
                      <button className="btn-smart btn-primary-smart py-1 px-3 small" onClick={() => updateStatus(c.id, 'In Progress')}>Accept</button>
                    )}
                    {c.status === 'In Progress' && (
                      <button className="btn-smart btn-success-smart py-1 px-3 small" onClick={() => updateStatus(c.id, 'Resolved')}>Resolve</button>
                    )}
                    {c.status === 'Resolved' && (
                      <span className="text-success small fw-bold">✓ Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
