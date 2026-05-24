import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { value: 'water', label: '💧 Water Supply Issue', dept: 'Municipal Water Dept' },
  { value: 'electricity', label: '⚡ Electricity / Power Cut', dept: 'Electricity Board' },
  { value: 'garbage', label: '🗑️ Garbage / Waste', dept: 'Sanitation Dept' },
  { value: 'road', label: '🚧 Road / Pothole', dept: 'PWD (Public Works)' },
  { value: 'drainage', label: '🌊 Drainage / Sewage', dept: 'Municipal Drainage Dept' },
];

export default function UserComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/user/complaints');
      setComplaints(res.data);
    } catch (e) {
      toast('Failed to load your complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    const formData = {
      category: e.target.category.value,
      priority: e.target.priority.value,
      title: e.target.title.value,
      description: e.target.desc.value,
      dept: CATEGORIES.find(c => c.value === e.target.category.value)?.dept || 'Assigned via AI'
    };

    try {
      await api.post('/user/file-complaint', formData);
      toast('Grievance filed! AI has assigned it to the relevant department.', 'success');
      setShowForm(false);
      fetchComplaints();
    } catch (err) {
      toast('Error submitting complaint', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving grievance history..." />;

  return (
    <div className="container-fluid p-0">
      <div className="row g-4">
        <div className="col-md-7">
          <div className="card-smart h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="section-header mb-0">
                <span>📋</span> My Grievances & Status
              </div>
              <button className="btn-smart btn-primary-smart" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Close Form' : '+ New Complaint'}
              </button>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-4">
                <div className="p-3 bg-light rounded text-center">
                  <div className="fw-bold text-dark">{complaints.filter(c => c.status === 'Pending').length}</div>
                  <div className="x-small text-muted">Pending</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 bg-light rounded text-center">
                  <div className="fw-bold text-dark">{complaints.filter(c => c.status === 'In Progress').length}</div>
                  <div className="x-small text-muted">In Progress</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3 bg-light rounded text-center">
                  <div className="fw-bold text-dark">{complaints.filter(c => c.status === 'Resolved').length}</div>
                  <div className="x-small text-muted">Resolved</div>
                </div>
              </div>
            </div>

            {showForm ? (
              <div className="p-4 border rounded animate-fade-in bg-white mb-4">
                <h5 className="fw-bold mb-4">File a New Complaint</h5>
                <form onSubmit={submitComplaint} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label x-small uppercase text-muted fw-bold">Category</label>
                    <select name="category" className="select-smart" required>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label x-small uppercase text-muted fw-bold">Priority</label>
                    <select name="priority" className="select-smart" required>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label x-small uppercase text-muted fw-bold">Subject</label>
                    <input name="title" type="text" className="input-smart" placeholder="What is the issue?" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label x-small uppercase text-muted fw-bold">Detailed Description</label>
                    <textarea name="desc" className="input-smart" rows="3" placeholder="Provide more details..."></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn-smart btn-primary-smart w-100 py-3">Submit Grievance</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {complaints.length === 0 ? (
                  <div className="text-center py-5 text-muted opacity-50">No grievances recorded.</div>
                ) : (
                  complaints.map(c => (
                    <div key={c.id} className="p-3 border rounded bg-white hover-bg-light transition-all">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold text-dark">{c.title}</div>
                          <div className="x-small text-muted">ID: {c.id} • Filed on {c.date}</div>
                        </div>
                        <span className={`badge-status ${c.status === 'Resolved' ? 'badge-success' : c.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top">
                        <span className="x-small text-muted">Dept:</span>
                        <span className="badge bg-light text-dark x-small">{c.dept}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-5">
          <div className="card-smart">
            <div className="section-header">
              <span>🧠</span> AI Civic Intelligence
            </div>
            <div className="d-flex flex-column gap-4">
              <div className="p-4 bg-primary-light rounded border border-primary border-opacity-10">
                <h6 className="fw-bold text-primary mb-2">Why use this portal?</h6>
                <p className="text-dark small mb-0">Our AI system analyzes keywords in your complaint to auto-assign it to the exact engineer or officer responsible.</p>
              </div>

              <div>
                <h6 className="fw-bold text-dark mb-3">Recent Resolutions in Your Area</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2 text-success small">✓ Fixed: Streetlight grid in BKC</div>
                  <div className="d-flex align-items-center gap-2 text-success small">✓ Resolved: Sewage leak at Dharavi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
