import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { User } from '../types';
import { ShieldAlert, Eye, EyeOff, Lock, Mail, Phone, User as UserIcon, Keyboard, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  lang: 'en' | 'am';
  authType: 'login' | 'register' | 'forgot';
  onNavigate: (view: any) => void;
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (newUser: Omit<User, 'id'>) => User;
}

export default function AuthView({ lang, authType: initialAuthType, onNavigate, onLogin, users, onRegister }: AuthViewProps) {
  const t = translations[lang];
  const [authType, setAuthType] = useState<'login' | 'register' | 'forgot'>(initialAuthType);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Security checks
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extract referral from URL if possible
  useEffect(() => {
    setAuthType(initialAuthType);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialAuthType]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg(lang === 'en' ? "Please fill in all credentials." : "እባክዎን ሁሉንም መስኮች ይሙሉ::");
      return;
    }

    if (!recaptchaChecked) {
      setErrorMsg(lang === 'en' ? "Please confirm the Security check." : "እባክዎን የደህንነት ማረጋገጫውን ይጫኑ::");
      return;
    }

    // Try finding admin or user
    const matchedUser = users.find(u =>
      (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) &&
      u.passwordHash === password
    );

    if (matchedUser) {
      if (matchedUser.status === 'suspended') {
        setErrorMsg(lang === 'en' ? "This account is suspended. Please contact Telegram Support Desk." : "ይህ መለያ ታግዷል። እባክዎን የቴሌግራም ድጋፍ ማዕከልን ያግኙ።");
        return;
      }
      onLogin(matchedUser);
    } else {
      setErrorMsg(lang === 'en' ? "Invalid username/email or password." : "የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል።");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !email || !phone || !password || !confirmPassword) {
      setErrorMsg(lang === 'en' ? "Please complete all fields." : "እባክዎን ሁሉንም መረጃዎች ያስገቡ::");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(lang === 'en' ? "Passwords do not match." : "የይለፍ ቃሎቹ አይመሳሰሉም::");
      return;
    }

    if (!termsAccepted) {
      setErrorMsg(lang === 'en' ? "You must accept the terms and policies." : "እባክዎን ደንቦቹን እና ፖሊሲዎችን ይቀበሉ።");
      return;
    }

    if (!recaptchaChecked) {
      setErrorMsg(lang === 'en' ? "Please confirm the Security check." : "እባክዎን የደህንነት ማረጋገጫውን ጠቅ ያድርጉ::");
      return;
    }

    // Check duplicate
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setErrorMsg(lang === 'en' ? "Username already registered." : "ይህ የተጠቃሚ ስም ቀድሞውኑ ተመዝግቧል።");
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg(lang === 'en' ? "Email already registered." : "ይህ ኢሜል ቀድሞውኑ ተመዝግቧል።");
      return;
    }

    // Launch email OTP simulated code modal
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(code);
    setIsVerifying(true);
  };

  const handleVerifyCodeSubmit = () => {
    if (userInputCode === simulatedCode || userInputCode === "123456") {
      // Create user
      const newUser = onRegister({
        username,
        email,
        phone,
        passwordHash: password,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: referralCode || undefined,
        balance: 10.00, // $10 signup bonus to attract traders!
        dailyProfit: 0,
        referralIncome: 0,
        activeInvestment: 0,
        status: 'active',
        role: 'user',
        isEmailVerified: true,
        registrationDate: new Date().toISOString()
      });

      setIsVerifying(false);
      onLogin(newUser);
    } else {
      setErrorMsg(lang === 'en' ? "Incorrect verification code. Please try again or use 123456." : "የማረጋገጫ ኮዱ የተሳሳተ ነው! እባክዎ እንደገና ይሞክሩ ወይም 123456 ይጠቀሙ።");
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg(lang === 'en' ? "Please enter your email." : "እባክዎን ኢሜልዎን ያስገቡ።");
      return;
    }
    setSuccessMsg(lang === 'en' ? `A recovery token has been transmitted to ${email}. Check inbox!` : `የይለፍ ቃል መልሶ ማግኛ መረጃ ወደ ${email} ተልኳል። ኢሜልዎን ያረጋግጡ!`);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#05070f] relative overflow-hidden">
      {/* Background Neon effects */}
      <div className="absolute top-[20%] left-[30%] w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-96 h-96 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />

      {/* Verification Code Popup */}
      {isVerifying && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-8 max-w-md w-full relative">
            <h3 className="text-xl font-bold text-white mb-4 text-center">{t.verifyEmailCode}</h3>
            <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
              {t.verificationCodeSent}
            </p>

            {/* Verification Helper Modal Alert */}
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider mb-1">Simulated Email OTP Code</span>
              <strong className="text-2xl text-amber-500 tracking-widest">{simulatedCode}</strong>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="X X X X X X"
                value={userInputCode}
                onChange={(e) => setUserInputCode(e.target.value)}
                className="w-full text-center text-xl font-bold text-white bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl py-3 tracking-widest placeholder-slate-700"
              />

              {errorMsg && (
                <p className="text-xs text-red-400 font-semibold text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  {errorMsg}
                </p>
              )}

              <button
                onClick={handleVerifyCodeSubmit}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold py-3.5 rounded-xl uppercase tracking-wider test-sm cursor-pointer hover:scale-[1.01] active:translate-y-0.5 transition-all mt-4"
              >
                {t.verifyBtn}
              </button>

              <button
                onClick={() => setIsVerifying(false)}
                className="w-full text-slate-400 hover:text-slate-200 text-xs py-2 block text-center cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Authentic Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 inline-flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-sm" />
            {t.appName}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {authType === 'login' ? 'Institutional Secure Signin' : authType === 'register' ? 'Create Premium Account' : t.forgotPasswordTitle}
          </p>
        </div>

        {errorMsg && !isVerifying && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {authType === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.username} / Email</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={lang === 'en' ? "Enter your username or email" : "የተጠቃሚ ስም ወይም ኢሜል ያስገቡ"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-sm pl-11 pr-4 py-3.5 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.password}</label>
                <button
                  type="button"
                  onClick={() => setAuthType('forgot')}
                  className="text-amber-500 hover:text-amber-400 text-xs font-semibold cursor-pointer"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-sm pl-11 pr-11 py-3.5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-850 text-amber-500 focus:ring-transparent bg-slate-950"
                />
                <span>{t.rememberMe}</span>
              </label>
            </div>

            {/* reCAPTCHA check */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center justify-between select-none">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recaptchaChecked}
                  onChange={(e) => setRecaptchaChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-800 text-amber-500 focus:ring-transparent bg-slate-900"
                />
                <span className="text-xs text-slate-300 font-bold">{t.recaptchaVerification}</span>
              </label>
              <ShieldCheck className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-4 rounded-xl shadow-lg hover:scale-[1.01] transition-transform cursor-pointer tracking-wider text-sm mt-4 uppercase"
            >
              {t.login}
            </button>

            <button
              type="button"
              onClick={() => { setAuthType('register'); setErrorMsg(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-4 cursor-pointer font-medium"
            >
              {t.dontHaveAccount}
            </button>
          </form>
        )}

        {authType === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t.username}</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. haile99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-xs pl-11 pr-4 py-3 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="e.g. trader99@apex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-xs pl-11 pr-4 py-3 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t.phone}</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="+251 900..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-xs pl-11 pr-4 py-3 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-xs pl-11 pr-11 py-3 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-xs pl-11 pr-4 py-3 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">{t.referralCode}</label>
              <div className="relative">
                <Keyboard className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Referrer Referral Code (Optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-xs pl-11 pr-4 py-3 transition-all"
                />
              </div>
            </div>

            <div className="py-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-slate-850 text-amber-500 bg-slate-950 mt-0.5"
                />
                <span>{t.termsAgreement}</span>
              </label>
            </div>

            {/* reCAPTCHA check */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center justify-between select-none">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recaptchaChecked}
                  onChange={(e) => setRecaptchaChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-800 text-amber-500 focus:ring-transparent bg-slate-900"
                />
                <span className="text-xs text-slate-300 font-bold">{t.recaptchaVerification}</span>
              </label>
              <ShieldCheck className="w-6 h-6 text-amber-500" />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-lg hover:scale-[1.01] transition-transform"
            >
              {lang === 'en' ? 'Get Direct Access' : 'ቀጥታ መዳረሻ ያግኙ'}
            </button>

            <button
              type="button"
              onClick={() => { setAuthType('login'); setErrorMsg(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-4 cursor-pointer font-medium"
            >
              {t.alreadyHaveAccount}
            </button>
          </form>
        )}

        {authType === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.forgotPasswordDesc}
            </p>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-white text-sm pl-11 pr-4 py-3.5 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-4 rounded-xl cursor-pointer shadow-lg hover:scale-[1.01] transition-transform text-xs uppercase"
            >
              {lang === 'en' ? 'Send Recover Token' : 'ማግኛ ሊንክ ይላኩ'}
            </button>

            <button
              type="button"
              onClick={() => { setAuthType('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
            >
              {lang === 'en' ? 'Back to Login' : 'ወደ መግቢያ ገጽ ተመለስ'}
            </button>
          </form>
        )}
      </div>

      {/* Development Notice Floating Card */}
      <div id="dev_notice" className="absolute bottom-4 left-4 bg-slate-950/70 border border-amber-500/10 px-4 py-2.5 rounded-xl text-[10px] text-slate-400 z-50 pointer-events-none md:block hidden">
        🔒 Simulated Sandbox Server Connected
      </div>
    </div>
  );
}
