import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="sidebar shadow-sm">
      <div className="sidebar-brand">SmartCity AI</div>
      <div className="sidebar-subtitle">Admin Control Center</div>
      
      <div className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">📊</span> Master Analysis
        </NavLink>
        <NavLink to="/admin/control" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">🚦</span> Traffic & Control
        </NavLink>
        <NavLink to="/admin/surveillance" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">👁️</span> AI Surveillance
        </NavLink>
        <NavLink to="/admin/utilities" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">💧</span> City Utilities
        </NavLink>
        <NavLink to="/admin/complaints" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">📋</span> Complaints
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">👥</span> Users
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">⚙️</span> Settings
        </NavLink>
      </div>

      <div className="mt-auto pt-4 border-top">
        <button className="btn-smart btn-outline-smart w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}
