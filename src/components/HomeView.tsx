import React, { useState } from 'react';
import { translations } from '../translations';
import { InvestmentPlan } from '../types';
import { ArrowRight, ShieldCheck, TrendingUp, Users, Wallet, CheckCircle2, MessageCircle, Newspaper, ChevronDown, ChevronUp } from 'lucide-react';

interface HomeViewProps {
  lang: 'en' | 'am';
  onNavigate: (view: any) => void;
  plans: InvestmentPlan[];
}

export default function HomeView({ lang, onNavigate, plans }: HomeViewProps) {
  const t = translations[lang];
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Mock initial stats
  const stats = {
    totalUsers: 14582,
    totalDeposits: "2,481,290.00",
    totalWithdrawals: "1,192,840.00",
    onlineUsers: 843
  };

  const testimonials = [
    { name: "Haile G. (Adama)", role: "VIP Elite Member", text: lang === 'en' ? "ApexInvest changed my life. Daily withdrawals of 2.5% are processed immediately without any delay. Highly recommended CBE support!" : "ApexInvest ህይወቴን ቀይሮታል። ዕለታዊ 2.5% ክፍያዎች ያለምንም መዘግየት በአስቸኳይ ይከፈላሉ። በCBE በኩል ያለው ድጋፍ በጣም ይገርማል!" },
    { name: "Chala B. (Hawassa)", role: "Crypto Analyst", text: lang === 'en' ? "The transparency of this platform matches Bybit. Secure, and referral program gives amazing commissions." : "የዚህ ፕላትፎርም ግልጽነት ከBybit ጋር ይመሳሰላል። ደህንነቱ የተጠበቀ ነው፣ የሪፈራል ፕሮግራሙም አስደናቂ ኮሚሽን ይሰጠናል።" },
    { name: "Betty T. (Addis Ababa)", role: "Passive Investor", text: lang === 'en' ? "Excellent interface in Amharic. Very easy to deposit using CBE. Customer service is 10/10." : "በአማርኛ የተዘጋጀው ገጽታ በጣም ድንቅ ነው። CBE በመጠቀም ገንዘብ ማስገባት በጣም ቀላል ነው። የደንበኞች አገልግሎት 10/10 ነው።" }
  ];

  const faqs = [
    { q: lang === 'en' ? "What is the minimum deposit and withdrawal limit?" : "አነስተኛው የገንዘብ ማስገቢያ እና ማውጫ ገደብ ስንት ነው?", a: lang === 'en' ? "The minimum deposit start is only $10. Withdrawals start from $5 with zero transaction fee on USDT network or Commercial Bank of Ethiopia (CBE)." : "አነስተኛው የተቀማጭ ገንዘብ ማስጀመሪያ $10 ብቻ ነው። የገንዘብ ማውጣት ደግሞ ከ $5 ይጀምራል ፣ በUSDT አውታረ መረብ ወይም በኢትዮጵያ ንግድ ባንክ (CBE) ላይ ምንም አይነት የግብይት ክፍያ የለም።" },
    { q: lang === 'en' ? "How fast are deposits and withdrawals processed?" : "የገንዘብ ማስገባት እና ማውጣት ሂደቱ ምን ያህል ፈጣን ነው?", a: lang === 'en' ? "Deposits are processed by administrators within 10-30 minutes after proof uploaded. Withdrawals are processed instantly and approved in under 2 hours." : "ተቀማጭ ገንዘቦች ማረጋገጫ ከተሰቀለ በኋላ ከ10-30 ደቂቃዎች ውስጥ በአስተዳዳሪዎች ይጸድቃሉ። የገንዘብ ማውጣት ጥያቄዎች ደግሞ በ2 ሰዓታት ውስጥ በፍጥነት ተረጋግጠው ይላካሉ።" },
    { q: lang === 'en' ? "How does the multi-level commission system work?" : "የብዙ-ደረጃ ኮሚሽን ስርዓቱ እንዴት ይሰራል?", a: lang === 'en' ? "You earn instantly from your downliners: Level 1 gives you 10%, Level 2 gives 5%, and Level 3 gives 2.5% commissions on all their active investment purchases." : "ከተከታዮችዎ በቅጽበት ያገኛሉ፡ ደረጃ 1 (10%)፣ ደረጃ 2 (5%)፣ እና ደረጃ 3 (2.5%) በሁሉም የኢንቨስትመንት እቅዶች ግዢ ላይ ኮሚሽን ያገኛሉ።" }
  ];

  const news = [
    { title: lang === 'en' ? "Direct Integration with Commercial Bank of Ethiopia (CBE)" : "ከኢትዮጵያ ንግድ ባንክ (CBE) ጋር ቀጥታ ትስስር", date: "2026-06-18", desc: lang === 'en' ? "We have officially integrated automated bank receipt validation to facilitate rapid deposits for East African investors." : "ለምስራቅ አፍሪካ ባለሀብቶች ፈጣን ተቀማጭዎችን ለማመቻቸት የባንክ ደረሰኝ ማረጋገጫን በይፋ አስተዋውቀናል።" },
    { title: lang === 'en' ? "ApexVIP Liquid Staking Strategy launched" : "የአፕክስ ቪአይፒ ፈሳሽ ስቴኪንግ ስትራቴጂ ተጀምሯል", date: "2026-06-15", desc: lang === 'en' ? "Enjoy custom rate returns up to 3.8% daily by locking stablecoins in our highly optimized automated trading pool." : "የተረጋጉ ሳንቲሞችን (stablecoins) በበለጸገው አውቶማቲክ የንግድ ገንዳችን ውስጥ በማስቀመጥ በየቀኑ እስከ 3.8% የሚደርስ ትርፍ ያግኙ።" }
  ];

  return (
    <div className="w-full text-slate-100 min-h-screen relative overflow-hidden bg-[#05070f]">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div id="home_badge" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          Bybit & Binance Inspired Liquidity
        </div>

        <h1 id="home_title" className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-500 mb-6 font-sans">
          {t.heroTitle}
        </h1>

        <p id="home_subtitle" className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-sans">
          {t.heroSubtitle}
        </p>

        <div id="home_actions" className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mb-16">
          <button
            id="hero_register_btn"
            onClick={() => onNavigate('register')}
            className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-[#05070f] font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-amber-500/10 transform transition-all hover:scale-[1.03] hover:shadow-amber-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            {t.register}
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            id="hero_login_btn"
            onClick={() => onNavigate('login')}
            className="flex-1 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 font-semibold text-base text-slate-100 px-8 py-4 rounded-xl transform transition-all hover:scale-[1.02] cursor-pointer"
          >
            {t.login}
          </button>
        </div>

        {/* Dynamic statistics */}
        <div id="home_stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.totalUsers}</span>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{stats.totalUsers.toLocaleString()}+</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.totalDeposits}</span>
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">${stats.totalDeposits}</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.totalWithdrawals}</span>
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">${stats.totalWithdrawals}</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.onlineUsers}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse mt-1.5" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{stats.onlineUsers}</p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans_section" className="px-6 py-16 bg-[#04060c] border-y border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
              {t.plansTitle}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {t.plansSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:translate-y-[-4px] overflow-hidden relative group"
              >
                {plan.dailyRate >= 3.5 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-[#05070f] text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider">
                    VIP ELITE
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{lang === 'en' ? plan.name : plan.nameAm}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-black text-amber-500">{plan.dailyRate}%</span>
                    <span className="text-slate-400 text-sm ml-2">/ {lang === 'en' ? 'daily profit' : 'ዕለታዊ ትርፍ'}</span>
                  </div>

                  <ul className="space-y-4 mb-8 text-sm text-slate-300 border-t border-slate-800/80 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>{lang === 'en' ? "Duration" : "ቆይታ"} : <strong>{plan.durationDays} {lang === 'en' ? "Days" : "ቀናት"}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>{lang === 'en' ? "Min Capital" : "ዝቅተኛ መነሻፊርማ"} : <strong>${plan.minDeposit}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>{lang === 'en' ? "Max Capital" : "ከፍተኛ ገደብ"} : <strong>${plan.maxDeposit.toLocaleString()}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>{lang === 'en' ? "Payout Cycle" : "የክፍያ ኡደት"} : <strong>{lang === 'en' ? "Every 24 Hours" : "ማንኛውም 24 ሰዓት"}</strong></span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate('login')}
                  className="w-full bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-500 text-amber-500 text-sm font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'en' ? 'Invest in Plan' : 'በእቅዱ ውስጥ ፈሰስ ያድርጉ'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials_section" className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            {t.testimonialsTitle}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t.testimonialsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative hover:border-amber-500/20 transition-all">
              <p className="text-slate-300 text-sm italic mb-6 leading-relaxed">"{test.text}"</p>
              <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                  {test.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1">{test.name}</h4>
                  <span className="text-xs font-semibold text-amber-500/80 uppercase">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Telegram Support Group */}
      <section className="px-6 py-6 max-w-5xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-amber-500/15 via-blue-600/10 to-transparent border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/15 text-blue-400 rounded-2xl">
              <MessageCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.appName} Official Support Channels</h3>
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Get 24/7 dedicated assistance from our administrators on Telegram.' : 'በቴሌግራም ላይ በዕለት ተዕለት ከእኛ አስተዳዳሪዎች የ24/7 እገዛን ያግኙ።'}</p>
            </div>
          </div>
          <a
            href="https://t.me/apexinvest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            {t.joinTelegram}
          </a>
        </div>
      </section>

      {/* News & Announcements Module */}
      <section id="news_section" className="px-6 py-12 max-w-7xl mx-auto border-t border-slate-900">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
            <Newspaper className="w-4 h-4" />
            {t.newsTitle}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">{t.newsSubtitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((n, idx) => (
            <div key={idx} className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl transition-all hover:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-500/80 px-2 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 mb-3 inline-block">{n.date}</span>
              <h3 className="text-lg font-bold text-white mb-2">{n.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq_section" className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-3">{t.faqTitle}</h2>
          <p className="text-slate-400 text-sm">{t.faqSubtitle}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border border-slate-800 bg-slate-900/30 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center px-6 py-5 hover:bg-slate-900/40 text-left cursor-pointer text-white font-bold text-base"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-400 text-sm leading-relaxed border-t border-slate-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 px-6 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-white font-black text-xl mb-4 italic flex items-center gap-2">
              <span className="w-2.5 h-6 bg-amber-500 rounded-sm" />
              {t.appName}
            </h3>
            <p className="text-slate-400 leading-relaxed text-xs">
              {t.aboutUsText}
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">{t.aboutUs}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              ApexInvest holds active licenses under decentralized forex and spot-hedging brokers. We operate globally 24/7.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">{t.contactUs}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              <strong>Support Desk:</strong> @ApexSupportDesk<br />
              <strong>Internal Mail:</strong> hailegulilat541@gmail.com<br />
              <strong>Offices:</strong> Addis Ababa, Ethiopia & London, UK
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">Policy Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => alert("Terms of Service:\n1. Minimum eligibility 18 years old.\n2. Leverage risk applies.\n3. Account details must remain confidential.")} className="hover:text-amber-500 text-left cursor-pointer">{t.terms}</button>
              </li>
              <li>
                <button onClick={() => alert("Privacy Contract:\nYour uploaded documents and payment proof screenshots are protected with advanced cryptographic hashing and absolute privacy protection.")} className="hover:text-amber-500 text-left cursor-pointer">{t.privacy}</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 {t.appName} Group. All Rights Reserved.</p>
          <p className="text-slate-600">Inspired by Binance, Bybit, CBE protocols.</p>
        </div>
      </footer>
    </div>
  );
}
