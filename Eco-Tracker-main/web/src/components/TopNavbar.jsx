import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Leaf, Truck, Trophy, BookOpen, Database, 
  LogOut, Layers, ChevronDown, Check, X, Award, Activity, 
  ExternalLink, User, Settings, Sparkles, LogIn, UserPlus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopNavbar = ({ 
  title = "EcoTrack",
  subtitle = "Municipal Command",
  role = "AUTHORITY",
  tabs = [],
  activeTab,
  onTabChange,
  rightActions
}) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    { name: 'Ledger Audit Explorer', path: '/explorer', icon: Database, role: 'AUTHORITY', desc: 'Cryptographic proof & immutable logs (Authority only)' },
    { name: 'Public Portal', path: '/', icon: Activity, role: 'PUBLIC', desc: 'Municipal pilot landing & live counters' }
  ];

  // Explorer is strictly restricted to AUTHORITY - exclude it from other roles
  // Citizen complaint portal is strictly for CITIZEN - remove from AUTHORITY
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
    <div className="w-full max-w-6xl mx-auto px-4 sticky top-3 mb-6" style={{ zIndex: 1050 }}>
      <motion.div 
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ flexWrap: 'nowrap' }}
        className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-md border border-outline-variant/30 p-2 sm:p-2.5 flex items-center justify-between gap-2.5"
      >
        {/* Left: Brand Identity */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-primary-container transition-colors flex-shrink-0">
            {role === 'AUTHORITY' ? <Shield size={19} /> :
             role === 'WORKER' ? <Truck size={19} /> :
             <Leaf size={19} />}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-md text-sm sm:text-base font-extrabold text-on-surface leading-tight tracking-tight">
                {title}
              </span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="font-label-sm text-[10px] sm:text-[11px] text-secondary font-bold leading-none mt-0.5">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Center: Contextual Tabs (Replacing Left Box on Every Single Page) */}
        {tabs.length > 0 && (
          <nav className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl overflow-x-auto min-w-0 flex-shrink no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || location.pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.onClick) tab.onClick();
                    else if (tab.path) navigate(tab.path);
                    else if (onTabChange) onTabChange(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isActive 
                      ? 'bg-surface-container-lowest text-primary shadow-xs' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50 bg-transparent'
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Actions & "Pop-up Setting / Pages" Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightActions}

          {/* Pop-up Setting Trigger */}
          <button
            type="button"
            id="nav-pages-trigger"
            onClick={() => setShowPageMenu(prev => !prev)}
            className="stitch-btn-secondary !py-2 !px-3 !text-xs !rounded-xl !bg-surface-container-low hover:!bg-surface-container flex items-center gap-1.5 border border-outline-variant/30 cursor-pointer flex-shrink-0"
            title="Switch Page & Settings"
          >
            <Settings size={15} className="text-primary animate-spin-slow" />
            <span className="font-bold">Pages</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${showPageMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Sign Out or Sign In */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-error hover:bg-error-container/20 transition-colors border-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-xl flex items-center gap-1.5"
              title="Sign In"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </motion.div>

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
              className="absolute right-4 top-16 w-96 max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 p-4 flex flex-col gap-3"
              style={{ zIndex: 1070 }}
            >
              {/* Pop-up Header */}
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <Layers size={14} />
                  </div>
                  <div>
                    <span className="font-headline-md text-xs font-black text-on-surface">Municipal Portals</span>
                    <span className="block text-[10px] text-on-surface-variant">Authorized civic navigations</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPageMenu(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container border-0 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Active Session Card (Replaced unneeded Quick Role Switcher) */}
              {isAuthenticated ? (
                <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between gap-2 border border-outline-variant/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <User size={15} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {currentUser?.name || 'Authenticated User'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant truncate">
                        {currentUser?.email || 'Active Session'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-primary text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                    {currentUser?.role || 'CITIZEN'}
                  </span>
                </div>
              ) : (
                <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between gap-2 border border-outline-variant/30">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">Guest Visitor</span>
                    <span className="text-[10px] text-on-surface-variant">Sign in for role-based access</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowPageMenu(false);
                      navigate('/login');
                    }}
                    className="stitch-btn-primary !py-1 !px-2.5 !text-[11px] !rounded-lg"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* All Pages Navigation List */}
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
                <span className="font-label-sm text-[10px] text-on-surface-variant font-extrabold uppercase tracking-wider px-1">
                  Available Portals
                </span>
                {accessiblePortals.map((page) => {
                  const PageIcon = page.icon;
                  const isCurrent = location.pathname === page.path;
                  return (
                    <button
                      key={page.path}
                      onClick={() => handlePortalNavigate(page)}
                      className={`p-2 rounded-xl text-left transition-all border-0 cursor-pointer flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-secondary-container text-on-secondary-container font-bold shadow-xs' 
                          : 'bg-transparent text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrent ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                        }`}>
                          <PageIcon size={14} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold leading-tight truncate">{page.name}</span>
                          <span className="text-[10px] text-on-surface-variant truncate">{page.desc}</span>
                        </div>
                      </div>
                      {isCurrent && <Check size={14} className="text-primary flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setShowPageMenu(false);
                  }}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-primary text-xs font-bold transition-colors flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>Login Portal</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 px-3 rounded-xl text-error text-xs font-bold hover:bg-error-container/20 transition-colors flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopNavbar;
