import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Play, CheckCircle2, Star, Clock, Lock, 
  ArrowLeft, Award, HelpCircle, ChevronRight, Zap, CheckCircle, Trophy, Leaf
} from 'lucide-react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { academyAPI, userAPI } from '../services/api';
import QuizModal from '../components/QuizModal';
import TopNavbar from '../components/TopNavbar';

const EcoAcademy = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const defaultModules = [
    { _id: 'm1', title: 'Solid Waste Segregation & Classification', description: 'Master colour-coded bins, organic vs dry waste separation, and household segregation protocols.', rewardXP: 100, isCompleted: true, isLocked: false, quiz: [
      { question: 'Which bin is designated for compostable kitchen waste in the national protocol?', options: ['Green Bin', 'Blue Bin', 'Red Bin', 'Black Bin'], correctAnswer: 0 },
      { question: 'What should be done with rinsed plastic milk pouches?', options: ['Dry recyclable blue bin', 'Wet organic green bin', 'Reject bin', 'Burn it'], correctAnswer: 0 }
    ]},
    { _id: 'm2', title: 'Safe Handling of Hazardous Waste', description: 'Identify batteries, electronic debris, chemicals, and medical waste requiring specialized disposal.', rewardXP: 150, isCompleted: true, isLocked: false, quiz: [
      { question: 'How should used lithium-ion batteries be disposed of?', options: ['Taken to designated e-waste collection center', 'Thrown in regular dustbin', 'Buried in backyard', 'Incinerated'], correctAnswer: 0 }
    ]},
    { _id: 'm3', title: 'Composting & Organic Circularity', description: 'Transform food scraps and garden waste into nutrient-rich soil conditioner with zero odor.', rewardXP: 120, isCompleted: true, isLocked: false, quiz: [
      { question: 'Which material should NOT be added to standard home compost?', options: ['Plastic bags and glossy paper', 'Vegetable peels', 'Dry leaves', 'Coffee grounds'], correctAnswer: 0 }
    ]},
    { _id: 'm4', title: 'Plastic Reduction & Circular Packaging', description: 'Understand single-use plastic alternatives, PET recycling symbols, and extended producer rules.', rewardXP: 130, isCompleted: false, isLocked: false, quiz: [
      { question: 'What does the SPI code #1 inside the recycling triangle represent?', options: ['PET (Polyethylene Terephthalate)', 'PVC', 'Polystyrene', 'Polypropylene'], correctAnswer: 0 }
    ]},
    { _id: 'm5', title: 'E-Waste Stewardship & Battery Reclamation', description: 'Safe disposal protocols for appliances, mobile phones, printed circuit boards, and cables.', rewardXP: 160, isCompleted: false, isLocked: false, quiz: [
      { question: 'How should damaged mobile phone circuit boards and batteries be disposed?', options: ['Handed over to authorized municipal e-waste recycling kiosks', 'Dumped into neighborhood municipal bin', 'Burned in waste heap', 'Mixed with food leftovers'], correctAnswer: 0 }
    ]},
    { _id: 'm6', title: 'Community Waste Auditing & Geotagging', description: 'Conduct ward cleanliness audits and file high-accuracy photographic incident complaints.', rewardXP: 200, isCompleted: false, isLocked: true, quiz: [
      { question: 'What is the main benefit of GPS coordinates when filing waste reports?', options: ['Directs sanitation response teams immediately to the spot', 'Enhances picture lighting', 'Decreases device battery', 'Creates social media stories'], correctAnswer: 0 }
    ]}
  ];

  const fetchModules = async () => {
    setLoading(true);
    try {
      const [moduleRes, userRes] = await Promise.all([
        academyAPI.getModules().catch(() => ({ data: { data: [] } })),
        userAPI.getProfile().catch(() => null)
      ]);
      if (moduleRes.data?.data && moduleRes.data.data.length > 0) {
        setModules(moduleRes.data.data);
      } else {
        setModules(defaultModules);
      }
      if (userRes?.data?.data?.user) {
        setUser(userRes.data.data.user);
      }
    } catch (err) {
      console.error('Academy fetch error, using default:', err);
      setModules(defaultModules);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleQuizComplete = async (answers) => {
    try {
      const res = await academyAPI.submitQuiz(selectedModule._id, answers);
      if (res.data.success) {
        setIsQuizOpen(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        alert(res.data.message || 'Quiz passed! XP and certificate progress updated.');
        fetchModules();
      } else {
        alert(res.data.message || 'Quiz did not meet passing score (60%). Please review the material and try again.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Quiz submission failed');
    }
  };

  const completedCount = modules.filter(m => m.isCompleted).length;
  const totalModules = modules.length;
  const progressPercent = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  return (
    <div className="stitch-layout">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}

      {/* Top Center Floating Navigation (Replacing Left Sidebar) */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="EcoAcademy"
        role={user?.role || 'CITIZEN'}
        tabs={[
          { id: 'academy', label: 'Learning Modules', icon: BookOpen },
          { id: 'dashboard', label: user?.role === 'AUTHORITY' ? 'Municipal Command' : user?.role === 'WORKER' ? 'Field Terminal' : 'Citizen Portal', icon: Leaf, path: user?.role === 'AUTHORITY' ? '/authority' : user?.role === 'WORKER' ? '/worker' : '/citizen' },
          { id: 'cert', label: 'Certifications', icon: Award, path: '/certification' },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
        ]}
        activeTab="academy"
        rightActions={
          <button 
            onClick={() => navigate('/certification')} 
            className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-xl"
          >
            <Award size={14} />
            <span className="hidden sm:inline">Certificates</span>
          </button>
        }
      />

      {/* Main Content */}
      <main className="stitch-main">
        {/* Top Header */}
        <header className="pb-6 mb-6 border-b border-outline-variant/20 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">Municipal Academy</span>
              <span className="font-label-sm text-outline-variant">•</span>
              <span className="font-label-sm text-on-surface-variant">Certified Citizen Track</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-extrabold tracking-tight mt-1">
              EcoAcademy Curriculum
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Complete interactive waste segregation modules, score ≥60% on quizzes, and earn official certification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {completedCount === totalModules && totalModules > 0 && (
              <button 
                onClick={() => navigate('/certification')}
                className="stitch-btn-primary !py-2.5 !px-4 !text-xs !rounded-xl"
              >
                <Award size={16} />
                <span>Claim Official Certificate</span>
              </button>
            )}
          </div>
        </header>

        {/* Progress Card */}
        <div className="stitch-card p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-label-sm text-on-surface-variant uppercase font-bold text-xs">Curriculum Progress</span>
              <h3 className="font-title-md text-sm font-bold text-on-surface mt-0.5">
                {completedCount} of {totalModules} Modules Mastered
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-bold">
              {Math.round(progressPercent)}% Complete
            </span>
          </div>

          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="bg-primary h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Module Cards Grid (Aligned Boxes) */}
        <div className="stitch-grid-3">
          {modules.map((mod, idx) => {
            const isCompleted = mod.isCompleted;
            const isLocked = mod.isLocked;

            return (
              <div 
                key={mod._id || idx}
                className={`stitch-card p-5 justify-between ${
                  isLocked ? 'opacity-70 bg-surface-container-low' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-xs font-bold text-secondary">
                      MODULE 0{idx + 1}
                    </span>
                    {isCompleted ? (
                      <span className="status-pill status-pill-resolved">
                        <CheckCircle size={12} /> Passed
                      </span>
                    ) : isLocked ? (
                      <span className="status-pill status-pill-progress">
                        <Lock size={12} /> Locked
                      </span>
                    ) : (
                      <span className="status-pill status-pill-verified">
                        Ready
                      </span>
                    )}
                  </div>

                  <h3 className="font-title-md text-base font-bold text-on-surface mb-1.5 leading-snug">
                    {mod.title}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mb-4">
                    {mod.description || 'Master proper handling, category segregation, and recycling protocols.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="font-label-sm text-xs text-primary font-bold">
                    +{mod.rewardXP || 100} XP
                  </span>

                  {!isLocked && (
                    <button
                      onClick={() => {
                        setSelectedModule(mod);
                        setIsQuizOpen(true);
                      }}
                      className="stitch-btn-primary !py-1.5 !px-3 !text-xs !rounded-lg"
                    >
                      <span>{isCompleted ? 'Retake Quiz' : 'Start Module'}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Quiz Modal */}
      {isQuizOpen && selectedModule && (
        <QuizModal 
          module={selectedModule} 
          onClose={() => setIsQuizOpen(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default EcoAcademy;
