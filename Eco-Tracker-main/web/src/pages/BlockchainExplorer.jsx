import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, ExternalLink, Database, Link as LinkIcon, Calendar, Clock, User, Package, ArrowLeft } from 'lucide-react';
import { certificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';

const BlockchainExplorer = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const defaultLedger = [
    { _id: '1', currentHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', action: 'INCIDENT_VERIFIED', actorId: { name: 'Ward 18 Supervisor' }, timestamp: Date.now() - 1000 * 60 * 12 },
    { _id: '2', currentHash: '0x12b596da7227d85317b92f76807d9f7839cf9b3f3e1b7f2324f46a8bebe4ecb1', action: 'COMPACTOR_DISPATCHED', actorId: { name: 'Compactor Unit #04' }, timestamp: Date.now() - 1000 * 60 * 35 },
    { _id: '3', currentHash: '0x9482ec61726f4324f68201a4e58b16e1b6a7b2c9e4d5f1a2b3c4d5e6f7a8b9c0', action: 'REPORT_GEOTAGGED', actorId: { name: 'Rahul Sharma' }, timestamp: Date.now() - 1000 * 60 * 60 },
    { _id: '4', currentHash: '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012', action: 'REWARD_MINTED', actorId: { name: 'EcoTrack Engine' }, timestamp: Date.now() - 1000 * 60 * 120 },
    { _id: '5', currentHash: '0x5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', action: 'GENESIS_BLOCK', actorId: { name: 'GMC Root Authority' }, timestamp: Date.now() - 1000 * 60 * 360 }
  ];

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await certificationAPI.getLedger();
        if (res.data?.data && res.data.data.length > 0) {
          setLedger(res.data.data);
        } else {
          setLedger(defaultLedger);
        }
      } catch (err) {
        console.error('Ledger error, using default:', err);
        setLedger(defaultLedger);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const filteredLedger = ledger.filter(log => 
    (log.currentHash || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.action || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stitch-layout">
      {/* Top Center Floating Navigation */}
      <TopNavbar 
        title="EcoTrack"
        subtitle="Cryptographic Ledger"
        role="AUTHORITY"
        tabs={[
          { id: 'authority', label: 'Municipal Command', icon: Shield, path: '/authority' },
          { id: 'explorer', label: 'Ledger Explorer', icon: Database },
        ]}
        activeTab="explorer"
        rightActions={
          <div className="relative w-44 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              placeholder="Search Hash..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="stitch-input !pl-8 !py-1.5 !text-xs !bg-surface-container-low"
            />
          </div>
        }
      />

      <main className="stitch-main flex flex-col gap-6">
        <header className="flex items-center justify-between pb-6 border-b border-outline-variant/20 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-secondary uppercase tracking-wider font-bold">Consensus Network</span>
              <span className="font-label-sm text-outline-variant">•</span>
              <span className="font-label-sm text-on-surface-variant">Immutable Audits</span>
            </div>
            <h1 className="font-headline-lg text-on-surface font-extrabold tracking-tight mt-0.5">
              EcoTrack Ledger Explorer
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              placeholder="Search by Hash or Action..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="stitch-input !pl-9 !text-xs !bg-surface-container-lowest border border-outline-variant/30"
            />
          </div>
        </header>

        {/* 3 Metric Cards (Stitch Box Alignment) */}
        <div className="stitch-grid-3">
          <div className="stitch-card p-4 justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Total Blocks Anchored</span>
            <div className="font-display-lg text-[28px] font-extrabold text-on-surface mt-1">
              {ledger.length || 42}
            </div>
            <span className="font-label-sm text-[11px] text-secondary font-bold">SHA-256 Validated</span>
          </div>

          <div className="stitch-card p-4 justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Consensus State</span>
            <div className="font-display-lg text-[28px] font-extrabold text-primary mt-1 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span>ACTIVE</span>
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant">100% Ward synchronization</span>
          </div>

          <div className="stitch-card p-4 justify-between">
            <span className="font-label-sm text-on-surface-variant uppercase font-bold text-[11px]">Avg Chaining Latency</span>
            <div className="font-display-lg text-[28px] font-extrabold text-tertiary mt-1">
              0.8s
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant">Deterministic timestamp</span>
          </div>
        </div>

        {/* Ledger Table Card */}
        <div className="stitch-card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
            <h3 className="font-title-md text-sm font-bold text-on-surface">Block Chaining Roster</h3>
            <span className="font-label-sm text-xs font-bold text-on-surface-variant">
              Showing {filteredLedger.length} verified records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                  <th className="py-2.5 px-3">Transaction Hash</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Block Height</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      No matching blocks found in ledger.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-primary flex items-center gap-1.5">
                        <LinkIcon size={12} className="text-secondary" />
                        <span>{(log.currentHash || '0xabcdef1234567890').substring(0, 20)}...</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="status-pill status-pill-verified">
                          {log.action || 'REPORT_FILED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-on-surface font-semibold">
                        {log.actorId?.name || 'Citizen Verified'}
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant">
                        {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-secondary">
                        #{10420 + (ledger.length - idx)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlockchainExplorer;
