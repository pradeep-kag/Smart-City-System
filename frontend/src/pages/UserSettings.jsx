import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function UserSettings() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      name: localStorage.getItem('username') || 'Registered User',
      username: localStorage.getItem('username') || 'user',
      email: 'user@smartcity.com',
      phone: '+91 90000 12345',
      role: 'User',
      zone: 'Zone A',
      joined: 'January 15, 2024',
      lastLogin: 'April 25, 2026 — 10:05 AM',
      status: 'Active'
    };
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('user_settings');
    return saved ? JSON.parse(saved) : {
      lang: 'English',
      timezone: 'IST — Asia/Kolkata (UTC +5:30)',
      notifications: true,
      emailAlerts: true,
      smsAlerts: false,
      twoFactor: false,
      theme: 'light',
      timeout: '30 Minutes'
    };
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleSaveProfile = () => {
    setProfile(editForm);
    localStorage.setItem('user_profile', JSON.stringify(editForm));
    setShowEditProfile(false);
    alert('Profile updated successfully');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    alert('Settings saved successfully');
  };

  const handleUpdatePassword = () => {
    if (passwordForm.new !== passwordForm.confirm) return alert('Passwords do not match');
    if (passwordForm.new.length < 8) return alert('Password must be at least 8 characters');
    // Validation rules
    const hasUpper = /[A-Z]/.test(passwordForm.new);
    const hasNum = /[0-9]/.test(passwordForm.new);
    const hasSpecial = /[!@#$%^&*]/.test(passwordForm.new);
    if (!hasUpper || !hasNum || !hasSpecial) return alert('Password must contain uppercase, number, and special character');
    
    alert('Password updated successfully');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const exportProfilePDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("User Profile Report", 14, 25);
    
    const content = [
      ["Full Name", profile.name],
      ["Username", profile.username],
      ["Email Address", profile.email],
      ["Phone Number", profile.phone],
      ["Role", profile.role],
      ["City Zone", profile.zone],
      ["Member Since", profile.joined],
      ["Last Login", profile.lastLogin],
      ["Status", profile.status]
    ];
    
    doc.autoTable({
      body: content,
      startY: 45,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
    });
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Smart City System — Confidential User Report", 14, doc.internal.pageSize.height - 10);
    doc.save('user_profile_report.pdf');
    setLoading(false);
    alert('PDF exported successfully');
  };

  const exportSettingsPDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("User Account Settings Report", 14, 25);
    
    const content = [
      ["Language", settings.lang],
      ["Timezone", settings.timezone],
      ["Notification Alerts", settings.notifications ? "Enabled" : "Disabled"],
      ["Email Notifications", settings.emailAlerts ? "Enabled" : "Disabled"],
      ["SMS Alerts", settings.smsAlerts ? "Enabled" : "Disabled"],
      ["Two Factor Auth", settings.twoFactor ? "Enabled" : "Disabled"],
      ["Dashboard Theme", settings.theme === 'light' ? 'Light Mode' : 'Dark Mode'],
      ["Session Timeout", settings.timeout]
    ];
    
    doc.autoTable({
      body: content,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 5 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 247, 250] } }
    });
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Smart City System — Confidential User Report", 14, doc.internal.pageSize.height - 10);
    doc.save('user_settings_report.pdf');
    setLoading(false);
    alert('PDF exported successfully');
  };

  return (
    <div className="container-fluid p-0">
      {loading && (
        <div className="side-panel-overlay d-flex align-items-center justify-content-center" style={{background: 'rgba(255,255,255,0.7)', zIndex: 9999}}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}
      
      <div className="card-smart">
        <div className="row g-0">
          {/* Sidebar Nav */}
          <div className="col-md-3 border-end">
            <div className="nav flex-column nav-pills p-3 gap-2">
              {[
                { id: 'profile', icon: '👤', label: 'My Profile' },
                { id: 'account', icon: '⚙️', label: 'Account Settings' },
                { id: 'password', icon: '🔒', label: 'Change Password' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`nav-link text-start py-3 px-4 d-flex align-items-center gap-3 cursor-pointer ${activeTab === tab.id ? 'active' : 'text-dark'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span style={{fontSize: '20px'}}>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-md-9 p-5">
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-800 mb-0">My Profile</h4>
                  <div className="d-flex gap-2">
                    <button className="btn-smart btn-outline-smart py-2 cursor-pointer" onClick={exportProfilePDF}>📄 Export PDF</button>
                    <button className="btn-smart btn-primary-smart py-2 cursor-pointer" onClick={() => { setEditForm({...profile}); setShowEditProfile(true); }}>Edit Profile</button>
                  </div>
                </div>
                <div className="row g-4">
                  {[
                    { label: 'Full Name', value: profile.name },
                    { label: 'Username', value: profile.username },
                    { label: 'Email Address', value: profile.email },
                    { label: 'Phone Number', value: profile.phone },
                    { label: 'Role', value: profile.role },
                    { label: 'City Zone', value: profile.zone },
                    { label: 'Member Since', value: profile.joined },
                    { label: 'Last Login', value: profile.lastLogin },
                    { label: 'Account Status', value: profile.status, isBadge: true }
                  ].map((field, i) => (
                    <div key={i} className="col-md-6">
                      <label className="detail-label">{field.label}</label>
                      {field.isBadge ? (
                        <div><span className="badge-status badge-success">Active ✅</span></div>
                      ) : (
                        <div className="detail-value">{field.value}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-800 mb-0">Account Settings</h4>
                  <button className="btn-smart btn-outline-smart py-2 cursor-pointer" onClick={exportSettingsPDF}>📄 Export PDF</button>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="detail-label">Language</label>
                    <select className="input-smart" value={settings.lang} onChange={e => setSettings({...settings, lang: e.target.value})}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="detail-label">Timezone</label>
                    <select className="input-smart" value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})}>
                      <option>IST — Asia/Kolkata (UTC +5:30)</option>
                      <option>UTC — Universal Time</option>
                      <option>PST — Pacific Standard Time</option>
                    </select>
                  </div>
                  <div className="col-12"><hr /></div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                      <div>
                        <div className="fw-bold">Notification Alerts</div>
                        <div className="text-muted small">Receive system alerts in real-time</div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input cursor-pointer" type="checkbox" checked={settings.notifications} onChange={e => setSettings({...settings, notifications: e.target.checked})} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                      <div>
                        <div className="fw-bold">Dashboard Theme</div>
                        <div className="text-muted small">{settings.theme === 'light' ? 'Light Mode' : 'Dark Mode'} Active</div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input cursor-pointer" type="checkbox" checked={settings.theme === 'dark'} onChange={e => setSettings({...settings, theme: e.target.checked ? 'dark' : 'light'})} />
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn-smart btn-primary-smart mt-5 px-5 py-2 cursor-pointer" onClick={handleSaveSettings}>Save All Changes</button>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="animate-fade-in" style={{maxWidth: '500px'}}>
                <h4 className="fw-800 mb-4">Change Password</h4>
                <div className="mb-3">
                  <label className="detail-label">Current Password</label>
                  <input type="password" title="current" className="input-smart" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="detail-label">New Password</label>
                  <input type="password" title="new" className="input-smart" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="detail-label">Confirm New Password</label>
                  <input type="password" title="confirm" className="input-smart" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                </div>
                <button className="btn-smart btn-primary-smart w-100 py-2 cursor-pointer" onClick={handleUpdatePassword}>Update Password</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="side-panel-overlay d-flex align-items-center justify-content-center" style={{zIndex: 9999}}>
          <div className="card-smart p-4" style={{width: '500px'}}>
            <h4 className="fw-800 mb-4">Edit Profile</h4>
            <div className="mb-3">
              <label className="detail-label">Full Name</label>
              <input type="text" title="name" className="input-smart" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="detail-label">Email Address</label>
              <input type="email" title="email" className="input-smart" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="detail-label">Phone Number</label>
              <input type="text" title="phone" className="input-smart" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary flex-grow-1 cursor-pointer" onClick={() => setShowEditProfile(false)}>Cancel</button>
              <button className="btn btn-primary flex-grow-1 cursor-pointer" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
