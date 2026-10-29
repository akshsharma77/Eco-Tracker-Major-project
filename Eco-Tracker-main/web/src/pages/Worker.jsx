import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Clock, Check, CheckCircle, LogOut, MapPin, User, 
  Target, Zap, Shield, BatteryCharging, AlertCircle, Navigation, 
  Camera, Upload, X, RotateCcw, ChevronRight, Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportAPI, userAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import TopNavbar from '../components/TopNavbar';

// Leaflet icon setup
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Worker = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [powData, setPowData] = useState({ afterImage: '', notes: '', timeTaken: '25' });
  const navigate = useNavigate();

  const defaultWorkerTasks = [
    {
      _id: 'w-task-1',
      title: 'Commercial dump cleanup at Kala Patthar Market',
      location: { address: 'Kala Patthar Rd, Sector 4, Ghaziabad', lat: 28.6415, lng: 77.3755 },
      status: 'ASSIGNED',
      priority: 'HIGH',
      aiAnalysis: { severity: 'High', wasteType: 'Mixed Domestic Waste', estimatedWeightKg: 85 },
      createdAt: Date.now() - 1000 * 60 * 60,
      imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'w-task-2',
      title: 'Sector 4 Central Park secondary bin collection',
      location: { address: 'Sector 4, Central Park Gate 2, Ghaziabad', lat: 28.6362, lng: 77.3712 },
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      aiAnalysis: { severity: 'Medium', wasteType: 'Plastic & Cans', estimatedWeightKg: 40 },
      createdAt: Date.now() - 1000 * 60 * 120,
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const fetchData = async () => {
    try {
      const [reportsRes, profileRes] = await Promise.all([
        reportAPI.getAll().catch(() => ({ data: { data: [] } })),
        userAPI.getProfile().catch(() => null)
      ]);
      const fetched = reportsRes.data?.data;
      setEntries(fetched && fetched.length > 0 ? fetched : defaultWorkerTasks);
      if (profileRes?.data?.data?.user) {
        const freshUser = profileRes.data.data.user;
        setUser(freshUser);
        setIsOnline(freshUser.workerDetails?.attendance?.status !== 'Offline');
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Failed to fetch worker data:', err);
      setEntries(defaultWorkerTasks);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'WORKER') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
      fetchData();
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleStatusUpdate = async (id, status) => {
    setLoading(true);
    try {
      await reportAPI.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const submitProofOfWork = async () => {
    if (!powData.afterImage) {
      alert('A photo showing the cleaned area is mandatory for proof-of-work verification.');
      return;
    }
    setLoading(true);
    try {
      await reportAPI.updateStatus(selectedTask._id, 'COMPLETED', {
        afterImage: powData.afterImage,
        completionNotes: powData.notes || 'Area thoroughly swept and cleared.',
        timeTaken: parseInt(powData.timeTaken) || 25
      });
      setSelectedTask(null);
      setPowData({ afterImage: '', notes: '', timeTaken: '25' });
      fetchData();
    } catch (err) {
      alert('Failed to submit proof of work');
    } finally {
      setLoading(false);
    }
  };

  const handleImageConversion = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPowData(prev => ({ ...prev, afterImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const toggleAttendance = () => {
    setIsOnline(!isOnline);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const worker = user.workerDetails || {};
  const zone = worker.zone || { zoneId: 'Z-04', ward: 'Ward 18' };
  const wallet = worker.rewards?.wallet || 450;
  const mapCenter = [28.6362, 77.3712];

  const assignedTasks = entries.filter(t => t.assignedWorker === user._id || t.status === 'AI_VERIFIED' || t.status === 'IN_PROGRESS');

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation (Replacing Left Sidebar) */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Field Worker Terminal"
        role="WORKER"
        tabs={[
          { id: 'tasks', label: 'Assigned Tasks', icon: Activity },
        ]}
        activeTab="tasks"
        rightActions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold">
              {wallet} EC
            </span>
            <button
              onClick={toggleAttendance}
              className={`stitch-btn-pill !py-2 !px-3 !text-xs !rounded-xl ${
                isOnline 
                  ? 'bg-secondary-container text-on-secondary-container font-bold' 
                  : 'bg-error-container text-on-error-container font-bold'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-error'}`} />
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="stitch-main">
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-6 mb-2 border-b border-outline-variant/20 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">
                {zone.ward || 'Ward 18'} • {worker.workerType || 'Collector'}
              </span>
              <span className="font-label-sm text-outline-variant">•</span>
              <span className="font-label-sm text-on-surface-variant">Shift: 07:00 - 15:00</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
              Terminal: {user.name}
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Compactor Unit #04 · GMC Sanitation Cluster Indirapuram
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-2.5 shadow-xs">
              <div className="flex flex-col text-right">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Credits Earned</span>
                <span className="text-sm font-extrabold text-primary">{wallet} EC</span>
              </div>
            </div>

            <button
              onClick={toggleAttendance}
              className={`stitch-btn-pill !py-2.5 !px-4 !text-xs !rounded-xl ${
                isOnline 
                  ? 'bg-secondary-container text-on-secondary-container font-bold' 
                  : 'bg-error-container text-on-error-container font-bold'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-error'}`} />
              <span>{isOnline ? 'Status: Active (Online)' : 'Status: Offline'}</span>
            </button>
          </div>
        </header>

        {/* 3 Metric Cards */}
        <div className="stitch-grid-3 my-6">
          <div className="stitch-card p-4 justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">Assigned Queue</span>
            <div className="font-display-lg text-[28px] font-extrabold text-on-surface mt-2">
              {assignedTasks.length}
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant">Tasks in current ward</span>
          </div>

          <div className="stitch-card p-4 justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">Completed Today</span>
            <div className="font-display-lg text-[28px] font-extrabold text-primary mt-2">
              {entries.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length}
            </div>
            <span className="font-label-sm text-[11px] text-secondary font-bold">100% On-time resolution</span>
          </div>

          <div className="stitch-card p-4 justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">Average Clear Time</span>
            <div className="font-display-lg text-[28px] font-extrabold text-tertiary mt-2">
              24m
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant">SLA target: &lt; 45m</span>
          </div>
        </div>

        {/* Split View: Telemetry Route Map & Task Cards */}
        <div className="dashboard-row">
          {/* Map View */}
          <div className="stitch-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                <Navigation size={16} className="text-primary" />
                <span>Assigned Route & Hotspots</span>
              </h3>
              <span className="font-label-sm text-xs font-bold text-secondary">Ward 18 Cluster</span>
            </div>

            <div className="h-[520px] rounded-xl overflow-hidden bg-surface-container relative border border-outline-variant/20">
              <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {assignedTasks.map((task, idx) => {
                  const lat = task.location?.coordinates?.lat || mapCenter[0] + (idx * 0.003);
                  const lng = task.location?.coordinates?.lng || mapCenter[1] + (idx * 0.004);
                  return (
                    <Marker key={task._id || idx} position={[lat, lng]}>
                      <Popup>
                        <div className="text-xs p-1">
                          <strong>{task.title}</strong>
                          <p className="my-1">{task.location?.address}</p>
                          <span className="font-bold text-primary">{task.status}</span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Task Queue Cards */}
          <div className="stitch-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h3 className="font-title-md text-sm font-bold text-on-surface">Task Dispatch Queue</h3>
              <span className="font-label-sm text-xs font-bold text-primary">{assignedTasks.length} Assigned</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
              {assignedTasks.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant text-xs">
                  No active tasks right now. All bins in your ward are clear!
                </div>
              ) : (
                assignedTasks.map((task) => (
                  <div key={task._id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-[11px] font-bold text-on-surface-variant">
                        #{task._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`status-pill ${
                        task.priority === 'HIGH' ? 'status-pill-urgent' : 'status-pill-progress'
                      }`}>
                        {task.priority || 'NORMAL'} PRIORITY
                      </span>
                    </div>

                    <div className="flex gap-3">
                      {task.imageUrl && (
                        <img src={task.imageUrl} alt="Incident" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-outline-variant/30" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-title-md text-sm font-bold text-on-surface truncate">
                          {task.title || 'Waste Pickup'}
                        </h4>
                        <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 truncate">
                          {task.location?.address || 'Indirapuram Ward 18'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1">
                      {task.status === 'AI_VERIFIED' || task.status === 'ASSIGNED' ? (
                        <button 
                          onClick={() => handleStatusUpdate(task._id, 'IN_PROGRESS')}
                          className="w-full stitch-btn-primary !py-2 !text-xs !rounded-lg"
                        >
                          Accept & Start Task
                        </button>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <button 
                          onClick={() => setSelectedTask(task)}
                          className="w-full stitch-btn-primary !py-2 !text-xs !rounded-lg !bg-tertiary-container hover:!bg-tertiary"
                        >
                          <Camera size={14} />
                          <span>Submit Proof of Work</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-primary font-bold text-xs py-1">
                          <CheckCircle size={14} />
                          <span>Proof Submitted • Verification Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Proof of Work Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content max-w-lg"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                <h3 className="font-title-md text-base font-bold text-on-surface">
                  Submit Proof of Work
                </h3>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="stitch-label mb-1.5">After-Cleanup Image *</label>
                  {powData.afterImage ? (
                    <div className="relative h-44 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 mb-2">
                      <img src={powData.afterImage} alt="After" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPowData(prev => ({ ...prev, afterImage: '' }))}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-error text-white border-0 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-outline-variant/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors">
                      <Camera size={24} className="text-primary mb-1.5" />
                      <span className="text-xs font-bold text-on-surface">Take or upload cleared photo</span>
                      <span className="text-[11px] text-on-surface-variant">Shows clean sidewalk/container</span>
                      <input type="file" accept="image/*" onChange={handleImageConversion} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="stitch-input-group">
                  <label className="stitch-label">Time Taken (minutes)</label>
                  <input 
                    type="number" 
                    value={powData.timeTaken}
                    onChange={e => setPowData({ ...powData, timeTaken: e.target.value })}
                    className="stitch-input"
                  />
                </div>

                <div className="stitch-input-group">
                  <label className="stitch-label">Completion Notes</label>
                  <textarea 
                    rows={2}
                    value={powData.notes}
                    onChange={e => setPowData({ ...powData, notes: e.target.value })}
                    placeholder="e.g. Area cleared and waste transported to compactor..."
                    className="stitch-textarea"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="stitch-btn-secondary !h-11"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitProofOfWork}
                    disabled={loading}
                    className="stitch-btn-primary !h-11"
                  >
                    <span>{loading ? 'Submitting...' : 'Confirm Cleanup'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Worker;
