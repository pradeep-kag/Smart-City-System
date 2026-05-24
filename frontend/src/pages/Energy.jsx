import { useEffect, useState } from 'react';
import api from '../api/axios';
import TrafficChart from '../components/TrafficChart';

export default function Energy() {
  const [loadData, setLoadData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [leaks, setLeaks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ld, fc, lk] = await Promise.all([
        api.get('/energy/power-load'),
        api.get('/energy/forecast-load'),
        api.get('/energy/water-leaks')
      ]);
      setLoadData(ld.data.data);
      setForecast(fc.data.data);
      setLeaks(lk.data.data);
    } catch (e) { console.error(e); }
  };

  // Convert the power load data to the format expected by TrafficChart
  const chartData = loadData.map(d => ({ time: d.time, traffic: d.power_load_mw }));

  return (
    <div className="container-fluid">
      <h2 className="dashboard-title mb-4 text-warning">⚡ Energy & Utilities Dashboard</h2>

      <div className="row g-4 mb-4">
        {/* Power Forecasting */}
        <div className="col-md-4">
          <div className="glass-card p-4 h-100 text-center border-info">
            <h5 className="text-muted mb-3">Power Load Forecast (Prophet)</h5>
            <div className="display-4 fw-bold text-info">{Math.round(forecast[0] || 0)} <span className="fs-6">MW</span></div>
            <p className="text-muted mt-2">Predicted demand for next hour</p>
          </div>
        </div>

        {/* Water Leaks */}
        <div className="col-md-8">
          <div className="glass-card p-4 h-100 border-primary">
            <h5 className="text-light mb-3">💧 Pipeline Leak Detection (Isolation Forest)</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover table-borderless bg-transparent">
                <thead>
                  <tr>
                    <th>Pipeline ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaks.map((l, i) => (
                    <tr key={i}>
                      <td>{l.pipeline_id}</td>
                      <td>
                        <span className={`badge ${l.status.includes('Anomaly') ? 'bg-danger' : 'bg-success'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="glass-card p-4 h-100">
            <h4 className="text-light mb-3">City-Wide Power Load (MW)</h4>
            {chartData.length > 0 && <TrafficChart data={chartData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
