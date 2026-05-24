import { useEffect, useState } from 'react';

export default function UserCityStatus() {
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    // Simulated live vitals
    setVitals({
      temp: 31,
      humidity: 68,
      wind: 12,
      aqi: 84,
      aqiStatus: 'Moderate',
      noise: 65,
      noiseStatus: 'Safe',
      uv: 6,
      uvStatus: 'High',
      updated: new Date().toLocaleTimeString()
    });
  }, []);

  if (!vitals) return null;

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-4">
        {/* Main Weather Card */}
        <div className="col-md-4">
          <div className="card-smart h-100 border-0 text-white" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)' }}>
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold uppercase x-small opacity-75">Current Weather</span>
              <span className="x-small opacity-75">Live • {vitals.updated}</span>
            </div>
            <div className="display-1 fw-800 mb-0">{vitals.temp}°</div>
            <div className="fs-5 mb-4">Partly Cloudy • Mumbai</div>
            
            <div className="row g-3 pt-4 border-top border-white border-opacity-20">
              <div className="col-4">
                <div className="x-small opacity-75">Humidity</div>
                <div className="fw-bold">{vitals.humidity}%</div>
              </div>
              <div className="col-4">
                <div className="x-small opacity-75">Wind</div>
                <div className="fw-bold">{vitals.wind} km/h</div>
              </div>
              <div className="col-4">
                <div className="x-small opacity-75">UV Index</div>
                <div className="fw-bold">{vitals.uv} ({vitals.uvStatus})</div>
              </div>
            </div>
          </div>
        </div>

        {/* AQI Meter */}
        <div className="col-md-4">
          <div className="card-smart h-100 text-center d-flex flex-column justify-content-center">
            <div className="section-header justify-content-center mb-4">
              <span>🌫️</span> Air Quality Index
            </div>
            <div className="display-2 fw-800 text-warning mb-1">{vitals.aqi}</div>
            <div className="badge-status badge-warning mx-auto mb-4">{vitals.aqiStatus}</div>
            <div className="px-4">
              <div className="progress-smart mb-2" style={{ height: '12px' }}>
                <div className="bar bg-warning" style={{ width: '42%' }}></div>
              </div>
              <div className="d-flex justify-content-between x-small text-muted">
                <span>0 Good</span>
                <span>200 Poor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Noise Level */}
        <div className="col-md-4">
          <div className="card-smart h-100 text-center d-flex flex-column justify-content-center">
            <div className="section-header justify-content-center mb-4">
              <span>🔊</span> Noise Pollution
            </div>
            <div className="display-2 fw-800 text-success mb-1">{vitals.noise} dB</div>
            <div className="badge-status badge-success mx-auto mb-4">{vitals.noiseStatus}</div>
            <p className="text-muted small px-3">Ambient noise levels in your current zone are within WHO safety limits.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Health Advisory */}
        <div className="col-md-8">
          <div className="card-smart">
            <div className="section-header">
              <span>🏥</span> AI Health Advisory
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded d-flex gap-3 align-items-start">
                  <div className="fs-3">🏃</div>
                  <div>
                    <div className="fw-bold small">Outdoor Activity</div>
                    <p className="text-muted x-small mb-0">AQI is moderate. Sensitive individuals should limit prolonged outdoor exertion.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded d-flex gap-3 align-items-start">
                  <div className="fs-3">🧴</div>
                  <div>
                    <div className="fw-bold small">Sun Protection</div>
                    <p className="text-muted x-small mb-0">UV Index is High. Apply SPF 30+ sunscreen if outdoors for more than 20 minutes.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded d-flex gap-3 align-items-start">
                  <div className="fs-3">💧</div>
                  <div>
                    <div className="fw-bold small">Hydration Target</div>
                    <p className="text-muted x-small mb-0">Based on 31°C temp, recommended intake today is 3.5 Liters for active adults.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded d-flex gap-3 align-items-start">
                  <div className="fs-3">😷</div>
                  <div>
                    <div className="fw-bold small">Mask Advisory</div>
                    <p className="text-muted x-small mb-0">Not required for general population, but recommended for asthmatic citizens today.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Chart Placeholder */}
        <div className="col-md-4">
          <div className="card-smart h-100">
            <div className="section-header">
              <span>📈</span> 24h AQI Forecast
            </div>
            <div className="py-5 text-center opacity-25">
              <div className="fs-1 mb-2">📊</div>
              <div className="small fw-bold">Predictive Model Loading...</div>
            </div>
            <div className="mt-auto p-3 bg-primary-light rounded border border-primary border-opacity-10">
              <div className="fw-bold text-primary x-small uppercase mb-1">AI Forecast</div>
              <p className="text-dark x-small mb-0">AQI expected to drop to 65 (Good) by tonight as wind speed increases.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
