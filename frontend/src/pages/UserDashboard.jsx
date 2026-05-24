import { useEffect, useState, useRef } from 'react';
import { useToast } from '../components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import TrafficChart from '../components/TrafficChart';
import ChatbotWidget from '../components/ChatbotWidget';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader } from '@googlemaps/js-api-loader';
import Groq from 'groq-sdk';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering in Leaflet
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function UserDashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [cityVitals, setCityVitals] = useState({ aqi: 0, weather: '', temp: 0 });
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosStep, setSosStep] = useState(1); // 1: Form, 2: Success
  const [lastSOSId, setLastSOSId] = useState('');
  
  // AI Route Optimizer State
  const [locationState, setLocationState] = useState('prompt'); // prompt, granted, denied
  const [mapLoading, setMapLoading] = useState(true);
  const [fromLocation, setFromLocation] = useState('');
  const [userCoords, setUserCoords] = useState({ lat: 0, lng: 0 });
  const [leafletCoords, setLeafletCoords] = useState([]); // Array of [lat, lng]
  const [locationLoading, setLocationLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [routeResults, setRouteResults] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [destination, setDestination] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(0);

  // Map Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  const toast = useToast();
  const navigate = useNavigate();

  const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const [sosForm, setSosForm] = useState({
    name: userProfile.name || localStorage.getItem('username') || '',
    phone: userProfile.phone || '+91 98765 43210',
    zone: 'Zone A',
    location: 'Bandra West, Mumbai — 19.05° N, 72.82° E',
    type: '🔥 Fire Emergency',
    description: '',
    priority: '🔴 Critical'
  });

  const INITIAL_ROUTES = [
    { id: 1, from: 'Andheri West', to: 'Bandra Kurla Complex', distance: '8.2 km', time: '18 min', traffic: '🟢 Light', aqi: '🟢 42', date: 'Apr 25' },
    { id: 2, from: 'Andheri West', to: 'Nariman Point', distance: '21.5 km', time: '45 min', traffic: '🟡 Mod', aqi: '🟡 88', date: 'Apr 24' },
    { id: 3, from: 'Borivali', to: 'Dadar', distance: '18.3 km', time: '38 min', traffic: '🔴 Heavy', aqi: '🔴 142', date: 'Apr 24' },
    { id: 4, from: 'Andheri West', to: 'Powai', distance: '9.7 km', time: '24 min', traffic: '🟢 Light', aqi: '🟢 51', date: 'Apr 23' },
    { id: 5, from: 'Malad', to: 'Churchgate', distance: '24.1 km', time: '52 min', traffic: '🟡 Mod', aqi: '🟡 95', date: 'Apr 23' },
    { id: 6, from: 'Andheri West', to: 'Thane', distance: '22.8 km', time: '48 min', traffic: '🔴 Heavy', aqi: '🔴 138', date: 'Apr 22' },
    { id: 7, from: 'Goregaon', to: 'Lower Parel', distance: '19.4 km', time: '41 min', traffic: '🟡 Mod', aqi: '🟢 67', date: 'Apr 22' },
    { id: 8, from: 'Andheri West', to: 'Navi Mumbai', distance: '31.2 km', time: '58 min', traffic: '🟢 Light', aqi: '🟡 78', date: 'Apr 21' },
  ];

  useEffect(() => {
    fetchData();
    const history = JSON.parse(localStorage.getItem(`route_history_${localStorage.getItem('username')}`) || '[]');
    setRouteHistory(history.length > 0 ? history : INITIAL_ROUTES);
    initGoogleMaps();
  }, []);

  const initGoogleMaps = async () => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry", "directions"]
    });

    try {
      const google = await loader.load();
      window.google = google;
      setGoogleMapsLoaded(true);
      setMapLoading(false);

      // Initialize Map Instance if container is ready
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 19.0760, lng: 72.8777 }, // Mumbai default
          mapTypeId: "roadmap",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
          ]
        });

        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          polylineOptions: {
            strokeColor: "#1a73e8",
            strokeWeight: 6,
            strokeOpacity: 0.9
          }
        });
      }

      const input = document.getElementById("destination-input");
      if (input && !autocompleteRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(input, {
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "in" },
          fields: ["place_id", "geometry", "name", "formatted_address"]
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.geometry) {
            setDestination({
              name: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });
          }
        });
      }
    } catch (e) {
      console.error("Google Maps Load Error:", e);
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (userCoords.lat !== 0 && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userCoords);
      mapInstanceRef.current.setZoom(14);
      
      new window.google.maps.Marker({
        position: userCoords,
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      });
    }
  }, [userCoords]);

  const getRealAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lng=${lng}&format=json`);
      const data = await response.json();
      const addr = data.address;
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || '';
      const city = addr.city || addr.town || addr.village || '';
      const state = addr.state || '';
      setFromLocation(`${suburb ? suburb + ', ' : ''}${city}${state ? ', ' + state : ''}`);
    } catch (error) {
      setFromLocation(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
    }
  };

  const requestLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationState('granted');
          await getRealAddress(lat, lng);
          setLocationLoading(false);
          toast('Live location detected!', 'success');
        },
        (error) => {
          setLocationState('denied');
          setLocationLoading(false);
          toast('Location access denied. Please enter manually.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [traffic, env] = await Promise.all([
        api.get('/mobility/traffic'),
        api.get('/environment/aqi')
      ]);
      
      setTrafficData(traffic.data.data);
      const firstZone = env.data.data[0];
      setCityVitals({
        aqi: firstZone.aqi,
        temp: 28 + Math.floor(Math.random() * 5),
        weather: 'Mostly Sunny'
      });
    } catch (e) {
      toast('Failed to sync city data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSOS = () => {
    const id = `SOS-2026-${Math.floor(Math.random() * 900) + 100}`;
    const newRequest = {
      ...sosForm,
      id,
      status: 'Pending ⏳',
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    };
    
    // Save to local storage history
    const history = JSON.parse(localStorage.getItem(`sos_history_${localStorage.getItem('username')}`) || '[]');
    localStorage.setItem(`sos_history_${localStorage.getItem('username')}`, JSON.stringify([newRequest, ...history]));
    
    // Notify Admin Panel
    const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const newAdminNotif = {
      id: Date.now(),
      type: 'error',
      icon: '🚨',
      title: 'CRITICAL SOS RECEIVED',
      desc: `${sosForm.type} reported by ${sosForm.name} in ${sosForm.zone}`,
      time: 'Just Now',
      unread: true,
      details: {
        status: 'Critical 🔴',
        description: `Emergency Type: ${sosForm.type}. ${sosForm.description || 'No description provided.'}`,
        time: new Date().toLocaleString(),
        triggeredBy: sosForm.name,
        affectedZone: sosForm.zone,
        action_required: 'Dispatch Nearest Unit Immediately'
      }
    };
    localStorage.setItem('admin_notifications', JSON.stringify([newAdminNotif, ...adminNotifs]));

    setLastSOSId(id);
    setSosStep(2);
  };

  const handleAnalyzeRoute = async (e) => {
    e.preventDefault();
    const destInput = document.getElementById("destination-input")?.value;
    if (!destInput || !fromLocation) {
      toast('Please enter a destination', 'warning');
      return;
    }
    
    setAnalyzing(true);
    setRouteResults(null);
    setAiRecommendation('');
    setDirectionsResponse(null);

    try {
      const google = window.google;
      const hasRealKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY && !import.meta.env.VITE_GOOGLE_MAPS_API_KEY.includes('your_');
      
      const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

      if (google && hasRealKey) {
        // CASE A: FULL GOOGLE MAPS INTEGRATION
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
          origin: fromLocation,
          destination: destInput,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          drivingOptions: { departureTime: new Date(), trafficModel: "bestguess" }
        });

        if (result.status === "OK") {
          setDirectionsResponse(result);
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
            directionsRendererRef.current.setRouteIndex(0);
          }
          const bounds = new google.maps.LatLngBounds();
          result.routes[0].legs[0].steps.forEach(step => {
            bounds.extend(step.start_location);
            bounds.extend(step.end_location);
          });
          if (mapInstanceRef.current) mapInstanceRef.current.fitBounds(bounds);

          const googleRoutes = result.routes.map((r, i) => ({
            index: i,
            via: r.summary,
            distance: r.legs[0].distance.text,
            duration: r.legs[0].duration.text,
            durationInTraffic: r.legs[0].duration_in_traffic?.text || r.legs[0].duration.text,
            trafficStatus: r.legs[0].duration_in_traffic?.value > r.legs[0].duration.value * 1.3 ? '🔴 Heavy' : '🟢 Light'
          }));

          setRouteResults({ from: fromLocation, to: destInput, routes: googleRoutes });
          setSelectedRoute(0);
          saveToLocalHistory(fromLocation, destInput, googleRoutes);

          const routeDataString = googleRoutes.map(r => `Route ${r.index+1} via ${r.via}: ${r.distance}, ${r.durationInTraffic}`).join('\n');
          const aiResponse = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are the Smart City AI Navigator. Analyze the provided routes and give a 2-3 sentence recommendation." },
              { role: "user", content: `Travel from ${fromLocation} to ${destInput}. Routes:\n${routeDataString}` }
            ],
            temperature: 0.5
          });
          setAiRecommendation(aiResponse.choices[0].message.content);
          toast('High-Precision Route Analysis Complete!', 'success');
        } else {
          throw new Error(`Google Maps Error: ${result.status}`);
        }
      } else {
        // CASE B: GROQ-ONLY INTELLIGENT ROUTING (NO GOOGLE KEY)
        toast('Synchronizing AI Routing Core...', 'info');
        
        const aiRoutingResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: `You are the Smart City AI Routing Engine. 
              Generate 3 realistic route options in JSON format. 
              Also include a 'path' array of 8-10 [lat, lng] coordinates for the primary route starting from ${userCoords.lat}, ${userCoords.lng} towards ${destInput}.
              Output MUST be valid JSON only. 
              Format: { "routes": [ { "via": "Road Name", "distance": "XX km", "duration": "XX min", "durationInTraffic": "XX min", "trafficStatus": "🟢 Light/🔴 Heavy" } ], "path": [[lat, lng], ...], "recommendation": "Summary here" }`
            },
            { role: "user", content: `Generate routes and coordinates from ${fromLocation} to ${destInput}.` }
          ],
          temperature: 0.6,
          response_format: { type: "json_object" }
        });

        const data = JSON.parse(aiRoutingResponse.choices[0].message.content);
        setRouteResults({ from: fromLocation, to: destInput, routes: data.routes });
        setAiRecommendation(data.recommendation);
        setLeafletCoords(data.path || []);
        setSelectedRoute(0);
        saveToLocalHistory(fromLocation, destInput, data.routes);
        toast('AI-Powered Route Discovery Complete!', 'success');
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      toast('AI Routing Engine is currently overwhelmed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const highlightRouteOnMap = (index) => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setRouteIndex(index);
    }
    setSelectedRoute(index);
    toast(`Switched to Route ${index + 1}`, 'info');
  };

  const openInGoogleMaps = () => {
    if (!routeResults) return;
    const origin = `${userCoords.lat},${userCoords.lng}`;
    const dest = encodeURIComponent(destination?.name || document.getElementById("destination-input")?.value);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const resetRoute = () => {
    setRouteResults(null);
    setAiRecommendation('');
    setDirectionsResponse(null);
    setSelectedRoute(0);
    setLeafletCoords([]);
    if (directionsRendererRef.current) directionsRendererRef.current.setDirections({ routes: [] });
  };

  const saveToLocalHistory = (from, to, routes) => {
    const newEntry = { 
      id: Date.now(), 
      from: from.split(',')[0], 
      to: to.split(',')[0], 
      distance: routes[0].distance, 
      time: routes[0].duration || routes[0].time, 
      traffic: routes[0].trafficStatus || routes[0].traffic, 
      aqi: `🟢 45`, 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    };
    const updatedHistory = [newEntry, ...routeHistory.slice(0, 7)];
    setRouteHistory(updatedHistory);
    localStorage.setItem(`route_history_${localStorage.getItem('username')}`, JSON.stringify(updatedHistory));
  };

  const exportRoutePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(37, 99, 235);
    doc.text("AI Route Optimizer Report", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated By: ${localStorage.getItem('username')}`, 14, 30);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`From: ${fromLocation}`, 14, 40);
    doc.text(`To: ${destination?.name || 'Manual Input'}`, 14, 45);

    if (routeResults) {
      doc.setFontSize(14); doc.setTextColor(0); doc.text("Real-Time Route Options", 14, 55);
      
      const analysisRows = routeResults.routes.map((r, i) => [
        i === 0 ? 'Best' : `Alt ${i}`,
        r.via,
        r.distance,
        r.time,
        r.durationInTraffic,
        r.traffic.split(' ')[1]
      ]);

      doc.autoTable({
        head: [['Type', 'Via', 'Distance', 'Time', 'Traffic Time', 'Status']],
        body: analysisRows,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      });
      
      doc.setFontSize(14); doc.text("🤖 AI Commute Analysis", 14, doc.lastAutoTable.finalY + 15);
      doc.setFontSize(10); doc.setFont("helvetica", "italic");
      const aiText = doc.splitTextToSize(aiRecommendation || "Analysis pending...", 180);
      doc.text(aiText, 14, doc.lastAutoTable.finalY + 25);
    }

    const startY = routeResults ? doc.lastAutoTable.finalY + 60 : 60;
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("My Recent Route Activity", 14, startY > 250 ? 20 : startY);
    const historyRows = routeHistory.map((r, i) => [i + 1, r.from, r.to, r.distance, r.time, r.traffic.split(' ')[1], r.date]);
    doc.autoTable({
      head: [['#', 'Origin', 'Destination', 'Distance', 'Time', 'Traffic', 'Date']],
      body: historyRows,
      startY: (startY > 250 ? 25 : startY + 5),
      theme: 'grid',
      headStyles: { fillColor: [107, 114, 128] }
    });

    doc.setFontSize(10); doc.setTextColor(150);
    doc.text("Smart City System — Confidential Route Intelligence Report", 14, doc.internal.pageSize.height - 10);
    doc.save(`smart_city_route_${Date.now()}.pdf`);
    toast('Route PDF exported successfully', 'success');
  };

  if (loading) return <LoadingSpinner text="Connecting to city grid..." />;

  return (
    <div className="container-fluid p-0">
      {/* Location Permission Banner */}
      {locationState === 'prompt' && (
        <div className="card-smart mb-4 border-primary bg-primary-light animate-fade-in">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="fs-3">📍</span>
              <div>
                <div className="fw-bold text-primary">Smart City System wants to access your location</div>
                <div className="text-dark small">To provide real-time route optimization based on traffic density and AQI levels, we need your current location.</div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary py-2 px-4 cursor-pointer" onClick={requestLocation}>✅ Allow Location</button>
              <button className="btn btn-outline-secondary py-2 px-4 cursor-pointer" onClick={() => setLocationState('denied')}>❌ Deny</button>
            </div>
          </div>
        </div>
      )}

      {/* City Overview Header */}
      <div className="card-smart mb-4 border-0 text-white" 
           style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
        <div className="row align-items-center">
          <div className="col-md-8">
            <h2 className="fw-800 mb-2">Good Day, Citizen</h2>
            <p className="opacity-75 mb-0">The city is breathing well today. AI systems are optimizing your commute.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button className="btn-smart bg-white text-primary fw-bold btn-sos-trigger" onClick={() => setShowSOSModal(true)}>
              🚨 Request Emergency SOS
            </button>
          </div>
        </div>
      </div>

      {/* Quick Vitals */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon">🌤️</div>
            <div className="kpi-label">Current Weather</div>
            <div className="kpi-value">{cityVitals.temp}°C</div>
            <div className="kpi-change text-info">{cityVitals.weather}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-card kpi-green">
            <div className="kpi-icon">🌫️</div>
            <div className="kpi-label">Air Quality (AQI)</div>
            <div className="kpi-value">{cityVitals.aqi}</div>
            <div className="kpi-change text-success">Good — Breathable</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-card kpi-amber">
            <div className="kpi-icon">🅿️</div>
            <div className="kpi-label">Parking Available</div>
            <div className="kpi-value">42%</div>
            <div className="kpi-change text-warning">Limited in BKC Zone</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* AI Route Optimizer */}
        <div className="col-md-6">
          <div className="card-smart h-100">
            <div className="section-header">
              <span>📍</span> AI Route Optimizer
            </div>
            <p className="text-muted small mb-4">Real-time analysis based on traffic density and AQI levels.</p>
            
            <form onSubmit={handleAnalyzeRoute} className="d-flex flex-column gap-3 mb-4">
              <div className="p-3 border rounded bg-light">
                <label className="detail-label">📍 FROM (Current Location)</label>
                {locationLoading ? (
                  <div className="d-flex align-items-center gap-2 py-1">
                    <span className="spinner-border spinner-border-sm text-primary"></span>
                    <span className="text-muted small">Detecting your live location...</span>
                  </div>
                ) : locationState === 'granted' ? (
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-success fw-bold small">
                      ✅ {fromLocation} <span className="opacity-50 ms-1 fw-normal">({userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°)</span>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-primary py-1 px-2 text-decoration-none small border-0 hover-shadow-sm" onClick={requestLocation}>🔄 Refresh</button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-1">
                    <input type="text" className="input-smart" placeholder="Enter starting location manually..." value={fromLocation} onChange={e => setFromLocation(e.target.value)} required />
                    {locationState === 'denied' && <div className="text-warning x-small">⚠️ Location access denied. Please enter manually.</div>}
                  </div>
                )}
              </div>

              <div className="p-3 border rounded bg-white">
                <label className="detail-label">🏁 TO (Destination)</label>
                <div className="position-relative">
                  <input id="destination-input" type="text" className="input-smart pe-5" placeholder="Where are you heading today?" required />
                  <span className="position-absolute end-0 top-50 translate-middle-y me-3 opacity-50">🔍</span>
                </div>
              </div>

              <button type="submit" className="btn-smart btn-primary-smart py-3 w-100 fw-800 d-flex align-items-center justify-content-center" disabled={analyzing}>
                {analyzing ? <span className="spinner-border spinner-border-sm me-2"></span> : '🔍 Analyze Route'}
              </button>
            </form>

            <div id="route-map-container" 
                   style={{ height: '420px', width: '100%', position: 'relative', background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden' }}>
                
                {/* Fallback Leaflet Map if Google is unavailable */}
                {(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY.includes('your_')) ? (
                  <MapContainer 
                    center={[userCoords.lat || 19.0760, userCoords.lng || 72.8777]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapRecenter center={[userCoords.lat, userCoords.lng]} />
                    
                    {userCoords.lat !== 0 && (
                      <Marker position={[userCoords.lat, userCoords.lng]}>
                        <Popup>Your Current Location</Popup>
                      </Marker>
                    )}
                    
                    {leafletCoords.length > 0 && (
                      <>
                        <Polyline positions={leafletCoords} color="blue" weight={5} opacity={0.7} />
                        <Marker position={leafletCoords[leafletCoords.length - 1]}>
                          <Popup>Destination: {routeResults?.to}</Popup>
                        </Marker>
                      </>
                    )}
                  </MapContainer>
                ) : (
                  <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
                    {mapLoading && (
                      <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <div className="text-muted small">Initializing City Navigation Grid...</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            {routeResults ? (
              <div className="animate-fade-in">
                {/* ROUTE CARDS — shown below map */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {routeResults.routes.map((r, i) => (
                    <div 
                      key={i} 
                      className={`p-4 border-start border-4 cursor-pointer transition-all ${i === selectedRoute ? 'border-primary bg-primary-light shadow-sm scale-102' : 'border-secondary bg-white hover-bg-light'}`}
                      onClick={() => highlightRouteOnMap(i)}
                      style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className={`fw-800 mb-0 ${i === 0 ? 'text-primary' : 'text-dark'}`}>
                          {i === 0 ? '✅ BEST ROUTE' : i === 1 ? '🔶 ALTERNATE ROUTE 1' : '🔴 ALTERNATE ROUTE 2'}
                        </h6>
                        {i === selectedRoute && <span className="badge-status badge-success">Selected</span>}
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="detail-label">Via</div>
                          <div className="fw-bold small text-dark">{r.via}</div>
                        </div>
                        <div className="col-4">
                          <div className="detail-label">Distance</div>
                          <div className="fw-bold small">{r.distance}</div>
                        </div>
                        <div className="col-4">
                          <div className="detail-label">Duration</div>
                          <div className="fw-bold small">{r.duration || r.time}</div>
                        </div>
                        <div className="col-4">
                          <div className="detail-label">Traffic</div>
                          <div className={`fw-bold small ${r.trafficStatus?.includes('Red') ? 'text-danger' : 'text-success'}`}>
                            {r.durationInTraffic || r.time} {r.trafficStatus?.includes('Red') ? '🔴' : '🟢'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI RECOMMENDATION */}
                <div className="p-4 bg-white border rounded mb-4 shadow-sm border-start border-4 border-info">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-4">🤖</span>
                    <h6 className="fw-800 text-info mb-0">Smart City AI Recommendation</h6>
                  </div>
                  <p className="small text-dark mb-0 italic" style={{ lineHeight: '1.6' }}>
                    {aiRecommendation || "AI is synthesizing current traffic and environmental factors..."}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-outline-primary flex-grow-1 py-2 fw-bold cursor-pointer" onClick={exportRoutePDF}>📄 Export Route PDF</button>
                  <button className="btn btn-outline-info flex-grow-1 py-2 fw-bold cursor-pointer" onClick={openInGoogleMaps}>🗺️ Open in Google Maps</button>
                  <button className="btn btn-secondary flex-grow-1 py-2 fw-bold cursor-pointer" onClick={resetRoute}>🔄 Search Again</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 opacity-50 bg-light rounded border border-dashed">
                <div className="display-4 mb-3">🗺️</div>
                <h5 className="fw-800 text-muted">Ready for Analysis</h5>
                <p className="small mb-0 px-4">Enter your destination to see real-time routes, live traffic, and AI-powered recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Traffic Trends & History */}
        <div className="col-md-6 d-flex flex-column gap-4">
          <div className="card-smart">
            <div className="section-header">
              <span>📋</span> MY RECENT ROUTES
            </div>
            <div className="table-responsive">
              <table className="table-smart x-small">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Time</th>
                    <th>Traffic</th>
                    <th>AQI</th>
                  </tr>
                </thead>
                <tbody>
                  {routeHistory.map(r => (
                    <tr key={r.id}>
                      <td className="text-truncate" style={{maxWidth: '80px'}}>{r.from}</td>
                      <td className="text-truncate" style={{maxWidth: '80px'}}>{r.to}</td>
                      <td className="fw-bold">{r.time}</td>
                      <td>{r.traffic}</td>
                      <td>{r.aqi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-link btn-sm mt-3 text-decoration-none p-0 cursor-pointer" onClick={exportRoutePDF}>📄 Export Routes History PDF</button>
          </div>

          <div className="card-smart flex-grow-1">
            <div className="section-header">
              <span>📊</span> Live Mobility Trends
            </div>
            <div style={{ height: '180px' }}>
              <TrafficChart data={trafficData} area="Your Local Zone" />
            </div>
          </div>
        </div>
      </div>

      <ChatbotWidget />

      {/* EMERGENCY SOS MODAL */}
      {showSOSModal && (
        <div className="side-panel-overlay d-flex align-items-center justify-content-center" style={{zIndex: 9999}}>
          <div className="card-smart p-0 overflow-hidden animate-fade-in" style={{width: '550px', maxWidth: '95%'}}>
            {sosStep === 1 ? (
              <>
                <div className="p-4 bg-danger text-white d-flex justify-content-between align-items-center">
                  <h4 className="fw-800 mb-0">🚨 Request Emergency SOS</h4>
                  <button className="btn-close btn-close-white" onClick={() => setShowSOSModal(false)}></button>
                </div>
                <div className="p-4 bg-white">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="detail-label">Full Name</label>
                      <input type="text" className="input-smart bg-light" value={sosForm.name} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="detail-label">Phone Number</label>
                      <input type="text" className="input-smart bg-light" value={sosForm.phone} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="detail-label">City Zone</label>
                      <select className="input-smart" value={sosForm.zone} onChange={e => setSosForm({...sosForm, zone: e.target.value})}>
                        <option>Zone A</option>
                        <option>Zone B</option>
                        <option>Zone C</option>
                        <option>Zone D</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="detail-label">Location</label>
                      <div className="position-relative">
                        <input type="text" className="input-smart pe-5" value={sosForm.location} onChange={e => setSosForm({...sosForm, location: e.target.value})} />
                        <button className="btn btn-sm btn-outline-primary position-absolute end-0 top-50 translate-middle-y me-2 border-0" title="Detect GPS">📍</button>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="detail-label">Emergency Type</label>
                      <select className="input-smart" value={sosForm.type} onChange={e => setSosForm({...sosForm, type: e.target.value})}>
                        <option>🔥 Fire Emergency</option>
                        <option>🚑 Medical Emergency</option>
                        <option>🚓 Police / Crime</option>
                        <option>🌊 Flood / Natural Disaster</option>
                        <option>⚡ Power Outage</option>
                        <option>🚗 Road Accident</option>
                        <option>🆘 Other Emergency</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="detail-label">Description</label>
                      <textarea className="input-smart" rows="3" placeholder="Describe the emergency..." value={sosForm.description} onChange={e => setSosForm({...sosForm, description: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="detail-label">Priority Level</label>
                      <div className="d-flex gap-3 mt-1">
                        {['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low'].map(p => (
                          <div key={p} className="form-check">
                            <input className="form-check-input" type="radio" name="priority" id={p} checked={sosForm.priority === p} onChange={() => setSosForm({...sosForm, priority: p})} />
                            <label className="form-check-label small cursor-pointer" htmlFor={p}>{p.split(' ')[1]}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4 pt-3 border-top">
                    <button className="btn btn-outline-secondary flex-grow-1 py-2 cursor-pointer" onClick={() => setShowSOSModal(false)}>Cancel</button>
                    <button className="btn btn-danger flex-grow-1 py-2 fw-800 cursor-pointer btn-sos-submit" onClick={handleSubmitSOS}>🚨 Submit SOS Request</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-5 text-center bg-white">
                <div className="display-1 text-success mb-3">✅</div>
                <h3 className="fw-800 text-dark">SOS Submitted Successfully!</h3>
                <p className="text-muted">Help is on the way. Please stay where you are.</p>
                <div className="bg-light p-3 rounded mb-4 text-start">
                  <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                    <span className="text-muted">Request ID:</span>
                    <span className="fw-800 text-primary">{lastSOSId}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                    <span className="text-muted">Est. Response Time:</span>
                    <span className="fw-bold">8-12 minutes</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Emergency Helpline:</span>
                    <span className="fw-bold text-danger">112</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary flex-grow-1 py-2 cursor-pointer" onClick={() => { navigate('/user/emergency'); setShowSOSModal(false); }}>Track My Request</button>
                  <button className="btn btn-outline-secondary flex-grow-1 py-2 cursor-pointer" onClick={() => setShowSOSModal(false)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
