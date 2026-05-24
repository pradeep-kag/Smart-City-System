import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'user';
  
  // Dynamic profile name loading
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(role === 'admin' ? 'admin_profile' : 'user_profile');
    if (saved) return JSON.parse(saved);
    return { name: localStorage.getItem('username') || (role === 'admin' ? 'Administrator' : 'Citizen') };
  });

  const username = profile.name;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const notificationRef = useRef(null);
  const messageRef = useRef(null);
  const profileRef = useRef(null);

  // Sync profile when localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(role === 'admin' ? 'admin_profile' : 'user_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [role]);

  const adminNotifications = [
    { id: 1, type: 'success', icon: '✅', title: 'System Sync', desc: 'City vitals synchronized successfully', time: '2 mins ago', unread: true, details: { status: 'Success ✅', description: 'City vitals have been synchronized successfully.', time: 'April 25, 2026 — 10:43 AM', triggeredBy: 'Automated Scheduler', affectedZone: 'All City Zones', action: 'Data pushed to central dashboard' }},
    { id: 2, type: 'error', icon: '⚠️', title: 'Sync Error', desc: 'Failed to synchronize city vitals', time: '10 mins ago', unread: true, details: { status: 'Failed ❌', description: 'Failed to synchronize city vitals due to connection timeout.', errorCode: 'ERR_CONNECTION_TIMEOUT', time: 'April 25, 2026 — 10:35 AM', triggeredBy: 'Auto Sync Service', affectedZone: 'Zone B, Zone D', action_required: 'Check API server' }},
    { id: 3, type: 'info', icon: '📊', title: 'Report Ready', desc: 'Traffic CSV report generated', time: '1 hour ago', unread: false, details: { status: 'Info ℹ️', description: 'Traffic CSV report generated successfully.', time: 'April 25, 2026 — 09:45 AM', file: 'traffic_report.csv', size: '2.4 MB', has_download: true }},
    { id: 4, type: 'warning', icon: '🔧', title: 'Maintenance', desc: 'System maintenance scheduled at 12:00 AM', time: '3 hours ago', unread: true, details: { status: 'Warning ⚠️', description: 'System maintenance scheduled for tonight.', scheduledBy: 'Admin — John Doe', time: 'April 25, 2026 — 07:45 AM', downtime: '12:00 AM — 2:00 AM', affected: 'Dashboard, Sync' }},
    { id: 5, type: 'info', icon: '👤', title: 'New Admin', desc: 'New admin user added: John Doe', time: 'Yesterday', unread: false, details: { status: 'Info ℹ️', user: 'John Doe', email: 'johndoe@smartcity.com', role: 'Administrator', addedBy: 'Super Admin', time: 'April 24, 2026 — 03:00 PM', has_profile: true }}
  ];

  const userNotifications = [
    { id: 1, type: 'success', icon: '✅', title: 'Account Created', desc: 'Your account was created successfully', time: 'Just now', unread: true, details: { status: 'Success ✅', description: 'Welcome to the Smart City ecosystem! Your account is now active.', time: 'Apr 25, 10:00 AM', triggeredBy: 'System' }},
    { id: 2, type: 'info', icon: '👤', title: 'Profile Incomplete', desc: 'Please complete your profile information', time: '5 mins ago', unread: true, details: { status: 'Info ℹ️', description: 'Adding your phone and address helps in emergency services.', time: 'Apr 25, 10:05 AM', action_required: 'Go to Settings > Profile', has_profile: true }},
    { id: 3, type: 'success', icon: '🔑', title: 'Login Success', desc: 'You logged in successfully', time: '10 mins ago', unread: false, details: { status: 'Success ✅', description: 'New login detected from device: Chrome/Windows.', time: 'Apr 25, 10:10 AM', ip: '192.168.1.15' }},
    { id: 4, type: 'warning', icon: '🔒', title: 'Password Weak', desc: 'Your password strength is weak', time: '1 hour ago', unread: true, details: { status: 'Warning ⚠️', description: 'Security alert: Your password does not meet current complexity standards.', action_required: 'Update password in Security settings' }},
    { id: 5, type: 'info', icon: '💬', title: 'New Message', desc: 'You have a new message from Admin', time: '2 hours ago', unread: false, details: { status: 'Info ℹ️', description: 'Administrative staff sent you a message regarding your recent query.', time: 'Apr 25, 08:30 AM', sender: 'Admin' }},
    { id: 6, type: 'success', icon: '📊', title: 'Data Synced', desc: 'Your city zone data synced successfully', time: 'Yesterday', unread: false, details: { status: 'Success ✅', description: 'Live telemetry for your registered zone has been refreshed.', time: 'Apr 24, 05:00 PM', affectedZone: 'Zone A' }},
    { id: 7, type: 'warning', icon: '⏲️', title: 'Session Expiring', desc: 'Your session will expire in 10 minutes', time: 'Yesterday', unread: false, details: { status: 'Warning ⚠️', description: 'For security, sessions are limited. Please save any pending work.', time: 'Apr 24, 04:30 PM' }},
    { id: 8, type: 'info', icon: '📄', title: 'Report Available', desc: 'Your requested report is ready to view', time: '2 days ago', unread: false, details: { status: 'Info ℹ️', description: 'The personal mobility report for Zone A is now available.', time: 'Apr 23, 11:00 AM', has_download: true, file: 'mobility_report.pdf' }},
    { id: 9, type: 'success', icon: '🛡️', title: 'Password Changed', desc: 'Your password was changed successfully', time: '3 days ago', unread: false, details: { status: 'Success ✅', description: 'Security confirmation: Your password was updated successfully.', time: 'Apr 22, 02:00 PM' }},
    { id: 10, type: 'info', icon: '🔄', title: 'System Update', desc: 'Platform updated to latest version', time: '4 days ago', unread: false, details: { status: 'Info ℹ️', description: 'Platform version v2.4.0 is now live with performance enhancements.', time: 'Apr 21, 09:00 AM' }}
  ];

  const adminMessages = [
    { id: 1, sender: 'Admin', icon: '👤', msg: 'Please review the latest city report', time: '5 mins ago', unread: true, subject: 'Review', thread: [{ id: 1, sender: 'Admin', text: 'Review the report.', time: '10:40 AM' }] },
    { id: 2, sender: 'System Bot', icon: '🤖', msg: 'Your export is ready', time: '20 mins ago', unread: false, subject: 'Export', thread: [{ id: 1, sender: 'System Bot', text: 'Export ready.', time: '10:25 AM' }], readOnly: true },
    { id: 3, sender: 'Support', icon: '🔧', msg: 'Ticket resolved', time: '1 hour ago', unread: false, subject: 'Support', thread: [{ id: 1, sender: 'Support', text: 'Resolved.', time: 'Yesterday' }] }
  ];

  const userMessages = [
    { id: 1, sender: 'Admin', icon: '👤', msg: 'Welcome to Smart City System!', time: 'Just now', unread: true, subject: 'Welcome', thread: [
      { id: 1, sender: 'Admin', text: 'Welcome to Smart City System! Please complete your profile.', time: 'Just now' },
      { id: 2, sender: 'Me', text: 'Thank you! I will complete it shortly.', time: '1 min ago' },
      { id: 3, sender: 'Admin', text: 'Let us know if you need any help getting started.', time: '2 mins ago' }
    ]},
    { id: 2, sender: 'System Bot', icon: '🤖', msg: 'Account activated successfully', time: '5 mins ago', unread: true, subject: 'Activation', thread: [
      { id: 1, sender: 'System Bot', text: 'Your account has been activated successfully. You can now access all features.', time: '5 mins ago' }
    ], readOnly: true },
    { id: 3, sender: 'Support', icon: '🛠️', msg: 'Need help? Contact us', time: '1 hour ago', unread: false, subject: 'Support', thread: [
      { id: 1, sender: 'Me', text: 'I am having trouble viewing my zone report.', time: 'Yesterday 2:00 PM' },
      { id: 2, sender: 'Support', text: 'We are looking into it. Ticket #2045 created.', time: 'Yesterday 3:00 PM' },
      { id: 3, sender: 'Support', text: 'Issue resolved. Please try again now.', time: 'Today 9:00 AM' },
      { id: 4, sender: 'Me', text: 'Working now. Thank you!', time: 'Today 9:05 AM' }
    ]},
    { id: 4, sender: 'Admin', icon: '👤', msg: 'Please review platform terms', time: 'Yesterday', unread: false, subject: 'Terms', thread: [{ id: 1, sender: 'Admin', text: 'Please review terms.', time: 'Yesterday' }] },
    { id: 5, sender: 'System Bot', icon: '🤖', msg: 'Last login notification', time: '2 days ago', unread: false, subject: 'Security', thread: [{ id: 1, sender: 'System Bot', text: 'Login from IP: 192.168.1.15', time: '2 days ago' }], readOnly: true },
    { id: 6, sender: 'Manager', icon: '💼', msg: 'Update zone preferences', time: '3 days ago', unread: false, subject: 'Preferences', thread: [{ id: 1, sender: 'Manager', text: 'Update zone prefs.', time: '3 days ago' }] },
    { id: 7, sender: 'Support', icon: '🛠️', msg: 'Feedback received', time: '4 days ago', unread: true, subject: 'Feedback', thread: [{ id: 1, sender: 'Support', text: 'Ticket #2045 received.', time: '4 days ago' }] },
    { id: 8, sender: 'Admin', icon: '👤', msg: 'New zone data report', time: '5 days ago', unread: false, subject: 'Data', thread: [{ id: 1, sender: 'Admin', text: 'Report available.', time: '5 days ago' }] }
  ];

  const [notifications, setNotifications] = useState(role === 'admin' ? adminNotifications : userNotifications);
  const [messages, setMessages] = useState(role === 'admin' ? adminMessages : userMessages);

  const unreadNotifications = notifications.filter(n => n.unread).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  const handleNotificationClick = (n) => {
    setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
    setSelectedNotification(n);
    setShowNotifications(false);
  };

  const handleMessageClick = (m) => {
    setMessages(messages.map(item => item.id === m.id ? { ...item, unread: false } : item));
    setSelectedMessage(m);
    setShowMessages(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newMsg = { id: Date.now(), sender: 'Me', text: replyText, time: 'Just now' };
    setSelectedMessage(prev => ({ ...prev, thread: [...prev.thread, newMsg] }));
    setReplyText('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload(); 
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (messageRef.current && !messageRef.current.contains(event.target)) setShowMessages(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllNotificationsRead = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
      setLoading(false);
      alert('All notifications marked as read');
    }, 500);
  };

  const markAllMessagesRead = () => {
    setLoading(true);
    setTimeout(() => {
      setMessages(messages.map(m => ({ ...m, status: 'Read', unread: false })));
      setLoading(false);
      alert('All messages marked as read');
    }, 500);
  };

  const exportNotificationsPDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text(role === 'admin' ? "Notifications Report" : "User Notifications Report", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: April 25, 2026 — 10:45 AM`, 14, 30);
    doc.text(`Generated By: ${profile.name}`, 14, 35);
    doc.text(`Platform: Smart City System`, 14, 40);

    const tableRows = notifications.map((n, i) => [i + 1, n.type.toUpperCase(), n.title, n.desc, n.time, n.unread ? 'Unread' : 'Read']);
    doc.autoTable({
      head: [['#', 'Type', 'Title', 'Description', 'Time', 'Status']],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const val = data.cell.raw;
          if (val === 'SUCCESS') data.cell.styles.textColor = [16, 185, 129];
          if (val === 'ERROR') data.cell.styles.textColor = [239, 68, 68];
          if (val === 'WARNING') data.cell.styles.textColor = [245, 158, 11];
          if (val === 'INFO') data.cell.styles.textColor = [37, 99, 235];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    doc.save(role === 'admin' ? 'notifications_report.pdf' : 'user_notifications_report.pdf');
    setLoading(false);
    alert('PDF exported successfully');
  };

  const exportMessagesPDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text(role === 'admin' ? "Inbox Messages Report" : "User Inbox Messages Report", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: April 25, 2026 — 10:45 AM`, 14, 30);
    doc.text(`Generated By: ${profile.name}`, 14, 35);

    const tableRows = messages.map((m, i) => [i + 1, m.sender, m.msg, m.time, m.unread ? 'Unread' : 'Read']);
    doc.autoTable({
      head: [['#', 'Sender', 'Message', 'Time', 'Status']],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body' && data.cell.raw === 'Unread') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [235, 245, 255];
        }
      }
    });
    doc.save(role === 'admin' ? 'inbox_messages_report.pdf' : 'user_inbox_messages_report.pdf');
    setLoading(false);
    alert('PDF exported successfully');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return role === 'admin' ? 'Overview Dashboard' : 'My Dashboard';
    if (path.includes('control')) return 'Traffic Control Center';
    if (path.includes('surveillance')) return 'AI Surveillance Grid';
    if (path.includes('utilities')) return 'Infrastructure & Utilities';
    if (path.includes('complaints')) return 'Grievance Management';
    if (path.includes('users')) return 'Citizen Database';
    if (path.includes('parking')) return 'Smart Parking Solutions';
    if (path.includes('fines')) return 'E-Challan System';
    if (path.includes('city-status')) return 'Live City Vitals';
    if (path.includes('emergency')) return 'Emergency Response SOS';
    if (path.includes('settings')) return role === 'admin' ? 'System Configurations' : 'Account Settings';
    if (path.includes('inbox')) return role === 'admin' ? 'Administrative Inbox' : 'My Inbox';
    if (path.includes('activity-log')) return role === 'admin' ? 'System Activity Logs' : 'My Activity Log';
    return 'Smart City AI';
  };

  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{getPageTitle()}</h1>
        <p className="topbar-subtitle">Real-time intelligence and city-wide oversight</p>
      </div>
      
      <div className="topbar-actions">
        {/* Notification Bell */}
        <div className="position-relative" ref={notificationRef}>
          <div className="topbar-badge cursor-pointer" onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); setShowProfileDropdown(false); }}>
            <span>🔔</span>
            {unreadNotifications > 0 && <div className="badge-count">{unreadNotifications}</div>}
          </div>
          
          {showNotifications && (
            <div className="topbar-dropdown">
              <div className="dropdown-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Notifications</h5>
                <div className="d-flex gap-2">
                  <button className="btn btn-link btn-sm p-0 text-decoration-none cursor-pointer small" onClick={exportNotificationsPDF}>📄 Export PDF</button>
                  <button className="btn btn-link btn-sm p-0 text-decoration-none cursor-pointer small" onClick={markAllNotificationsRead}>Mark all read</button>
                </div>
              </div>
              <div className="dropdown-body">
                {notifications.map(n => (
                  <div key={n.id} className={`dropdown-item-smart cursor-pointer ${n.unread ? 'unread' : ''}`} onClick={() => handleNotificationClick(n)}>
                    <div className="dropdown-icon">{n.icon}</div>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{n.title}</div>
                      <div className="dropdown-desc">{n.desc}</div>
                      <div className="dropdown-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer cursor-pointer" onClick={() => { navigate(role === 'admin' ? '/admin/activity-log' : '/user/activity-log'); setShowNotifications(false); }}>View All Activity</div>
            </div>
          )}
        </div>

        {/* Chat / Message Icon */}
        <div className="position-relative" ref={messageRef}>
          <div className="topbar-badge me-2 cursor-pointer" onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); setShowProfileDropdown(false); }}>
            <span>💬</span>
            {unreadMessages > 0 && <div className="badge-count">{unreadMessages}</div>}
          </div>

          {showMessages && (
            <div className="topbar-dropdown">
              <div className="dropdown-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Messages</h5>
                <div className="d-flex gap-2">
                  <button className="btn btn-link btn-sm p-0 text-decoration-none cursor-pointer small" onClick={exportMessagesPDF}>📄 Export PDF</button>
                  <button className="btn btn-link btn-sm p-0 text-decoration-none cursor-pointer small" onClick={markAllMessagesRead}>Clear Unread</button>
                </div>
              </div>
              <div className="dropdown-body">
                {messages.map(m => (
                  <div key={m.id} className={`dropdown-item-smart cursor-pointer ${m.unread ? 'unread' : ''}`} onClick={() => handleMessageClick(m)}>
                    <div className="dropdown-icon">{m.icon}</div>
                    <div className="dropdown-content">
                      <div className="dropdown-title">{m.sender}</div>
                      <div className="dropdown-desc">{m.msg}</div>
                      <div className="dropdown-time">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer cursor-pointer" onClick={() => { navigate(role === 'admin' ? '/admin/inbox' : '/user/inbox'); setShowMessages(false); }}>Open Inbox</div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="position-relative" ref={profileRef}>
          <div className="d-flex align-items-center gap-3 ps-3 border-start cursor-pointer" onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); setShowMessages(false); }}>
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-dark small">{username}</div>
              <div className="text-muted" style={{fontSize: '11px', textTransform: 'uppercase'}}>{role}</div>
            </div>
            <div className="topbar-avatar" style={{background: role === 'admin' ? 'linear-gradient(135deg, #10B981, #3B82F6)' : 'linear-gradient(135deg, #3B82F6, #6366F1)'}}>
              {username.charAt(0).toUpperCase()}
            </div>
          </div>

          {showProfileDropdown && (
            <div className="topbar-dropdown" style={{width: '220px'}}>
              <div className="dropdown-body p-2">
                <div className="dropdown-item-smart border-0 rounded" onClick={() => { navigate(role === 'admin' ? '/admin/settings?tab=profile' : '/user/settings?tab=profile'); setShowProfileDropdown(false); }}>
                  <span className="me-2">👤</span> My Profile
                </div>
                <div className="dropdown-item-smart border-0 rounded" onClick={() => { navigate(role === 'admin' ? '/admin/settings?tab=account' : '/user/settings?tab=account'); setShowProfileDropdown(false); }}>
                  <span className="me-2">⚙️</span> Account Settings
                </div>
                <div className="dropdown-item-smart border-0 rounded" onClick={() => { navigate(role === 'admin' ? '/admin/settings?tab=password' : '/user/settings?tab=password'); setShowProfileDropdown(false); }}>
                  <span className="me-2">🔒</span> Change Password
                </div>
                <div className="dropdown-item-smart border-0 rounded" onClick={() => { navigate(role === 'admin' ? '/admin/activity-log' : '/user/activity-log'); setShowProfileDropdown(false); }}>
                  <span className="me-2">📋</span> Activity Log
                </div>
                <hr className="my-1" />
                <div className="dropdown-item-smart border-0 rounded text-danger" onClick={() => setShowLogoutConfirm(true)}>
                  <span className="me-2">🚪</span> Logout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="side-panel-overlay d-flex align-items-center justify-content-center" onClick={() => setShowLogoutConfirm(false)}>
          <div className="card-smart p-4 text-center animate-fade-in" style={{width: '350px', animation: 'fadeInUp 0.3s ease'}} onClick={e => e.stopPropagation()}>
            <div className="display-4 mb-3">🚪</div>
            <h5 className="fw-800">Confirm Logout</h5>
            <p className="text-muted small">Are you sure you want to exit the Smart City Command Center?</p>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-danger flex-grow-1" onClick={handleLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION DETAIL PANEL */}
      {selectedNotification && (
        <div className="side-panel-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="side-panel" onClick={e => e.stopPropagation()}>
            <div className="side-panel-header">
              <h5 className="mb-0 fw-800 text-primary">{selectedNotification.title} Detail</h5>
              <button className="btn-close" onClick={() => setSelectedNotification(null)}></button>
            </div>
            <div className="side-panel-body">
              <div className="text-center mb-4">
                <div className="display-4">{selectedNotification.icon}</div>
                <div className={`badge-status badge-${selectedNotification.type === 'success' ? 'success' : selectedNotification.type === 'warning' ? 'warning' : selectedNotification.type === 'error' ? 'danger' : 'info'} mt-2`}>
                  {selectedNotification.details.status}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Description</div>
                <div className="detail-value">{selectedNotification.details.description}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Time & Date</div>
                <div className="detail-value">{selectedNotification.details.time}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Triggered By</div>
                <div className="detail-value">{selectedNotification.details.triggeredBy || selectedNotification.details.scheduledBy || selectedNotification.details.triggered_by}</div>
              </div>

              {selectedNotification.details.affectedZone && (
                <div className="detail-row">
                  <div className="detail-label">Affected Zone</div>
                  <div className="detail-value">{selectedNotification.details.affectedZone}</div>
                </div>
              )}

              {selectedNotification.details.errorCode && (
                <div className="detail-row">
                  <div className="detail-label">Error Code</div>
                  <div className="detail-value font-monospace text-danger">{selectedNotification.details.errorCode}</div>
                </div>
              )}

              {selectedNotification.details.action && (
                <div className="detail-row">
                  <div className="detail-label">Action Taken</div>
                  <div className="detail-value text-success fw-600">{selectedNotification.details.action}</div>
                </div>
              )}

              {selectedNotification.details.action_required && (
                <div className="detail-row">
                  <div className="detail-label">Action Required</div>
                  <div className="detail-value text-danger fw-600">{selectedNotification.details.action_required}</div>
                </div>
              )}

              {selectedNotification.details.file && (
                <div className="detail-row">
                  <div className="detail-label">Generated File</div>
                  <div className="detail-value">{selectedNotification.details.file} ({selectedNotification.details.size})</div>
                </div>
              )}

              {selectedNotification.details.user && (
                <div className="card p-3 bg-light border-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="topbar-avatar bg-primary">{selectedNotification.details.user.charAt(0)}</div>
                    <div>
                      <div className="fw-bold">{selectedNotification.details.user}</div>
                      <div className="text-muted small">{selectedNotification.details.email}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="side-panel-footer">
              {selectedNotification.details.has_download && <button className="btn btn-primary w-100 py-2">📥 Download CSV Report</button>}
              {selectedNotification.details.has_profile && <button className="btn btn-primary w-100 py-2">👤 View User Profile</button>}
              {!selectedNotification.details.has_download && !selectedNotification.details.has_profile && <button className="btn btn-outline-secondary w-100 py-2" onClick={() => setSelectedNotification(null)}>Close View</button>}
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE THREAD PANEL */}
      {selectedMessage && (
        <div className="side-panel-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="side-panel" onClick={e => e.stopPropagation()}>
            <div className="side-panel-header">
              <div>
                <h5 className="mb-0 fw-800 text-primary">{selectedMessage.sender}</h5>
                <div className="text-muted xx-small uppercase letter-spacing-1">{selectedMessage.subject}</div>
              </div>
              <button className="btn-close" onClick={() => setSelectedMessage(null)}></button>
            </div>
            <div className="side-panel-body">
              <div className="chat-thread">
                {selectedMessage.thread.map(t => (
                  <div key={t.id} className={`chat-bubble ${t.sender === 'Me' ? 'sender' : 'receiver'}`}>
                    <div>{t.text}</div>
                    {t.has_file && (
                      <button className="btn btn-sm btn-light mt-2 border w-100 text-start">
                        📄 Download Attachment
                      </button>
                    )}
                    <div className="chat-time">{t.time}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="side-panel-footer">
              <div className="reply-box">
                <input 
                  type="text" 
                  placeholder="Type your reply..." 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                />
                <button onClick={handleSendReply}>🕊️</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="side-panel-overlay d-flex align-items-center justify-content-center" style={{zIndex: 9999}}>
          <div className="card-smart p-4 text-center" style={{maxWidth: '400px', width: '90%'}}>
            <div className="mb-4" style={{fontSize: '48px'}}>🚪</div>
            <h4 className="fw-800">Logout Confirmation</h4>
            <p className="text-muted">Are you sure you want to logout? You will need to login again to access the command hub.</p>
            <div className="d-flex gap-3 mt-4">
              <button className="btn btn-outline-secondary flex-grow-1 cursor-pointer" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-danger flex-grow-1 cursor-pointer" onClick={() => { localStorage.clear(); navigate('/login'); alert('Logged out successfully'); }}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
