import React, { useState } from 'react';
import { translations } from '../translations';
import { User, DepositRequest, WithdrawalRequest, InvestmentPlan, PlatformSettings, Announcement } from '../types';
import { Users, Wallet, TrendingUp, AlertTriangle, ShieldCheck, Check, Trash, Plus, Search, Settings, Megaphone, Eye, X, Edit, RotateCcw, HelpCircle } from 'lucide-react';

interface AdminViewProps {
  lang: 'en' | 'am';
  users: User[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  plans: InvestmentPlan[];
  settings: PlatformSettings;
  onUpdateUsers: (updated: User[]) => void;
  onUpdateDeposits: (updated: DepositRequest[]) => void;
  onUpdateWithdrawals: (updated: WithdrawalRequest[]) => void;
  onUpdatePlans: (updated: InvestmentPlan[]) => void;
  onUpdateSettings: (updated: PlatformSettings) => void;
  onBroadcastAnnouncement: (ann: Announcement) => void;
}

type AdminSub = 'stats' | 'users' | 'deposits' | 'withdrawals' | 'plans' | 'announcements' | 'settings';

export default function AdminView({
  lang,
  users,
  deposits,
  withdrawals,
  plans,
  settings,
  onUpdateUsers,
  onUpdateDeposits,
  onUpdateWithdrawals,
  onUpdatePlans,
  onUpdateSettings,
  onBroadcastAnnouncement
}: AdminViewProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<AdminSub>('stats');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustBalanceVal, setAdjustBalanceVal] = useState('');
  const [forceResetPass, setForceResetPass] = useState('');

  // Plans manager form
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanNameAm, setNewPlanNameAm] = useState('');
  const [newPlanRate, setNewPlanRate] = useState('');
  const [newPlanDur, setNewPlanDur] = useState('');
  const [newPlanMin, setNewPlanMin] = useState('');
  const [newPlanMax, setNewPlanMax] = useState('');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');

  // Settings Forms
  const [cfgWebsiteName, setCfgWebsiteName] = useState(settings.websiteName);
  const [cfgMinDeposit, setCfgMinDeposit] = useState(settings.minimumDeposit.toString());
  const [cfgMinWithdrawal, setCfgMinWithdrawal] = useState(settings.minimumWithdrawal.toString());
  const [cfgCom1, setCfgCom1] = useState(settings.referralLevel1Com.toString());
  const [cfgCom2, setCfgCom2] = useState(settings.referralLevel2Com.toString());
  const [cfgCom3, setCfgCom3] = useState(settings.referralLevel3Com.toString());
  const [cfgRegEnabled, setCfgRegEnabled] = useState(settings.registrationEnabled);

  // Screenshot viewer modal
  const [viewScreenshotImg, setViewScreenshotImg] = useState<string | null>(null);

  // Calculate stats in real-time
  const totalUsersCount = users.length;
  const activeMembersCount = users.filter(u => u.status === 'active').length;
  
  const totalApprovedDeposits = deposits
    .filter(d => d.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalApprovedWithdrawals = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const totalPendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

  const handleUserSearch = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

  // Approve Deposit Request
  const handleApproveDeposit = (dep: DepositRequest) => {
    // 1. Credit User Balance
    const updatedUsers = users.map(user => {
      if (user.id === dep.userId) {
        // Also check if they were referred by someone to distribute multilevel commission!
        let refIncomeUpdate = 0;
        let updateReferredBy = users;

        if (user.referredBy) {
          // Level 1 Commission
          updateReferredBy = updateReferredBy.map(u1 => {
            if (u1.referralCode === user.referredBy) {
              const comm1 = dep.amount * (settings.referralLevel1Com / 100);
              return {
                ...u1,
                balance: u1.balance + comm1,
                referralIncome: u1.referralIncome + comm1
              };
            }
            return u1;
          });

          // Level 2 Commission (Optional if referred by lvl 2 exists)
          const lvl1User = users.find(u => u.referralCode === user.referredBy);
          if (lvl1User && lvl1User.referredBy) {
            updateReferredBy = updateReferredBy.map(u2 => {
              if (u2.referralCode === lvl1User.referredBy) {
                const comm2 = dep.amount * (settings.referralLevel2Com / 100);
                return {
                  ...u2,
                  balance: u2.balance + comm2,
                  referralIncome: u2.referralIncome + comm2
                };
              }
              return u2;
            });

            // Level 3 Commission
            const lvl2User = users.find(u => u.referralCode === lvl1User.referredBy);
            if (lvl2User && lvl2User.referredBy) {
              updateReferredBy = updateReferredBy.map(u3 => {
                if (u3.referralCode === lvl2User.referredBy) {
                  const comm3 = dep.amount * (settings.referralLevel3Com / 100);
                  return {
                    ...u3,
                    balance: u3.balance + comm3,
                    referralIncome: u3.referralIncome + comm3
                  };
                }
                return u3;
              });
            }
          }
        }

        return {
          ...user,
          balance: user.balance + dep.amount
        };
      }
      return user;
    });

    // If referral commissions were distributed, map over updatedUsers list
    onUpdateUsers(updatedUsers);

    // 2. Resolve Status to approved
    const updatedDeposits = deposits.map(d => d.id === dep.id ? { ...d, status: 'approved' as const } : d);
    onUpdateDeposits(updatedDeposits);

    alert(`Deposit of $${dep.amount} approved for @${dep.username}. Wallet credited instantly.`);
  };

  // Reject Deposit Request
  const handleRejectDeposit = (dep: DepositRequest) => {
    const updatedDeposits = deposits.map(d => d.id === dep.id ? { ...d, status: 'rejected' as const } : d);
    onUpdateDeposits(updatedDeposits);
    alert(`Deposit of $${dep.amount} rejected.`);
  };

  // Approve Withdrawal Request
  const handleApproveWithdrawal = (wit: WithdrawalRequest) => {
    // Subtract immediately if approved.
    const updatedUsers = users.map(user => {
      if (user.id === wit.userId) {
        if (user.balance < wit.amount) {
          alert(`Warning: User only has $${user.balance} left in account!`);
        }
        return {
          ...user,
          balance: Math.max(0, user.balance - wit.amount)
        };
      }
      return user;
    });
    onUpdateUsers(updatedUsers);

    const updatedWithdrawals = withdrawals.map(w => w.id === wit.id ? { ...w, status: 'approved' as const } : w);
    onUpdateWithdrawals(updatedWithdrawals);
    alert(`Payout of $${wit.amount} completed for @${wit.username}.`);
  };

  // Reject Withdrawal Request
  const handleRejectWithdrawal = (wit: WithdrawalRequest) => {
    const updatedWithdrawals = withdrawals.map(w => w.id === wit.id ? { ...w, status: 'rejected' as const } : w);
    onUpdateWithdrawals(updatedWithdrawals);
    alert(`Withdrawal request of $${wit.amount} rejected.`);
  };

  // Suspend client
  const handleToggleSuspendUser = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, status: nextStatus as any } : u);
    onUpdateUsers(updatedUsers);
    setSelectedUser({ ...user, status: nextStatus });
    alert(`User status mutated to: ${nextStatus.toUpperCase()}`);
  };

  // Toggle KYC state
  const handleToggleKycUser = (user: User) => {
    const nextKyc = !user.isKycVerified;
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, isKycVerified: nextKyc } : u);
    onUpdateUsers(updatedUsers);
    setSelectedUser({ ...user, isKycVerified: nextKyc });
    alert(`User KYC status manually updated to: ${nextKyc ? 'VERIFIED' : 'UNVERIFIED'}`);
  };

  // Adjust balance
  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const adjustVal = parseFloat(adjustBalanceVal);
    if (isNaN(adjustVal)) {
      alert("Invalid input.");
      return;
    }

    const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, balance: adjustVal } : u);
    onUpdateUsers(updatedUsers);
    setSelectedUser({ ...selectedUser, balance: adjustVal });
    setAdjustBalanceVal('');
    alert(`Balance modified to: $${adjustVal}`);
  };

  // Force reset pass
  const handleForceResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !forceResetPass) return;

    const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, passwordHash: forceResetPass } : u);
    onUpdateUsers(updatedUsers);
    setForceResetPass('');
    alert(`Password securely overridden.`);
  };

  // Add Investment Plan Scheme
  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newPlanRate);
    const dur = parseInt(newPlanDur);
    const min = parseFloat(newPlanMin);
    const max = parseFloat(newPlanMax);

    if (!newPlanName || isNaN(rate) || isNaN(dur) || isNaN(min) || isNaN(max)) {
      alert("Please fill in plan descriptors accurately.");
      return;
    }

    const newPlan: InvestmentPlan = {
      id: Math.random().toString(36).substring(2, 7),
      name: newPlanName,
      nameAm: newPlanNameAm || newPlanName,
      dailyRate: rate,
      durationDays: dur,
      minDeposit: min,
      maxDeposit: max
    };

    onUpdatePlans([...plans, newPlan]);
    setNewPlanName('');
    setNewPlanNameAm('');
    setNewPlanRate('');
    setNewPlanDur('');
    setNewPlanMin('');
    setNewPlanMax('');
    alert("Innovative interest package setup registered.");
  };

  // Delete Plan Scheme
  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) {
      alert("Must keep at least 1 design scheme.");
      return;
    }
    const updated = plans.filter(p => p.id !== planId);
    onUpdatePlans(updated);
  };

  // Send Broadcast Notice
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annBody) {
      alert("Fields cannot be hollow.");
      return;
    }

    onBroadcastAnnouncement({
      id: Math.random().toString(36).substring(2, 7),
      title: annTitle,
      body: annBody,
      date: new Date().toISOString()
    });

    setAnnTitle('');
    setAnnBody('');
    alert("Announcement broadcasted securely to all user feeds.");
  };

  // Save Settings Config
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      websiteName: cfgWebsiteName,
      minimumDeposit: parseFloat(cfgMinDeposit) || 10,
      minimumWithdrawal: parseFloat(cfgMinWithdrawal) || 5,
      referralLevel1Com: parseFloat(cfgCom1) || 10,
      referralLevel2Com: parseFloat(cfgCom2) || 5,
      referralLevel3Com: parseFloat(cfgCom3) || 2.5,
      registrationEnabled: cfgRegEnabled,
      themeColorGold: settings.themeColorGold
    });
    alert("Configuration updated in system cache!");
  };

  return (
    <div className="w-full bg-[#05070f] text-slate-100 min-h-screen pb-16 flex flex-col md:flex-row">
      
      {/* Screenshot viewer modal */}
      {viewScreenshotImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button onClick={() => setViewScreenshotImg(null)} className="absolute top-6 right-6 text-white cursor-pointer bg-slate-900 p-2 rounded-full hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
          <div className="p-2 bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-800">
            <img src={viewScreenshotImg} alt="Proof of payment screenshot uploaded by client" className="w-full h-auto max-h-[75vh] object-contain rounded-2xl" />
            <p className="text-[10px] text-center text-slate-500 mt-2">Client-Uploaded Transaction Receipt Verification Screen</p>
          </div>
        </div>
      )}

      {/* Side Control panel */}
      <aside className="w-full md:w-64 shrink-0 bg-[#060a16] border-r border-slate-900/80 p-6 space-y-6">
        <div>
          <span className="text-sm font-black tracking-widest text-[#f59e0b] block">APEX SECURE ADM</span>
          <h2 className="text-lg font-black text-white italic mt-1">{t.appName} Panel</h2>
        </div>

        <nav className="flex flex-col gap-2 text-sm font-semibold">
          <button onClick={() => setActiveTab('stats')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all ${activeTab === 'stats' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>{lang === 'en' ? 'Overview' : 'እይታ'}</button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all ${activeTab === 'users' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>{lang === 'en' ? 'User Directory' : 'የአባላት ደብተር'}</button>
          
          <button onClick={() => setActiveTab('deposits')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all relative ${activeTab === 'deposits' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <span>{lang === 'en' ? 'Pending Deposits' : 'ጠቅላላ ገቢዎች'}</span>
            {totalPendingDeposits > 0 && <span className="absolute right-3.5 top-3.5 bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce">{totalPendingDeposits}</span>}
          </button>

          <button onClick={() => setActiveTab('withdrawals')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all relative ${activeTab === 'withdrawals' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <span>{lang === 'en' ? 'Pending Withdraw' : 'የክፍያ ጥያቄዎች'}</span>
            {totalPendingWithdrawals > 0 && <span className="absolute right-3.5 top-3.5 bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce">{totalPendingWithdrawals}</span>}
          </button>
          
          <button onClick={() => setActiveTab('plans')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all ${activeTab === 'plans' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>{lang === 'en' ? 'Scheme Editor' : 'የእቅዶች ማስተካከያ'}</button>
          <button onClick={() => setActiveTab('announcements')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all ${activeTab === 'announcements' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>{lang === 'en' ? 'Broadcast News' : 'አጠቃላይ ማስታወቂያ'}</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left py-3.5 px-4 rounded-xl cursor-pointer transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>{lang === 'en' ? 'Core Settings' : 'ዋና ቅንብሮች'}</button>
        </nav>
      </aside>

      {/* Main admin context container */}
      <main className="flex-1 p-6 space-y-8 max-w-7xl">
        
        {/* ================= ADMIN TAB: STATS ================= */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold tracking-tight text-white mb-6">Secured System Dashboard Statistics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.totalUsers}</span>
                <p className="text-3xl font-extrabold text-white mt-1">{totalUsersCount}</p>
                <span className="text-[10px] text-emerald-400 block mt-2">Active accounts ratio {(activeMembersCount/totalUsersCount*100).toFixed(1)}%</span>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.totalDeposits}</span>
                <p className="text-3xl font-extrabold text-white mt-1">${totalApprovedDeposits.toFixed(2)}</p>
                <span className="text-[10px] text-amber-500 block mt-2">Approved deposits ledger index</span>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.totalWithdrawals}</span>
                <p className="text-3xl font-extrabold text-white mt-1">${totalApprovedWithdrawals.toFixed(2)}</p>
                <span className="text-[10px] text-red-400 block mt-2">Processed payouts cashout ratio {(totalApprovedWithdrawals/totalApprovedDeposits*100 || 0).toFixed(1)}%</span>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{t.totalRevenue} reserves</span>
                <p className="text-3xl font-extrabold text-[#f59e0b] mt-1">${(totalApprovedDeposits - totalApprovedWithdrawals).toFixed(2)}</p>
                <span className="text-[10px] text-emerald-400 block mt-2">Real balance reserve pool</span>
              </div>
            </div>

            {/* Simulated Admin Trend Graph */}
            <div className="bg-[#060a16] border border-slate-900 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Cash Inflow vs Outflow Reserves Weekly</h3>
              <div className="relative w-full h-[180px] bg-slate-950/40 border border-slate-900/80 rounded-2xl p-2">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#111827" strokeWidth="0.2" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#111827" strokeWidth="0.2" />
                  {/* Deposits Curve (Emerald) */}
                  <path d="M 0 25 Q 20 18, 40 12 T 80 5 T 100 2" fill="none" stroke="#10b981" strokeWidth="0.8" />
                  {/* Payouts Curve (Rose) */}
                  <path d="M 0 28 Q 20 22, 40 19 T 80 14 T 100 11" fill="none" stroke="#f43f5e" strokeWidth="0.8" />
                </svg>
                {/* Labels */}
                <div className="absolute inset-x-4 bottom-2 flex justify-between text-[9px] text-slate-500 font-mono">
                  <span className="text-emerald-400">● Inbounds</span>
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span className="text-rose-500">● Cashouts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN TAB: USERS ================= */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Verify & Modify User Accounts Directory</h2>

              {/* Search user */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={t.searchUsersPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-900">
                    <tr>
                      <th className="py-3 px-4">Client username</th>
                      <th className="py-3 px-4">Email / Phone</th>
                      <th className="py-3 px-4">User balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {handleUserSearch.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-950/20">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          {user.role === 'admin' ? '⭐' : '👤'}
                          {user.username}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="text-slate-400 block">{user.email}</span>
                          <span className="text-slate-500">{user.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-500 font-mono">${user.balance.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {user.status === 'active' ? t.active : t.suspended}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 hover:scale-105 transition-transform"
                          >
                            <Settings className="w-3.5 h-3.5" /> Modify Account
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Editor drawer */}
            {selectedUser && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-sm" />
                    Modify Card File: @{selectedUser.username}
                  </h3>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs space-y-2">
                    <p className="text-slate-400">UID: <span className="text-white float-right">{selectedUser.id}</span></p>
                    <p className="text-slate-400">Referral Code: <span className="text-amber-500 font-bold float-right">{selectedUser.referralCode}</span></p>
                    <p className="text-slate-400">Referred By: <span className="text-white float-right">{selectedUser.referredBy || 'None'}</span></p>
                    <p className="text-slate-400">Investments Active: <span className="text-white float-right">${selectedUser.activeInvestment.toFixed(2)}</span></p>
                    <p className="text-slate-400">P2P Status: <span className={`font-black uppercase float-right ${selectedUser.isKycVerified ? 'text-emerald-400' : 'text-amber-500'}`}>{selectedUser.isKycVerified ? 'Verified KYC' : 'Unverified / Process'}</span></p>
                  </div>

                  {/* Scanned/Uploaded KYC Documents Panel */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 text-xs space-y-3">
                    <h4 className="text-[10px] text-amber-500 font-extrabold uppercase font-mono tracking-wider">🔬 Captured KYC Document Feeds</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Facial Scan */}
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">1. Facial Scan:</span>
                        {selectedUser.kycFacialPic ? (
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                            <img 
                              src={selectedUser.kycFacialPic} 
                              className="w-full h-full object-cover" 
                              alt="Facial Capture" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg border border-dashed border-slate-900 bg-slate-900/40 flex items-center justify-center text-center p-2 text-[10px] text-slate-600 font-mono">
                            No biometric face scanned
                          </div>
                        )}
                      </div>

                      {/* Official ID Scan */}
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">2. Camera ID Scan:</span>
                        {selectedUser.kycIdPic ? (
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                            {selectedUser.kycIdPic.startsWith('data:') ? (
                              <img 
                                src={selectedUser.kycIdPic} 
                                className="w-full h-full object-contain bg-slate-950 p-1" 
                                alt="National ID Scan" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-11/12 h-3/5 bg-amber-500/10 border border-amber-550/30 rounded flex flex-col items-center justify-center text-center p-1">
                                <span className="text-[10px] font-black font-mono text-amber-500 leading-none">ID FILE</span>
                                <span className="text-[7px] text-slate-400 mt-1 truncate max-w-full">Custom_ID_Upload</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg border border-dashed border-slate-900 bg-slate-900/40 flex items-center justify-center text-center p-2 text-[10px] text-slate-600 font-mono">
                            No ID document scanned
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleKycUser(selectedUser)}
                      className={`w-full font-black text-[10px] py-2 rounded-lg uppercase tracking-widest cursor-pointer transition-all ${
                        selectedUser.isKycVerified 
                          ? 'bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {selectedUser.isKycVerified ? '⚠️ Revoke KYC Verification' : '✓ Approves/Verify KYC Document Scan'}
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleToggleSuspendUser(selectedUser)}
                      className={`flex-1 font-bold text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer ${selectedUser.status === 'active' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25'}`}
                    >
                      {selectedUser.status === 'active' ? t.suspendUser : t.activateUser}
                    </button>
                  </div>
                </div>

                {/* Adjust balances */}
                <div className="space-y-6">
                  <form onSubmit={handleAdjustBalanceSubmit} className="space-y-2.5">
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{lang === 'en' ? 'Modify Wallet Balance' : 'የኪስ ሂሳብ ቀይር'}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder={`Current: $${selectedUser.balance}`}
                        value={adjustBalanceVal}
                        onChange={(e) => setAdjustBalanceVal(e.target.value)}
                        className="bg-slate-950 border border-slate-850 px-4 py-2.5 text-sm rounded-xl text-white flex-1 focus:outline-none focus:border-amber-500"
                      />
                      <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-4 rounded-xl text-xs cursor-pointer">Submit</button>
                    </div>
                  </form>

                  <form onSubmit={handleForceResetPasswordSubmit} className="space-y-2.5 pt-4 border-t border-slate-900">
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{t.resetPassword}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter secure password override"
                        value={forceResetPass}
                        onChange={(e) => setForceResetPass(e.target.value)}
                        className="bg-slate-950 border border-slate-850 px-4 py-2.5 text-sm rounded-xl text-white flex-1 focus:outline-none focus:border-amber-500"
                      />
                      <button type="submit" className="bg-slate-900 border border-slate-800 text-white font-bold px-4 rounded-xl text-xs cursor-pointer hover:bg-slate-850">Override</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ADMIN TAB: DEPOSITS ================= */}
        {activeTab === 'deposits' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Review Inbound Payment Ledger Requests</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-900">
                    <tr>
                      <th className="py-3 px-4">Client username</th>
                      <th className="py-3 px-4">Method / Channel</th>
                      <th className="py-3 px-4">{t.amount}</th>
                      <th className="py-3 px-4">Receipt proof</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-950/20">
                        <td className="py-4 px-4 text-white font-bold">@{dep.username}</td>
                        <td className="py-4 px-4 text-xs">{dep.paymentMethod}</td>
                        <td className="py-4 px-4 font-extrabold text-emerald-400 font-mono">${dep.amount.toFixed(2)}</td>
                        <td className="py-4 px-4 text-xs">
                          {dep.screenshotUrl ? (
                            <button
                              onClick={() => setViewScreenshotImg(dep.screenshotUrl)}
                              className="text-amber-500 hover:text-amber-400 hover:underline font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" /> [View Proof Image]
                            </button>
                          ) : (
                            <span className="text-slate-500 font-semibold">[No Mock image]</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dep.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : dep.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                            {dep.status === 'approved' ? t.approved : dep.status === 'rejected' ? t.rejected : t.pending}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {dep.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveDeposit(dep)}
                                className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded text-xs cursor-pointer hover:scale-105 transition-transform"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(dep)}
                                className="bg-red-500 text-white font-bold px-3 py-1 rounded text-xs cursor-pointer hover:scale-105 transition-transform"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN TAB: WITHDRAWALS ================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Review Outbound Cash Withdrawal Ledger</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-900">
                    <tr>
                      <th className="py-3 px-4">Client username</th>
                      <th className="py-3 px-4">Channel / Destination</th>
                      <th className="py-3 px-4">Destination Credential Details</th>
                      <th className="py-3 px-4">{t.amount}</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {withdrawals.map((wit) => (
                      <tr key={wit.id} className="hover:bg-slate-950/20">
                        <td className="py-4 px-4 text-white font-bold">@{wit.username}</td>
                        <td className="py-4 px-4 text-xs">{wit.paymentMethod}</td>
                        <td className="py-4 px-4 text-xs font-mono max-w-[200px] overflow-hidden truncate">{wit.address}</td>
                        <td className="py-4 px-4 font-extrabold text-rose-400 font-mono">${wit.amount.toFixed(2)}</td>
                        <td className="py-4 px-4 text-xs font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${wit.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : wit.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                            {wit.status === 'approved' ? t.approved : wit.status === 'rejected' ? t.rejected : t.pending}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {wit.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(wit)}
                                className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded text-xs cursor-pointer hover:scale-105 transition-transform"
                              >
                                Approve Payout
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(wit)}
                                className="bg-red-500 text-white font-bold px-3 py-1 rounded text-xs cursor-pointer hover:scale-105 transition-transform"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN TAB: INVESTMENT PLANS ================= */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Manage Interest Reward Schemes</h2>

              {/* Plans creator form */}
              <form onSubmit={handleAddPlanSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end bg-slate-950 p-6 rounded-2xl border border-slate-900/80 mb-8 text-xs">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-400 font-bold uppercase block mb-1.5">Plan Name EN</label>
                  <input type="text" placeholder="Bronze Scheme" className="w-full bg-slate-900 text-white py-2.5 px-3 rounded-lg border border-slate-800" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-slate-400 font-bold uppercase block mb-1.5">Plan Name AM</label>
                  <input type="text" placeholder="የነሐስ እቅድ" className="w-full bg-slate-900 text-white py-2.5 px-3 rounded-lg border border-slate-800" value={newPlanNameAm} onChange={(e) => setNewPlanNameAm(e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-400 font-bold uppercase block mb-1.5">Daily rate (%)</label>
                  <input type="number" step="0.1" placeholder="1.8" className="w-full bg-slate-900 text-white py-2.5 px-3 rounded-lg border border-slate-800" value={newPlanRate} onChange={(e) => setNewPlanRate(e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-400 font-bold uppercase block mb-1.5">Days</label>
                  <input type="number" placeholder="30" className="w-full bg-slate-900 text-white py-2.5 px-3 rounded-lg border border-slate-800" value={newPlanDur} onChange={(e) => setNewPlanDur(e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-400 font-bold uppercase block mb-1.5">Min ($)</label>
                  <input type="number" placeholder="10" className="w-full bg-slate-900 text-white py-2.5 px-3 rounded-lg border border-slate-800" value={newPlanMin} onChange={(e) => setNewPlanMin(e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-400 font-bold uppercase block mb-1.5">Max ($)</label>
                  <input type="number" placeholder="5000" className="w-full bg-slate-900 text-white py-2.5 px-3 rounded-lg border border-slate-800 font-bold" value={newPlanMax} onChange={(e) => setNewPlanMax(e.target.value)} />
                  <button type="submit" className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-lg text-center cursor-pointer">Add Scheme</button>
                </div>
              </form>

              {/* Plans directory list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-900 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold text-base">{p.name} <span className="text-xs text-slate-500 font-mono block">AM: {p.nameAm}</span></h4>
                      <p className="text-2xl font-black text-amber-500 mt-2 mb-4">{p.dailyRate}% returns daily</p>
                      <ul className="text-xs text-slate-400 space-y-1.5">
                        <li>Trading period: <strong>{p.durationDays} Days</strong></li>
                        <li>Floor Capital: <strong>${p.minDeposit}</strong></li>
                        <li>Ceiling Capital: <strong>${p.maxDeposit}</strong></li>
                      </ul>
                    </div>
                    <button
                      onClick={() => handlePlanDeletionFlow(p.id)}
                      className="mt-6 border border-red-500/10 hover:border-red-500 text-xs text-red-400 hover:text-[#05070f] hover:bg-red-500 py-2 rounded-xl transition-all font-bold cursor-pointer inline-flex items-center justify-center gap-1"
                    >
                      <Trash className="w-3.5 h-3.5" /> Cancel Interest Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN TAB: ANNOUNCEMENTS ================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Global Broadcaster News Feed</h2>

              <form onSubmit={handleBroadcastSubmit} className="space-y-5">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">announcement Header / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. CBE direct validation services maintenance notice"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Announcements Body</label>
                  <textarea
                    rows={4}
                    placeholder="Provide description updates..."
                    value={annBody}
                    onChange={(e) => setAnnBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:scale-105 transition-transform cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <Megaphone className="w-4 h-4" /> Broadcast Notice
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= ADMIN TAB: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 rounded-3xl p-8 border border-slate-880 border-slate-800">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Platform Configuration Settings</h2>

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-900">
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Website customization name</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 font-bold" value={cfgWebsiteName} onChange={(e) => setCfgWebsiteName(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.enableReg}</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none"
                      value={cfgRegEnabled ? "yes" : "no"}
                      onChange={(e) => setCfgRegEnabled(e.target.value === "yes")}
                    >
                      <option value="yes">YES - Open Registration Gate</option>
                      <option value="no">NO - Lockdown Registration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-900">
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Minimum Deposit Limit ($)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" value={cfgMinDeposit} onChange={(e) => setCfgMinDeposit(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Minimum Withdrawal Limit ($)</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" value={cfgMinWithdrawal} onChange={(e) => setCfgMinWithdrawal(e.target.value)} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-4">Customize Referral Affiliate System Tree (%)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Level 1 Commission</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" value={cfgCom1} onChange={(e) => setCfgCom1(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Level 2 Commission</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" value={cfgCom2} onChange={(e) => setCfgCom2(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Level 3 Commission</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" value={cfgCom3} onChange={(e) => setCfgCom3(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-left">
                  <button type="submit" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer">
                    Apply configurations modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  function handlePlanDeletionFlow(id: string) {
    if (confirm("Are you sure you want to deactivate interest reward plan tier?")) {
      handleDeletePlan(id);
    }
  }
}
