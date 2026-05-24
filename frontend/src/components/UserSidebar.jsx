import { NavLink, useNavigate } from 'react-router-dom';

export default function UserSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="sidebar shadow-sm">
      <div className="sidebar-brand">SmartCity AI</div>
      <div className="sidebar-subtitle">Citizen Portal</div>
      
      <div className="sidebar-nav">
        <NavLink to="/user/dashboard" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">🏠</span> My Dashboard
        </NavLink>
        <NavLink to="/user/parking" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">🅿️</span> Book Parking
        </NavLink>
        <NavLink to="/user/fines" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">🧾</span> Fines & Challans
        </NavLink>
        <NavLink to="/user/complaints" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">📋</span> File Complaint
        </NavLink>
        <NavLink to="/user/city-status" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">🌆</span> Live City Status
        </NavLink>
        <NavLink to="/user/emergency" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">🚑</span> Emergency
        </NavLink>

        <div className="sidebar-divider my-3 opacity-25"></div>
        
        <NavLink to="/user/inbox" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">📩</span> My Inbox
        </NavLink>
        <NavLink to="/user/activity-log" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">📋</span> Activity Log
        </NavLink>
        <NavLink to="/user/settings" className={({ isActive }) => "sidebar-link " + (isActive ? "active" : "")}>
          <span className="link-icon">⚙️</span> Account Settings
        </NavLink>
      </div>

      <div className="mt-auto pt-4 border-top">
        <button className="btn-smart btn-outline-smart w-100 d-flex align-items-center justify-content-center gap-2 cursor-pointer" onClick={() => { localStorage.clear(); navigate('/'); window.location.reload(); }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}
