import React, { useState, useEffect } from 'react';
import { User, InvestmentPlan, DepositRequest, WithdrawalRequest, Announcement, PlatformSettings } from './types';
import { translations } from './translations';
import HomeView from './components/HomeView';
import AuthView from './components/AuthView';
import UserView from './components/UserView';
import AdminView from './components/AdminView';
import { Globe, ShieldCheck, Mail, Megaphone, Bell, LogIn, Key, HelpCircle, LogOut } from 'lucide-react';

const SEED_USERS: User[] = [
  {
    id: 'user_haile',
    username: 'haile',
    email: 'hailegulilat541@gmail.com',
    phone: '+251912345678',
    passwordHash: '123456',
    referralCode: 'AMH5819',
    referredBy: undefined,
    balance: 1450.00,
    dailyProfit: 36.25,
    referralIncome: 120.00,
    activeInvestment: 800.00,
    status: 'active',
    role: 'user',
    withdrawalAddress: 'TRX7823yfh8234yisdhf',
    isEmailVerified: true,
    registrationDate: '2026-06-10T12:00:00Z'
  },
  {
    id: 'admin_root',
    username: 'admin',
    email: 'admin@apexinvest.com',
    phone: '+251911223344',
    passwordHash: 'admin123',
    referralCode: 'ADM001',
    referredBy: undefined,
    balance: 8900.00,
    dailyProfit: 0,
    referralIncome: 0,
    activeInvestment: 0,
    status: 'active',
    role: 'admin',
    isEmailVerified: true,
    registrationDate: '2026-06-01T12:00:00Z'
  }
];

const SEED_PLANS: InvestmentPlan[] = [
  {
    id: 'plan_bronze',
    name: 'Bronze Growth Tier',
    nameAm: 'የነሐስ ደረጃ ዕቅድ',
    dailyRate: 1.5,
    durationDays: 30,
    minDeposit: 10,
    maxDeposit: 499
  },
  {
    id: 'plan_gold',
    name: 'Gold Wealth Booster',
    nameAm: 'የወርቅ ብልጽግና ዕቅድ',
    dailyRate: 2.5,
    durationDays: 45,
    minDeposit: 500,
    maxDeposit: 4999
  },
  {
    id: 'plan_platinum',
    name: 'VIP Platinum Asset Pool',
    nameAm: 'የቫይፒ ፕላቲነም ፈሰስ ዕቅድ',
    dailyRate: 3.8,
    durationDays: 60,
    minDeposit: 5000,
    maxDeposit: 100000
  }
];

const SEED_DEPOSITS: DepositRequest[] = [
  {
    id: 'dep_1',
    userId: 'user_haile',
    username: 'haile',
    amount: 500,
    paymentMethod: 'Commercial Bank of Ethiopia (CBE)',
    screenshotUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="40%" font-weight="bold" font-family="sans-serif" font-size="14" fill="%23f59e0b" text-anchor="middle">COMMERCIAL BANK OF ETHIOPIA</text><text x="50%" y="60%" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">Receipt TxId: cbe-84920492</text><text x="50%" y="80%" font-family="sans-serif" font-weight="bold" font-size="12" fill="%2310b981" text-anchor="middle">SUCCESSFULLY TRANSFERRED $500.00</text></svg>',
    date: '2026-06-11T13:42:00Z',
    status: 'approved'
  },
  {
    id: 'dep_2',
    userId: 'user_haile',
    username: 'haile',
    amount: 800,
    paymentMethod: 'USDT (TRC-20 Fast Network)',
    screenshotUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="40%" font-weight="bold" font-family="sans-serif" font-size="14" fill="%2310b981" text-anchor="middle">USDT TRANSACTION LEDGER</text><text x="50%" y="60%" font-family="sans-serif" font-size="10" fill="%2394a3b8" text-anchor="middle">Network: TRON (TRC-20)</text><text x="50%" y="85%" font-family="sans-serif" font-weight="bold" font-size="13" fill="%23ffffff" text-anchor="middle">Amount: 800.00 USDT</text></svg>',
    date: '2026-06-14T09:12:00Z',
    status: 'approved'
  },
  {
    id: 'dep_3',
    userId: 'user_haile',
    username: 'haile',
    amount: 300,
    paymentMethod: 'Telebirr SuperApp Pay',
    screenshotUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="%231e1b4b"/><text x="50%" y="45%" font-weight="bold" font-family="sans-serif" font-size="16" fill="%23f59e0b" text-anchor="middle">telebirr (ቴሌብር)</text><text x="50%" y="65%" font-family="sans-serif" font-size="10" fill="%2394a3b8" text-anchor="middle">Merchant ID: 99283 - Approved</text><text x="50%" y="90%" font-family="sans-serif" font-weight="bold" font-size="13" fill="%2310b981" text-anchor="middle">Sent $300.00 - Pending Verification</text></svg>',
    date: '2026-06-20T14:10:00Z',
    status: 'pending' // Admin can approve this!
  }
];

const SEED_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'with_1',
    userId: 'user_haile',
    username: 'haile',
    amount: 50,
    paymentMethod: 'USDT (TRC-20 Fast Network)',
    address: 'TCpG9F8y5isdfhS823yShdf923r',
    date: '2026-06-15T18:22:00Z',
    status: 'approved'
  },
  {
    id: 'with_2',
    userId: 'user_haile',
    username: 'haile',
    amount: 100,
    paymentMethod: 'Commercial Bank of Ethiopia (CBE)',
    address: 'Haile Gulilat - CBE Acc No: 1000128392123',
    date: '2026-06-20T11:05:00Z',
    status: 'pending' // Admin can approve this!
  }
];

const SEED_SETTINGS: PlatformSettings = {
  websiteName: 'ApexInvest',
  minimumDeposit: 10,
  minimumWithdrawal: 5,
  referralLevel1Com: 10,
  referralLevel2Com: 5,
  referralLevel3Com: 2.5,
  registrationEnabled: true,
  themeColorGold: '#f59e0b'
};

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Automated CBE Support Channel Upgrade',
    body: 'We have updated holding accounts under Commercial Bank of Ethiopia (CBE) to boost validation. Check dynamic deposit codes.',
    date: '2026-06-19T08:00:00Z'
  }
];

export default function App() {
  // Common States loaded from LocalStorage
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appRoute, setAppRoute] = useState<'home' | 'login' | 'register' | 'forgot' | 'dashboard' | 'admin'>('home');

  // Database lists
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(SEED_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Notification feeds
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Load and pre-seed databases
  useEffect(() => {
    const cachedUsers = localStorage.getItem('apex_users');
    const cachedPlans = localStorage.getItem('apex_plans');
    const cachedDeposits = localStorage.getItem('apex_deposits');
    const cachedWithdrawals = localStorage.getItem('apex_withdrawals');
    const cachedSettings = localStorage.getItem('apex_settings');
    const cachedAnnouncements = localStorage.getItem('apex_announcements');

    if (cachedUsers) setUsers(JSON.parse(cachedUsers));
    else {
      setUsers(SEED_USERS);
      localStorage.setItem('apex_users', JSON.stringify(SEED_USERS));
    }

    if (cachedPlans) setPlans(JSON.parse(cachedPlans));
    else {
      setPlans(SEED_PLANS);
      localStorage.setItem('apex_plans', JSON.stringify(SEED_PLANS));
    }

    if (cachedDeposits) setDeposits(JSON.parse(cachedDeposits));
    else {
      setDeposits(SEED_DEPOSITS);
      localStorage.setItem('apex_deposits', JSON.stringify(SEED_DEPOSITS));
    }

    if (cachedWithdrawals) setWithdrawals(JSON.parse(cachedWithdrawals));
    else {
      setWithdrawals(SEED_WITHDRAWALS);
      localStorage.setItem('apex_withdrawals', JSON.stringify(SEED_WITHDRAWALS));
    }

    if (cachedSettings) setSettings(JSON.parse(cachedSettings));
    else {
      setSettings(SEED_SETTINGS);
      localStorage.setItem('apex_settings', JSON.stringify(SEED_SETTINGS));
    }

    if (cachedAnnouncements) setAnnouncements(JSON.parse(cachedAnnouncements));
    else {
      setAnnouncements(SEED_ANNOUNCEMENTS);
      localStorage.setItem('apex_announcements', JSON.stringify(SEED_ANNOUNCEMENTS));
    }

    // Default welcome notification
    setNotifications([
      "Welcome to ApexInvest high-yield trading pool!",
      "New CBE payment receipt gateway has completed integration setup."
    ]);
  }, []);

  // Sync state helpers to update databases locally
  const syncUsers = (updated: User[]) => {
    setUsers(updated);
    localStorage.setItem('apex_users', JSON.stringify(updated));
    // If current logged-in user changes inside the system, update state too!
    if (currentUser) {
      const match = updated.find(u => u.id === currentUser.id);
      if (match) setCurrentUser(match);
    }
  };

  const syncDeposits = (updated: DepositRequest[]) => {
    setDeposits(updated);
    localStorage.setItem('apex_deposits', JSON.stringify(updated));
  };

  const syncWithdrawals = (updated: WithdrawalRequest[]) => {
    setWithdrawals(updated);
    localStorage.setItem('apex_withdrawals', JSON.stringify(updated));
  };

  const syncPlans = (updated: InvestmentPlan[]) => {
    setPlans(updated);
    localStorage.setItem('apex_plans', JSON.stringify(updated));
  };

  const syncSettings = (updated: PlatformSettings) => {
    setSettings(updated);
    localStorage.setItem('apex_settings', JSON.stringify(updated));
  };

  // Auth Operations
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setAppRoute('admin');
    } else {
      setAppRoute('dashboard');
    }
  };

  const handleRegisterUser = (newUser: Omit<User, 'id'>) => {
    if (!settings.registrationEnabled) {
      alert("Registration is temporarily closed by platform security.");
      throw new Error("Closed");
    }

    const createdUser: User = {
      ...newUser,
      id: 'user_' + Math.random().toString(36).substring(2, 8)
    };

    const nextList = [...users, createdUser];
    syncUsers(nextList);

    setNotifications(prev => [
      `User @${createdUser.username} successfully registered. Welcome bonus $10.00 credited!`,
      ...prev
    ]);

    return createdUser;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppRoute('home');
  };

  // User Page Payout Submission callbacks
  const handleUserDepositSubmit = (amount: number, method: string, screenshot: string) => {
    if (!currentUser) return;
    const newDep: DepositRequest = {
      id: 'dep_' + Math.random().toString(36).substring(2, 8),
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      paymentMethod: method,
      screenshotUrl: screenshot,
      date: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [newDep, ...deposits];
    syncDeposits(updated);

    // Push system reminder alert to administrators
    setNotifications(prev => [
      `Inbound notice: @${currentUser.username} initiated $${amount} via ${method}. Proof loaded.`,
      ...prev
    ]);
  };

  const handleUserWithdrawalSubmit = (amount: number, method: string, address: string) => {
    if (!currentUser) return;
    const newWith: WithdrawalRequest = {
      id: 'with_' + Math.random().toString(36).substring(2, 7),
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      paymentMethod: method,
      address,
      date: new Date().toISOString(),
      status: 'pending'
    };

    // Fast-verify user balance decrement
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, balance: u.balance - amount } : u);
    syncUsers(updatedUsers);

    const updatedWithdrawals = [newWith, ...withdrawals];
    syncWithdrawals(updatedWithdrawals);

    setNotifications(prev => [
      `Outbound payout request: @${currentUser.username} requested $${amount} to ${method}.`,
      ...prev
    ]);
  };

  // Invest Scheme Purchase
  const handleUserInvestSubmit = (planId: string, amount: number) => {
    if (!currentUser) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Deduct user balance, increment active portfolio size, schedule daily return increments
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          balance: u.balance - amount,
          activeInvestment: u.activeInvestment + amount,
          dailyProfit: u.dailyProfit + (amount * (plan.dailyRate / 100))
        };
      }
      return u;
    });

    syncUsers(updatedUsers);
    
    setNotifications(prev => [
      `Investment Activation: @${currentUser.username} locked $${amount} in the ${plan.name} at ${plan.dailyRate}%/day.`,
      ...prev
    ]);
  };

  // Admin Broadcast Global Announcement
  const handleAdminBroadcastAnnouncement = (ann: Announcement) => {
    const updated = [ann, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('apex_announcements', JSON.stringify(updated));

    setNotifications(prev => [
      `Global Announcement Transmitted: "${ann.title}"`,
      ...prev
    ]);
  };

  // Fast Interactive Role Switcher helper
  const handleToggleRoles = (role: 'haile_investor' | 'admin_desk') => {
    if (role === 'haile_investor') {
      const match = users.find(u => u.username === 'haile');
      if (match) {
        setCurrentUser(match);
        setAppRoute('dashboard');
      }
    } else {
      const match = users.find(u => u.username === 'admin');
      if (match) {
        setCurrentUser(match);
        setAppRoute('admin');
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05070f] font-sans antialiased text-slate-100 flex flex-col justify-between">
      
      {/* Platform top banner (Bilingual choice / Role Switcher VIP) */}
      <div className="bg-[#090f1d] px-6 py-2 border-b border-slate-900/40 text-xs flex flex-wrap justify-between items-center gap-3 relative z-50">
        
        {/* Floating Developer Sandbox Quick Swapper (Essential for Iframe testing) */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">🔬 SANDBOX QUICK-SWAP:</span>
          <button
            onClick={() => handleToggleRoles('haile_investor')}
            className={`cursor-pointer px-2 py-0.5 rounded font-black text-[10px] ${currentUser?.username === 'haile' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'}`}
          >
            Investor Flow (Haile)
          </button>
          <button
            onClick={() => handleToggleRoles('admin_desk')}
            className={`cursor-pointer px-2 py-0.5 rounded font-black text-[10px] ${currentUser?.username === 'admin' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'}`}
          >
            Platform Admin
          </button>
        </div>

        {/* Global Notifications and Language switchers */}
        <div className="flex items-center gap-6">
          
          {/* Notifications count */}
          <div className="relative">
            <button onClick={() => setShowNotificationPanel(!showNotificationPanel)} className="cursor-pointer text-slate-400 hover:text-amber-500 flex items-center gap-1.5 font-bold">
              <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[10px]">{notifications.length}</span>
            </button>

            {showNotificationPanel && (
              <div className="absolute right-0 mt-2.5 w-72 bg-slate-900 border border-slate-850 p-4 rounded-2xl shadow-2xl z-50 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-white font-bold text-xs uppercase tracking-wider">System Live Logs</span>
                  <button onClick={() => setShowNotificationPanel(false)} className="text-[10px] text-slate-500 hover:text-white">Close</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.map((not, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-900 text-[10px] text-slate-300 leading-normal font-medium">
                      {not}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <button onClick={() => setLang('en')} className={`cursor-pointer px-1 py-0.5 font-semibold ${lang === 'en' ? 'text-amber-500 underline' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => setLang('am')} className={`cursor-pointer px-1 py-0.5 font-semibold ${lang === 'am' ? 'text-amber-500 underline' : 'text-slate-500 hover:text-slate-300'}`}>አማርኛ (AM)</button>
          </div>

          {currentUser ? (
            <button onClick={handleLogout} className="cursor-pointer text-slate-400 hover:text-white font-bold flex items-center gap-1 hover:underline">
              <LogOut className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Sign out' : 'ውጣ'}
            </button>
          ) : (
            <button onClick={() => setAppRoute('login')} className="cursor-pointer text-slate-400 hover:text-amber-500 font-black flex items-center gap-1 hover:underline">
              <LogIn className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Login' : 'ግባ'}
            </button>
          )}
        </div>
      </div>

      {/* Main Orchestrator Routes */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Route: HOME (Public Website) */}
        {appRoute === 'home' && (
          <HomeView
            lang={lang}
            onNavigate={(route) => setAppRoute(route)}
            plans={plans}
          />
        )}

        {/* Route: AUTH PAGES */}
        {(appRoute === 'login' || appRoute === 'register' || appRoute === 'forgot') && (
          <AuthView
            lang={lang}
            authType={appRoute as any}
            onNavigate={(route) => setAppRoute(route)}
            onLogin={handleLogin}
            users={users}
            onRegister={handleRegisterUser}
          />
        )}

        {/* Route: USER PORTAL */}
        {appRoute === 'dashboard' && currentUser && (
          <UserView
            lang={lang}
            user={currentUser}
            onNavigate={(route) => setAppRoute(route)}
            plans={plans}
            deposits={deposits}
            withdrawals={withdrawals}
            onSubmitDeposit={handleUserDepositSubmit}
            onSubmitWithdrawal={handleUserWithdrawalSubmit}
            onUpdateUser={(updated) => {
              const updatedList = users.map(u => u.id === updated.id ? updated : u);
              syncUsers(updatedList);
            }}
            onInvest={handleUserInvestSubmit}
          />
        )}

        {/* Route: ADMIN OPERATIONS */}
        {appRoute === 'admin' && currentUser && currentUser.role === 'admin' && (
          <AdminView
            lang={lang}
            users={users}
            deposits={deposits}
            withdrawals={withdrawals}
            plans={plans}
            settings={settings}
            onUpdateUsers={syncUsers}
            onUpdateDeposits={syncDeposits}
            onUpdateWithdrawals={syncWithdrawals}
            onUpdatePlans={syncPlans}
            onUpdateSettings={syncSettings}
            onBroadcastAnnouncement={handleAdminBroadcastAnnouncement}
          />
        )}
      </div>

      {/* Embedded Global Announcement Ribbon */}
      {announcements.length > 0 && appRoute !== 'home' && (
        <div id="announcement_ribbon" className="bg-amber-500 text-slate-950 px-6 py-2 text-xs font-black text-center flex items-center justify-center gap-2 animate-pulse z-40 relative">
          <Megaphone className="w-4 h-4" />
          <span>GLOBAL BROADCAST: {announcements[0].title} — {announcements[0].body}</span>
        </div>
      )}
    </div>
  );
}
