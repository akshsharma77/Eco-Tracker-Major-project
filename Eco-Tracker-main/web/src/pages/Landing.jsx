import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Navigation, MapPin, Clock, CheckCircle2, Check, 
  ArrowRight, ShieldCheck, Download, Smartphone, Layers, 
  ChevronDown, X, Leaf, Shield, Truck, Trophy, BookOpen, 
  Database, LogIn, ExternalLink, Settings, Sparkles, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [showPageMenu, setShowPageMenu] = useState(false);

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    currentUser = null;
  }
  const isAuthenticated = Boolean(token && currentUser);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSecureNavigate = (targetPath, requiredRole = null, customMessage = null) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: targetPath,
          message: customMessage || 'Please sign in to access this feature.'
        }
      });
      return;
    }
    if (requiredRole && currentUser?.role !== requiredRole && currentUser?.role !== 'AUTHORITY') {
      navigate('/login', {
        state: {
          from: targetPath,
          message: `Access denied: Requires ${requiredRole} account.`
        }
      });
      return;
    }
    navigate(targetPath);
  };

  const handlePortalNavigate = (page) => {
    setShowPageMenu(false);
    const secureRoles = ['AUTHORITY', 'CITIZEN', 'WORKER', 'CREDENTIALS'];
    if (secureRoles.includes(page.role)) {
      if (!isAuthenticated) {
        navigate('/login', {
          state: {
            from: page.path,
            message: `Sign in required: Please authenticate to access ${page.name}.`
          }
        });
        return;
      }
      if (page.role === 'AUTHORITY' && currentUser?.role !== 'AUTHORITY') {
        navigate('/login', {
          state: {
            from: page.path,
            message: `Access denied: ${page.name} requires Authority credentials.`
          }
        });
        return;
      }
      if (page.role !== 'CREDENTIALS' && currentUser?.role !== page.role && currentUser?.role !== 'AUTHORITY') {
        navigate('/login', {
          state: {
            from: page.path,
            message: `Access denied: ${page.name} requires ${page.role} authorization.`
          }
        });
        return;
      }
    }
    navigate(page.path);
  };

  const portalPages = [
    { name: 'Municipal Command', path: '/authority', icon: Shield, role: 'AUTHORITY', desc: 'Real-time telemetry, AI dispatch & hotspots' },
    { name: 'Citizen Impact Portal', path: '/citizen', icon: Leaf, role: 'CITIZEN', desc: 'File geotagged complaints & earn XP' },
    { name: 'Field Worker Terminal', path: '/worker', icon: Truck, role: 'WORKER', desc: 'Active routes, pickups & proof of work' },
    { name: 'Civic Leaderboard', path: '/leaderboard', icon: Trophy, role: 'COMMUNITY', desc: 'Ward contributor rankings & podium' },
    { name: 'EcoAcademy Courses', path: '/academy', icon: BookOpen, role: 'EDUCATION', desc: 'Waste segregation & civic modules' },
    { name: 'Verified Certificates', path: '/certification', icon: Award, role: 'CREDENTIALS', desc: 'Tamper-proof civic graduation certificate' },
    { name: 'Ledger Audit Explorer', path: '/explorer', icon: Database, role: 'AUTHORITY', desc: 'Cryptographic proof & transaction blocks (Authority only)' },
    { name: 'Public Landing', path: '/', icon: Sparkles, role: 'PUBLIC', desc: 'Municipal pilot landing & live counters' }
  ];

  const accessiblePortals = portalPages.filter(page => {
    if (page.path === '/explorer' && currentUser?.role !== 'AUTHORITY') {
      return false;
    }
    if (page.path === '/citizen' && currentUser?.role === 'AUTHORITY') {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-[#F7F9F7] text-[#18201B] min-h-screen flex flex-col font-sans selection:bg-[#EAF5EF] selection:text-[#237A57]">
      {/* Minimalist Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8E4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#237A57] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#237A57]">EcoTrack</span>
              <span className="text-xs text-[#5B6660] -mt-0.5">Civic Waste Management</span>
            </div>
          </div>

          {/* Uncrowded Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5B6660]">
            <a href="#how-it-works" className="hover:text-[#237A57] transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-[#237A57] transition-colors">Impact</a>
            <button 
              onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to access the citizen portal.')}
              className="hover:text-[#237A57] transition-colors bg-transparent border-0 cursor-pointer font-medium text-sm text-[#5B6660]"
            >
              Citizen Portal
            </button>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="hover:text-[#237A57] transition-colors bg-transparent border-0 cursor-pointer font-medium text-sm text-[#5B6660]"
            >
              Leaderboard
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Pop-up Navigation Menu Trigger */}
            <button
              type="button"
              id="landing-pages-trigger"
              onClick={() => setShowPageMenu(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF5EF] text-[#237A57] hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
              title="Page Navigator & Role Settings"
            >
              <Settings size={14} className="text-[#237A57]" />
              <span>Pages</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showPageMenu ? 'rotate-180' : ''}`} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(currentUser?.role === 'AUTHORITY' ? '/authority' : currentUser?.role === 'WORKER' ? '/worker' : '/citizen')}
                  className="text-xs font-bold text-[#237A57] bg-[#EAF5EF] px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
                >
                  My Portal
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 hover:text-red-700 font-medium bg-transparent border-0 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-[#5B6660] hover:text-[#18201B] transition-colors bg-transparent border-0 cursor-pointer hidden sm:inline"
              >
                Login
              </button>
            )}

            <button
              onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to file and track municipal waste reports.')}
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-lg bg-[#237A57] text-white font-medium text-sm shadow-sm hover:bg-[#1A5C41] transition-all border-0 cursor-pointer"
            >
              Report Waste
            </button>
          </div>
        </div>
      </header>

      {/* Pop-up Navigation & Role Setting Modal */}
      <AnimatePresence>
        {showPageMenu && (
          <>
            <motion.div 
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPageMenu(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[3px]" 
              style={{ zIndex: 1060 }}
            />
            <motion.div
              key="nav-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="fixed right-4 sm:right-10 top-20 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-[#E2E8E4] p-4 flex flex-col gap-3"
              style={{ zIndex: 1070 }}
            >
              {/* Pop-up Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8E4]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#EAF5EF] flex items-center justify-center text-[#237A57]">
                    <Layers size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#18201B]">Municipal Portals</span>
                    <span className="block text-[10px] text-[#5B6660]">Authorized civic navigations</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPageMenu(false)}
                  className="p-1 rounded-lg text-[#5B6660] hover:bg-[#F7F9F7] border-0 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Active Session Info */}
              {isAuthenticated ? (
                <div className="bg-[#F7F9F7] p-2.5 rounded-xl flex items-center justify-between gap-2 border border-[#E2E8E4]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF5EF] text-[#237A57] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <User size={15} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#18201B] truncate">
                        {currentUser?.name || 'Authorized Member'}
                      </span>
                      <span className="text-[10px] text-[#5B6660] truncate">
                        {currentUser?.email || 'Logged In'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#EAF5EF] text-[#237A57] text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                    {currentUser?.role || 'CITIZEN'}
                  </span>
                </div>
              ) : (
                <div className="bg-[#F7F9F7] p-2.5 rounded-xl flex items-center justify-between gap-2 border border-[#E2E8E4]">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#18201B]">Guest Portal</span>
                    <span className="text-[10px] text-[#5B6660]">Sign in for role-based features</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowPageMenu(false);
                      navigate('/login');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#237A57] text-white text-[11px] font-bold border-0 cursor-pointer hover:bg-[#1b6346]"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* All Pages Navigation List */}
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
                <span className="text-[10px] text-[#5B6660] font-extrabold uppercase tracking-wider px-1">
                  Available Portals
                </span>
                {accessiblePortals.map((page) => {
                  const PageIcon = page.icon;
                  const isCurrent = page.path === '/';
                  return (
                    <button
                      key={page.path}
                      onClick={() => handlePortalNavigate(page)}
                      className={`p-2 rounded-xl text-left transition-all border-0 cursor-pointer flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-[#EAF5EF] text-[#237A57] font-bold shadow-xs' 
                          : 'bg-transparent text-[#18201B] hover:bg-[#F7F9F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrent ? 'bg-[#237A57] text-white' : 'bg-[#EAF5EF] text-[#237A57]'
                        }`}>
                          <PageIcon size={14} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold leading-tight truncate">{page.name}</span>
                          <span className="text-[10px] text-[#5B6660] truncate">{page.desc}</span>
                        </div>
                      </div>
                      {isCurrent && <Check size={14} className="text-[#237A57] flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-[#E2E8E4] flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setShowPageMenu(false);
                  }}
                  className="p-2 rounded-xl text-[#5B6660] hover:text-[#237A57] text-xs font-bold transition-colors flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>Login Portal</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setShowPageMenu(false);
                  }}
                  className="p-2 px-3 rounded-xl bg-[#237A57] text-white text-xs font-bold hover:bg-[#1A5C41] transition-colors flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  <span>Register Free</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Clean Charcoal/Dark-Green Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Clean residential street in India with segregated waste bins" 
              className="w-full h-full object-cover object-center" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1UMpf11mBOslE4gm4RXN554MidjSoxqet8Etz5438423_6WA2bYOSkT1p9eNqp9ihLx24HOp-yEAVNhbezV_Jh_j9oJrh_0SLrK947ANvhwrcAvD4IIGZ4XvH70ITYTfaFFIgOxMQpbaM7MSv2OEAdsPrNQ-OFEOU_Gp90QLymlJE-Ves7VbdZdg7kldC0iDBcQb__6LTC55t6t-zMM-4DFa01WQnwh5jzDgEvZhtogLNkHLaphf0CAVBB_"
            />
            {/* Tasteful gradient overlay for crisp text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#102319]/90 via-[#102319]/80 to-[#18201B]/70" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center text-white flex flex-col items-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-[#EAF5EF] mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ghaziabad Nagar Nigam Citizen Initiative
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] text-balance">
              Cleaner surroundings, together.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed text-balance">
              EcoTrack connects citizens directly with municipal sanitation teams to report overflowing bins, track resolution in real-time, and build cleaner, healthier communities.
            </p>

            {/* Clean Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to file and track municipal waste reports.')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#237A57] text-white font-medium text-base shadow-lg hover:bg-[#1A5C41] transition-all border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                Report Waste Nearby
              </button>

              <button 
                onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to track your complaint reports.')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-base border border-white/25 backdrop-blur-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">near_me</span>
                Track a Complaint
              </button>
            </div>

            {/* Generous 3 Key Stats Row */}
            <div className="mt-16 pt-10 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white tracking-tight">14,000+</span>
                <span className="text-sm text-white/70 mt-1">Reports Resolved</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white tracking-tight">96%</span>
                <span className="text-sm text-white/70 mt-1">Response Rate</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white tracking-tight">32 Wards</span>
                <span className="text-sm text-white/70 mt-1">Actively Covered</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-[#F7F9F7]" id="how-it-works">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[#237A57] font-semibold text-xs tracking-wider uppercase">Simple & Transparent</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#18201B] tracking-tight mt-2">
                How EcoTrack Works
              </h2>
              <p className="text-[#5B6660] mt-3 text-base">
                Resolving civic waste takes just three straightforward steps, ensuring quick turnaround and verified proof.
              </p>
            </div>

            {/* 3 Simple Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-8 border border-[#E2E8E4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF5EF] text-[#237A57] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                  </div>
                  <div className="text-xs font-bold text-[#237A57] uppercase tracking-wider mb-2">Step 01</div>
                  <h3 className="text-xl font-bold text-[#18201B] mb-3">Snap & Geotag</h3>
                  <p className="text-[#5B6660] text-sm leading-relaxed">
                    Take a quick photo of overflowing garbage or neglected spots. Your device location is automatically recorded without manual entry.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8E4]/60 text-xs text-[#8A968F] font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#237A57]">pin_drop</span>
                  Automatic GPS location match
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-8 border border-[#E2E8E4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF5EF] text-[#237A57] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">alt_route</span>
                  </div>
                  <div className="text-xs font-bold text-[#237A57] uppercase tracking-wider mb-2">Step 02</div>
                  <h3 className="text-xl font-bold text-[#18201B] mb-3">Instant Municipal Routing</h3>
                  <p className="text-[#5B6660] text-sm leading-relaxed">
                    Your report is immediately dispatched to the assigned ward sanitation beat and compactors on duty for swift clearing.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8E4]/60 text-xs text-[#8A968F] font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#237A57]">schedule</span>
                  Average response under 4 hours
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-8 border border-[#E2E8E4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF5EF] text-[#237A57] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">verified</span>
                  </div>
                  <div className="text-xs font-bold text-[#237A57] uppercase tracking-wider mb-2">Step 03</div>
                  <h3 className="text-xl font-bold text-[#18201B] mb-3">Verified Resolution</h3>
                  <p className="text-[#5B6660] text-sm leading-relaxed">
                    Once the crew clears the site, they submit mandatory photo proof. You verify the result and earn community Green Score points.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E2E8E4]/60 text-xs text-[#8A968F] font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#237A57]">task_alt</span>
                  Civic verification guarantee
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App & Citizen Impact Section */}
        <section className="py-20 bg-white border-y border-[#E2E8E4]" id="impact">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text and Benefits */}
              <div className="lg:col-span-7 flex flex-col">
                <span className="text-[#237A57] font-semibold text-xs tracking-wider uppercase">Citizen Empowerment</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#18201B] tracking-tight mt-2 mb-6">
                  Keep your neighborhood clean right from your pocket
                </h2>
                <p className="text-[#5B6660] text-base leading-relaxed mb-8">
                  The EcoTrack mobile application makes civic engagement effortless. Designed with intuitive workflows, residents can actively participate in neighborhood hygiene and celebrate tangible change.
                </p>

                {/* Clean Bullet Points */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#237A57] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#18201B]">Effortless 30-Second Reporting</h4>
                      <p className="text-sm text-[#5B6660] mt-0.5">Snap a photo on your walk and submit. No complicated government forms.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#237A57] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#18201B]">Live Resolution Tracking</h4>
                      <p className="text-sm text-[#5B6660] mt-0.5">Receive instant alerts when the municipal van is dispatched and when the spot is cleared.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#237A57] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#18201B]">Green Score Rewards</h4>
                      <p className="text-sm text-[#5B6660] mt-0.5">Earn recognition tokens for verified reports and redeem points for civic benefits.</p>
                    </div>
                  </div>
                </div>

                {/* Download / Action CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to access the citizen portal.')}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#18201B] text-white font-medium text-sm hover:bg-[#18201B]/90 transition-all border-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">android</span>
                    Download Android App
                  </button>

                  <button 
                    onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to access the web portal.')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[#237A57] bg-[#EAF5EF] font-medium text-sm hover:bg-emerald-100 transition-colors border-0 cursor-pointer"
                  >
                    Launch Web Portal
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Clean Graphic / Card Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm bg-[#F7F9F7] rounded-2xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col gap-5">
                  {/* Mock notification header */}
                  <div className="bg-white rounded-xl p-4 border border-[#E2E8E4] shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#237A57] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#18201B]">Issue Resolved #GZ-8912</div>
                      <div className="text-xs text-[#5B6660]">Indirapuram, Sector 4 cleared</div>
                    </div>
                    <span className="text-[10px] text-[#8A968F] ml-auto">10m ago</span>
                  </div>

                  {/* Citizen Score Badge */}
                  <div className="bg-white rounded-xl p-5 border border-[#E2E8E4] shadow-xs text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#237A57] text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                      88
                    </div>
                    <div className="text-base font-bold text-[#18201B]">Citizen Green Score</div>
                    <p className="text-xs text-[#5B6660] mt-1">Tier 1 Active Neighborhood Steward</p>
                    <div className="w-full bg-[#E2E8E4]/60 rounded-full h-1.5 mt-4">
                      <div className="bg-[#237A57] h-1.5 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <span className="text-[11px] text-[#8A968F] mt-2">14 verified reports cleared</span>
                  </div>

                  {/* Municipal Assurance Note */}
                  <div className="p-3.5 bg-[#EAF5EF] rounded-xl flex items-center gap-2.5 text-xs text-[#237A57] font-medium">
                    <span className="material-symbols-outlined text-[18px]">security</span>
                    Verified directly with Ghaziabad Nagar Nigam
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Call to Action Banner */}
        <section className="py-16 bg-[#237A57] text-white">
          <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Help make your street cleaner today
            </h2>
            <p className="mt-3 text-white/80 text-sm sm:text-base max-w-xl">
              Report municipal waste, overflowing street bins, or uncollected garbage in less than a minute.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to report a waste issue.')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#237A57] font-semibold text-sm shadow hover:bg-neutral-100 transition-colors border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                Report an Issue Now
              </button>

              <a 
                href="#how-it-works"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Clean, Professional Footer */}
      <footer className="bg-white border-t border-[#E2E8E4] pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E2E8E4]">
            {/* Brand Info */}
            <div className="md:col-span-1 flex flex-col">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#237A57] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                </div>
                <span className="text-lg font-bold text-[#18201B]">EcoTrack</span>
              </div>
              <p className="text-xs text-[#5B6660] leading-relaxed">
                Intelligent civic waste monitoring and community-driven sanitation surveillance for Indian smart cities.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2.5 text-xs text-[#5B6660]">
              <div className="font-semibold text-sm text-[#18201B] mb-1">Platform</div>
              <a className="hover:text-[#237A57] transition-colors" href="#how-it-works">How It Works</a>
              <a className="hover:text-[#237A57] transition-colors" href="#impact">Impact & Statistics</a>
              <button 
                onClick={() => handleSecureNavigate('/citizen', 'CITIZEN', 'Please sign in to access the citizen portal.')}
                className="hover:text-[#237A57] transition-colors bg-transparent border-0 text-left p-0 cursor-pointer text-xs text-[#5B6660]"
              >
                Citizen Portal
              </button>
              <button 
                onClick={() => navigate('/leaderboard')}
                className="hover:text-[#237A57] transition-colors bg-transparent border-0 text-left p-0 cursor-pointer text-xs text-[#5B6660]"
              >
                Civic Leaderboard & Honors
              </button>
            </div>

            {/* Municipal Support & Helplines */}
            <div className="flex flex-col gap-2.5 text-xs text-[#5B6660]">
              <div className="font-semibold text-sm text-[#18201B] mb-1">Municipal Support</div>
              <div>Toll-Free Sanitation Helpline: <strong className="text-[#18201B] font-semibold">1969</strong></div>
              <div>Ghaziabad Control Room: <strong className="text-[#18201B] font-semibold">1800-180-3012</strong></div>
              <div>Email: <a className="hover:text-[#237A57]" href="mailto:grievance@ecotrack.gov.in">grievance@ecotrack.gov.in</a></div>
              <div className="text-[11px] text-[#8A968F] mt-1">24x7 Municipal Dispatch Assistance</div>
            </div>

            {/* Capstone Attribution */}
            <div className="flex flex-col gap-2 text-xs text-[#5B6660]">
              <div className="font-semibold text-sm text-[#18201B] mb-1">Project Attribution</div>
              <p className="leading-relaxed">
                Designed as a <span className="text-[#18201B] font-medium">B.Tech Final Year Capstone Project</span> in Computer Science & Environmental Informatics in partnership with the Ghaziabad Nagar Nigam pilot.
              </p>
            </div>
          </div>

          {/* Copyright & SBM Attribution */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A968F]">
            <span>© 2025 EcoTrack. All rights reserved.</span>
            <span>Aligned with Swachh Bharat Mission (Urban 2.0)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
