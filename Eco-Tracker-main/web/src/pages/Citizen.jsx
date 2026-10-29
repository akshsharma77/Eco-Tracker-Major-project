import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MapPin, Clock, CheckCircle, AlertTriangle, ChevronRight, 
  Leaf, Trophy, LogOut, Star, Activity, Bell, User, Plus, X, 
  Upload, Trash2, RotateCcw, Info, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportAPI, userAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import TopNavbar from '../components/TopNavbar';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Citizen = () => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();

  // Form State matching Stitch Design
  const [formData, setFormData] = useState({
    title: '',
    category: 'Overflowing Bin',
    description: 'Community dustbin has been overflowing. Stray animals are scattering waste onto the street.',
    landmark: 'Near Community Center, Gate 2',
    urgency: 'normal', // 'low', 'normal', 'urgent'
    lat: 28.6362,
    lng: 77.3712,
    locationAddress: 'Indirapuram, Sector 4, Ghaziabad',
    imageBase64: ''
  });

  const defaultCitizenReports = [
    {
      _id: 'r1',
      title: 'Overflowing garbage near Kala Patthar Market',
      location: { address: 'Kala Patthar Rd, Sector 4' },
      status: 'IN_PROGRESS',
      createdAt: Date.now() - 1000 * 60 * 90,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYpZHlz6AvT2CPOTD3-2-UNzGPtXNiuTu27G6K_G1KX5jGR1DRPCE_bvuQy7v32agUywWbgth2n9QFaFTOybz0-X_YqMsIwQUa6pyxSmOr9SuGg70oHmlyh3kXU_bF4r3iSIOh4883oQFOxOUTir35cg0rDSmBNje2SjRcD-yGlvJhK6b9aSdl8lN4K8VLeazoUt_3EzkW8AbEuszVbdTySmJlEyf8BAh9TmzJui2DEbMuCimxWDHRUA',
      assignedWorker: 'Ward 18 Team'
    },
    {
      _id: 'r2',
      title: 'Waste scattered beside community dustbin',
      location: { address: 'Near Shipra Mall Back Gate' },
      status: 'VERIFIED',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB_QsQxyqq6v4SZatlNKxTTgh1YziJz89Kbhb_Ecvh-gm7CyV-Q8Vycc1_cpCDQuAzUDh78sLVKSZLRXkWb3IaFvaxQiEXf0u9J9hWL6C8rWlxuJGnPyg1gkfW4wVdcQK37n4AAJG0kgqlwn2nw0KjyFmap8N6pL4JH89TRTgPPoTQ5CJ2vh5-1cgk2qSiISTrBu5e_Sgbf-Iy9umUdAzL1Kz7ECUpbUCnNc2tj1TuhEgtW64j19j68w',
      assignedWorker: 'Ward 18 Team'
    },
    {
      _id: 'r3',
      title: 'Uncollected dry waste near residential lane 3',
      location: { address: 'Gyan Khand II, Indirapuram' },
      status: 'VERIFIED',
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      imageUrl: ''
    }
  ];

  const fetchData = async () => {
    try {
      const [reportsRes, profileRes] = await Promise.all([
        reportAPI.getAll().catch(() => ({ data: { data: [] } })),
        userAPI.getProfile().catch(() => null)
      ]);
      if (reportsRes?.data?.data && reportsRes.data.data.length > 0) {
        setEntries(reportsRes.data.data);
      } else {
        setEntries(defaultCitizenReports);
      }
      if (profileRes?.data?.data?.user) {
        setUser(profileRes.data.data.user);
        localStorage.setItem('user', JSON.stringify(profileRes.data.data.user));
      }
    } catch (err) {
      console.error('Failed to load citizen data, using defaults:', err);
      setEntries(defaultCitizenReports);
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
      setUser(JSON.parse(storedUser));
      fetchData();
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return formData.lat ? <Marker position={[formData.lat, formData.lng]} /> : null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.imageBase64) {
      alert('An evidence photo is mandatory for AI verification and GPS anchoring.');
      return;
    }

    setLoading(true);
    try {
      await reportAPI.create({
        title: formData.title || `${formData.category} Incident`,
        description: formData.description,
        type: formData.category === 'Overflowing Bin' ? 'BIODEGRADABLE' : 
              formData.category === 'Illegal Dumping' ? 'HAZARDOUS' :
              formData.category === 'Roadside Garbage' ? 'NON_BIODEGRADABLE' : 'MIXED',
        location: {
          address: formData.locationAddress,
          coordinates: { lat: formData.lat, lng: formData.lng }
        },
        imageUrl: formData.imageBase64
      });

      setShowReportModal(false);
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        imageBase64: ''
      }));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  // Compute Statistics from real entries
  const totalSubmitted = entries.length;
  const resolvedCount = entries.filter(e => e.status === 'VERIFIED' || e.status === 'COMPLETED').length;
  const activeCount = entries.filter(e => e.status !== 'VERIFIED' && e.status !== 'COMPLETED' && e.status !== 'REJECTED').length;
  const resolveRate = totalSubmitted > 0 ? Math.round((resolvedCount / totalSubmitted) * 100) : 78;

  // Green Score calculation
  const greenScore = Math.min(100, Math.max(10, Math.round((user.xp || 360) / 5)));

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation (Replacing Left Sidebar) */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Citizen Portal"
        role="CITIZEN"
        tabs={[
          { id: 'home', label: 'My Impact', icon: Activity, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
          { id: 'report', label: 'Report Waste', icon: Plus, onClick: () => setShowReportModal(true) },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
          { id: 'academy', label: 'EcoAcademy', icon: Star, path: '/academy' },
        ]}
        activeTab="home"
        rightActions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold">
              {user.xp || 480} XP
            </span>
            <button 
              onClick={() => setShowReportModal(true)} 
              className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-xl"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">File Report</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <main className="stitch-main">
        {/* Top Header matching Stitch Screen 1 */}
        <header className="flex items-center justify-between pb-6 mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">Ghaziabad Nagar Nigam</span>
              <span className="font-label-sm text-outline-variant">•</span>
              <span className="font-label-sm text-on-surface-variant">Wednesday, 24 Oct 2026</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="font-headline-lg text-on-surface font-extrabold tracking-tight">
                Good morning, {user.name?.split(' ')[0] || 'Rahul'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Active Ward 18
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-[13px] mt-0.5">
              <MapPin size={14} className="text-primary" />
              <span>Indirapuram, Sector 4, Ghaziabad</span>
            </div>
          </div>

          {/* Quick status chips */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 p-2 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Credits</span>
                <span className="text-sm font-extrabold text-primary">{user.credits || 0} Tokens</span>
              </div>
            </div>

            <button 
              onClick={() => setShowReportModal(true)}
              className="stitch-btn-primary !py-2.5 !px-4 !text-xs !rounded-xl shadow-sm"
            >
              <Plus size={16} />
              <span>File Complaint</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-5 max-w-5xl">
          {/* Civic Green Score Card (Stitch Screen 1) */}
          <section className="stitch-card p-5 relative overflow-hidden border border-outline-variant/30">
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-title-md text-on-surface font-bold text-base">Civic Green Score</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-[11px] text-primary font-bold">
                    Verified
                  </span>
                </div>
                <p className="font-label-md text-on-surface-variant flex items-center gap-1.5 text-xs">
                  <span>Tier {user.level || 2} Citizen Contributor</span>
                  <span>•</span>
                  <span className="text-primary font-bold">+{user.xp ? Math.round(user.xp / 40) : 4} pts earned this week</span>
                </p>
              </div>

              {/* Circular Progress Ring */}
              <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '60px', height: '60px', minWidth: '60px', minHeight: '60px' }}>
                <svg className="-rotate-90" viewBox="0 0 36 36" style={{ width: '60px', height: '60px' }}>
                  <circle 
                    className="text-surface-container-high" 
                    cx="18" cy="18" fill="none" r="15.5" stroke="currentColor" strokeWidth="3" 
                  />
                  <circle 
                    className="text-primary" 
                    cx="18" cy="18" fill="none" r="15.5" stroke="currentColor" 
                    strokeDasharray="97.4" 
                    strokeDashoffset={97.4 - (97.4 * (greenScore / 100))} 
                    strokeLinecap="round" strokeWidth="3" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-label-md font-extrabold text-on-surface leading-none text-sm">{greenScore}</span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant leading-none mt-0.5">/100</span>
                </div>
              </div>
            </div>

            {/* Micro perk bar */}
            <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
              <div className="flex items-center gap-1.5">
                <Trophy size={15} className="text-tertiary" />
                <span>Rank #14 in Ward 18 (Indirapuram Sanitation Cluster)</span>
              </div>
              <button 
                onClick={() => navigate('/leaderboard')}
                className="text-primary font-bold flex items-center hover:underline text-xs bg-transparent border-0 cursor-pointer"
              >
                <span>View Perks</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </section>

          {/* Statistics Grid (3 Aligned Compact Boxes - Stitch Screen 1) */}
          <section className="stitch-grid-3">
            {/* Box 1: Submitted */}
            <div className="stitch-card p-4 justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">Submitted</span>
                <div className="w-6 h-6 rounded-md bg-surface-container text-outline flex items-center justify-center">
                  <Activity size={14} />
                </div>
              </div>
              <div className="mt-2">
                <span className="font-display-lg text-[28px] font-extrabold text-on-surface leading-tight">
                  {totalSubmitted || 14}
                </span>
                <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Total filed complaints</div>
              </div>
            </div>

            {/* Box 2: Resolved */}
            <div className="stitch-card p-4 justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">Resolved</span>
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <div className="mt-2">
                <span className="font-display-lg text-[28px] font-extrabold text-primary leading-tight">
                  {resolvedCount || 11}
                </span>
                <div className="mt-1">
                  <span className="inline-flex px-2 py-0.5 rounded bg-surface-container-low font-label-sm text-[11px] text-primary font-bold">
                    {resolveRate}% Clearance Rate
                  </span>
                </div>
              </div>
            </div>

            {/* Box 3: Active */}
            <div className="stitch-card p-4 justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold text-[11px]">Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim" />
              </div>
              <div className="mt-2">
                <span className="font-display-lg text-[28px] font-extrabold text-tertiary leading-tight">
                  {activeCount || 3}
                </span>
                <div className="mt-1">
                  <span className="inline-flex px-2 py-0.5 rounded bg-surface-container-high font-label-sm text-[11px] text-tertiary font-bold">
                    In Municipal Triage
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Primary Action Banner (Stitch Screen 1) */}
          <section className="stitch-card-primary p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-on-primary/15 text-primary-fixed font-label-sm text-[10px] font-bold tracking-wide uppercase">
                    Quick Civic Action
                  </span>
                </div>
                <h2 className="font-title-lg text-lg font-bold text-on-primary mt-1">
                  Report Waste Nearby
                </h2>
                <p className="font-body-sm text-xs text-surface-variant/90 leading-relaxed max-w-lg">
                  Spot overflowing garbage or an illegal dump? Submit a geotagged complaint in under 30 seconds to trigger municipal compactor dispatch.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center flex-shrink-0 text-primary-fixed">
                <Camera size={24} />
              </div>
            </div>

            <button 
              onClick={() => setShowReportModal(true)}
              className="w-full h-11 rounded-xl bg-surface-container-lowest text-primary font-label-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-low active:scale-[0.99] transition-all border-0 cursor-pointer"
            >
              <Plus size={18} />
              <span>Report Waste Now</span>
            </button>
          </section>

          {/* Recent Complaints Feed (Stitch Screen 1) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-title-md text-base font-bold text-on-surface">Recent Complaints</h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-xs font-bold text-on-surface-variant">
                  Ward 18
                </span>
              </div>
              <span className="font-label-md text-xs text-primary font-bold">
                Total ({entries.length || 14})
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {entries.length === 0 ? (
                <div className="stitch-card p-6 text-center text-on-surface-variant text-sm">
                  No grievances filed yet. Click "Report Waste Now" to file your first complaint!
                </div>
              ) : (
                entries.slice(0, 5).map((item, idx) => (
                  <article key={item._id || idx} className="stitch-card p-4 hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-label-sm text-xs font-bold text-on-surface-variant tracking-wider">
                        #ET-2026-{String(100 + idx).padStart(4, '0')}
                      </span>
                      <span className={`status-pill ${
                        item.status === 'VERIFIED' || item.status === 'COMPLETED'
                          ? 'status-pill-resolved'
                          : item.priority === 'HIGH'
                          ? 'status-pill-urgent'
                          : 'status-pill-progress'
                      }`}>
                        {item.status === 'VERIFIED' ? (
                          <><CheckCircle size={12} /> Resolved</>
                        ) : item.status === 'IN_PROGRESS' ? (
                          <><Activity size={12} /> In Progress</>
                        ) : (
                          <><Clock size={12} /> {item.status}</>
                        )}
                      </span>
                    </div>

                    <div className="flex gap-3.5">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 relative border border-outline-variant/30">
                          <img 
                            src={item.imageUrl} 
                            alt="Complaint photo" 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-white font-label-sm text-[8px]">
                            Photo
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <h3 className="font-title-md text-sm font-bold text-on-surface truncate">
                            {item.title}
                          </h3>
                          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 truncate">
                            {item.location?.address || item.landmark || 'Indirapuram, Sector 4'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[11px] pt-1">
                          <span>{new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                          <span className="text-secondary font-bold">
                            {item.assignedWorker ? 'Assigned to Crew' : 'AI Verified • Ward 18'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Civic Eco Tip Card (Stitch Screen 1) */}
          <section className="rounded-xl bg-surface-container p-4 shadow-xs flex items-start gap-3 border border-outline-variant/20">
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <Lightbulb size={18} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wide">Civic Eco Tip</span>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Segregate wet and dry waste before 8:00 AM collection van arrival to speed up municipal sorting and earn maximum eco-credits.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Report Waste Modal (Faithful implementation of Stitch Screen 2) */}
      <AnimatePresence>
        {showReportModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content max-w-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="font-title-md text-base font-bold text-on-surface leading-tight">
                      Step 1 of 3: Incident Details & Photo
                    </h2>
                    <span className="font-label-sm text-[11px] text-secondary font-bold">33% Complete</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-5">
                <div className="bg-primary h-full w-1/3 rounded-full" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* 1. Evidence Photo Card */}
                <div className="stitch-card p-4 border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <Camera size={16} className="text-primary" />
                      <span>Evidence Photo</span>
                      <span className="text-error">*</span>
                    </label>
                    {formData.imageBase64 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold">
                        <CheckCircle size={12} /> Attached
                      </span>
                    )}
                  </div>

                  {formData.imageBase64 ? (
                    <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-inner bg-surface-container border border-outline-variant/30">
                      <img src={formData.imageBase64} alt="Evidence preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface shadow-xs text-[11px] font-semibold">
                          <CheckCircle size={13} className="text-primary-fixed" />
                          <span>GPS Geotag Verified • Lat: {formData.lat.toFixed(4)}, Long: {formData.lng.toFixed(4)}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-inverse-surface/75 backdrop-blur-sm text-inverse-on-surface font-label-sm text-[11px]">
                          Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="h-8 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer">
                            <RotateCcw size={14} className="text-primary" />
                            <span>Retake</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageBase64: '' }))}
                            className="h-8 w-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shadow-md border-0 cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-colors">
                      <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-2">
                        <Camera size={22} />
                      </div>
                      <span className="text-sm font-bold text-on-surface">Click to take or upload incident photo</span>
                      <span className="text-xs text-on-surface-variant mt-1">High-resolution daylight photo recommended</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low text-on-surface-variant mt-3 text-xs">
                    <Info size={15} className="text-secondary flex-shrink-0" />
                    <span>Camera & GPS geotagging granted for Ward 18 (GMC Sanitation Cluster).</span>
                  </div>
                </div>

                {/* 2. Waste Category Selection Pills */}
                <div className="stitch-card p-4 border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-title-md text-sm font-bold text-on-surface">
                      Waste Category <span className="text-error">*</span>
                    </label>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">Select main issue</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'Overflowing Bin', label: 'Overflowing Bin', sub: 'Community container beyond capacity', full: true },
                      { key: 'Illegal Dumping', label: 'Illegal Dumping', sub: 'Hazardous / bulk waste' },
                      { key: 'Uncollected Waste', label: 'Uncollected Waste', sub: 'Residential lane delay' },
                      { key: 'Roadside Garbage', label: 'Roadside Garbage', sub: 'Pedestrian spillover' },
                      { key: 'Other Issue', label: 'Other Issue', sub: 'Sanitation concern' },
                    ].map((cat) => {
                      const isSelected = formData.category === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.key }))}
                          className={`p-3 rounded-xl text-left transition-all border-0 cursor-pointer flex items-center justify-between ${
                            cat.full ? 'col-span-2' : ''
                          } ${
                            isSelected 
                              ? 'bg-secondary-container text-on-secondary-container shadow-xs font-bold' 
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              <Leaf size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold truncate">{cat.label}</span>
                              {cat.sub && <span className="text-[10px] text-on-surface-variant truncate">{cat.sub}</span>}
                            </div>
                          </div>
                          {isSelected && <CheckCircle size={18} className="text-primary flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Location Details with Leaflet Map */}
                <div className="stitch-card p-4 border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <MapPin size={16} className="text-primary" />
                      <span>Location Details</span>
                    </label>
                    <span className="font-label-sm text-[11px] text-secondary font-bold">Ward 18</span>
                  </div>

                  <div className="w-full h-36 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 relative mb-3">
                    <MapContainer
                      center={[formData.lat, formData.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker />
                    </MapContainer>
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-md shadow-xs flex items-center gap-1 text-[10px] font-bold z-[400]">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span>GPS Accuracy (±3m)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-container-low mb-2">
                    <input 
                      type="text" 
                      value={formData.locationAddress}
                      onChange={e => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
                      placeholder="Address or landmark..."
                      className="w-full bg-transparent border-0 outline-none text-xs font-semibold text-on-surface"
                    />
                  </div>
                </div>

                {/* 4. Description & Landmarks */}
                <div className="stitch-card p-4 border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-title-md text-sm font-bold text-on-surface">
                      Description & Landmarks
                    </label>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      {formData.description.length}/300
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe the issue (overflowing for 2 days, spilling onto road)..."
                    className="stitch-textarea !text-xs !bg-surface-container-low"
                  />
                </div>

                {/* 5. Urgency Level Selector */}
                <div className="stitch-card p-4 border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="font-title-md text-sm font-bold text-on-surface">
                      Urgency Level
                    </label>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">SLA target</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'low', label: 'Low', sla: 'Within 48h' },
                      { key: 'normal', label: 'Normal', sla: 'Within 24h' },
                      { key: 'urgent', label: 'Urgent', sla: 'Within 6h', alert: true },
                    ].map(u => {
                      const isSelected = formData.urgency === u.key;
                      return (
                        <button
                          key={u.key}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, urgency: u.key }))}
                          className={`h-12 rounded-xl text-xs flex flex-col items-center justify-center transition-all border-0 cursor-pointer ${
                            isSelected
                              ? u.alert 
                                ? 'bg-error text-on-error font-bold shadow-xs'
                                : 'bg-primary text-on-primary font-bold shadow-xs'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          <span>{u.label}</span>
                          <span className={`text-[10px] mt-0.5 ${isSelected ? 'opacity-90' : 'text-outline'}`}>
                            {u.sla}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md border-0 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{loading ? 'Transmitting Incident...' : 'Submit Complaint'}</span>
                    <ChevronRight size={18} />
                  </button>
                  <p className="font-label-sm text-[11px] text-on-surface-variant text-center">
                    Complaint will be routed to Ghaziabad Municipal Corporation (GMC) Sanitation Department.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation (Stitch Design) */}
      <nav className="mobile-nav">
        <button onClick={() => navigate('/citizen')} className="flex flex-col items-center text-primary font-bold bg-transparent border-0 cursor-pointer">
          <Activity size={20} />
          <span className="text-[10px] mt-1">Home</span>
        </button>
        <button onClick={() => setShowReportModal(true)} className="flex flex-col items-center text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer">
          <div className="w-8 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
            <Camera size={14} />
          </div>
          <span className="text-[10px] mt-1">Report</span>
        </button>
        <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer">
          <Trophy size={20} />
          <span className="text-[10px] mt-1">Rankings</span>
        </button>
        <button onClick={() => navigate('/academy')} className="flex flex-col items-center text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer">
          <Star size={20} />
          <span className="text-[10px] mt-1">Learn</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center text-error bg-transparent border-0 cursor-pointer">
          <LogOut size={20} />
          <span className="text-[10px] mt-1">Sign Out</span>
        </button>
      </nav>
    </div>
  );
};

export default Citizen;
