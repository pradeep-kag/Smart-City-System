import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', username);
      
      toast(`Welcome back, ${username}!`, 'success');
      
      if (res.data.role === 'admin') navigate('/admin/dashboard');
      else navigate('/user/dashboard');
    } catch (err) {
      toast(err.response?.data?.msg || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    setUsername(role);
    setPassword(role === 'admin' ? 'admin123' : 'user123');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="card-smart p-0 overflow-hidden shadow-lg border-0 d-flex" style={{ width: '900px', height: '550px' }}>
        {/* Left Side - Visual */}
        <div className="d-none d-md-flex flex-column justify-content-center p-5 text-white position-relative" 
             style={{ width: '45%', background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)' }}>
          <div className="position-relative z-1">
            <h1 className="fw-800 display-5 mb-3">SmartCity AI</h1>
            <p className="opacity-75 fs-5">Empowering urban life with intelligent infrastructure and real-time oversight.</p>
            <div className="mt-5 d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">📍</div>
                <span>Real-time Traffic Tracking</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">🛡️</div>
                <span>Emergency SOS Response</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">🌫️</div>
                <span>AQI & Environment Monitoring</span>
              </div>
            </div>
          </div>
          {/* Abstract circles */}
          <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '300px', height: '300px', bottom: '-100px', left: '-100px' }}></div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white p-5 d-flex flex-column justify-content-center" style={{ width: '100%', maxWidth: '55%' }}>
          <div className="mb-4 text-center text-md-start">
            <h2 className="fw-800 text-dark mb-1">Welcome Back</h2>
            <p className="text-muted">Enter your credentials to access the portal</p>
          </div>

          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label small fw-600 text-secondary">Username</label>
              <input 
                type="text" 
                className="input-smart" 
                placeholder="Enter username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="form-label small fw-600 text-secondary">Password</label>
              <input 
                type="password" 
                className="input-smart" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn-smart btn-primary-smart w-100 py-3 mt-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted small">New citizen? <Link to="/signup" className="text-primary fw-600 text-decoration-none">Register your account</Link></p>
          </div>

          <div className="mt-4 pt-4 border-top">
            <p className="text-muted text-center small mb-3">Quick Access (Demo Mode)</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn-smart btn-outline-smart py-2 px-3 small" onClick={() => quickLogin('admin')}>
                <span>🔑</span> Admin
              </button>
              <button className="btn-smart btn-outline-smart py-2 px-3 small" onClick={() => quickLogin('user')}>
                <span>👤</span> Citizen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
