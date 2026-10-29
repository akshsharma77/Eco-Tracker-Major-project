import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Leaf, AlertCircle, Home, Database, Trophy, BookOpen, Truck, Info } from 'lucide-react';
import { authAPI } from '../services/api';
import TopNavbar from '../components/TopNavbar';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const noticeMessage = location.state?.message;
  const fromPath = location.state?.from;

  // Auto-fill role if query param is set (?role=AUTHORITY)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'AUTHORITY') {
      setFormData({ email: 'admin@ecotrack.gov', password: 'password123' });
    } else if (roleParam === 'WORKER') {
      setFormData({ email: 'testworker99@ecotrack.gov', password: 'password123' });
    } else if (roleParam === 'CITIZEN') {
      setFormData({ email: 'test@ecotrack.gov', password: 'password123' });
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email: formData.email, password: formData.password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Navigate to previous protected route if role matches, else role dashboard
      const userRole = res.data.user.role;
      if (fromPath && (
        userRole === 'AUTHORITY' ||
        (userRole === 'WORKER' && fromPath.startsWith('/worker')) ||
        (userRole === 'CITIZEN' && (fromPath.startsWith('/citizen') || fromPath.startsWith('/certification')))
      )) {
        navigate(fromPath);
      } else if (userRole === 'AUTHORITY') {
        navigate('/authority');
      } else if (userRole === 'WORKER') {
        navigate('/worker');
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Authentication Portal"
        role="CITIZEN"
        tabs={[
          { id: 'landing', label: 'Public Portal', icon: Home, path: '/' },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
          { id: 'academy', label: 'EcoAcademy', icon: BookOpen, path: '/academy' },
        ]}
        activeTab="login"
        rightActions={
          <button 
            onClick={() => navigate('/register')}
            className="stitch-btn-primary !py-1.5 !px-3.5 !text-xs !rounded-xl"
          >
            Create Account
          </button>
        }
      />

      <main className="stitch-main flex items-center justify-center py-6">
        <div className="stitch-card max-w-md w-full p-8 shadow-md border border-outline-variant/30">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-3 shadow-xs">
            <Leaf size={24} />
          </div>
          <h2 className="font-headline-lg text-2xl font-black text-on-surface">Welcome Back</h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            Access the EcoTrack civic waste network
          </p>
        </div>

        {noticeMessage && (
          <div className="p-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-xs mb-4 flex items-start gap-2.5 border border-primary/20">
            <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block text-on-primary-container">Login Required</span>
              <span className="text-on-primary-container/80 text-[11px] leading-tight mt-0.5 block">{noticeMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container font-label-md text-xs mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Fill Demo Credentials (For Testing) */}
        <div className="mb-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-[10px] uppercase font-extrabold text-secondary tracking-wider">
              Quick Fill Credentials (Testing)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setFormData({ email: 'admin@ecotrack.gov', password: 'password123' })}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface text-[11px] font-bold transition-all border border-outline-variant/20 flex flex-col items-center gap-1 cursor-pointer"
            >
              <Shield size={13} />
              <span>Authority</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'test@ecotrack.gov', password: 'password123' })}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface text-[11px] font-bold transition-all border border-outline-variant/20 flex flex-col items-center gap-1 cursor-pointer"
            >
              <Leaf size={13} />
              <span>Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'testworker99@ecotrack.gov', password: 'password123' })}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface text-[11px] font-bold transition-all border border-outline-variant/20 flex flex-col items-center gap-1 cursor-pointer"
            >
              <Truck size={13} />
              <span>Worker</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="stitch-input-group">
            <label className="stitch-label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="citizen@ecotrack.io"
                className="stitch-input !pl-10 !text-xs !bg-surface-container-low"
              />
            </div>
          </div>

          <div className="stitch-input-group">
            <label className="stitch-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="stitch-input !pl-10 !text-xs !bg-surface-container-low"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="stitch-btn-primary !h-12 !mt-2 !rounded-xl !text-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register Here
          </Link>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
