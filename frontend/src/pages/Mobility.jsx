import { useEffect, useState } from 'react';
import api from '../api/axios';
import TrafficChart from '../components/TrafficChart';
import MapWidget from '../components/MapWidget';

export default function Mobility() {
  const [trafficData, setTrafficData] = useState([]);
  const [parkingData, setParkingData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [signals, setSignals] = useState(null);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tr, pk, pr, sg, hs] = await Promise.all([
        api.get('/mobility/traffic'),
        api.get('/mobility/parking'),
        api.get('/mobility/predict-traffic'),
        api.get('/mobility/signals'),
        api.get('/mobility/accidents')
      ]);
      setTrafficData(tr.data.data);
      setParkingData(pk.data.data);
      setPrediction(pr.data.prediction);
      setSignals(sg.data.data);
      setHotspots(hs.data.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="container-fluid">
      <h2 className="dashboard-title mb-4">🚦 Smart Traffic & Mobility</h2>
      
      {/* Top row metrics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="glass-card p-3 h-100 text-center border-primary">
            <h5 className="text-muted">Traffic Prediction (1hr)</h5>
            <h2 className="text-light fw-bold">{prediction || '...'} <span className="fs-6 fw-normal">vehicles</span></h2>
            <small className="text-success">Powered by LSTM</small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="glass-card p-3 h-100 border-warning">
            <h5 className="text-muted">Adaptive Signals (YOLO)</h5>
            <div className="d-flex justify-content-around mt-3">
              {signals && Object.keys(signals).map(dir => (
                <div key={dir} className="text-center">
                  <h6 className="text-light">{dir}</h6>
                  <span className={`badge ${signals[dir].density === 'High' ? 'bg-danger' : 'bg-success'}`}>
                    {signals[dir].density} Traffic
                  </span>
                  <br/><small className="text-muted">{signals[dir].green_time_sec}s Green Time</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-3 h-100 text-center border-danger">
            <h5 className="text-muted">Accident Hotspots (XGBoost)</h5>
            <ul className="list-unstyled mt-2">
              {hotspots.slice(0, 2).map((h, i) => (
                <li key={i} className="text-light small">
                  {h.location} - <strong className={h.accident_risk === 'High' ? 'text-danger' : 'text-warning'}>{h.accident_risk} Risk</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="row g-4">
        <div className="col-md-8">
          <div className="glass-card p-4 h-100">
            <h4 className="text-light mb-3">Live Traffic Volume</h4>
            {trafficData.length > 0 && <TrafficChart data={trafficData} />}
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h4 className="text-light mb-3">Smart Parking Availability</h4>
            {parkingData.length > 0 && <MapWidget parkingData={parkingData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
