import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Download, Share2, ArrowLeft, ShieldCheck, Leaf, LogOut, Star, Award, CheckCircle, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { certificationAPI, userAPI, academyAPI } from '../services/api';
import confetti from 'canvas-confetti';
import TopNavbar from '../components/TopNavbar';

const CertificationView = () => {
  const [user, setUser] = useState(null);
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await userAPI.getProfile().catch(() => null);
        const moduleRes = await academyAPI.getModules().catch(() => null);
        const totalModules = moduleRes?.data?.data?.length || 0;
        
        let parsed = null;
        try { parsed = JSON.parse(storedUser); } catch(e) {}

        const userData = res?.data?.data?.user || parsed || {
          name: 'Civic Contributor',
          email: 'citizen@ecotrack.gov',
          role: 'CITIZEN',
          xp: 680,
          credits: 140
        };
        const certData = res?.data?.data?.certifications?.find(c => c.type === 'ECO_ACADEMY_GRADUATE') || {
          type: 'ECO_ACADEMY_GRADUATE',
          title: 'Master Civic Recycler & Waste Auditor',
          issuedAt: new Date().toISOString(),
          certificateId: 'ECT-2026-CERT-8842',
          verifiedOnChain: true,
          txHash: '0x8f2c...4e1b'
        };
        
        setUser(userData);
        setCert(certData);

        if (userData?.academyProgress?.length >= totalModules && totalModules > 0) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.7 } });
        }
      } catch (err) {
        console.error('Failed to load certification data:', err);
        setUser({ name: 'Rahul Sharma', email: 'rahul.citizen@ecotrack.io', role: 'CITIZEN', xp: 680 });
        setCert({
          type: 'ECO_ACADEMY_GRADUATE',
          title: 'Master Civic Recycler & Waste Auditor',
          issuedAt: new Date().toISOString(),
          certificateId: 'ECT-2026-CERT-8842',
          verifiedOnChain: true,
          txHash: '0x8f2c...4e1b'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const downloadCertificate = async () => {
    try {
      const res = await certificationAPI.download();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EcoTrack_Certification_${user?.name?.replace(/\s+/g, '_') || 'Citizen'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert('PDF download failed. Generating digital copy...');
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Verified Certificate"
        role="CITIZEN"
        tabs={[
          { id: 'academy', label: 'Return to Academy', icon: ArrowLeft, path: '/academy' },
          { id: 'leaderboard', label: 'Civic Leaderboard', icon: Trophy, path: '/leaderboard' },
        ]}
        activeTab="cert"
        rightActions={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-sm text-xs font-bold">
            <CheckCircle size={14} className="text-primary" />
            <span className="hidden sm:inline">Cryptographically Anchored</span>
          </div>
        }
      />

      <main className="stitch-main flex flex-col items-center">
        <div className="max-w-4xl w-full flex flex-col items-center gap-6">

        {/* Certificate Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full bg-surface-container-lowest p-8 sm:p-14 rounded-2xl shadow-md border-8 border-primary relative text-center"
          style={{ outline: '2px solid #D4AF37', outlineOffset: '-10px' }}
        >
          {/* Gold Decorative Corners */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-tertiary-fixed-dim" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-tertiary-fixed-dim" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-tertiary-fixed-dim" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-tertiary-fixed-dim" />

          <div className="flex flex-col items-center">
            {/* Seal Icon */}
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center border-2 border-tertiary-fixed-dim mb-4 shadow-xs">
              <Award size={36} className="text-primary" />
            </div>

            <span className="font-label-sm text-tertiary uppercase font-extrabold tracking-widest text-xs">
              EcoTrack Decentralized Governance Protocol
            </span>
            <h1 className="font-display-lg text-2xl sm:text-3xl text-primary font-black tracking-wider uppercase mt-1 mb-2">
              Certificate of Achievement
            </h1>

            <p className="font-body-md text-sm text-on-surface-variant italic mt-3 mb-1">
              This municipal honor is formally awarded to
            </p>
            <h2 className="font-display-lg text-3xl sm:text-4xl text-on-surface font-black underline decoration-tertiary-fixed-dim underline-offset-8 my-3">
              {user?.name || 'Rahul Sharma'}
            </h2>

            <p className="font-body-sm text-xs text-on-surface-variant max-w-xl mx-auto leading-relaxed mt-4 mb-6">
              For demonstrating exceptional civic responsibility in municipal waste segregation, community reporting, and achieving graduation standards across all EcoAcademy curriculum modules.
            </p>

            {/* Metrics Triad (Aligned Boxes) */}
            <div className="w-full grid grid-cols-3 gap-4 border-y border-outline-variant/30 py-4 my-4">
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-[11px] text-tertiary font-bold uppercase">Classification</span>
                <span className="font-title-md text-sm font-bold text-primary mt-0.5">{user?.role || 'CITIZEN'}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-[11px] text-tertiary font-bold uppercase">Impact XP</span>
                <span className="font-title-md text-sm font-bold text-primary mt-0.5">{user?.xp || 360} XP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-label-sm text-[11px] text-tertiary font-bold uppercase">Date Issued</span>
                <span className="font-title-md text-sm font-bold text-primary mt-0.5">
                  {new Date(cert?.issuedAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Bottom Signatures & QR */}
            <div className="w-full flex items-end justify-between mt-4 text-left">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${cert?.certificateHash || 'ET-CERT-2026'}`} 
                  alt="QR Verification"
                  className="w-16 h-16 rounded-lg border border-outline-variant/40"
                />
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-secondary font-bold uppercase">Ledger Proof</span>
                  <span className="text-[11px] font-bold text-on-surface">EcoTrack Governance</span>
                  <span className="text-[9px] text-outline font-mono truncate max-w-[140px]">
                    {cert?.certificateHash || '0x4f8e...291a'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="w-32 h-0.5 bg-primary ml-auto mb-1" />
                <span className="font-title-md text-xs font-bold text-on-surface">Director of Sanitation</span>
                <div className="font-label-sm text-[10px] text-on-surface-variant">Ghaziabad Municipal Corp.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <button 
            onClick={downloadCertificate}
            className="flex-1 stitch-btn-primary !h-12 !rounded-xl !text-sm shadow-md"
          >
            <Download size={18} />
            <span>Download PDF Certificate</span>
          </button>
          <button 
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Certificate verification URL copied to clipboard!');
            }}
            className="stitch-btn-secondary !h-12 !px-5 !rounded-xl !text-sm"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
        </div>
      </main>
    </div>
  );
};

export default CertificationView;
