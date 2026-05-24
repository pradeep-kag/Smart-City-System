import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSidebar from './components/AdminSidebar';
import UserSidebar from './components/UserSidebar';
import TopBar from './components/TopBar';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminControl from './pages/AdminControl';
import AdminSurveillance from './pages/AdminSurveillance';
import AdminUtilities from './pages/AdminUtilities';
import AdminUsers from './pages/AdminUsers';
import AdminComplaints from './pages/AdminComplaints';
import AdminSettings from './pages/AdminSettings';
import AdminInbox from './pages/AdminInbox';
import AdminActivityLog from './pages/AdminActivityLog';

// User Pages
import UserDashboard from './pages/UserDashboard';
import UserParking from './pages/UserParking';
import UserFines from './pages/UserFines';
import UserEmergency from './pages/UserEmergency';
import UserComplaints from './pages/UserComplaints';
import UserCityStatus from './pages/UserCityStatus';
import UserSettings from './pages/UserSettings';
import UserInbox from './pages/UserInbox';
import UserActivityLog from './pages/UserActivityLog';

function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;
  
  const Sidebar = role === 'admin' ? AdminSidebar : UserSidebar;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/control" element={<PrivateRoute requiredRole="admin"><AdminControl /></PrivateRoute>} />
        <Route path="/admin/surveillance" element={<PrivateRoute requiredRole="admin"><AdminSurveillance /></PrivateRoute>} />
        <Route path="/admin/utilities" element={<PrivateRoute requiredRole="admin"><AdminUtilities /></PrivateRoute>} />
        <Route path="/admin/complaints" element={<PrivateRoute requiredRole="admin"><AdminComplaints /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute requiredRole="admin"><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute requiredRole="admin"><AdminSettings /></PrivateRoute>} />
        <Route path="/admin/inbox" element={<PrivateRoute requiredRole="admin"><AdminInbox /></PrivateRoute>} />
        <Route path="/admin/activity-log" element={<PrivateRoute requiredRole="admin"><AdminActivityLog /></PrivateRoute>} />
        
        {/* USER ROUTES */}
        <Route path="/user/dashboard" element={<PrivateRoute requiredRole="user"><UserDashboard /></PrivateRoute>} />
        <Route path="/user/parking" element={<PrivateRoute requiredRole="user"><UserParking /></PrivateRoute>} />
        <Route path="/user/fines" element={<PrivateRoute requiredRole="user"><UserFines /></PrivateRoute>} />
        <Route path="/user/complaints" element={<PrivateRoute requiredRole="user"><UserComplaints /></PrivateRoute>} />
        <Route path="/user/city-status" element={<PrivateRoute requiredRole="user"><UserCityStatus /></PrivateRoute>} />
        <Route path="/user/emergency" element={<PrivateRoute requiredRole="user"><UserEmergency /></PrivateRoute>} />
        <Route path="/user/settings" element={<PrivateRoute requiredRole="user"><UserSettings /></PrivateRoute>} />
        <Route path="/user/inbox" element={<PrivateRoute requiredRole="user"><UserInbox /></PrivateRoute>} />
        <Route path="/user/activity-log" element={<PrivateRoute requiredRole="user"><UserActivityLog /></PrivateRoute>} />
        
        {/* FALLBACKS */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
