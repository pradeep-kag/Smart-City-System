import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastProvider';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import LoadingSpinner from '../components/LoadingSpinner';

const INITIAL_SOS_DATA = [
  { id: 'SOS-2026-001', type: '🔥 Fire Emergency', zone: 'Zone A', location: 'Andheri West, Mumbai — 19.1197° N, 72.8464° E', priority: '🔴 Critical', status: 'Resolved ✅', time: 'Apr 25, 2026, 10:00 AM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Fire broke out on 3rd floor of residential building. Residents are trapped. Immediate help needed.', responseTime: '8 minutes', responder: 'Mumbai Fire Brigade — Unit 4', resolvedAt: '10:45 AM' },
  { id: 'SOS-2026-002', type: '🚑 Medical Emergency', zone: 'Zone B', location: 'Bandra West, Mumbai', priority: '🔴 Critical', status: 'Resolved ✅', time: 'Apr 24, 2026, 02:30 PM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Severe chest pain, elderly patient. Need immediate ambulance.', responseTime: '6 minutes', responder: 'City Hospital — Amb-02', resolvedAt: '03:15 PM' },
  { id: 'SOS-2026-003', type: '🚓 Police / Crime', zone: 'Zone C', location: 'Colaba, Mumbai', priority: '🟠 High', status: 'In Progress 🔄', time: 'Apr 24, 2026, 11:00 AM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Suspected theft in progress at neighbor house.', responseTime: 'Ongoing', responder: 'PCR Van 42', resolvedAt: '-' },
  { id: 'SOS-2026-004', type: '🚗 Road Accident', zone: 'Zone A', location: 'Juhu, Mumbai', priority: '🟠 High', status: 'Resolved ✅', time: 'Apr 23, 2026, 08:45 AM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Two car collision, minor injuries reported.', responseTime: '10 minutes', responder: 'Traffic Police Unit 1', resolvedAt: '09:30 AM' },
  { id: 'SOS-2026-005', type: '⚡ Power Outage', zone: 'Zone D', location: 'Dadar, Mumbai', priority: '🟡 Medium', status: 'Resolved ✅', time: 'Apr 22, 2026, 06:00 PM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Complete blackout in Sector 4.', responseTime: '45 minutes', responder: 'Smart Grid Repair Team', resolvedAt: '07:30 PM' },
  { id: 'SOS-2026-006', type: '🌊 Flood / Natural Disaster', zone: 'Zone B', location: 'Versova, Mumbai', priority: '🔴 Critical', status: 'Resolved ✅', time: 'Apr 21, 2026, 03:15 PM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Water entering ground floor houses due to high tide.', responseTime: '15 minutes', responder: 'Disaster Mgmt Force', resolvedAt: '06:00 PM' },
  { id: 'SOS-2026-007', type: '🏚️ Building Collapse', zone: 'Zone C', location: 'Ghatkopar, Mumbai', priority: '🔴 Critical', status: 'Resolved ✅', time: 'Apr 20, 2026, 09:30 AM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Old structure collapsed partially.', responseTime: '5 minutes', responder: 'NDRF Unit 7', resolvedAt: '01:00 PM' },
  { id: 'SOS-2026-008', type: '🆘 Other Emergency', zone: 'Zone A', location: 'Powai, Mumbai', priority: '🟢 Low', status: 'Pending ⏳', time: 'Apr 19, 2026, 04:00 PM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Stray animal in distress near lake.', responseTime: '-', responder: 'Pending Dispatch', resolvedAt: '-' },
  { id: 'SOS-2026-009', type: '🚑 Medical Emergency', zone: 'Zone D', location: 'Borivali, Mumbai', priority: '🟠 High', status: 'Resolved ✅', time: 'Apr 18, 2026, 01:00 PM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Allergic reaction, need medical advice.', responseTime: '12 minutes', responder: 'Local Clinic Outreach', resolvedAt: '01:45 PM' },
  { id: 'SOS-2026-010', type: '🔥 Fire Emergency', zone: 'Zone B', location: 'Santacruz, Mumbai', priority: '🔴 Critical', status: 'Resolved ✅', time: 'Apr 17, 2026, 11:45 AM', name: 'Citizen User', phone: '+91 98765 43210', desc: 'Short circuit in commercial shop.', responseTime: '7 minutes', responder: 'Fire Unit 2', resolvedAt: '12:30 PM' },
];

export default function UserEmergency() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    const userHistory = JSON.parse(localStorage.getItem(`sos_history_${localStorage.getItem('username')}`) || '[]');
    const combined = [...userHistory, ...INITIAL_SOS_DATA];
    setRequests(combined);
    setFilteredRequests(combined);
  }, []);

  useEffect(() => {
    let result = requests.filter(r => 
      (r.id.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())) &&
      (filterType === 'All' || r.type.includes(filterType))
    );
    setFilteredRequests(result);
    setCurrentPage(1);
  }, [search, filterType, requests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedData = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportFullHistoryPDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(220, 38, 38);
    doc.text("Emergency SOS Request History", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated By: ${localStorage.getItem('username')}`, 14, 30);
    doc.text(`Generated On: April 25, 2026 — 10:45 AM`, 14, 35);
    doc.text(`Platform: Smart City System`, 14, 40);

    const tableRows = filteredRequests.map((r, i) => [i + 1, r.id, r.type, r.zone, r.priority.split(' ')[1], r.status.split(' ')[0], r.time]);
    doc.autoTable({
      head: [['#', 'Request ID', 'Emergency Type', 'Zone', 'Priority', 'Status', 'Time']],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      alternateRowStyles: { fillColor: [255, 245, 245] },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          const p = data.cell.raw;
          if (p === 'Critical') data.cell.styles.textColor = [220, 38, 38];
          if (p === 'High') data.cell.styles.textColor = [249, 115, 22];
        }
      }
    });
    doc.text("Smart City System — Emergency SOS Report — Confidential", 14, doc.lastAutoTable.finalY + 10);
    doc.save('sos_request_history_april2026.pdf');
    setLoading(false);
    toast('SOS Report exported successfully', 'success');
  };

  const exportSingleSOSPDF = (r) => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(220, 38, 38);
    doc.text("Emergency SOS Request Detail", 14, 22);
    
    doc.setFontSize(12); doc.setTextColor(0);
    let y = 35;
    const drawLine = (label, value) => {
      doc.setFont("helvetica", "bold"); doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal"); doc.text(`${value}`, 60, y);
      y += 10;
    };
    drawLine("Request ID", r.id);
    drawLine("Emergency Type", r.type);
    drawLine("Full Name", r.name);
    drawLine("Phone", r.phone);
    drawLine("City Zone", r.zone);
    drawLine("Location", r.location);
    drawLine("Priority", r.priority);
    drawLine("Submitted At", r.time);
    drawLine("Status", r.status);
    
    y += 5; doc.setFont("helvetica", "bold"); doc.text("Description:", 14, y);
    y += 7; doc.setFont("helvetica", "normal"); 
    const lines = doc.splitTextToSize(r.desc, 180);
    doc.text(lines, 14, y);
    y += (lines.length * 7) + 5;

    doc.setFont("helvetica", "bold"); doc.text("Timeline:", 14, y); y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`• ${r.time.split(',')[1]} → SOS Submitted by Citizen`, 20, y); y += 7;
    doc.text(`• 10:02 AM → Request received by Control Room`, 20, y); y += 7;
    doc.text(`• 10:04 AM → Responder dispatched: ${r.responder}`, 20, y); y += 7;
    doc.text(`• ${r.resolvedAt} → Emergency resolved successfully`, 20, y);

    doc.save(`sos_request_${r.id}.pdf`);
    setLoading(false);
    toast('SOS Detail Report exported successfully', 'success');
  };

  if (loading) return <LoadingSpinner text="Generating Reports..." />;

  return (
    <div className="container-fluid p-0">
      <div className="card-smart mb-4 border-0 bg-white shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-800 text-dark mb-1">Emergency SOS History</h2>
            <p className="text-muted small">View and audit all your previous emergency requests</p>
          </div>
          <button className="btn-smart btn-danger-smart px-4 cursor-pointer" onClick={exportFullHistoryPDF}>📄 Export Full History PDF</button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <input type="text" className="input-smart" placeholder="Search by ID or Type..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="select-smart" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option>All Types</option>
              <option>Fire Emergency</option>
              <option>Medical Emergency</option>
              <option>Police / Crime</option>
              <option>Road Accident</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table-smart">
            <thead>
              <tr>
                <th>#</th>
                <th>Request ID</th>
                <th>Emergency Type</th>
                <th>Zone</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r, i) => (
                <tr key={r.id} className="cursor-pointer" onClick={() => setSelectedSOS(r)}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td className="fw-bold text-primary">{r.id}</td>
                  <td>{r.type}</td>
                  <td>{r.zone}</td>
                  <td>{r.priority}</td>
                  <td>
                    <span className={`badge-status ${r.status.includes('Resolved') ? 'badge-success' : r.status.includes('In Progress') ? 'badge-info' : 'badge-warning'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-muted small">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted small">Showing {paginatedData.length} of {filteredRequests.length} entries</div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
            <div className="d-flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
            <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* SOS DETAIL MODAL */}
      {selectedSOS && (
        <div className="side-panel-overlay d-flex align-items-center justify-content-center" style={{zIndex: 9999}}>
          <div className="card-smart p-0 overflow-hidden animate-fade-in" style={{width: '600px', maxWidth: '95%'}}>
            <div className="p-4 bg-danger text-white d-flex justify-content-between align-items-center">
              <h4 className="fw-800 mb-0">Incident Details: {selectedSOS.id}</h4>
              <button className="btn-close btn-close-white" onClick={() => setSelectedSOS(null)}></button>
            </div>
            <div className="p-4 bg-white">
              <div className="row g-4 mb-4">
                <div className="col-md-6"><div className="detail-label">Request ID</div><div className="detail-value text-primary fw-800">{selectedSOS.id}</div></div>
                <div className="col-md-6"><div className="detail-label">Emergency Type</div><div className="detail-value">{selectedSOS.type}</div></div>
                <div className="col-md-6"><div className="detail-label">Full Name</div><div className="detail-value">{selectedSOS.name}</div></div>
                <div className="col-md-6"><div className="detail-label">Phone</div><div className="detail-value">{selectedSOS.phone}</div></div>
                <div className="col-md-6"><div className="detail-label">City Zone</div><div className="detail-value">{selectedSOS.zone}</div></div>
                <div className="col-md-6"><div className="detail-label">Priority</div><div className="detail-value">{selectedSOS.priority}</div></div>
                <div className="col-12"><div className="detail-label">Location</div><div className="detail-value">{selectedSOS.location}</div></div>
                <div className="col-12">
                  <div className="detail-label">Description</div>
                  <div className="p-3 bg-light rounded small italic">"{selectedSOS.desc}"</div>
                </div>
              </div>

              <div className="border-top pt-4">
                <div className="detail-label mb-3">Response Timeline</div>
                <div className="timeline-smart">
                  <div className="timeline-item d-flex gap-3 mb-3">
                    <div className="timeline-marker bg-danger"></div>
                    <div><div className="fw-bold small">{selectedSOS.time.split(',')[1]}</div><div className="text-muted x-small">SOS Submitted by Citizen</div></div>
                  </div>
                  <div className="timeline-item d-flex gap-3 mb-3">
                    <div className="timeline-marker bg-warning"></div>
                    <div><div className="fw-bold small">10:02 AM</div><div className="text-muted x-small">Request received by Control Room</div></div>
                  </div>
                  <div className="timeline-item d-flex gap-3 mb-3">
                    <div className="timeline-marker bg-primary"></div>
                    <div><div className="fw-bold small">10:04 AM</div><div className="text-muted x-small">{selectedSOS.responder} dispatched</div></div>
                  </div>
                  <div className="timeline-item d-flex gap-3">
                    <div className="timeline-marker bg-success"></div>
                    <div><div className="fw-bold small">{selectedSOS.resolvedAt}</div><div className="text-muted x-small">Emergency resolved successfully</div></div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button className="btn btn-outline-danger flex-grow-1 py-2 cursor-pointer" onClick={() => exportSingleSOSPDF(selectedSOS)}>📄 Export PDF</button>
                <button className="btn btn-secondary flex-grow-1 py-2 cursor-pointer" onClick={() => setSelectedSOS(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
