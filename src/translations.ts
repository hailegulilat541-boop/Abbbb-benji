export interface Translations {
  // Common
  appName: string;
  login: string;
  register: string;
  logout: string;
  dashboard: string;
  adminDashboard: string;
  support: string;
  language: string;
  active: string;
  pending: string;
  approved: string;
  rejected: string;
  suspended: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  status: string;
  action: string;
  amount: string;
  date: string;
  allNotifications: string;
  noNotifications: string;

  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  totalUsers: string;
  totalDeposits: string;
  totalWithdrawals: string;
  onlineUsers: string;
  plansTitle: string;
  plansSubtitle: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  faqTitle: string;
  faqSubtitle: string;
  newsTitle: string;
  newsSubtitle: string;
  joinTelegram: string;
  aboutUs: string;
  aboutUsText: string;
  contactUs: string;
  terms: string;
  privacy: string;

  // Auth Pages
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  termsAgreement: string;
  rememberMe: string;
  forgotPassword: string;
  forgotPasswordTitle: string;
  forgotPasswordDesc: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  recaptchaVerification: string;
  verifyEmailCode: string;
  verificationCodeSent: string;
  verifyBtn: string;

  // User Dashboard
  walletBalance: string;
  dailyProfit: string;
  referralIncome: string;
  activeInvestment: string;
  transactionStats: string;
  earningsOverview: string;
  recentTransactions: string;
  withdrawalAddress: string;

  // User Pages
  paymentMethod: string;
  uploadScreenshot: string;
  dragDropScreenshot: string;
  enterAmount: string;
  depositHistory: string;
  withdrawHistory: string;
  referralLink: string;
  copyBtn: string;
  copied: string;
  referralStats: string;
  commissionLevels: string;
  changePassword: string;
  editProfile: string;
  profilePicture: string;
  securitySettings: string;

  // Admin Dashboard
  totalRevenue: string;
  dailyRevenue: string;
  monthlyRevenue: string;
  userManagement: string;
  depositManagement: string;
  withdrawalManagement: string;
  plansManagement: string;
  systemNotifications: string;
  systemSettings: string;
  searchUsersPlaceholder: string;
  suspendUser: string;
  activateUser: string;
  editBalance: string;
  resetPassword: string;
  sendAnnouncement: string;
  announcementTitle: string;
  announcementBody: string;
  minDepositWithdraw: string;
  enableReg: string;
}

export const translations: Record<'en' | 'am', Translations> = {
  en: {
    appName: "ApexInvest",
    login: "Login",
    register: "Register",
    logout: "Log Out",
    dashboard: "User Dashboard",
    adminDashboard: "Admin Panel",
    support: "Telegram Support",
    language: "Language",
    active: "Active",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    suspended: "Suspended",
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    status: "Status",
    action: "Action",
    amount: "Amount ($)",
    date: "Date",
    allNotifications: "Notifications",
    noNotifications: "No new notifications",

    heroTitle: "Premium Automated Crypto & Forex Investing",
    heroSubtitle: "Experience institutional-grade asset growth with professional analytics. Fully secure, ultra-reliable, with daily returns up to 3.8%.",
    totalUsers: "Total Registered Users",
    totalDeposits: "Total Safe Deposits",
    totalWithdrawals: "Completed Withdrawals",
    onlineUsers: "Traders Online Now",
    plansTitle: "High-Yield Portfolio Plans",
    plansSubtitle: "Choose an investment package meticulously designed for consistent financial prosperity.",
    testimonialsTitle: "What Our Investors Say",
    testimonialsSubtitle: "Read reviews from our elite group of global cryptocurrency and exchange market traders.",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Have questions about deposits, rates, or withdrawal processing? Find quick answers.",
    newsTitle: "Market Insights & Events",
    newsSubtitle: "Stay informed with real-time financial declarations, updates, and corporate news.",
    joinTelegram: "Join Official Telegram Group",
    aboutUs: "About ApexInvest",
    aboutUsText: "We are a top-tier European & African investment conglomerate specialized in decentralized liquidity bootstrapping, cryptocurrency market making, and automated currency spot trading strategies.",
    contactUs: "Contact Security Desk",
    terms: "Terms of Service",
    privacy: "Privacy Policy",

    username: "Username / Name",
    email: "Email Address",
    phone: "Phone Number",
    password: "Secure Password",
    confirmPassword: "Confirm Password",
    referralCode: "Referral Code (Optional)",
    termsAgreement: "I accept and agree to the Investment Policy.",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    forgotPasswordTitle: "Recover Platform Access",
    forgotPasswordDesc: "Enter your registered email to receive access credentials recovery code.",
    alreadyHaveAccount: "Already have an account? Sign In",
    dontHaveAccount: "Don't have an account? Register Now",
    recaptchaVerification: "Security Check: I am not a robot.",
    verifyEmailCode: "Email Verification Code",
    verificationCodeSent: "A 6-digit confirmation code has been sent to your email.",
    verifyBtn: "Verify & Launch",

    walletBalance: "Wallet Balance",
    dailyProfit: "Est. Daily Earnings",
    referralIncome: "Total Referral Bonus",
    activeInvestment: "Active Portfolio",
    transactionStats: "Transaction Breakdown",
    earningsOverview: "Earnings Calendar Chart",
    recentTransactions: "Recent Activity Log",
    withdrawalAddress: "Receiving Wallet Address (USDT / Bank)",

    paymentMethod: "Choose Deposit Network / Method",
    uploadScreenshot: "Proof of Payment (Screenshot)",
    dragDropScreenshot: "Drag & drop transaction screenshot, or click to upload",
    enterAmount: "Amount to Trade ($)",
    depositHistory: "Deposit History Logs",
    withdrawHistory: "Withdrawal Requests Tracker",
    referralLink: "Your Referral Link",
    copyBtn: "Copy Link",
    copied: "Copied!",
    referralStats: "My Affiliate Dashboard",
    commissionLevels: "Multi-Tier Affiliate Tree",
    changePassword: "Change Security Key",
    editProfile: "Modify Account Details",
    profilePicture: "Investor Profile Picture",
    securitySettings: "Two-Factor & Device Logs",

    totalRevenue: "Gross Platform Reserves",
    dailyRevenue: "Daily Ingestion",
    monthlyRevenue: "Monthly Net Return",
    userManagement: "Registered Members",
    depositManagement: "Inbound Ledger",
    withdrawalManagement: "Outbound Requests",
    plansManagement: "Interest Scheme Editor",
    systemNotifications: "Global Announcement Feed",
    systemSettings: "Core Configurations",
    searchUsersPlaceholder: "Search by username, email, or wallet structure...",
    suspendUser: "Suspend Client",
    activateUser: "Unban Client",
    editBalance: "Modify Balance",
    resetPassword: "Force Reset Password",
    sendAnnouncement: "Transmit Global Notice",
    announcementTitle: "Notice Heading",
    announcementBody: "Notice Body / Informational content to display on dashboards...",
    minDepositWithdraw: "Floor Limit ($) [Deposit / Out]",
    enableReg: "New Registration Window Open"
  },
  am: {
    appName: "ApexInvest",
    login: "ግባ",
    register: "ተመዝገብ",
    logout: "ውጣ",
    dashboard: "የተጠቃሚ ሰሌዳ",
    adminDashboard: "አስተዳዳሪ ሰሌዳ",
    support: "የቴሌግራም ድጋፍ",
    language: "ቋንቋ",
    active: "ንቁ",
    pending: "በመጠባበቅ ላይ",
    approved: "የጸደቀ",
    rejected: "ውድቅ የተደረገ",
    suspended: "የታገደ",
    save: "ለውጦችን አስቀምጥ",
    cancel: "ሰርዝ",
    delete: "አጥፋ",
    edit: "አስተካክል",
    status: "ሁኔታ",
    action: "ድርጊት",
    amount: "መጠን ($)",
    date: "ቀን",
    allNotifications: "ማሳወቂያዎች",
    noNotifications: "አዲስ ማሳወቂያ የለም",

    heroTitle: "ፕሪሚየም አውቶማቲክ የክሪፕቶ እና ፎሬክስ ኢንቨስትመንት",
    heroSubtitle: "በባለሙያ ትንታኔዎች ተቋማዊ የንብረት እድገትን ይለማመዱ። ሙሉ በሙሉ ደህንነቱ የተጠበቀ፣ እጅግ አስተማማኝ፣ ዕለታዊ ተመላሽ እስከ 3.8%።",
    totalUsers: "ጠቅላላ የተመዘገቡ ተጠቃሚዎች",
    totalDeposits: "ጠቅላላ የተቀመጡ ተቀማጮች",
    totalWithdrawals: "የተጠናቀቁ ክፍያዎች",
    onlineUsers: "አሁን በመስመር ላይ ያሉ ነጋዴዎች",
    plansTitle: "ከፍተኛ ምርት የሚሰጡ እቅዶች",
    plansSubtitle: "ለተከታታይ የፋይናንስ ብልጽግና በትጋት የተነደፈ የኢንቨስትመንት ጥቅል ይምረጡ።",
    testimonialsTitle: "የባለሀብቶቻችን ምስክርነት",
    testimonialsSubtitle: "ከታዋቂው ዓለም አቀፍ የክሪፕቶፕ እና ልውውጥ ገበያ ነጋዴዎች ግምገማዎችን ያንብቡ።",
    faqTitle: "ተደጋግሞ የሚጠየቁ ጥያቄዎች",
    faqSubtitle: "ስለ ተቀማጭ ገንዘቦች፣ ተመኖች ወይም ገንዘብ ማውጣት ሂደት ጥያቄዎች አሉዎት? ፈጣን መልሶችን ያግኙ።",
    newsTitle: "የገበያ ትንታኔዎች እና ክስተቶች",
    newsSubtitle: "በእውነተኛ ጊዜ ከፋይናንሺያል መግለጫዎች፣ ዝመናዎች እና የድርጅት ዜናዎች ጋር ይወቁ።",
    joinTelegram: "ኦፊሴላዊ የቴሌግራም ቡድንን ይቀላቀሉ",
    aboutUs: "ስለ ApexInvest",
    aboutUsText: "እኛ ያልተማከለ የፈሳሽ ቡትስትራፒንግ፣ የክሪፕቶፕ ማርኬት አወቃቀር እና አውቶማቲክ የምንዛሬ ስፖት ትሬዲንግ ስትራቴጂዎች ላይ የተሰማራን ግንባር ቀደም የአውሮፓ እና አፍሪካ የኢንቨስትመንት ቡድን ነን።",
    contactUs: "የደህንነት ክፍልን ያግኙ",
    terms: "የአጠቃቀም ደንቦች",
    privacy: "የግላዊነት ፖሊሲ",

    username: "የተጠቃሚ ስም / ስም",
    email: "የኢሜል አድራሻ",
    phone: "ስልክ ቁጥር",
    password: "ጠንካራ የይለፍ ቃል",
    confirmPassword: "ይለፍ ቃል ያረጋግጡ",
    referralCode: "የሪፈራል ኮድ (ከተፈለገ)",
    termsAgreement: "የኢንቨስትመንት ደንቦችን እና ፖሊሲዎች ተስማምቻለሁ።",
    rememberMe: "አስታውሰኝ",
    forgotPassword: "ይለፍ ቃል ረሱ?",
    forgotPasswordTitle: "መለያዎን መልሰው ያግኙ",
    forgotPasswordDesc: "የማገገሚያ ኮድ ለመቀበል የተመዘገበበትን የኢሜል አድራሻ ያስገቡ።",
    alreadyHaveAccount: "ቀድሞውኑ መለያ አለዎት? ይግቡ",
    dontHaveAccount: "መለያ የለዎትም? አሁኑኑ ይመዝገቡ",
    recaptchaVerification: "የደህንነት ማረጋገጫ፡ እኔ ሮቦት አይደለሁም።",
    verifyEmailCode: "የኢሜል ማረጋገጫ ኮድ",
    verificationCodeSent: "የ 6 አሃዝ የማረጋገጫ ኮድ ወደ ኢሜልዎ ተልኳል።",
    verifyBtn: "ያረጋግጡ እና ይጀምሩ",

    walletBalance: "የኪስ ቀሪ ሂሳብ",
    dailyProfit: "የታሰበው ዕለታዊ ትርፍ",
    referralIncome: "ጠቅላላ የሪፈራል ጉርሻ",
    activeInvestment: "ንቁ ፖርትፎሊዮ",
    transactionStats: "የግብይት ዝርዝሮች",
    earningsOverview: "የትርፍ ካላንደር ገበታ",
    recentTransactions: "የቅርብ ጊዜ እንቅስቃሴዎች",
    withdrawalAddress: "ገንዘብ መቀበያ አድራሻ (USDT / ባንክ)",

    paymentMethod: "የተቀማጭ ክፍያ ዘዴ ይምረጡ",
    uploadScreenshot: "የክፍያ ማረጋገጫ (ስክሪንሾት)",
    dragDropScreenshot: "የክፍያውን ስክሪንሾት እዚህ ይጎትቱ ወይም ፋይል ለመምረጥ ይጫኑ",
    enterAmount: "የንግድ መጠን ($)",
    depositHistory: "የገንዘብ ማስገቢያ እንቅስቃሴዎች",
    withdrawHistory: "የገንዘብ ማውጫ ጥያቄዎች",
    referralLink: "የእርስዎ የሪፈራል ሊንክ",
    copyBtn: "ሊንኩን ገልብጥ",
    copied: "ተገልብጧል!",
    referralStats: "የተባባሪዎች ሰሌዳ",
    commissionLevels: "የብዙ-ደረጃ ተባባሪዎች ዛፍ",
    changePassword: "የደህንነት ቁልፍ ቀይር",
    editProfile: "የመለያ መረጃ አሻሽል",
    profilePicture: "የባለሀብቱ መገለጫ ምስል",
    securitySettings: "ባለሁለት-ደረጃ ማረጋገጫ እና መሳሪያዎች",

    totalRevenue: "ጠቅላላ የፕላትፎርም መጠባበቂያ",
    dailyRevenue: "ዕለታዊ ገቢ ማስገባት",
    monthlyRevenue: "ወርሃዊ የተጣራ ትርፍ",
    userManagement: "የተመዘገቡ አባላት",
    depositManagement: "ገቢ የሂሳብ መዝገብ",
    withdrawalManagement: "ወጪ ክፍያ ጥያቄዎች",
    plansManagement: "የወለድ እቅድ አርታዒ",
    systemNotifications: "አጠቃላይ ይፋዊ ማስታወቂያዎች",
    systemSettings: "ዋና ዋና ቅንብሮች",
    searchUsersPlaceholder: "በተጠቃሚ ስም፣ ኢሜል ወይም በኪስ አድራሻ ይፈልጉ...",
    suspendUser: "አባል እገድብ",
    activateUser: "እገዳ አንሳ",
    editBalance: "ቀሪ ሂሳብን ቀይር",
    resetPassword: "የይለፍ ቃል አስገድደህ ቀይር",
    sendAnnouncement: "አጠቃላይ ማስታወቂያ አስተላልፍ",
    announcementTitle: "የማስታወቂያው ርዕስ",
    announcementBody: "የማስታወቂያው ይዘት / መረጃ በተጠቃሚዎች ሰሌዳ ላይ እንዲታይ...",
    minDepositWithdraw: "አነስተኛ ገደብ ($) [ማስገባት / ማውጣት]",
    enableReg: "የአዲስ ምዝገባ መስኮት ክፍት ነው"
  }
};
