import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, Map, List, LogOut, CheckCircle, AlertCircle, 
  Clock, Check, X, RefreshCw, BarChart, Database, Cpu, Search, 
  UserPlus, User, Users, MapPin, ChevronRight, Filter, AlertTriangle, 
  ArrowRight, Truck, Phone, Mail, Award, Star, Eye, Calendar, CheckCircle2,
  ThumbsUp, ShieldAlert, FileText, CheckCheck
} from 'lucide-react';
import { reportAPI, userAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Authority = () => {
  const [entries, setEntries] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, activeIssues: 0, verifiedToday: 0, avgCleanupTime: '4.2h' });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'workers' | 'citizens' | 'ai' | 'map'
  const [loading, setLoading] = useState(false);
  const [reviewTask, setReviewTask] = useState(null);
  const [selectedWorkerDetails, setSelectedWorkerDetails] = useState(null);
  const [selectedCitizenDetails, setSelectedCitizenDetails] = useState(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Filters
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('ALL');
  const [incidentSearch, setIncidentSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState('ALL');
  const [citizenSearch, setCitizenSearch] = useState('');

  // Worker onboarding form
  const [workerForm, setWorkerForm] = useState({ 
    name: '', email: '', mobileNumber: '', password: '', 
    location: { address: '', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014' },
    workerDetails: { 
      workerType: 'Collector', 
      zone: { zoneId: 'Z-04', ward: 'Ward 18' },
      shift: { start: '07:00', end: '15:00', type: 'Morning' },
      verification: { idType: 'Aadhaar', idNumber: '' }
    }
  });
  const [workerSuccess, setWorkerSuccess] = useState('');
  const [workerError, setWorkerError] = useState('');
  const navigate = useNavigate();

  const defaultAuthorityReports = [
    {
      _id: 'auth-r1',
      title: 'Overflowing dumpster at Sector 4 Central Park Gate 2',
      location: { address: 'Sector 4, Central Park, Indirapuram, Ghaziabad', coordinates: { lat: 28.6362, lng: 77.3712 } },
      status: 'AI_VERIFIED',
      priority: 'HIGH',
      citizenId: { name: 'Rahul Sharma', email: 'rahul.citizen@ecotrack.io' },
      aiMetadata: { confidence: 96, detectedType: 'BIODEGRADABLE', fraudDetectionFlag: false },
      createdAt: Date.now() - 1000 * 60 * 45,
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
      blockchainHash: '0x7f83b1657ff1fc53'
    },
    {
      _id: 'auth-r2',
      title: 'Unsegregated plastic accumulation near Kala Patthar Road',
      location: { address: 'Kala Patthar Rd, Sector 4, Ghaziabad', coordinates: { lat: 28.6415, lng: 77.3755 } },
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      citizenId: { name: 'Priya Verma', email: 'priya.v@ecotrack.io' },
      assignedWorker: { _id: 'w1', name: 'Vikas Kumar', mobileNumber: '+91 98765 43210' },
      aiMetadata: { confidence: 91, detectedType: 'NON_BIODEGRADABLE' },
      createdAt: Date.now() - 1000 * 60 * 180,
      imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
      blockchainHash: '0x12b596da7227d853'
    },
    {
      _id: 'auth-r3',
      title: 'Post-market clearing required at Shipra Market',
      location: { address: 'Shipra Commercial Complex, Vaibhav Khand, Ghaziabad', coordinates: { lat: 28.6310, lng: 77.3680 } },
      status: 'COMPLETED',
      priority: 'HIGH',
      citizenId: { name: 'Amit Patel', email: 'amit.patel@gmail.com' },
      assignedWorker: { _id: 'w1', name: 'Vikas Kumar', mobileNumber: '+91 98765 43210' },
      proofOfWork: {
        afterImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
        timeTaken: 32,
        completionNotes: 'Area cleared, swept and disinfected with lime powder. Compactor dispatched.'
      },
      createdAt: Date.now() - 1000 * 60 * 300,
      blockchainHash: '0x9482ec61726f4324'
    }
  ];

  const defaultWorkersList = [
    { 
      _id: 'w1', 
      name: 'Vikas Kumar', 
      email: 'vikas.sanitation@ecotrack.io', 
      mobileNumber: '+91 98765 43210', 
      workerDetails: { 
        workerId: 'WRK-GHA-1042',
        workerType: 'Collector', 
        zone: { zoneId: 'Z-04', ward: 'Ward 18' }, 
        shift: { start: '07:00', end: '15:00', type: 'Morning' },
        attendance: { status: 'Online' },
        rewards: { wallet: 450, points: 450 }
      },
      taskStats: { total: 12, completed: 10, active: 2 }
    },
    { 
      _id: 'w2', 
      name: 'Ramesh Chander', 
      email: 'ramesh.crew@ecotrack.io', 
      mobileNumber: '+91 98111 22334', 
      workerDetails: { 
        workerId: 'WRK-GHA-2091',
        workerType: 'Driver', 
        zone: { zoneId: 'Z-04', ward: 'Ward 18' }, 
        shift: { start: '06:30', end: '14:30', type: 'Morning' },
        attendance: { status: 'Online' },
        rewards: { wallet: 620, points: 620 }
      },
      taskStats: { total: 18, completed: 17, active: 1 }
    },
    { 
      _id: 'w3', 
      name: 'Sunil Verma', 
      email: 'sunil.ops@ecotrack.io', 
      mobileNumber: '+91 98222 33445', 
      workerDetails: { 
        workerId: 'WRK-GHA-3318',
        workerType: 'Supervisor', 
        zone: { zoneId: 'Z-04', ward: 'Ward 18' }, 
        shift: { start: '08:00', end: '16:00', type: 'Morning' },
        attendance: { status: 'Offline' },
        rewards: { wallet: 310, points: 310 }
      },
      taskStats: { total: 8, completed: 8, active: 0 }
    }
  ];

  const defaultCitizensList = [
    {
      _id: 'c1',
      name: 'Rahul Sharma',
      email: 'rahul.citizen@ecotrack.io',
      mobileNumber: '+91 98765 12345',
      citizenDetails: { citizenId: 'CTZ-48210', awarenessLevel: 'Advanced', notificationPreferences: 'App' },
      location: { city: 'Ghaziabad', address: 'Indirapuram Ward 18' },
      xp: 480,
      credits: 120,
      level: 2,
      subRole: 'CERTIFIED_CITIZEN',
      reportStats: { total: 5, resolved: 4, active: 1, rejected: 0 }
    },
    {
      _id: 'c2',
      name: 'Priya Verma',
      email: 'priya.v@ecotrack.io',
      mobileNumber: '+91 98112 33445',
      citizenDetails: { citizenId: 'CTZ-39102', awarenessLevel: 'Intermediate', notificationPreferences: 'SMS' },
      location: { city: 'Ghaziabad', address: 'Shipra Sun City Ward 18' },
      xp: 390,
      credits: 95,
      level: 2,
      subRole: 'CITIZEN',
      reportStats: { total: 3, resolved: 3, active: 0, rejected: 0 }
    },
    {
      _id: 'c3',
      name: 'Amit Patel',
      email: 'amit.patel@gmail.com',
      mobileNumber: '+91 99223 44556',
      citizenDetails: { citizenId: 'CTZ-28045', awarenessLevel: 'Beginner', notificationPreferences: 'App' },
      location: { city: 'Ghaziabad', address: 'Vaibhav Khand Ward 18' },
      xp: 280,
      credits: 70,
      level: 1,
      subRole: 'CITIZEN',
      reportStats: { total: 4, resolved: 2, active: 1, rejected: 1 }
    },
    {
      _id: 'c4',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@gmail.com',
      mobileNumber: '+91 98334 55667',
      citizenDetails: { citizenId: 'CTZ-21098', awarenessLevel: 'Intermediate', notificationPreferences: 'Email' },
      location: { city: 'Ghaziabad', address: 'Gyan Khand II Ward 18' },
      xp: 210,
      credits: 50,
      level: 1,
      subRole: 'CITIZEN',
      reportStats: { total: 2, resolved: 1, active: 1, rejected: 0 }
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes, workersRes, citizensRes] = await Promise.all([
        reportAPI.getAll().catch(() => ({ data: { data: [] } })),
        reportAPI.getStats().catch(() => ({ data: { data: { totalReports: 14, activeIssues: 3, verifiedToday: 11, avgCleanupTime: '4.2h' } } })),
        userAPI.getWorkers().catch(() => ({ data: { data: [] } })),
        userAPI.getCitizens().catch(() => ({ data: { data: [] } }))
      ]);

      const fetchedReports = reportsRes.data?.data;
      setEntries(fetchedReports && fetchedReports.length > 0 ? fetchedReports : defaultAuthorityReports);
      setStats(statsRes.data?.data || { totalReports: 14, activeIssues: 3, verifiedToday: 11, avgCleanupTime: '4.2h' });

      const fetchedWorkers = workersRes.data?.data;
      setWorkers(fetchedWorkers && fetchedWorkers.length > 0 ? fetchedWorkers : defaultWorkersList);

      const fetchedCitizens = citizensRes.data?.data;
      setCitizens(fetchedCitizens && fetchedCitizens.length > 0 ? fetchedCitizens : defaultCitizensList);
    } catch (err) {
      console.error('Failed to fetch authority telemetry:', err);
      setEntries(defaultAuthorityReports);
      setWorkers(defaultWorkersList);
      setCitizens(defaultCitizensList);
    } finally {
      setLoading(false);
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
      if (parsedUser.role !== 'AUTHORITY') {
        navigate('/login');
        return;
      }
      fetchData();
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await reportAPI.updateStatus(id, newStatus);
      setReviewTask(null);
      fetchData(); 
    } catch (err) {
      alert('Verification status update failed.');
    }
  };

  const handleAssignWorker = async (reportId, workerId) => {
    try {
      await reportAPI.assignWorker(reportId, workerId);
      fetchData();
    } catch (err) {
      alert('Worker assignment failed.');
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setWorkerError('');
    setWorkerSuccess('');
    try {
      await userAPI.createWorker(workerForm);
      setWorkerSuccess('Sanitation crew member registered and provisioned successfully!');
      setWorkerForm({ 
        name: '', email: '', mobileNumber: '', password: '', 
        location: { address: '', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014' },
        workerDetails: { 
          workerType: 'Collector', 
          zone: { zoneId: 'Z-04', ward: 'Ward 18' },
          shift: { start: '07:00', end: '15:00', type: 'Morning' },
          verification: { idType: 'Aadhaar', idNumber: '' }
        }
      });
      fetchData();
      setTimeout(() => setShowOnboardModal(false), 1200);
    } catch (err) {
      setWorkerError(err.response?.data?.message || 'Worker registration failed');
    }
  };

  // Filtered Incidents
  const filteredIncidents = entries.filter(item => {
    const matchesStatus = incidentStatusFilter === 'ALL' || item.status === incidentStatusFilter;
    const matchesSearch = incidentSearch === '' || 
      (item.title || '').toLowerCase().includes(incidentSearch.toLowerCase()) ||
      (item.location?.address || '').toLowerCase().includes(incidentSearch.toLowerCase()) ||
      (item.citizenId?.name || '').toLowerCase().includes(incidentSearch.toLowerCase()) ||
      (item.blockchainHash || '').toLowerCase().includes(incidentSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Workers
  const filteredWorkers = workers.filter(w => {
    const matchesStatus = workerStatusFilter === 'ALL' || (w.workerDetails?.attendance?.status || 'Online') === workerStatusFilter;
    const matchesSearch = workerSearch === '' || 
      (w.name || '').toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.workerDetails?.workerId || '').toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.workerDetails?.workerType || '').toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.mobileNumber || '').toLowerCase().includes(workerSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Citizens
  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = citizenSearch === '' || 
      (c.name || '').toLowerCase().includes(citizenSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(citizenSearch.toLowerCase()) ||
      (c.citizenDetails?.citizenId || '').toLowerCase().includes(citizenSearch.toLowerCase()) ||
      (c.location?.address || '').toLowerCase().includes(citizenSearch.toLowerCase());
    return matchesSearch;
  });

  const onlineWorkersCount = workers.filter(w => (w.workerDetails?.attendance?.status || 'Online') !== 'Offline').length;

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Municipal Command"
        role="AUTHORITY"
        tabs={[
          { id: 'overview', label: 'Command Overview', icon: Activity },
          { id: 'workers', label: 'Worker Fleet Monitor', icon: Truck },
          { id: 'citizens', label: 'Citizen Registry', icon: Users },
          { id: 'ai', label: 'AI Analytics', icon: Cpu },
          { id: 'map', label: 'District Hotspot Map', icon: Map },
          { id: 'explorer', label: 'Ledger Explorer', icon: Database, path: '/explorer' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rightActions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowOnboardModal(true)} 
              className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-xl hidden sm:flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>Onboard Worker</span>
            </button>
            <button 
              onClick={fetchData} 
              className="stitch-btn-secondary !py-2 !px-3 !text-xs !rounded-xl"
              title="Sync Telemetry"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        }
      />

      {/* Main Command Dashboard */}
      <main className="stitch-main">
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-6 mb-2 border-b border-outline-variant/20 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">Ghaziabad Municipal Corporation</span>
              <span className="font-label-sm text-outline-variant">•</span>
              <span className="font-label-sm text-on-surface-variant">Sanitation Ward 18 Command Center</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
              Authority Supervisory Terminal
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Centralized municipal surveillance: monitor citizen grievances, inspect field worker attendance & routes, and verify photographic proof of work.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-xl bg-primary-fixed text-primary font-label-sm text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{onlineWorkersCount} Crew Active Online</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-sm text-xs font-bold">
              {citizens.length} Citizens Enrolled
            </span>
          </div>
        </header>

        {/* Tab 1: Overview (Command Surveillance & Queue) */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 mt-6">
            {/* 4 Aligned KPI Cards */}
            <div className="metrics-grid">
              {[
                { label: 'Total Incidents', value: stats.totalReports || entries.length, sub: 'All citizen complaints', color: 'text-on-surface' },
                { label: 'AI Triage Queue', value: entries.filter(e => e.status === 'AI_VERIFIED' || e.status === 'SUBMITTED').length, sub: 'Awaiting crew dispatch', color: 'text-primary' },
                { label: 'Proofs Under Review', value: entries.filter(e => e.status === 'COMPLETED').length, sub: 'Cleaned area photo attached', color: 'text-tertiary' },
                { label: 'Verified Cleaned', value: stats.verifiedToday || entries.filter(e => e.status === 'VERIFIED').length, sub: 'Cryptographically anchored', color: 'text-secondary' },
              ].map((kpi, i) => (
                <div key={i} className="stitch-card p-4 justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">
                      {kpi.label}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <div className="mt-2">
                    <div className={`font-display-lg text-[28px] font-extrabold leading-tight ${kpi.color}`}>
                      {kpi.value}
                    </div>
                    <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                      {kpi.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Split Row: Incident Queue & Hotspot Map */}
            <div className="dashboard-row">
              {/* Incident Feed & Worker Dispatch */}
              <div className="stitch-card p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title-md text-base font-bold text-on-surface">Incident Dispatch & Surveillance</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-xs font-bold text-on-surface-variant">
                      {filteredIncidents.length} Filtered
                    </span>
                  </div>

                  {/* Incident Search */}
                  <div className="relative w-48 sm:w-56">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
                    <input 
                      type="text"
                      placeholder="Search complaints..."
                      value={incidentSearch}
                      onChange={e => setIncidentSearch(e.target.value)}
                      className="stitch-input !pl-8 !py-1 !text-xs !bg-surface-container-low"
                    />
                  </div>
                </div>

                {/* Status Filter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
                  {[
                    { id: 'ALL', label: 'All Incidents' },
                    { id: 'AI_VERIFIED', label: 'AI Verified' },
                    { id: 'ASSIGNED', label: 'Assigned' },
                    { id: 'IN_PROGRESS', label: 'In Progress' },
                    { id: 'COMPLETED', label: 'Review Proof' },
                    { id: 'VERIFIED', label: 'Resolved' },
                    { id: 'REJECTED', label: 'Rejected' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setIncidentStatusFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer whitespace-nowrap ${
                        incidentStatusFilter === tab.id
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1">
                  {filteredIncidents.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant text-sm">
                      No complaints match the selected filter criteria.
                    </div>
                  ) : (
                    filteredIncidents.map((item) => (
                      <div key={item._id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-[11px] font-bold text-on-surface-variant tracking-wider font-mono">
                            HASH: {(item.blockchainHash || '0x4f82a1b9').substring(0, 12)}...
                          </span>
                          <span className={`status-pill ${
                            item.status === 'VERIFIED' ? 'status-pill-resolved' :
                            item.status === 'COMPLETED' ? 'status-pill-verified' :
                            item.priority === 'HIGH' ? 'status-pill-urgent' : 'status-pill-progress'
                          }`}>
                            {item.status === 'COMPLETED' ? 'PROOF SUBMITTED' : item.status}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3 min-w-0">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt="Incident" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-outline-variant/30" />
                            )}
                            <div className="min-w-0">
                              <h4 className="font-title-md text-sm font-bold text-on-surface leading-tight truncate">
                                {item.title}
                              </h4>
                              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 truncate">
                                {item.location?.address || 'Indirapuram Ward 18'}
                              </p>
                              
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-on-surface-variant flex-wrap">
                                <span className="flex items-center gap-1 font-semibold text-secondary">
                                  <User size={12} />
                                  <span>{item.citizenId?.name || 'Citizen Contributor'}</span>
                                </span>
                                {item.assignedWorker ? (
                                  <span className="flex items-center gap-1 font-semibold text-primary">
                                    <Truck size={12} />
                                    <span>Assigned: {item.assignedWorker.name || 'Crew #04'}</span>
                                  </span>
                                ) : (
                                  <span className="text-error font-semibold">Unassigned</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(item.status === 'SUBMITTED' || item.status === 'AI_VERIFIED' || !item.assignedWorker) && (
                              <select 
                                onChange={(e) => handleAssignWorker(item._id, e.target.value)}
                                defaultValue=""
                                className="stitch-select !py-1.5 !px-2 !text-xs !bg-surface-container-lowest !border-outline-variant/30"
                              >
                                <option value="" disabled>Dispatch Worker...</option>
                                {workers.map(w => (
                                  <option key={w._id} value={w._id}>{w.name} ({w.workerDetails?.workerType || 'Crew'})</option>
                                ))}
                              </select>
                            )}

                            {item.status === 'COMPLETED' && (
                              <button 
                                onClick={() => setReviewTask(item)}
                                className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-lg"
                              >
                                <Eye size={13} />
                                <span>Review Proof</span>
                              </button>
                            )}

                            {item.status === 'AI_VERIFIED' && (
                              <button 
                                onClick={() => handleStatusUpdate(item._id, 'VERIFIED')}
                                className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center border-0 cursor-pointer shadow-xs"
                                title="Direct Approve"
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hotspot & Telemetry Map */}
              <div className="stitch-card p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
                  <h3 className="font-title-md text-base font-bold text-on-surface">District Heatmap & Fleet</h3>
                  <span className="font-label-sm text-xs font-bold text-primary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Real-time GIS</span>
                  </span>
                </div>

                <div className="h-[520px] rounded-xl overflow-hidden bg-surface-container relative border border-outline-variant/20">
                  <MapContainer 
                    center={[28.6362, 77.3712]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {entries.map((entry, idx) => {
                      const lat = entry.location?.coordinates?.lat || 28.6362 + (idx * 0.005);
                      const lng = entry.location?.coordinates?.lng || 77.3712 + (idx * 0.004);
                      return (
                        <Marker key={entry._id || idx} position={[lat, lng]}>
                          <Popup>
                            <div className="text-xs p-1">
                              <strong className="block mb-1">{entry.title}</strong>
                              <p className="text-gray-500 mb-1">{entry.location?.address}</p>
                              <div className="flex items-center gap-1 font-bold text-primary">
                                <span>Status: {entry.status}</span>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Worker Fleet Monitoring */}
        {activeTab === 'workers' && (
          <div className="flex flex-col gap-6 mt-6">
            {/* Worker Fleet Summary Cards */}
            <div className="metrics-grid">
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Total Crew Roster</span>
                <div className="font-display-lg text-[28px] font-extrabold text-on-surface mt-1">{workers.length}</div>
                <span className="font-label-sm text-[11px] text-secondary font-bold">GMC Ward 18 Sanitation Unit</span>
              </div>
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Duty Attendance</span>
                <div className="font-display-lg text-[28px] font-extrabold text-primary mt-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span>{onlineWorkersCount} Active</span>
                </div>
                <span className="font-label-sm text-[11px] text-on-surface-variant">{workers.length - onlineWorkersCount} Offline / Off Duty</span>
              </div>
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Active Clearances</span>
                <div className="font-display-lg text-[28px] font-extrabold text-tertiary mt-1">
                  {entries.filter(e => e.status === 'ASSIGNED' || e.status === 'IN_PROGRESS').length}
                </div>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Ongoing field collections</span>
              </div>
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Completed Tasks</span>
                <div className="font-display-lg text-[28px] font-extrabold text-secondary mt-1">
                  {entries.filter(e => e.status === 'VERIFIED' || e.status === 'COMPLETED').length}
                </div>
                <span className="font-label-sm text-[11px] text-secondary font-bold">100% Verified SLAs</span>
              </div>
            </div>

            {/* Workers Surveillance Table Card */}
            <div className="stitch-card p-5">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20 flex-wrap gap-3">
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">Field Worker Fleet Surveillance</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Real-time attendance telemetry, task assignment load, and ward patrol zones.</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Status Filter */}
                  <select
                    value={workerStatusFilter}
                    onChange={e => setWorkerStatusFilter(e.target.value)}
                    className="stitch-select !py-1.5 !px-2.5 !text-xs !bg-surface-container-low"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Online">Online Only</option>
                    <option value="Offline">Offline</option>
                  </select>

                  {/* Search Input */}
                  <div className="relative w-48 sm:w-60">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input 
                      type="text"
                      placeholder="Search crew..."
                      value={workerSearch}
                      onChange={e => setWorkerSearch(e.target.value)}
                      className="stitch-input !pl-8 !py-1.5 !text-xs !bg-surface-container-low"
                    />
                  </div>

                  <button
                    onClick={() => setShowOnboardModal(true)}
                    className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-xl flex items-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    <span>Onboard Worker</span>
                  </button>
                </div>
              </div>

              {/* Workers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map(w => {
                  const isOnline = (w.workerDetails?.attendance?.status || 'Online') !== 'Offline';
                  const assignedCount = entries.filter(e => e.assignedWorker?._id === w._id || e.assignedWorker === w._id).length;
                  return (
                    <div key={w._id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-label-sm text-[10px] text-secondary font-extrabold uppercase tracking-wider font-mono">
                            {w.workerDetails?.workerId || 'WRK-GHA-1042'}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOnline ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-error'}`} />
                            <span>{isOnline ? 'Active Online' : 'Offline'}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            {w.name ? w.name[0] : 'W'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-title-md text-sm font-bold text-on-surface truncate">{w.name}</h4>
                            <span className="text-[11px] text-on-surface-variant block truncate">
                              {w.workerDetails?.workerType || 'Sanitation Collector'} • {w.workerDetails?.zone?.ward || 'Ward 18'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-outline-variant/20 text-center">
                        <div>
                          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold block">Active</span>
                          <span className="text-xs font-black text-primary">{assignedCount} tasks</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold block">Shift</span>
                          <span className="text-xs font-bold text-on-surface">{w.workerDetails?.shift?.type || 'Morning'}</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold block">Credits</span>
                          <span className="text-xs font-black text-secondary">{w.workerDetails?.rewards?.wallet || 450} EC</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                        <div className="flex items-center gap-1 truncate">
                          <Phone size={12} className="text-secondary flex-shrink-0" />
                          <span className="truncate">{w.mobileNumber || '+91 98765 00000'}</span>
                        </div>
                        <button
                          onClick={() => setSelectedWorkerDetails(w)}
                          className="text-xs font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Citizen Registry & Impact Monitoring */}
        {activeTab === 'citizens' && (
          <div className="flex flex-col gap-6 mt-6">
            {/* Citizen Metrics */}
            <div className="metrics-grid">
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Enrolled Citizens</span>
                <div className="font-display-lg text-[28px] font-extrabold text-on-surface mt-1">{citizens.length}</div>
                <span className="font-label-sm text-[11px] text-secondary font-bold">Verified Ward 18 Residents</span>
              </div>
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Reports Submitted</span>
                <div className="font-display-lg text-[28px] font-extrabold text-primary mt-1">{entries.length}</div>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Citizen reported grievances</span>
              </div>
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Cleanliness Resolution</span>
                <div className="font-display-lg text-[28px] font-extrabold text-secondary mt-1">94.8%</div>
                <span className="font-label-sm text-[11px] text-secondary font-bold">Fastest clearance ward</span>
              </div>
              <div className="stitch-card p-4 justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Eco Credits Minted</span>
                <div className="font-display-lg text-[28px] font-extrabold text-tertiary mt-1">
                  {citizens.reduce((acc, c) => acc + (c.credits || 0), 0) || 1840} EC
                </div>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Incentivized civic participation</span>
              </div>
            </div>

            {/* Citizen Surveillance Table Card */}
            <div className="stitch-card p-5">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20 flex-wrap gap-3">
                <div>
                  <h3 className="font-title-md text-base font-bold text-on-surface">Registered Citizen Impact Surveillance</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Monitor civic reporting participation, verified cleanliness points, and green score achievements.</p>
                </div>

                <div className="relative w-64 sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input 
                    type="text"
                    placeholder="Search citizens by name, email..."
                    value={citizenSearch}
                    onChange={e => setCitizenSearch(e.target.value)}
                    className="stitch-input !pl-8 !py-1.5 !text-xs !bg-surface-container-low"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                      <th className="py-2.5 px-3">Citizen</th>
                      <th className="py-2.5 px-3">Citizen ID</th>
                      <th className="py-2.5 px-3">Grievances Filed</th>
                      <th className="py-2.5 px-3">Civic XP / Credits</th>
                      <th className="py-2.5 px-3">Certification Level</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-xs">
                    {filteredCitizens.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                          No citizens match search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCitizens.map(c => {
                        const citizenReports = entries.filter(e => e.citizenId?._id === c._id || e.citizenId?.name === c.name || e.citizenId === c._id);
                        return (
                          <tr key={c._id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center flex-shrink-0 text-xs">
                                  {c.name ? c.name[0] : 'C'}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-on-surface truncate">{c.name}</span>
                                  <span className="text-[10px] text-on-surface-variant truncate">{c.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-secondary">
                              {c.citizenDetails?.citizenId || `CTZ-${c._id.slice(-5).toUpperCase()}`}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-on-surface">{citizenReports.length || c.reportStats?.total || 1} complaints</span>
                              <span className="block text-[10px] text-secondary font-semibold">
                                {citizenReports.filter(r => r.status === 'VERIFIED').length || c.reportStats?.resolved || 1} resolved
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-black text-primary">{c.xp || 360} XP</span>
                              <span className="block text-[10px] text-on-surface-variant">{c.credits || 90} Credits</span>
                            </td>
                            <td className="py-3 px-3">
                              {c.subRole === 'CERTIFIED_CITIZEN' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                                  <Award size={12} className="text-primary" />
                                  <span>Certified Specialist</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                                  <CheckCheck size={12} />
                                  <span>Active Contributor</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setSelectedCitizenDetails(c)}
                                className="stitch-btn-secondary !py-1 !px-2.5 !text-[11px] !rounded-lg"
                              >
                                View Record
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI Analytics */}
        {activeTab === 'ai' && (
          <div className="stitch-card p-6 mt-6 flex flex-col gap-6">
            <div>
              <h3 className="font-title-lg text-lg font-bold text-on-surface mb-1">
                Predictive Waste Volume & Fraud Detection AI
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Deep neural network triage validating SHA-256 duplicate image hashes, priority classification, and municipal SLA forecasting.
              </p>
            </div>

            <div className="stitch-grid-3">
              <div className="stitch-card-low p-4">
                <span className="font-label-sm text-xs font-bold text-secondary uppercase">CV Model</span>
                <div className="text-xl font-black text-on-surface mt-1">ResNet-50 v2</div>
                <p className="text-[11px] text-on-surface-variant mt-1">Trained on 45,000+ municipal waste images</p>
              </div>
              <div className="stitch-card-low p-4">
                <span className="font-label-sm text-xs font-bold text-secondary uppercase">Average Accuracy</span>
                <div className="text-xl font-black text-primary mt-1">94.8%</div>
                <p className="text-[11px] text-on-surface-variant mt-1">Sub-second inference time</p>
              </div>
              <div className="stitch-card-low p-4">
                <span className="font-label-sm text-xs font-bold text-secondary uppercase">Fraud Flags</span>
                <div className="text-xl font-black text-secondary mt-1">0 Detected</div>
                <p className="text-[11px] text-on-surface-variant mt-1">All image hashes validated & anchored</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Full City Heatmap */}
        {activeTab === 'map' && (
          <div className="stitch-card p-5 mt-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
              <div>
                <h3 className="font-title-lg text-lg font-bold text-on-surface">
                  City-Wide Sanitation Coverage & Fleet Telemetry
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Live GIS monitoring displaying incident severity markers and active compactor fleet units.
                </p>
              </div>
              <span className="font-label-sm text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>GPS Sensors Active</span>
              </span>
            </div>

            <div className="h-[600px] rounded-xl overflow-hidden bg-surface-container relative">
              <MapContainer 
                center={[28.6362, 77.3712]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {entries.map((entry, idx) => (
                  <Marker 
                    key={entry._id || idx} 
                    position={[
                      entry.location?.coordinates?.lat || 28.6362 + (idx * 0.004), 
                      entry.location?.coordinates?.lng || 77.3712 + (idx * 0.003)
                    ]}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>{entry.title}</strong>
                        <p className="my-1">{entry.location?.address}</p>
                        <span className="font-bold text-primary">Status: {entry.status}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}
      </main>

      {/* Review Proof of Work Modal */}
      <AnimatePresence>
        {reviewTask && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content max-w-xl"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                <h3 className="font-title-md text-base font-bold text-on-surface">
                  Verify Proof of Cleanup
                </h3>
                <button 
                  onClick={() => setReviewTask(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-xs font-bold text-on-surface-variant">Before Incident</span>
                    <div className="h-40 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30">
                      {reviewTask.imageUrl ? (
                        <img src={reviewTask.imageUrl} alt="Before" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">No Image</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-xs font-bold text-primary">After Cleanup (Proof)</span>
                    <div className="h-40 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30">
                      {reviewTask.proofOfWork?.afterImage || reviewTask.afterImage ? (
                        <img src={reviewTask.proofOfWork?.afterImage || reviewTask.afterImage} alt="After" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">Cleaned Area Photo</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low text-xs">
                  <div className="font-bold text-on-surface mb-1">Crew Cleanup Notes:</div>
                  <p className="text-on-surface-variant">
                    {reviewTask.proofOfWork?.completionNotes || reviewTask.completionNotes || 'Compactor arrived at site. Garbage cleared and sidewalk swept thoroughly.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleStatusUpdate(reviewTask._id, 'VERIFIED')}
                    className="stitch-btn-primary !h-11"
                  >
                    <CheckCircle size={16} />
                    <span>Approve & Credit Worker</span>
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(reviewTask._id, 'REJECTED')}
                    className="stitch-btn-secondary !h-11 text-error hover:bg-error-container/20"
                  >
                    <X size={16} />
                    <span>Reject Proof</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboard Worker Modal */}
      <AnimatePresence>
        {showOnboardModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content max-w-xl p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h3 className="font-title-md text-base font-bold text-on-surface">Onboard Sanitation Worker</h3>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">Provision a new field worker terminal node</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOnboardModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {workerSuccess && (
                <div className="p-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-xs mb-4 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{workerSuccess}</span>
                </div>
              )}
              {workerError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container font-label-md text-xs mb-4 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{workerError}</span>
                </div>
              )}

              <form onSubmit={handleCreateWorker} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="stitch-input-group">
                    <label className="stitch-label">Full Name *</label>
                    <input 
                      type="text" required
                      value={workerForm.name}
                      onChange={e => setWorkerForm({...workerForm, name: e.target.value})}
                      placeholder="e.g. Suresh Kumar"
                      className="stitch-input"
                    />
                  </div>
                  <div className="stitch-input-group">
                    <label className="stitch-label">Mobile Number *</label>
                    <input 
                      type="tel" required
                      value={workerForm.mobileNumber}
                      onChange={e => setWorkerForm({...workerForm, mobileNumber: e.target.value})}
                      placeholder="10-digit number"
                      className="stitch-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="stitch-input-group">
                    <label className="stitch-label">Email Address *</label>
                    <input 
                      type="email" required
                      value={workerForm.email}
                      onChange={e => setWorkerForm({...workerForm, email: e.target.value})}
                      placeholder="worker@ecotrack.io"
                      className="stitch-input"
                    />
                  </div>
                  <div className="stitch-input-group">
                    <label className="stitch-label">Password *</label>
                    <input 
                      type="password" required
                      value={workerForm.password}
                      onChange={e => setWorkerForm({...workerForm, password: e.target.value})}
                      placeholder="••••••••"
                      className="stitch-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="stitch-input-group">
                    <label className="stitch-label">Role Classification</label>
                    <select 
                      value={workerForm.workerDetails.workerType}
                      onChange={e => setWorkerForm({
                        ...workerForm,
                        workerDetails: { ...workerForm.workerDetails, workerType: e.target.value }
                      })}
                      className="stitch-select"
                    >
                      <option value="Collector">Waste Collector / Crew</option>
                      <option value="Driver">Compactor Driver</option>
                      <option value="Supervisor">Ward Supervisor</option>
                    </select>
                  </div>
                  <div className="stitch-input-group">
                    <label className="stitch-label">Assigned Ward</label>
                    <input 
                      type="text"
                      value={workerForm.workerDetails.zone.ward}
                      onChange={e => setWorkerForm({
                        ...workerForm,
                        workerDetails: {
                          ...workerForm.workerDetails,
                          zone: { ...workerForm.workerDetails.zone, ward: e.target.value }
                        }
                      })}
                      className="stitch-input"
                    />
                  </div>
                </div>

                <button type="submit" className="stitch-btn-primary !h-11 !mt-2">
                  <UserPlus size={16} />
                  <span>Provision Worker Node</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspect Worker Details Modal */}
      <AnimatePresence>
        {selectedWorkerDetails && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content max-w-lg p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
                    {selectedWorkerDetails.name ? selectedWorkerDetails.name[0] : 'W'}
                  </div>
                  <div>
                    <h3 className="font-title-md text-base font-bold text-on-surface">{selectedWorkerDetails.name}</h3>
                    <span className="font-label-sm text-[11px] text-on-surface-variant font-mono">
                      {selectedWorkerDetails.workerDetails?.workerId || 'WRK-GHA-1042'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWorkerDetails(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Status</span>
                    <span className="font-bold text-primary">{(selectedWorkerDetails.workerDetails?.attendance?.status || 'Online')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Role</span>
                    <span className="font-bold text-on-surface">{selectedWorkerDetails.workerDetails?.workerType || 'Crew Collector'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Mobile</span>
                    <span className="font-bold text-on-surface">{selectedWorkerDetails.mobileNumber || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Email</span>
                    <span className="font-bold text-on-surface truncate">{selectedWorkerDetails.email}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-on-surface mb-2">Assigned Tasks Queue</h4>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {entries.filter(e => e.assignedWorker?._id === selectedWorkerDetails._id || e.assignedWorker === selectedWorkerDetails._id).length === 0 ? (
                      <p className="text-on-surface-variant text-center py-4">No active assignments for this worker.</p>
                    ) : (
                      entries.filter(e => e.assignedWorker?._id === selectedWorkerDetails._id || e.assignedWorker === selectedWorkerDetails._id).map(t => (
                        <div key={t._id} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                          <span className="font-bold truncate max-w-[200px]">{t.title}</span>
                          <span className="status-pill status-pill-progress">{t.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspect Citizen Record Modal */}
      <AnimatePresence>
        {selectedCitizenDetails && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content max-w-lg p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                    {selectedCitizenDetails.name ? selectedCitizenDetails.name[0] : 'C'}
                  </div>
                  <div>
                    <h3 className="font-title-md text-base font-bold text-on-surface">{selectedCitizenDetails.name}</h3>
                    <span className="font-label-sm text-[11px] text-secondary font-mono font-bold">
                      {selectedCitizenDetails.citizenDetails?.citizenId || 'CTZ-48210'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCitizenDetails(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Email</span>
                    <span className="font-bold text-on-surface truncate">{selectedCitizenDetails.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Mobile</span>
                    <span className="font-bold text-on-surface">{selectedCitizenDetails.mobileNumber || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Civic XP</span>
                    <span className="font-black text-primary">{selectedCitizenDetails.xp || 480} XP</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Eco Credits</span>
                    <span className="font-black text-secondary">{selectedCitizenDetails.credits || 120} EC</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-on-surface mb-2">Filed Grievances History</h4>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {entries.filter(e => e.citizenId?._id === selectedCitizenDetails._id || e.citizenId?.name === selectedCitizenDetails.name || e.citizenId === selectedCitizenDetails._id).length === 0 ? (
                      <p className="text-on-surface-variant text-center py-4">No filed complaints on record.</p>
                    ) : (
                      entries.filter(e => e.citizenId?._id === selectedCitizenDetails._id || e.citizenId?.name === selectedCitizenDetails.name || e.citizenId === selectedCitizenDetails._id).map(g => (
                        <div key={g._id} className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                          <span className="font-bold truncate max-w-[220px]">{g.title}</span>
                          <span className={`status-pill ${g.status === 'VERIFIED' ? 'status-pill-resolved' : 'status-pill-progress'}`}>
                            {g.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Authority;
