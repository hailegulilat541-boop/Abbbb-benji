import React, { useState, useRef } from 'react';
import { translations } from '../translations';
import { User, DepositRequest, WithdrawalRequest, InvestmentPlan, Transaction } from '../types';
import { Wallet, ShieldCheck, ArrowDownCircle, ArrowUpCircle, Share2, Award, UserCheck, Plus, Check, Link, RefreshCw, Upload, Eye, EyeOff, Camera, ChevronRight, MessageSquare } from 'lucide-react';

interface UserViewProps {
  lang: 'en' | 'am';
  user: User;
  onNavigate: (view: any) => void;
  plans: InvestmentPlan[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  onSubmitDeposit: (amount: number, method: string, screenshot: string) => void;
  onSubmitWithdrawal: (amount: number, method: string, address: string) => void;
  onUpdateUser: (updated: User) => void;
  onInvest: (planId: string, amount: number) => void;
}

type SubView = 'dashboard' | 'deposit' | 'withdraw' | 'referrals' | 'profile' | 'plans';

export default function UserView({
  lang,
  user,
  onNavigate,
  plans,
  deposits,
  withdrawals,
  onSubmitDeposit,
  onSubmitWithdrawal,
  onUpdateUser,
  onInvest
}: UserViewProps) {
  const t = translations[lang];
  const [subView, setSubView] = useState<SubView>('dashboard');

  // Deposit Form states
  const [depMethod, setDepMethod] = useState('Commercial Bank of Ethiopia (CBE)');
  const [depAmount, setDepAmount] = useState('');
  const [depScreenshot, setDepScreenshot] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Withdrawal Form states
  const [withMethod, setWithMethod] = useState('Commercial Bank of Ethiopia (CBE)');
  const [withAmount, setWithAmount] = useState('');
  const [withAddress, setWithAddress] = useState('');

  // Investment states
  const [investPlanId, setInvestPlanId] = useState('');
  const [investAmount, setInvestAmount] = useState('');
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState('');

  // Profile Form States
  const [editUsername, setEditUsername] = useState(user.username);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Copy status
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter lists custom for this user
  const myDeposits = deposits.filter(d => d.userId === user.id);
  const myWithdrawals = withdrawals.filter(w => w.userId === user.id);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleScreenshotFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleScreenshotFile(e.target.files[0]);
    }
  };

  const handleScreenshotFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setDepScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Deposit Submit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(depAmount);
    if (!parsedAmount || parsedAmount < 10) {
      alert(lang === 'en' ? "Minimum deposit is $10." : "አነስተኛው የገንዘብ መጠን $10 ነው።");
      return;
    }
    if (!depScreenshot) {
      alert(lang === 'en' ? "Please upload transaction proof screenshot." : "እባክዎን የክፍያ ማረጋገጫ ፋይል ይስቀሉ።");
      return;
    }
    onSubmitDeposit(parsedAmount, depMethod, depScreenshot);
    setDepAmount('');
    setDepScreenshot('');
    alert(lang === 'en' ? "Deposit submitted! Please wait for administration approval." : "ገንዘብ ማስገቢያ ጥያቄ በትክክል ተልኳል! እባክዎ በአስተዳዳሪ እስከሚረጋገጥ ድረስ ይጠብቁ።");
  };

  // Withdrawal Submit
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withAmount);
    if (!parsedAmount || parsedAmount < 5) {
      alert(lang === 'en' ? "Minimum withdrawal is $5." : "አነስተኛው የገንዘብ ማውጫ $5 ነው።");
      return;
    }
    if (parsedAmount > user.balance) {
      alert(lang === 'en' ? "Inadequate account balance." : "በቂ ቀሪ ሂሳብ የለዎትም።");
      return;
    }
    if (!withAddress) {
      alert(lang === 'en' ? "Please enter your withdrawal coordinates / bank account details." : "እባክዎን የባንክ ሂሳብ ወይም የክሪፕቶ አድራሻ ይሙሉ።");
      return;
    }
    onSubmitWithdrawal(parsedAmount, withMethod, withAddress);
    setWithAmount('');
    setWithAddress('');
    alert(lang === 'en' ? "Withdrawal requested successfully!" : "የገንዘብ ማውጣት ጥያቄ በተሳካ ሁኔታ ተልኳል!");
  };

  // Profile Edit Submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');

    const updatedUser = {
      ...user,
      username: editUsername,
      phone: editPhone,
    };

    if (newPassword) {
      updatedUser.passwordHash = newPassword;
    }

    onUpdateUser(updatedUser);
    setNewPassword('');
    setProfileSuccess(lang === 'en' ? "Profile credentials modernized!" : "መለያ መረጃ በትክክል ተስተካክሏል!");
  };

  // Avatar Image Upload (Base64 conversion)
  const handleAvatarUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({
          ...user,
          profilePic: reader.result as string
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Investment Submit
  const handleInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInvestError('');
    setInvestSuccess('');

    const plan = plans.find(p => p.id === investPlanId);
    if (!plan) return;

    const amountNum = parseFloat(investAmount);
    if (!amountNum || isNaN(amountNum)) {
      setInvestError(lang === 'en' ? "Enter valid amount" : "ልክ መጠን ያስገቡ");
      return;
    }

    if (amountNum < plan.minDeposit || amountNum > plan.maxDeposit) {
      setInvestError(lang === 'en' ? `Limit error. Min: $${plan.minDeposit}, Max: $${plan.maxDeposit}` : `የመጠን ስህተት። ዝቅተኛ፡ $${plan.minDeposit}፣ ከፍተኛ፡ $${plan.maxDeposit}`);
      return;
    }

    if (user.balance < amountNum) {
      setInvestError(lang === 'en' ? "Inadequate balance to trade!" : "በቂ ቀሪ ሂሳብ የለዎትም!");
      return;
    }

    onInvest(investPlanId, amountNum);
    setInvestAmount('');
    setInvestPlanId('');
    setInvestSuccess(lang === 'en' ? "Portfolio created! Dividends are tracking." : "ፖርትፎሊዮ ተጀምሯል! ዕለታዊ ትርፍ በትክክል ታክሏል።");
  };

  // Dynamic values helper
  const referralLinkUrl = `https://apexinvest.com/register?ref=${user.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full bg-[#05070f] text-slate-100 min-h-screen relative pb-16">
      {/* Upper Navigation Row */}
      <header className="sticky top-0 z-40 bg-[#060a16]/80 backdrop-blur-xl border-b border-slate-900/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <span className="text-xl font-black italic text-amber-500 cursor-pointer flex items-center gap-2" onClick={() => setSubView('dashboard')}>
            <span className="w-2 h-5 bg-amber-500 rounded-sm" />
            {t.appName}
          </span>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button onClick={() => setSubView('dashboard')} className={`cursor-pointer ${subView === 'dashboard' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{t.dashboard}</button>
            <button onClick={() => setSubView('plans')} className={`cursor-pointer ${subView === 'plans' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{t.activeInvestment}</button>
            <button onClick={() => setSubView('deposit')} className={`cursor-pointer ${subView === 'deposit' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Deposit' : 'ገንዘብ ማስገባት'}</button>
            <button onClick={() => setSubView('withdraw')} className={`cursor-pointer ${subView === 'withdraw' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Withdraw' : 'ገንዘብ ማውጣት'}</button>
            <button onClick={() => setSubView('referrals')} className={`cursor-pointer ${subView === 'referrals' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Affiliate' : 'ተባባሪዎች'}</button>
            <button onClick={() => setSubView('profile')} className={`cursor-pointer ${subView === 'profile' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Account Profile' : 'የመለያ መገለጫ'}</button>
          </nav>
        </div>

        {/* User Badge Top right */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-500 block leading-tight">{lang === 'en' ? 'Welcome Back' : 'እንኳን ደህና መጡ' }</span>
            <span className="text-sm font-bold text-white uppercase">{user.username}</span>
          </div>

          <div className="relative group">
            <label className="cursor-pointer block relative">
              <input type="file" accept="image/*" onChange={handleAvatarUploadChange} className="hidden" />
              {user.profilePic ? (
                <img src={user.profilePic} alt="avatar" className="w-10 h-10 rounded-full border border-amber-500/30 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-850 hover:bg-slate-800 text-amber-500 font-bold border border-slate-800 flex items-center justify-center text-sm uppercase">
                  {user.username[0]}
                </div>
              )}
              <div className="absolute right-0 bottom-0 bg-amber-500 p-0.5 rounded-full text-slate-950 border border-[#05070f]">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </label>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Control Bar under header */}
      <div className="md:hidden bg-slate-900/60 border-b border-slate-900 grid grid-cols-5 text-[10px] text-center font-bold text-slate-400">
        <button onClick={() => setSubView('dashboard')} className={`py-3 ${subView === 'dashboard' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Overview' : 'እይታ'}</button>
        <button onClick={() => setSubView('plans')} className={`py-3 ${subView === 'plans' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Invest' : 'ፈሰስ'}</button>
        <button onClick={() => setSubView('deposit')} className={`py-3 ${subView === 'deposit' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Deposit' : 'ማስገቢያ'}</button>
        <button onClick={() => setSubView('withdraw')} className={`py-3 ${subView === 'withdraw' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Payout' : 'ማውጫ'}</button>
        <button onClick={() => setSubView('profile')} className={`py-3 ${subView === 'profile' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Security' : 'ደህንነት'}</button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {user.status === 'suspended' && (
          <div className="mb-8 p-6 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-4 text-red-400 font-semibold text-sm">
            <span>🛡️ Warning: Your account is suspended. Your dashboard statistics are currently read-only. Contact Support.</span>
          </div>
        )}

        {/* ================= VIEW: OVERVIEW DASHBOARD ================= */}
        {subView === 'dashboard' && (
          <div className="space-y-8">
            {/* Upper Balance Panels Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card: Balance */}
              <div className="bg-slate-900/60 border border-slate-850 hover:border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.walletBalance}</span>
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Wallet className="w-5 h-5" /></div>
                </div>
                <h3 className="text-3xl font-black text-white leading-none tracking-tight">${user.balance.toFixed(2)}</h3>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setSubView('deposit')} className="cursor-pointer flex-1 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg text-center">{lang === 'en' ? 'Deposit' : 'ማስገቢያ'}</button>
                  <button onClick={() => setSubView('withdraw')} className="cursor-pointer flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white text-xs rounded-lg text-center font-bold tracking-wide">{lang === 'en' ? 'Withdraw' : 'ማውጫ'}</button>
                </div>
              </div>

              {/* Card: Daily Returns */}
              <div className="bg-slate-900/60 border border-slate-850 hover:border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.dailyProfit}</span>
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><Plus className="w-5 h-5 text-amber-500" /></div>
                </div>
                <h3 className="text-3xl font-black text-white leading-none tracking-tight">${user.dailyProfit.toFixed(2)}</h3>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">📈 Accruing automated return payouts</p>
              </div>

              {/* Card: Referral Earnings */}
              <div className="bg-slate-900/60 border border-slate-850 hover:border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.referralIncome}</span>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl"><Award className="w-5 h-5 text-amber-500" /></div>
                </div>
                <h3 className="text-3xl font-black text-white leading-none tracking-tight">${user.referralIncome.toFixed(2)}</h3>
                <button onClick={() => setSubView('referrals')} className="text-xs text-amber-500 hover:text-amber-400 mt-3 font-semibold flex items-center gap-1 cursor-pointer">Affiliate Tree Hierarchy →</button>
              </div>

              {/* Card: Active Contracts */}
              <div className="bg-slate-900/60 border border-slate-850 hover:border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.activeInvestment}</span>
                  <div className="p-2 bg-green-500/10 text-green-400 rounded-xl"><ShieldCheck className="w-5 h-5 text-amber-500" /></div>
                </div>
                <h3 className="text-3xl font-black text-white leading-none tracking-tight">${user.activeInvestment.toFixed(2)}</h3>
                <button onClick={() => setSubView('plans')} className="text-xs text-amber-500 hover:text-amber-400 mt-3 font-semibold flex items-center gap-1 cursor-pointer">{lang === 'en' ? 'Open New Plan +' : 'አዲስ እቅድ ጀምር +'}</button>
              </div>
            </div>

            {/* Custom SVG Earnings Line Chart Dashboard */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider mb-0.5">{t.earningsOverview}</span>
                  <h3 className="text-lg font-bold text-white">Compounding Profit Accumulation (Last 10 Days)</h3>
                </div>
                <div className="text-right">
                  <span className="text-amber-500 text-xs font-black">+ 36.25 USD Today</span>
                </div>
              </div>

              {/* Custom SVG Drawing Line chart */}
              <div className="relative w-full h-[180px] bg-slate-950/40 border border-slate-900/80 rounded-2xl p-2">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart_grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#111827" strokeWidth="0.2" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#111827" strokeWidth="0.2" />
                  {/* Glowing Fill area */}
                  <path d="M 0 30 Q 15 22, 30 25 T 60 14 T 90 6 T 100 5 L 100 30 Z" fill="url(#chart_grad)" />
                  {/* Interactive glowing line */}
                  <path d="M 0 30 Q 15 22, 30 25 T 60 14 T 90 6 T 100 5" fill="none" stroke="#f59e0b" strokeWidth="0.65" strokeLinecap="round" className="animate-pulse" />
                </svg>
                {/* Labels under SVG */}
                <div className="absolute inset-x-4 bottom-2 flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Day 1</span>
                  <span>Day 3</span>
                  <span>Day 6</span>
                  <span>Day 9</span>
                  <span>Now (Active)</span>
                </div>
              </div>
            </div>

            {/* Recent activity list */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-x3l rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-amber-500 rounded-sm" />
                {t.recentTransactions}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-900">
                    <tr>
                      <th className="py-3 px-4">{t.date}</th>
                      <th className="py-3 px-4">Method / Gate</th>
                      <th className="py-3 px-4">{t.amount}</th>
                      <th className="py-3 px-4">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {myDeposits.length === 0 && myWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-xs text-slate-500">
                          No recent transactions found. Start by completing a secure Deposit.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {myDeposits.slice(0, 3).map((d) => (
                          <tr key={d.id} className="hover:bg-slate-950/20">
                            <td className="py-3.5 px-4 text-xs font-mono">{d.date ? d.date.split('T')[0] : '2026-06-20'}</td>
                            <td className="py-3.5 px-4 text-xs font-semibold flex items-center gap-1.5 text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Deposit via {d.paymentMethod}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-500 font-mono">+${d.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                {d.status === 'approved' ? t.approved : d.status === 'rejected' ? t.rejected : t.pending}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {myWithdrawals.slice(0, 3).map((w) => (
                          <tr key={w.id} className="hover:bg-slate-950/20">
                            <td className="py-3.5 px-4 text-xs font-mono">{w.date ? w.date.split('T')[0] : '2026-06-20'}</td>
                            <td className="py-3.5 px-4 text-xs font-semibold flex items-center gap-1.5 text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Withdraw to {w.paymentMethod}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-rose-500 font-mono">-${w.amount.toFixed(2)}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : w.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                {w.status === 'approved' ? t.approved : w.status === 'rejected' ? t.rejected : t.pending}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW: PLANS (ACTIVE INVESTMENT) ================= */}
        {subView === 'plans' && (
          <div className="space-y-8">
            <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800">
              <h2 className="text-2xl font-black text-white mb-2">{t.plansTitle}</h2>
              <p className="text-slate-400 text-sm">{t.plansSubtitle}</p>

              {/* Start plan selector */}
              <form onSubmit={handleInvestmentSubmit} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-slate-950 p-6 rounded-2xl border border-slate-900/80">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{lang === 'en' ? 'Select Portfolio Tier' : 'ቁልፍ የትርፍ እቅድ ይምረጡ'}</label>
                  <select
                    value={investPlanId}
                    onChange={(e) => setInvestPlanId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- {lang === 'en' ? 'Choose Plan' : 'እቅድ ይምረጡ'} --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{lang === 'en' ? p.name : p.nameAm} ({p.dailyRate}%/day)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.enterAmount}</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-3 rounded-xl uppercase tracking-wider text-xs hover:scale-[1.01] transition-transform cursor-pointer shadow-md"
                  >
                    {lang === 'en' ? 'Activate Portfolio NOW' : 'የኢንቨስትመንት እቅድ አሁን ጀምር'}
                  </button>
                </div>
              </form>

              {investError && <p className="text-xs text-red-400 font-bold mt-3">⚠️ {investError}</p>}
              {investSuccess && <p className="text-xs text-emerald-400 font-bold mt-3">✅ {investSuccess}</p>}
            </div>

            {/* Showcase Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
                  <div>
                    <h3 className="text-base font-bold text-white">{lang === 'en' ? p.name : p.nameAm}</h3>
                    <p className="text-2xl font-extrabold text-amber-500 mt-2 mb-4">{p.dailyRate}% {lang === 'en' ? 'returns daily' : 'የየዕለቱ ወለድ'}</p>
                    <span className="text-xs text-slate-500 block">{lang === 'en' ? 'Trading Period' : 'የስራ ቀናት'} : {p.durationDays} Days</span>
                  </div>
                  <button
                    onClick={() => { setInvestPlanId(p.id); setInvestAmount(p.minDeposit.toString()); }}
                    className="mt-6 text-xs text-center border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-500 py-2 rounded-xl transition-all cursor-pointer font-bold"
                  >
                    Quick Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW: DEPOSIT PAGE ================= */}
        {subView === 'deposit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Deposit Form */}
            <div className="lg:col-span-2 bg-slate-900/60 rounded-3xl p-8 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">{lang === 'en' ? 'Make Safe Deposit Request' : 'ሂሳብዎን ደህንነቱ በተጠበቀ ሁኔታ ይሙሉ'}</h2>
                <p className="text-slate-400 text-xs mt-1">{t.plansSubtitle}</p>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-5">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.paymentMethod}</label>
                  <select
                    value={depMethod}
                    onChange={(e) => setDepMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Telebirr SuperApp Pay">Telebirr SuperApp Pay (ምቹ ክፍያ)</option>
                    <option value="USDT (TRC-20 Fast Network)">USDT (TRC-20 Network Wallet)</option>
                  </select>
                </div>

                {/* Gateway Detail boxes */}
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed space-y-3">
                  <h4 className="text-amber-500 font-bold uppercase tracking-wider">{lang === 'en' ? 'Selected Channel Instructions' : 'የክፍያ ዘዴ መመሪያዎች'}</h4>
                  {depMethod.includes('CBE') && (
                    <div className="space-y-2">
                      <p>🏦 {lang === 'en' ? 'Transfer funds to our official holding account:' : 'እባክዎ ገንዘቡን ወደዚህ የባንክ ሂሳብ ያስገቡ፡'}</p>
                      <p className="text-white text-sm bg-slate-950 p-3 rounded-lg font-mono">
                        Bank: <strong>Commercial Bank of Ethiopia</strong><br />
                        Acc Name: <strong>ApexInvest Securities Ltd.</strong><br />
                        Acc No: <strong className="text-amber-500">1000348239012</strong>
                      </p>
                    </div>
                  )}
                  {depMethod.includes('Telebirr') && (
                    <div>
                      <p>📱 {lang === 'en' ? 'Transfer directly using Telebirr SuperApp:' : 'ቴሌብርን በመጠቀም ቀጥታ ያስተላልፉ፡'}</p>
                      <p className="text-white text-sm bg-slate-950 p-3 rounded-lg font-mono">
                        Telebirr ID: <strong>99283</strong><br />
                        Phone Reference: <span className="text-amber-500">+251 900 12 34 56</span>
                      </p>
                    </div>
                  )}
                  {depMethod.includes('USDT') && (
                    <div>
                      <p>🪙 {lang === 'en' ? 'Submit payment via Tron TRC-20 Smart Contract address:' : 'በTron TRC-20 አድራሻ በኩል ይክፈሉ፡'}</p>
                      <p className="text-white text-sm bg-slate-950 p-3 rounded-lg font-mono flex items-center justify-between">
                        <span className="text-amber-500 text-xs">TCpG9F8y5isdfhS823yShdf923r</span>
                        <button type="button" onClick={() => alert("Address Copied!")} className="text-amber-500 hover:text-white font-bold cursor-pointer text-xs uppercase underline">Copy</button>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.enterAmount}</label>
                  <input
                    type="number"
                    min={10}
                    placeholder="Limit: Min $10. Enter amount."
                    value={depAmount}
                    onChange={(e) => setDepAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500 font-mono text-center text-lg font-bold"
                  />
                </div>

                {/* Proof Screenshot drag area */}
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.uploadScreenshot}</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => screenshotInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-amber-500 bg-slate-900/60' : depScreenshot ? 'border-emerald-500 bg-slate-950' : 'border-slate-800 bg-slate-950 hover:bg-slate-900/40'}`}
                  >
                    <input
                      type="file"
                      ref={screenshotInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {depScreenshot ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={depScreenshot} alt="Screenshot proof uploaded" className="max-h-24 rounded border border-emerald-500/20" />
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">✓ Proof Loaded Successfully. Click to replace file.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-slate-500" />
                        <p className="text-xs text-slate-400 font-bold">{t.dragDropScreenshot}</p>
                        <span className="text-[10px] text-slate-600">Supports JPG, PNG, WEBP receipts</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-4 rounded-xl uppercase tracking-wider text-sm hover:scale-[1.01] cursor-pointer transition-transform shadow-lg"
                >
                  {lang === 'en' ? 'Submit Secure Receipt Ledger' : 'ክፍያውን አረጋግጥ'}
                </button>
              </form>
            </div>

            {/* Right side: History tracker & info */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850 h-fit space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">{t.depositHistory}</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {myDeposits.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No deposits requests sent yet.</p>
                ) : (
                  myDeposits.map((dep) => (
                    <div key={dep.id} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono d-block">{dep.date ? dep.date.split('T')[0] : 'Today'}</span>
                        <h4 className="text-xs font-bold text-white mt-1">Deposit ${dep.amount.toFixed(2)}</h4>
                        <span className="text-[10px] text-slate-400 block">{dep.paymentMethod}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dep.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : dep.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                        {dep.status === 'approved' ? t.approved : dep.status === 'rejected' ? t.rejected : t.pending}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW: WITHDRAWAL ================= */}
        {subView === 'withdraw' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-slate-900/60 rounded-3xl p-8 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">{lang === 'en' ? 'Request Immediate Payout' : 'ያገኙትን ትርፍ በአስቸኳይ ያውጡ'}</h2>
                <p className="text-slate-400 text-xs mt-1">Available balance with lock protection: <strong>${user.balance.toFixed(2)}</strong></p>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{lang === 'en' ? 'Select Withdrawal gateway' : 'የገንዘብ መቀበያ ዘዴ'}</label>
                  <select
                    value={withMethod}
                    onChange={(e) => setWithMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Telebirr App Wallet Transfer">Telebirr Wallet Transfer</option>
                    <option value="USDT (TRC-20 Protocol)">USDT (Tron TRC-20 protocol wallet)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.enterAmount}</label>
                  <input
                    type="number"
                    min={5}
                    placeholder="Min $5. Enter amount."
                    value={withAmount}
                    onChange={(e) => setWithAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 focus:outline-none focus:border-amber-500 font-mono text-center text-lg font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Platform fee: 0% gateway commission. No additional networks taxes.</span>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.withdrawalAddress}</label>
                  <input
                    type="text"
                    placeholder={withMethod.includes('CBE') ? "Enter Bank Account Holder & Acc Number" : "Enter Payment Wallet ID or Crypto Address"}
                    value={withAddress}
                    onChange={(e) => setWithAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-4 rounded-xl uppercase tracking-wider text-sm hover:scale-[1.01] cursor-pointer transition-transform shadow-lg"
                >
                  {lang === 'en' ? 'Process Secure Withdrawal' : 'ወጭ ለማድረግ ጠይቅ'}
                </button>
              </form>
            </div>

            {/* Tracker */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850 h-fit space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">{t.withdrawHistory}</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {myWithdrawals.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No withdrawals requested yet.</p>
                ) : (
                  myWithdrawals.map((w) => (
                    <div key={w.id} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">{w.date ? w.date.split('T')[0] : 'Today'}</span>
                        <h4 className="text-xs font-bold text-white mt-1">Payout ${w.amount.toFixed(2)}</h4>
                        <span className="text-[10px] text-slate-400 block">{w.paymentMethod}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : w.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                        {w.status === 'approved' ? t.approved : w.status === 'rejected' ? t.rejected : t.pending}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW: REFERRAL SYSTEM ================= */}
        {subView === 'referrals' && (
          <div className="space-y-8">
            {/* Copy code banner */}
            <div className="bg-[#0b101f] border border-amber-500/25 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full col-span-1 bg-amber-500/5 blur-2xl pointer-events-none" />
              <div>
                <span className="text-amber-500 text-xs font-bold uppercase tracking-wider block mb-1">Affiliate Booster</span>
                <h2 className="text-2xl font-black text-white mb-2">{t.referralLink}</h2>
                <p className="text-xs text-slate-400 max-w-lg">Invite fellow active traders, and earn multi-level tiered rewards: Level 1 (10%), Level 2 (5%), Level 3 (2.5%) instantly credited when they start any profile portfolios.</p>
              </div>

              {/* Link generator box */}
              <div className="w-full md:w-auto flex items-center bg-slate-950 border border-slate-850 p-2 rounded-2xl max-w-md">
                <span className="text-xs font-mono text-slate-400 px-3 hidden sm:block overflow-hidden max-w-[210px] whitespace-nowrap">{referralLinkUrl}</span>
                <button
                  onClick={copyReferralLink}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all ml-auto whitespace-nowrap"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  {copiedLink ? t.copied : t.copyBtn}
                </button>
              </div>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1 font-bold">Total Referred Agents</span>
                <p className="text-3xl font-black text-white">4 Active Members</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1 font-bold">Your Referral commission percentage</span>
                <p className="text-3xl font-black text-amber-500">Up to 17.5% Accrued</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1 font-bold">Pending Affiliate commissions</span>
                <p className="text-3xl font-black text-white">$12.50 USD</p>
              </div>
            </div>

            {/* Tree visualization panel */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-6 uppercase tracking-wider">{t.commissionLevels}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Level 1 */}
                <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs text-amber-500 font-black">🌳 Tier Level 1 (Direct)</span>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">10% COMMISSION</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-900 flex justify-between">
                      <span className="text-white font-semibold">@chala_b</span>
                      <span className="text-amber-500 font-bold">Earned: $80.00</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 flex justify-between">
                      <span className="text-white font-semibold">@betty_t</span>
                      <span className="text-amber-500 font-bold">Earned: $40.00</span>
                    </div>
                  </div>
                </div>

                {/* Level 2 */}
                <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs text-amber-500 font-black">🌿 Tier Level 2</span>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">5% COMMISSION</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-900 flex justify-between">
                      <span className="text-white font-semibold flex items-center gap-1">@dawit_amharic</span>
                      <span className="text-amber-500 font-bold">Earned: $0.00</span>
                    </div>
                  </div>
                </div>

                {/* Level 3 */}
                <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <span className="text-xs text-amber-500 font-black">🍃 Tier Level 3</span>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">2.5% COMMISSION</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="text-center py-4 text-slate-500">
                      No Level 3 downline referrals yet. Expand your group network tree to start earning!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW: PROFILE ================= */}
        {subView === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Box: Info Panel */}
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-850 flex flex-col items-center text-center space-y-4 h-fit">
              {user.profilePic ? (
                <img src={user.profilePic} alt="profile" className="w-24 h-24 rounded-full border border-amber-500 object-cover shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-950 border border-slate-850 text-amber-500 text-3xl font-bold flex items-center justify-center uppercase shadow-lg">
                  {user.username[0]}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white uppercase">{user.username}</h3>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded mt-2">Active Elite Client</span>
              </div>

              <div className="w-full text-left text-xs bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-2.5">
                <p className="text-slate-400">Email: <strong className="text-white float-right">{user.email}</strong></p>
                <p className="text-slate-400">Phone: <strong className="text-white float-right">{user.phone}</strong></p>
                <p className="text-slate-400">Status: <strong className="text-emerald-400 float-right uppercase">✓ Active Verified</strong></p>
                <p className="text-slate-400">Registered: <strong className="text-white float-right">{user.registrationDate ? user.registrationDate.split('T')[0] : '2026-06-20'}</strong></p>
              </div>

              <label className="text-xs bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl cursor-pointer w-full transition-all block font-bold">
                Update Logo Avatar
                <input type="file" accept="image/*" onChange={handleAvatarUploadChange} className="hidden" />
              </label>
            </div>

            {/* Right Form: Modify Credentials */}
            <div className="md:col-span-2 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-black text-white">{t.editProfile}</h2>
                <p className="text-slate-400 text-xs mt-1">Modernize password security tokens or mobile coordinate linkages.</p>
              </div>

              {profileSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                  <span>✓ {profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.username}</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3.5 focus:outline-none focus:border-amber-500"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.phone}</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-sm px-4 py-3.5 focus:outline-none focus:border-amber-500"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{lang === 'en' ? 'Core Password (Leave blank to keep existing)' : 'የደህንነት ይለፍ ቃል ቀይር (ካልቀየሩት ዝም ብለው ይለፉት)'}</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-xs pl-4 pr-11 py-3.5 focus:outline-none focus:border-amber-500 font-mono"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-4">
                  <button type="submit" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider hover:scale-[1.01] transition-transform cursor-pointer">
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
