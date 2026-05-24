import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white glass-card" style={{ width: '280px', height: '100vh', position: 'fixed' }}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4 fw-bold dashboard-title">🏙️ Smart City</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        <li className="nav-item">
          <NavLink to="/mobility" className={({ isActive }) => "nav-link text-white " + (isActive ? "bg-primary" : "")}>
            🚦 Mobility & Traffic
          </NavLink>
        </li>
        <li>
          <NavLink to="/energy" className={({ isActive }) => "nav-link text-white " + (isActive ? "bg-warning text-dark" : "")}>
            ⚡ Energy & Utilities
          </NavLink>
        </li>
        <li>
          <NavLink to="/environment" className={({ isActive }) => "nav-link text-white " + (isActive ? "bg-success" : "")}>
            🌿 Environment & AQI
          </NavLink>
        </li>
      </ul>
      <hr />
      <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
