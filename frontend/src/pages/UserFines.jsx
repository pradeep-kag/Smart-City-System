import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserFines() {
  const [challans, setChallans] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/user/challans');
      setChallans(res.data);
    } catch (e) { 
      toast('Failed to fetch challan data', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const downloadReceiptPDF = (c) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Official Payment Receipt", 14, 25);
      doc.setFontSize(10);
      doc.text("Mumbai Smart City Traffic Police Division", 14, 33);

      // Body
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Receipt ID: RCPT-${c._id.slice(-8).toUpperCase()}`, 14, 55);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 55);
      
      autoTable(doc, {
        startY: 65,
        head: [['Description', 'Details']],
        body: [
          ['Violation Type', c.violation],
          ['Vehicle Number', c.vehicle],
          ['Location', c.address],
          ['Violation Date', c.date],
          ['Status', 'PAID ✅'],
          ['Penalty Amount', `INR ${c.amount}.00`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } }
      });

      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text("Total Paid:", 140, finalY + 15);
      doc.text(`INR ${c.amount}.00`, 170, finalY + 15);

      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("This is a computer-generated document and does not require a physical signature.", 14, finalY + 30);
      doc.text("For any queries, please visit the nearest Traffic Police Helpdesk.", 14, finalY + 35);

      doc.save(`Receipt_${c._id.slice(-6)}.pdf`);
      toast('PDF Receipt Downloaded', 'success');
    } catch (err) {
      console.error("PDF Error:", err);
      toast('Error generating PDF receipt', 'error');
    }
  };

  const downloadStatementPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Traffic Violation Statement", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`User: ${localStorage.getItem('username')}`, 14, 30);
      doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 35);

      const rows = challans.map((c, i) => [
        i + 1,
        c.violation,
        c.vehicle,
        c.date,
        c.status.toUpperCase(),
        `INR ${c.amount}`
      ]);

      autoTable(doc, {
        head: [['#', 'Violation', 'Vehicle', 'Date', 'Status', 'Amount']],
        body: rows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [107, 114, 128] }
      });

      doc.save(`Challan_Statement_${Date.now()}.pdf`);
      toast('Full Statement PDF Downloaded', 'success');
    } catch (err) {
      console.error("Statement PDF Error:", err);
      toast('Error generating statement PDF', 'error');
    }
  };

  const processPayment = (id) => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        await api.post('/user/pay-challan', { id });
        setChallans(challans.map(c => c._id === id ? { ...c, status: 'Paid' } : c));
        toast('Payment Successful! E-Receipt generated.', 'success');
      } catch (err) { 
        toast('Payment gateway error', 'error'); 
      } finally { 
        setProcessing(false); 
      }
    }, 2000);
  };

  if (loading) return <LoadingSpinner text="Syncing with traffic police records..." />;

  const pendingCount = challans.filter(c => c.status === 'Pending').length;

  return (
    <div className="container-fluid p-0">
      {/* Summary Header */}
      <div className="card-smart mb-4 border-0" 
           style={{ background: pendingCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className={`fw-800 mb-1 ${pendingCount > 0 ? 'text-danger' : 'text-success'}`}>
              {pendingCount > 0 ? `You have ${pendingCount} pending challans` : 'All clear! No pending fines'}
            </h4>
            <p className="text-muted small mb-0">Official E-Challan payment portal for Mumbai Traffic Police.</p>
          </div>
          <div className="d-flex gap-2">
            {challans.length > 0 && (
              <button className="btn-smart btn-outline-smart py-2 px-3 small bg-white shadow-sm" onClick={downloadStatementPDF}>
                📥 Export Statement (PDF)
              </button>
            )}
            <div className="fs-1">{pendingCount > 0 ? '📑' : '✅'}</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Challan List */}
        <div className="col-md-8">
          <div className="card-smart">
            <div className="section-header">
              <span>🧾</span> Detailed Violation Records
            </div>
            {challans.length === 0 ? (
              <div className="text-center py-5">
                <div className="fs-1 mb-2">🏆</div>
                <div className="fw-bold">Excellent Record</div>
                <div className="text-muted small">No traffic violations found in the system.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {challans.map(c => (
                  <div key={c._id} className="p-4 border rounded hover-shadow-sm transition-all bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="fw-800 text-dark fs-5">{c.violation}</div>
                        <div className="text-muted x-small uppercase">Vehicle: {c.vehicle} • ID: {c._id.slice(-8).toUpperCase()}</div>
                      </div>
                      <span className={`badge-status ${c.status.toLowerCase() === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="row g-3 mb-4">
                      <div className="col-md-6 border-end">
                        <div className="x-small text-muted uppercase">Location & Date</div>
                        <div className="fw-bold small">{c.address}</div>
                        <div className="text-muted small">{c.date}</div>
                      </div>
                      <div className="col-md-6 ps-md-4">
                        <div className="x-small text-muted uppercase">Penalty Amount</div>
                        <div className="display-6 fw-800 text-danger">₹{c.amount}</div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <div className="text-muted small">Pay via UPI, Card, or Net Banking</div>
                      {c.status.toLowerCase() === 'pending' ? (
                        <button className="btn-smart btn-danger-smart px-5" onClick={() => processPayment(c._id)} disabled={processing}>
                          {processing ? 'Processing...' : 'Pay Fine Now'}
                        </button>
                      ) : (
                        <button className="btn-smart btn-outline-smart px-4" onClick={() => downloadReceiptPDF(c)}>Download Receipt (PDF)</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legal Sidebar */}
        <div className="col-md-4">
          <div className="card-smart">
            <div className="section-header">
              <span>⚖️</span> Traffic Rules & Information
            </div>
            <div className="d-flex flex-column gap-4">
              <div className="p-3 bg-light rounded">
                <div className="fw-bold text-dark small mb-1">New MV Act Guidelines</div>
                <p className="text-muted small mb-0">Under Section 183, speeding penalties have been increased by 200% for repeated offenses.</p>
              </div>

              <div>
                <h6 className="fw-bold text-dark mb-3">Quick Links</h6>
                <div className="d-flex flex-column gap-2">
                  <a href="#" className="text-primary text-decoration-none small">→ How to contest a challan?</a>
                  <a href="#" className="text-primary text-decoration-none small">→ View my traffic license points</a>
                  <a href="#" className="text-primary text-decoration-none small">→ Road safety awareness course</a>
                </div>
              </div>

              <div className="p-3 border border-warning-light bg-warning-light rounded">
                <div className="fw-bold text-warning small mb-1">Payment Notice</div>
                <p className="text-dark small mb-0">Challans unpaid for over 60 days will be auto-transferred to the Lok Adalat system.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
