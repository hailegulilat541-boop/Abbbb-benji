export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string; // client-side simulation
  referralCode: string; // own referral code
  referredBy?: string;  // who referred this user
  balance: number;
  dailyProfit: number;
  referralIncome: number;
  activeInvestment: number;
  status: 'active' | 'suspended';
  role: 'user' | 'admin';
  profilePic?: string;
  withdrawalAddress?: string;
  isEmailVerified: boolean;
  registrationDate: string;
  p2pIntent?: boolean;
  isKycVerified?: boolean;
  kycFacialPic?: string;
  kycIdPic?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  nameAm: string;
  dailyRate: number; // e.g. 1.5 for 1.5%
  durationDays: number;
  minDeposit: number;
  maxDeposit: number;
}

export interface ActiveInvestment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  dailyRate: number;
  durationDays: number;
  daysElapsed: number;
  startDate: string;
  totalEarned: number;
  status: 'active' | 'completed';
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  paymentMethod: string;
  screenshotUrl: string; // base64 or simulated asset URL
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  paymentMethod: string;
  address: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific userId
  title: string;
  titleAm: string;
  body: string;
  bodyAm: string;
  date: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'dividend' | 'referral_bonus';
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface PlatformSettings {
  websiteName: string;
  minimumDeposit: number;
  minimumWithdrawal: number;
  referralLevel1Com: number; // e.g., 10 for 10%
  referralLevel2Com: number; // e.g., 5 for 5%
  referralLevel3Com: number; // e.g., 2.5 for 2.5%
  registrationEnabled: boolean;
  themeColorGold: string; // Theme hex highlight color
}
