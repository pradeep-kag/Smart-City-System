import { useState, useEffect, useRef } from 'react';
import { exportToPDF } from '../utils/exportUtils';
import { useToast } from '../components/ToastProvider';

/**
 * HIGH-QUALITY TRAFFIC FOOTAGE NODES
 * Using dedicated city traffic streams for each Mumbai location.
 */
const CCTV_NODES = [
  { 
    id: 'NODE-01', 
    location: 'Bandra Junction', 
    type: 'Traffic', 
    video: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-busy-city-at-night-4228-large.mp4' 
  },
  { 
    id: 'NODE-02', 
    location: 'Marine Drive', 
    type: 'Flow Monitoring', 
    video: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-viewed-from-above-4243-large.mp4' 
  },
  { 
    id: 'NODE-03', 
    location: 'CST Hub', 
    type: 'Station Traffic', 
    video: 'https://assets.mixkit.co/videos/preview/mixkit-busy-street-in-a-city-at-night-4244-large.mp4' 
  },
  { 
    id: 'NODE-04', 
    location: 'Dharavi Main Road', 
    type: 'Congestion Watch', 
    video: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-on-a-highway-4242-large.mp4' 
  },
  { 
    id: 'NODE-05', 
    location: 'Colaba Intersection', 
    type: 'Urban Flow', 
    video: 'https://assets.mixkit.co/videos/preview/mixkit-cars-driving-fast-at-night-4229-large.mp4' 
  },
  { 
    id: 'NODE-06', 
    location: 'Andheri Highway', 
    type: 'Speed Monitoring', 
    video: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-on-a-busy-city-street-at-night-4231-large.mp4' 
  },
];

const LiveFeed = ({ node, isExpanded, onExpand }) => {
  const [objects, setObjects] = useState([]);
  const videoRef = useRef(null);

  // AI Bounding Box Simulation - Traffic Focus (Cars/Buses)
  useEffect(() => {
    const interval = setInterval(() => {
      const newObjects = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({
        id: i,
        top: Math.random() * 40 + 30 + '%',
        left: Math.random() * 70 + 15 + '%',
        width: Math.random() * 120 + 80 + 'px',
        height: Math.random() * 80 + 50 + 'px',
        label: Math.random() > 0.2 ? 'Vehicle' : 'Bus'
      }));
      setObjects(newObjects);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`cctv-node ${isExpanded ? 'expanded' : ''}`} onClick={() => !isExpanded && onExpand(node)}>
      <div className="cctv-header">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-danger rounded-circle pulse-red" style={{width: '10px', height: '10px'}}></div>
          <span className="font-mono text-white small fw-800">{node.id} // TRAFFIC_LIVE</span>
        </div>
        <div className="xx-small text-cyan font-mono opacity-75">{node.location.toUpperCase()}</div>
      </div>
      
      <div className="video-container">
        {/* CONTINUOUS TRAFFIC VIDEO */}
        <video 
          key={node.video}
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="auto"
          className="cctv-video-element"
        >
          <source src={node.video} type="video/mp4" />
        </video>
        
        {/* AI TRAFFIC DETECTION */}
        {objects.map(obj => (
          <div key={obj.id} className="ai-detector-box" style={{ top: obj.top, left: obj.left, width: obj.width, height: obj.height }}>
            <span className="ai-tag">{obj.label.toUpperCase()} // DETECTED_{Math.floor(Math.random() * 10 + 90)}%</span>
          </div>
        ))}

        {/* HUD Overlay */}
        <div className="hud-layer">
          <div className="d-flex justify-content-between p-3 font-mono xx-small text-white" style={{background: 'linear-gradient(rgba(0,0,0,0.7), transparent)'}}>
            <div>STREAM_STATUS: OPTIMAL</div>
            <div className="text-end">FPS: 60.0 // 4K_UHD</div>
          </div>
          <div className="crosshair-center"></div>
        </div>

        {/* PTZ UI ELEMENTS */}
        <div className="ptz-overlay">
          <div className="ptz-bracket tl"></div>
          <div className="ptz-bracket tr"></div>
          <div className="ptz-bracket bl"></div>
          <div className="ptz-bracket br"></div>
        </div>
      </div>

      {isExpanded && (
        <div className="cctv-footer-controls animate-fade-in">
          <div className="d-flex gap-2">
            <button className="ctrl-btn">L</button>
            <button className="ctrl-btn">U</button>
            <button className="ctrl-btn">D</button>
            <button className="ctrl-btn">R</button>
          </div>
          <div className="font-mono xx-small text-white opacity-50 ms-3">PAN_TILT_ZOOM_ACTIVE</div>
          <button className="btn-close-cctv" onClick={(e) => { e.stopPropagation(); onExpand(null); }}>CLOSE_GRID</button>
        </div>
      )}
    </div>
  );
};

export default function AdminSurveillance() {
  const [expandedNode, setExpandedNode] = useState(null);
  const [logs, setLogs] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      const node = CCTV_NODES[Math.floor(Math.random() * CCTV_NODES.length)];
      const type = Math.random() > 0.85 ? 'CONGESTION_ALERT' : 'FLOW_OPTIMIZED';
      const logEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        node: node.id,
        msg: type,
        status: type === 'CONGESTION_ALERT' ? 'critical' : 'normal'
      };
      setLogs(prev => [logEntry, ...prev].slice(0, 15));
      if (type === 'CONGESTION_ALERT') toast(`Traffic Alert: High Congestion at ${node.location}`, 'warning');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="surv-wrapper">
      <div className="row g-3 h-100">
        <div className="col-lg-9 h-100">
          <div className={`video-matrix ${expandedNode ? 'focus-mode' : ''}`}>
            {CCTV_NODES.map(node => (
              <LiveFeed 
                key={node.id} 
                node={node} 
                isExpanded={expandedNode?.id === node.id} 
                onExpand={setExpandedNode} 
              />
            ))}
          </div>
        </div>

        <div className="col-lg-3 h-100">
          <div className="surv-info-panel shadow-lg">
            <div className="panel-header">
              <div className="font-mono text-primary fw-800 fs-5">TRAFFIC_CONTROL_OS</div>
              <div className="xx-small opacity-50 mt-1">MUMBAI_SMART_CITY_V10.2</div>
            </div>

            <div className="panel-body flex-grow-1 overflow-hidden">
              <div className="section-label font-mono x-small text-muted mb-3">TRAFFIC_TELEMETRY</div>
              <div className="telemetry-scroll">
                {logs.map(log => (
                  <div key={log.id} className={`log-card ${log.status}`}>
                    <div className="d-flex justify-content-between xx-small font-mono mb-1">
                      <span className="text-muted">{log.time}</span>
                      <span className="text-primary">{log.node}</span>
                    </div>
                    <div className="small fw-bold font-mono text-white">{log.msg}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-footer p-3">
              <button className="btn-smart btn-primary-smart w-100 font-mono py-2 shadow-sm" onClick={exportToPDF}>
                GENERATE_FLOW_REPORT
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .surv-wrapper { height: calc(100vh - 120px); background: #000; padding: 20px; color: #fff; }
        .font-mono { font-family: 'SFMono-Regular', Consolas, monospace; }
        .x-small { font-size: 11px; }
        .xx-small { font-size: 9px; }
        .text-cyan { color: #22d3ee; }
        
        .video-matrix { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 15px; height: 100%; transition: 0.5s ease-in-out; }
        .video-matrix.focus-mode { grid-template-columns: 1fr; grid-template-rows: 1fr; }
        .video-matrix.focus-mode .cctv-node:not(.expanded) { display: none; }

        .cctv-node { background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: 0.2s; }
        .cctv-node:hover { border-color: #3b82f6; box-shadow: 0 0 25px rgba(59, 130, 246, 0.4); }
        .cctv-header { padding: 10px 15px; background: #111827; display: flex; justify-content: space-between; align-items: center; }
        .pulse-red { animation: pulse 1s infinite; box-shadow: 0 0 10px #ef4444; }
        @keyframes pulse { 0% { opacity: 0.5; } 100% { opacity: 1; } }

        .video-container { flex-grow: 1; position: relative; background: #000; overflow: hidden; }
        .cctv-video-element { width: 100%; height: 100%; object-fit: cover; filter: brightness(1) contrast(1.1); }
        
        .ai-detector-box { position: absolute; border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.1); pointer-events: none; transition: 1s ease-in-out; }
        .ai-tag { position: absolute; top: -18px; left: -2px; background: #3b82f6; color: #fff; font-size: 8px; padding: 0 5px; font-family: monospace; white-space: nowrap; }

        .hud-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; }
        .crosshair-center { position: absolute; top: 50%; left: 50%; width: 50px; height: 50px; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; transform: translate(-50%, -50%); }
        
        .ptz-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .ptz-bracket { position: absolute; width: 30px; height: 30px; border: 2px solid rgba(255,255,255,0.2); }
        .tl { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .tr { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
        .bl { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
        .br { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

        .cctv-footer-controls { padding: 12px; background: #111827; display: flex; align-items: center; gap: 10px; }
        .ctrl-btn { width: 35px; height: 35px; background: #1e293b; border: 1px solid #334155; color: #fff; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .btn-close-cctv { margin-left: auto; background: #dc2626; border: none; color: #fff; padding: 6px 16px; font-size: 11px; border-radius: 4px; font-weight: bold; }

        .surv-info-panel { background: #0f172a; border-radius: 12px; display: flex; flex-direction: column; height: 100%; overflow: hidden; border: 1px solid #1e293b; }
        .panel-header { padding: 25px; background: #111827; border-bottom: 1px solid #1e293b; }
        .panel-body { padding: 20px; display: flex; flex-direction: column; overflow: hidden; }
        .telemetry-scroll { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .log-card { padding: 12px; background: #1e293b; border-radius: 6px; border-left: 4px solid #3b82f6; }
        .log-card.critical { border-left-color: #facc15; background: rgba(250, 204, 21, 0.05); }
      `}</style>
    </div>
  );
}
