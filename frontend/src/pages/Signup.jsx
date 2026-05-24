import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import api from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', mobile: '', address: '', vehicle: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast('Account created successfully! Please login.', 'success');
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.msg || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="card-smart p-0 overflow-hidden shadow-lg border-0 d-flex" style={{ width: '1000px', height: '650px' }}>
        {/* Left Side - Visual */}
        <div className="d-none d-md-flex flex-column justify-content-center p-5 text-white position-relative" 
             style={{ width: '40%', background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)' }}>
          <div className="position-relative z-1">
            <h2 className="fw-800 display-6 mb-3">Join the Future</h2>
            <p className="opacity-75">Become a verified citizen of SmartCity AI and access real-time urban intelligence.</p>
            <div className="mt-5 d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2" style={{width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center'}}>1</div>
                <span>Verify Identity</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2" style={{width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center'}}>2</div>
                <span>Register Vehicle</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2" style={{width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center'}}>3</div>
                <span>Access Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white p-5 d-flex flex-column" style={{ width: '100%', maxWidth: '60%', overflowY: 'auto' }}>
          <div className="mb-4">
            <h2 className="fw-800 text-dark mb-1">Citizen Registration</h2>
            <p className="text-muted small">Create your account to access smart city services</p>
          </div>

          <form onSubmit={handleSignup} className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-600 text-secondary">Full Name</label>
              <input type="text" className="input-smart" placeholder="Rajesh Kumar" onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-600 text-secondary">Email</label>
              <input type="email" className="input-smart" placeholder="rajesh@example.com" onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-600 text-secondary">Username</label>
              <input type="text" className="input-smart" placeholder="rajesh_city" onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-600 text-secondary">Password</label>
              <input type="password" className="input-smart" placeholder="••••••••" onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-600 text-secondary">Mobile No.</label>
              <input type="text" className="input-smart" placeholder="+91-XXXX-XXX-XXX" onChange={e => setForm({...form, mobile: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-600 text-secondary">Vehicle Number</label>
              <input type="text" className="input-smart" placeholder="MH-02-AB-1234" onChange={e => setForm({...form, vehicle: e.target.value})} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-600 text-secondary">Residential Address</label>
              <input type="text" className="input-smart" placeholder="Bandra West, Mumbai" onChange={e => setForm({...form, address: e.target.value})} required />
            </div>
            <div className="col-12 mt-4">
              <button type="submit" className="btn-smart btn-primary-smart w-100 py-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted small">Already registered? <Link to="/" className="text-primary fw-600 text-decoration-none">Login to your portal</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
