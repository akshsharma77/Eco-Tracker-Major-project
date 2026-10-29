import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ArrowUpRight, Leaf, Shield, LogOut, ChevronRight, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import TopNavbar from '../components/TopNavbar';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const defaultRankings = [
    { _id: '1', name: 'Rahul Sharma', xp: 480, credits: 120, level: 2, subRole: 'CERTIFIED_CITIZEN' },
    { _id: '2', name: 'Priya Verma', xp: 390, credits: 95, level: 2, subRole: 'CITIZEN' },
    { _id: '3', name: 'Amit Patel', xp: 280, credits: 70, level: 1, subRole: 'CITIZEN' },
    { _id: '4', name: 'Sneha Reddy', xp: 210, credits: 50, level: 1, subRole: 'CITIZEN' },
    { _id: '5', name: 'Vikram Singh', xp: 190, credits: 45, level: 1, subRole: 'CITIZEN' }
  ];

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await userAPI.getLeaderboard();
        if (res.data?.data && res.data.data.length > 0) {
          setRankings(res.data.data);
        } else {
          setRankings(defaultRankings);
        }
      } catch (err) {
        console.error('Leaderboard fetch error, using default:', err);
        setRankings(defaultRankings);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const storedUser = localStorage.getItem('user');
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    currentUser = null;
  }
  const dashboardPath = currentUser?.role === 'AUTHORITY' ? '/authority' : currentUser?.role === 'WORKER' ? '/worker' : currentUser?.role === 'CITIZEN' ? '/citizen' : '/';

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation (Replacing Left Sidebar) */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Civic Honors"
        role={currentUser?.role || 'CITIZEN'}
        tabs={[
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'dashboard', label: currentUser?.role === 'AUTHORITY' ? 'Municipal Command' : currentUser?.role === 'WORKER' ? 'Field Terminal' : 'My Impact', icon: Activity, path: dashboardPath },
          { id: 'academy', label: 'EcoAcademy', icon: Star, path: '/academy' },
        ]}
        activeTab="leaderboard"
      />

      {/* Main Content */}
      <main className="stitch-main">
        <header className="pb-6 mb-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">Ward 18 Cluster</span>
              <span className="font-label-sm text-outline-variant">•</span>
              <span className="font-label-sm text-on-surface-variant">Swachh Civic Honors</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
              Global Green Rankings
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Honoring the most proactive citizen contributors across all municipal zones.
            </p>
          </div>

          <button 
            onClick={() => navigate(dashboardPath)}
            className="stitch-btn-secondary !py-2 !px-3.5 !text-xs !rounded-xl"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </button>
        </header>

        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Top 3 Podium (Centered, Equal Alignment) */}
          {!loading && rankings.length >= 3 && (
            <div className="flex justify-center items-end gap-4 sm:gap-8 pt-6 pb-4">
              {/* 2nd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center w-28 sm:w-36"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-high relative flex items-center justify-center border-4 border-white shadow-sm mb-2">
                  <span className="text-xl font-black text-on-surface-variant">
                    {rankings[1]?.name?.[0] || '2'}
                  </span>
                  <div className="absolute -bottom-2 bg-outline text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    #2
                  </div>
                </div>
                <div className="font-title-md text-xs sm:text-sm font-bold text-on-surface truncate w-full">
                  {rankings[1]?.name || 'Citizen'}
                </div>
                <div className="text-primary font-bold text-xs mt-0.5">
                  {rankings[1]?.xp || 0} XP
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center w-32 sm:w-44 -mt-6"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-tertiary-fixed relative flex items-center justify-center border-4 border-tertiary shadow-md mb-2">
                  <Trophy size={36} className="text-tertiary" />
                  <div className="absolute -bottom-2 bg-tertiary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Master
                  </div>
                </div>
                <div className="font-title-md text-sm sm:text-base font-extrabold text-on-surface truncate w-full">
                  {rankings[0]?.name || 'Champion'}
                </div>
                <div className="text-primary font-black text-sm mt-0.5">
                  {rankings[0]?.xp || 0} XP
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold mt-1">
                  Tier 1 Icon
                </span>
              </motion.div>

              {/* 3rd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center w-28 sm:w-36"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container relative flex items-center justify-center border-4 border-white shadow-sm mb-2">
                  <span className="text-xl font-black text-on-surface-variant">
                    {rankings[2]?.name?.[0] || '3'}
                  </span>
                  <div className="absolute -bottom-2 bg-tertiary-container text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    #3
                  </div>
                </div>
                <div className="font-title-md text-xs sm:text-sm font-bold text-on-surface truncate w-full">
                  {rankings[2]?.name || 'Citizen'}
                </div>
                <div className="text-primary font-bold text-xs mt-0.5">
                  {rankings[2]?.xp || 0} XP
                </div>
              </motion.div>
            </div>
          )}

          {/* Rankings Table Card */}
          <div className="stitch-card p-5">
            <h3 className="font-title-md text-sm font-bold text-on-surface mb-3 pb-2 border-b border-outline-variant/20">
              Ward 18 Contributor Roster
            </h3>

            <div className="flex flex-col gap-2">
              {rankings.map((user, idx) => (
                <div 
                  key={user._id || idx}
                  className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-4 border border-outline-variant/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-xs text-on-surface-variant">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary font-bold text-xs flex items-center justify-center border border-outline-variant/20">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-title-md text-xs font-bold text-on-surface">{user.name}</div>
                      <div className="text-[10px] text-on-surface-variant">
                        {user.subRole === 'CERTIFIED_CITIZEN' ? 'Certified Eco Specialist' : 'Civic Contributor'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-bold text-xs text-primary">{user.xp || 0} XP</span>
                      <div className="text-[10px] text-on-surface-variant">{user.credits || 0} Credits</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">
                      Lvl {user.level || 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
