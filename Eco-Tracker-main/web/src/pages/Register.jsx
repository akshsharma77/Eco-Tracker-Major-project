import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, MapPin, Phone, ArrowRight, Briefcase, Leaf, AlertCircle, Home, Trophy, BookOpen, Database, LogIn } from 'lucide-react';
import { authAPI } from '../services/api';
import TopNavbar from '../components/TopNavbar';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', mobileNumber: '', password: '', confirmPassword: '', role: 'CITIZEN',
    location: { address: '', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014' },
    citizenDetails: { username: '', age: '', gender: 'Other', occupation: 'Citizen', preferredLanguage: 'English', notificationPreferences: 'App', awarenessLevel: 'Beginner' },
    workerDetails: { dob: '', gender: 'Male', emergencyContact: '', workerType: 'Collector', experience: '1', assignedArea: 'Ward 18', shiftPreference: 'Morning' },
    adminDetails: { adminCode: '', departmentName: 'Sanitation Dept', designation: 'Supervisor', roleLevel: 'Area Admin' }
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'AUTHORITY') navigate('/authority');
      else if (res.data.user.role === 'WORKER') navigate('/worker');
      else navigate('/citizen');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Onboarding Node"
        role="CITIZEN"
        tabs={[
          { id: 'landing', label: 'Public Portal', icon: Home, path: '/' },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
          { id: 'academy', label: 'EcoAcademy', icon: BookOpen, path: '/academy' },
        ]}
        activeTab="register"
        rightActions={
          <button 
            onClick={() => navigate('/login')}
            className="stitch-btn-secondary !py-1.5 !px-3.5 !text-xs !rounded-xl"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        }
      />

      <main className="stitch-main flex items-center justify-center py-6">
        <div className="stitch-card max-w-xl w-full p-8 shadow-md border border-outline-variant/30">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-3 shadow-xs">
            <Leaf size={24} />
          </div>
          <h2 className="font-headline-lg text-2xl font-black text-on-surface">Join the Ecosystem</h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            Create your decentralized EcoTrack account
          </p>
        </div>

        {/* Role Selector Tabs (Stitch Pill Style) */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-xl mb-6">
          {[
            { id: 'CITIZEN', label: 'Citizen' },
            { id: 'WORKER', label: 'Crew Worker' },
            { id: 'AUTHORITY', label: 'Authority' },
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setFormData({...formData, role: r.id})}
              className={`py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                formData.role === r.id 
                  ? 'bg-surface-container-lowest text-primary shadow-xs' 
                  : 'text-on-surface-variant hover:text-on-surface bg-transparent'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container font-label-md text-xs mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="stitch-input-group">
              <label className="stitch-label">Full Name *</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Rahul Sharma"
                className="stitch-input !text-xs !bg-surface-container-low"
              />
            </div>

            <div className="stitch-input-group">
              <label className="stitch-label">Email Address *</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="rahul@ecotrack.io"
                className="stitch-input !text-xs !bg-surface-container-low"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="stitch-input-group">
              <label className="stitch-label">Mobile Number *</label>
              <input 
                type="tel" required
                value={formData.mobileNumber}
                onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                placeholder="9876543210"
                className="stitch-input !text-xs !bg-surface-container-low"
              />
            </div>

            <div className="stitch-input-group">
              <label className="stitch-label">Address / Ward *</label>
              <input 
                type="text" required
                value={formData.location.address}
                onChange={e => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                placeholder="Indirapuram Sector 4"
                className="stitch-input !text-xs !bg-surface-container-low"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="stitch-input-group">
              <label className="stitch-label">Password *</label>
              <input 
                type="password" required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="stitch-input !text-xs !bg-surface-container-low"
              />
            </div>

            <div className="stitch-input-group">
              <label className="stitch-label">Confirm Password *</label>
              <input 
                type="password" required
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                className="stitch-input !text-xs !bg-surface-container-low"
              />
            </div>
          </div>

          {/* Conditional Role-Specific Fields */}
          {formData.role === 'AUTHORITY' && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
              <span className="font-label-sm text-xs font-bold text-secondary uppercase">Authority Credentials</span>
              <div className="stitch-input-group">
                <label className="stitch-label">Admin Invite Code *</label>
                <input 
                  type="text" required
                  placeholder="VIVA_ADMIN_2026"
                  value={formData.adminDetails.adminCode}
                  onChange={e => handleNestedChange('adminDetails', 'adminCode', e.target.value)}
                  className="stitch-input !text-xs !bg-surface-container-lowest"
                />
              </div>
            </div>
          )}

          {formData.role === 'WORKER' && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
              <span className="font-label-sm text-xs font-bold text-secondary uppercase">Sanitation Crew Details</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="stitch-input-group">
                  <label className="stitch-label">Crew Type</label>
                  <select 
                    value={formData.workerDetails.workerType}
                    onChange={e => handleNestedChange('workerDetails', 'workerType', e.target.value)}
                    className="stitch-select !text-xs !bg-surface-container-lowest"
                  >
                    <option value="Collector">Waste Collector</option>
                    <option value="Driver">Compactor Driver</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="stitch-input-group">
                  <label className="stitch-label">Assigned Ward</label>
                  <input 
                    type="text"
                    value={formData.workerDetails.assignedArea}
                    onChange={e => handleNestedChange('workerDetails', 'assignedArea', e.target.value)}
                    placeholder="Ward 18"
                    className="stitch-input !text-xs !bg-surface-container-lowest"
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="stitch-btn-primary !h-12 !mt-2 !rounded-xl !text-sm"
          >
            <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
