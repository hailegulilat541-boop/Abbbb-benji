import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';
import { User, DepositRequest, WithdrawalRequest, InvestmentPlan, Transaction } from '../types';
import { Wallet, ShieldCheck, ArrowDownCircle, ArrowUpCircle, Share2, Award, UserCheck, Plus, Check, Link, RefreshCw, Upload, Eye, EyeOff, Camera, ChevronRight, MessageSquare, TrendingUp, TrendingDown, Coins, Activity, Sparkles, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { CameraIdScanner } from './CameraIdScanner';
import { CameraFaceScanner } from './CameraFaceScanner';

interface UserViewProps {
  lang: 'en' | 'am';
  user: User;
  users: User[];
  onNavigate: (view: any) => void;
  plans: InvestmentPlan[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  onSubmitDeposit: (amount: number, method: string, screenshot: string, userAccountNo?: string) => void;
  onSubmitWithdrawal: (amount: number, method: string, address: string) => void;
  onUpdateUser: (updated: User) => void;
  onInvest: (planId: string, amount: number) => void;
}

type SubView = 'dashboard' | 'deposit' | 'withdraw' | 'referrals' | 'profile' | 'plans' | 'tasks' | 'p2p';

export default function UserView({
  lang,
  user,
  users = [],
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
  const [userAccountNo, setUserAccountNo] = useState('');
  const [depScreenshot, setDepScreenshot] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Withdrawal Form states
  const [withMethod, setWithMethod] = useState('Commercial Bank of Ethiopia (CBE)');
  const [withAmount, setWithAmount] = useState('');
  const [withAddress, setWithAddress] = useState('');

  // P2P KYC secure verification states
  const [p2pFacialPic, setP2pFacialPic] = useState('');
  const [p2pIdPic, setP2pIdPic] = useState('');
  const [p2pFacialScanning, setP2pFacialScanning] = useState(false);
  const [p2pIdUploading, setP2pIdUploading] = useState(false);
  const [showP2pIdScanner, setShowP2pIdScanner] = useState(false);
  const [showP2pFaceScanner, setShowP2pFaceScanner] = useState(false);
  const [p2pKycError, setP2pKycError] = useState('');

  // Real-time Daily Profit Accumulator & Coins state
  const [liveDailyProfit, setLiveDailyProfit] = useState(user.dailyProfit);
  const [profitPing, setProfitPing] = useState(false);
  const [depositCashAlert, setDepositCashAlert] = useState(user.balance < 50);

  // Live coins pricing data state
  const [coins, setCoins] = useState<any[]>([
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 102450.00,
      change: 2.45,
      sparkline: [101200, 101800, 101500, 102100, 102000, 102450]
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      price: 3242.80,
      change: -0.72,
      sparkline: [3290, 3270, 3255, 3230, 3250, 3242.80]
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      price: 195.45,
      change: 5.68,
      sparkline: [184, 186, 189, 192, 190, 195.45]
    },
    {
      name: 'Apex Token',
      symbol: 'APEX',
      price: 1.345,
      change: 12.35,
      sparkline: [1.18, 1.20, 1.25, 1.28, 1.31, 1.345]
    }
  ]);

  // Sync when user.dailyProfit updates
  useEffect(() => {
    setLiveDailyProfit(user.dailyProfit);
  }, [user.dailyProfit]);

  // Handle ticking simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Tick up daily profit real-time! If they have high active investments, speed increases!
      const minVal = user.activeInvestment > 0 
        ? (user.activeInvestment * 0.000008) + (Math.random() * 0.000002) 
        : 0.000025 + (Math.random() * 0.000010);
      
      setLiveDailyProfit(prev => {
        const next = prev + minVal;
        // Trigger blinking update state animation
        setProfitPing(true);
        setTimeout(() => setProfitPing(false), 400);
        return next;
      });

      // Tick Coin prices slightly to simulate ups & downs
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          const tickPercent = (Math.random() - 0.49) * 0.004; // small fluctuation
          const newPrice = Math.max(0.01, coin.price * (1 + tickPercent));
          const currentSparkline = [...coin.sparkline.slice(1), parseFloat(newPrice.toFixed(2))];
          const newChange = coin.change + (tickPercent * 100);
          return {
            ...coin,
            price: newPrice,
            change: parseFloat(newChange.toFixed(2)),
            sparkline: currentSparkline
          };
        })
      );
    }, 1800);

    return () => clearInterval(timer);
  }, [user.activeInvestment]);

  useEffect(() => {
    setDepositCashAlert(user.balance < 50);
  }, [user.balance]);

  // Tasks tracking states
  const [claimedTaskIds, setClaimedTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`apex_claimed_tasks_${user.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  // High Commission Bounty Tasks list
  const highCommissionTasks = [
    {
      id: 'task_arbitrage',
      title: 'Forex Spot Arbitrage Protocol Quiz',
      titleAm: 'የፎሬክስ አርቢትሬጅ ስልጠና ጥያቄዎች',
      description: 'Study our core low-latency spreads and select the correct liquidity pair used for cross-border hedging.',
      descriptionAm: 'ዋናውን ዝቅተኛ-ርዝመት የገበያ ልዩነት ያጥኑ እና ለድንበር ተሻጋሪ ሽያጭ ጥቅም ላይ የሚውለውን ትክክለኛ የፈሳሽ ጥንድ ይምረጡ።',
      reward: 20,
      actionType: 'quiz',
      options: ['EUR/USD Premium Pool', 'BTC/USDT Liquidity Hub', 'CBE/Telebirr Exchange Bridge'],
      correctAnswer: 'EUR/USD Premium Pool',
      helpText: 'Hint: EUR/USD spreads always maintain the highest reserve coefficient.'
    },
    {
      id: 'task_signals',
      title: 'Telegram Official Signal Node Integration',
      titleAm: 'የቴሌግራም ኦፊሴላዊ ሲግናል ኖድ መቀላቀል',
      description: 'Join the VIP Channel on Telegram to extract daily algorithmic buy/sell signals. Enter your Telegram Username to claim.',
      descriptionAm: 'ዕለታዊ የአልጎሪዝም ሲግናል መረጃዎችን ለማግኘት የVIP ቴሌግራም ቻናልን ይቀላቀሉ። ለማረጋገጥ የእርስዎን የቴሌግራም ስም ያስገቡ።',
      reward: 15,
      actionType: 'text_input',
      placeholder: '@username_here_or_phone',
      buttonLabel: 'Verify & Claim $15.00'
    },
    {
      id: 'task_node_activation',
      title: 'Binance & Bybit Dual-Link Verification',
      titleAm: 'የባይናንስ እና ባይቢት ድርብ-ሊንክ ማረጋገጫ',
      description: 'Bind your exchange hot wallet coordinates to secure your secondary decentralized dividends routing. Paste your ERC-20 Address.',
      descriptionAm: 'ለሁለተኛ ደረጃ ክፍያዎች ደህንነትን ለማረጋገጥ የእርስዎን የክሪፕቶ ዋሌት አድራሻ ያገናኙ። የእርስዎን ERC-20 ወይም TRC-20 አድራሻ ያስገቡ።',
      reward: 35,
      actionType: 'text_input',
      placeholder: '0x... or T...',
      buttonLabel: 'Bind Node & Claim $35.00'
    },
    {
      id: 'task_review',
      title: 'Five-Star Trustpilot Feedback Initiative',
      titleAm: 'የ 5 ኮከብ የትረስት ፓይለት አስተያየት ዘመቻ',
      description: 'We prioritize professional corporate reputation. Submit a sincere five-star rating feedback and type your Trustpilot review username here.',
      descriptionAm: 'ለድርጅታችን መልካም ስም ቅድሚያ እንሰጣለን። ባለ 5 ኮከብ ደረጃ አስተያየት ይስጡ እና የተጠቀሙበትን የተጠቃሚ ስም እዚህ ያስገቡ።',
      reward: 18,
      actionType: 'text_input',
      placeholder: 'Your Reviewer Name (e.g. Haile G.)',
      buttonLabel: 'Submit & Claim $18.00'
    },
    {
      id: 'task_telegram_share',
      title: 'Multi-Group Direct Affiliate Broadcast',
      titleAm: 'በተለያዩ የክሪፕቶ ግሩፖች የማጋራት ዘመቻ',
      description: 'Share your personal referral link to at least 3 active cryptocurrency Telegram groups and paste the confirmation channel group names.',
      descriptionAm: 'የእርስዎን የሪፈራል ሊንክ ቢያንስ ለ 3 ንቁ የክሪፕቶ ቴሌግራም ግሩፖች ያጋሩ እና ያጋሩባቸውን የግሩፕ ስሞች እዚህ ያስገቡ።',
      reward: 45,
      actionType: 'text_input',
      placeholder: 'Group 1, Group 2, Group 3',
      buttonLabel: 'Verify Links & Claim $45.00'
    },
    {
      id: 'task_whatsapp_status',
      title: 'Daily Status Leverage Broadcast',
      titleAm: 'የዋትስአፕ ስታተስ ማጋሪያ ተግባር',
      description: 'Upload your current ApexInvest payout or active trading panel on your WhatsApp Status. Paste your phone number to verify status visibility.',
      descriptionAm: 'አሁን ያለዎትን የትርፍ ሰሌዳ በዋትስአፕ ስታተስዎ ላይ ይስቀሉ። መታየቱን ለማረጋገጥ ስልክ ቁጥርዎን እዚህ ያስገቡ።',
      reward: 22,
      actionType: 'text_input',
      placeholder: '+251...',
      buttonLabel: 'Claim Payout Bonus $22.00'
    }
  ];

  const handleClaimTask = (taskId: string, reward: number, checkAnswer?: string) => {
    if (user.status === 'suspended') {
      alert(lang === 'en' ? "Your account is currently suspended. You cannot perform bounty tasks." : "መለያዎ ስለታገደ ተግባራትን ማጠናቀቅ አይችሉም።");
      return;
    }

    if (claimedTaskIds.includes(taskId)) {
      alert(lang === 'en' ? "You have already completed this bounty task!" : "ይህንን ተግባር አስቀድመው አጠናቀዋል።");
      return;
    }

    const userInput = taskInputs[taskId]?.trim() || '';

    // If it's a quiz, verify correct answer
    if (checkAnswer) {
      if (userInput !== checkAnswer) {
        alert(lang === 'en' ? "Incorrect answer. Please review the Forex spreads and try again!" : "የተሳሳተ መልስ። እባክዎ ጥያቄውን በድጋሚ ገምግመው ይሞክሩ!");
        return;
      }
    } else {
      // Must not be empty for text inputs
      if (!userInput) {
        alert(lang === 'en' ? "Please complete the required field or submit code proof!" : "እባክዎን ማረጋገጫውን በትክክል ያስገቡ!");
        return;
      }
    }

    // Success: add to claimed tasks, update list in storage, and credit balance!
    const updatedClaimed = [...claimedTaskIds, taskId];
    setClaimedTaskIds(updatedClaimed);
    localStorage.setItem(`apex_claimed_tasks_${user.id}`, JSON.stringify(updatedClaimed));

    // Credit user core state balance!
    const updatedUser = {
      ...user,
      balance: user.balance + reward
    };
    onUpdateUser(updatedUser);

    // Show a beautiful, professional alert
    alert(lang === 'en' 
      ? `🎉 Success! Task verified. Core Account Balance credited with +$${reward.toFixed(2)} USD!` 
      : `🎉 ተሳክቷል! ተግባሩ ተረጋግጧል። በሒሳብዎ ላይ +$${reward.toFixed(2)} ዶላር ተጨምሯል!`
    );
  };

  // ================= P2P SYSTEM & ESCROW CODES =================
  interface P2PEscrow {
    id: string;
    type: 'buy' | 'sell';
    partyName: string; // Counterparty merchant
    usdAmount: number;
    exchangeRate: number; // e.g. 1 USD = 118.5 ETB
    etbAmount: number;
    method: string;
    bankAccount: string;
    status: 'pending_payment' | 'submitted_proof' | 'released' | 'disputed';
    proofRef?: string;
    createdAt: string;
  }

  const [escrows, setEscrows] = useState<P2PEscrow[]>(() => {
    try {
      const stored = localStorage.getItem(`apex_escrows_${user.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'esc_seed_1',
        type: 'buy',
        partyName: 'Alula_Trader_VIP',
        usdAmount: 50,
        exchangeRate: 118.5,
        etbAmount: 5925,
        method: 'Commercial Bank of Ethiopia (CBE)',
        bankAccount: '1000481273921',
        status: 'released',
        proofRef: 'CBE-FT-948271',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`apex_escrows_${user.id}`, JSON.stringify(escrows));
  }, [escrows, user.id]);

  interface ChatMessage {
    id: string;
    sender: 'user' | 'counterparty';
    senderName: string;
    text: string;
    timestamp: string;
    screenshotUrl?: string;
    isReceipt?: boolean;
    approved?: boolean;
  }

  const [p2pChats, setP2pChats] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const stored = localStorage.getItem(`apex_p2p_chats_${user.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      'esc_seed_1': [
        { id: '1', sender: 'counterparty', senderName: 'Alula_Trader_VIP', text: "Hello! Welcome to secure escrow network. Please transfer funds and upload your photo receipt on this chat node.", timestamp: "11:20 AM" },
        { id: '2', sender: 'user', senderName: 'Me', text: "Sent! Check attached receipt.", timestamp: "11:24 AM" },
        { id: '3', sender: 'counterparty', senderName: 'Alula_Trader_VIP', text: "Approved! Verification completed and USD is released.", timestamp: "11:25 AM" }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem(`apex_p2p_chats_${user.id}`, JSON.stringify(p2pChats));
  }, [p2pChats, user.id]);

  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});

  const handleSendChatMessage = (escrowId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      senderName: 'Me',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setP2pChats(prev => {
      const list = prev[escrowId] || [];
      return {
        ...prev,
        [escrowId]: [...list, newMsg]
      };
    });

    setChatInputs(prev => ({ ...prev, [escrowId]: '' }));

    // Simulate merchant/counterparty answer after 3 seconds:
    setTimeout(() => {
      const esc = escrows.find(e => e.id === escrowId);
      if (!esc || esc.status === 'released') return;

      let replyStr = "";
      if (esc.type === 'buy') {
        replyStr = lang === 'en'
          ? "Please don't forget to attach the screenshot receipt here on this chat tab. I need it to approve and release your funds!"
          : "እባክዎን የባንክ ማስተላለፊያ ደረሰኝ (Screenshot) ማያያዝዎን አይርሱ:: ግብይቱን ለማፅደቅ ደረሰኙ ያስፈልገኛል::";
      } else {
        replyStr = lang === 'en'
          ? "Awesome. Checking my mobile banking application now to verify your request..."
          : "በጣም ጥሩ:: ክፍያውን ለማረጋገጥ አሁን የሞባይል ባንክ አፕሊኬሽኔን እያረጋገጥኩ ነው::";
      }

      const counterMsg: ChatMessage = {
        id: `msg_counter_${Date.now()}`,
        sender: 'counterparty',
        senderName: esc.partyName,
        text: replyStr,
        timestamp: new Date().toLocaleTimeString()
      };

      setP2pChats(prev => {
        const list = prev[escrowId] || [];
        return {
          ...prev,
          [escrowId]: [...list, counterMsg]
        };
      });
    }, 3000);
  };

  const handleSendChatScreenshot = (escrowId: string, base64Url: string) => {
    const esc = escrows.find(e => e.id === escrowId);
    if (!esc) return;

    const userScreenshotMsg: ChatMessage = {
      id: `msg_user_proof_${Date.now()}`,
      sender: 'user',
      senderName: 'Me',
      text: lang === 'en' 
        ? "Here is the official bank transaction receipt screenshot. Please approve!"
        : "የክፍያ ማስተላለፊያ ማረጋገጫ ፎቶ ደረሰኝ ይኸውና:: እባክዎን አረጋግጠው ይልቀቁኝ::",
      timestamp: new Date().toLocaleTimeString(),
      screenshotUrl: base64Url,
      isReceipt: true
    };

    setP2pChats(prev => {
      const list = prev[escrowId] || [];
      return {
        ...prev,
        [escrowId]: [...list, userScreenshotMsg]
      };
    });

    // Update escrow contract status to submitted_proof with simulated receipt ref
    setEscrows(currentEscrows => currentEscrows.map(item => {
      if (item.id === escrowId) {
        return { ...item, status: 'submitted_proof', proofRef: 'CBE-FT-CHAT-' + Math.floor(100000 + Math.random() * 900000) };
      }
      return item;
    }));

    setTimeout(() => {
      const sellerAckMsg: ChatMessage = {
        id: `msg_seller_ack_${Date.now()}`,
        sender: 'counterparty',
        senderName: esc.partyName,
        text: lang === 'en' 
          ? `Receipt screenshot received! Let me check the details. If clear, I will immediately approve and release the USD escrow...`
          : `ማረጋገጫ ፎቶው ደርሶኛል! ዝርዝሩን እያረጋገጥኩ ነው:: ሁሉም ነገር ትክክል ከሆነ ወዲያውኑ ዶላሩን እለቃለሁ::`,
        timestamp: new Date().toLocaleTimeString()
      };

      setP2pChats(prevChats => {
        const list = prevChats[escrowId] || [];
        return {
          ...prevChats,
          [escrowId]: [...list, sellerAckMsg]
        };
      });

      // Simulation: merchant seller approves the draft 3.5 seconds later
      setTimeout(() => {
        setEscrows(currentEscrows => {
          let orderCompleted = false;
          const updated = currentEscrows.map(item => {
            if (item.id === escrowId && item.status === 'submitted_proof') {
              orderCompleted = true;
              return { ...item, status: 'released' as const };
            }
            return item;
          });

          if (orderCompleted) {
            const updatedUser = {
              ...user,
              balance: user.balance + esc.usdAmount
            };
            onUpdateUser(updatedUser);

            const sellerFinalMsg: ChatMessage = {
              id: `msg_seller_final_${Date.now()}`,
              sender: 'counterparty',
              senderName: esc.partyName,
              text: lang === 'en'
                ? `✓ Screenshot receipt approved! I have released $${esc.usdAmount.toFixed(2)} USD from lock escrow to your balance account. Thank you!`
                : `✓ የስክሪንሾት ደረሰኝዎ ጸድቋል! $${esc.usdAmount.toFixed(2)} ዶላር ከኤስክሮው ወደ ሂሳብዎ ተለቋል። እናመሰግናለን!`,
              timestamp: new Date().toLocaleTimeString(),
              approved: true
            };

            setP2pChats(prevChats => {
              const list = prevChats[escrowId] || [];
              return {
                ...prevChats,
                [escrowId]: [...list, sellerFinalMsg]
              };
            });
          }
          return updated;
        });
      }, 3500);

    }, 2500);
  };

  const handleApproveScreenshotInChat = (escrowId: string) => {
    let releasedEscrow: P2PEscrow | null = null;
    
    setEscrows(current => current.map(item => {
      if (item.id === escrowId && item.status === 'submitted_proof') {
        releasedEscrow = item;
        return { ...item, status: 'released' as const };
      }
      return item;
    }));

    const completedMsg: ChatMessage = {
      id: `msg_approved_${Date.now()}`,
      sender: 'user',
      senderName: 'Me',
      text: lang === 'en'
        ? "✓ Approved! Screenshot receipt is verified. USD is unlocked from escrow and completed successfully."
        : "✓ ጸድቋል! የደረሰኝ ማረጋገጫ ፎቶውን አሽፌያለሁ:: ዶላሩ ከኤስክሮው ተለቆ በተሳካ ሁኔታ ተጠናቋል።",
      timestamp: new Date().toLocaleTimeString(),
      approved: true
    };

    setP2pChats(prev => {
      const list = prev[escrowId] || [];
      return {
        ...prev,
        [escrowId]: [...list, completedMsg]
      };
    });

    alert(lang === 'en'
      ? "🎉 Success! You have approved the buyer's screenshot in the chat. Escrow USD released!"
      : "🎉 ተሳክቷል! የገዢውን የስክሪንሾት ደረሰኝ በውይይቱ ላይ አጽድቀዋል። የኤስክሮው ዶላር ተለቋል!"
    );
  };

  // Active Live Trading Listings (CBE, Telebirr, Awash, BOA)
  const [p2pListings] = useState([
    { id: 'lst_1', name: 'Alula_Trader_VIP', rate: 118.50, limitMin: 10, limitMax: 2000, completed: 842, score: '99.1%', methods: ['Commercial Bank of Ethiopia (CBE)', 'Telebirr'] },
    { id: 'lst_2', name: 'Liyu_FastTransfer', rate: 119.20, limitMin: 20, limitMax: 1500, completed: 1511, score: '98.5%', methods: ['Telebirr', 'Bank of Abyssinia (BOA)'] },
    { id: 'lst_3', name: 'Zola_Escrow_Node', rate: 118.10, limitMin: 50, limitMax: 5000, completed: 320, score: '100%', methods: ['Commercial Bank of Ethiopia (CBE)', 'Awash Bank'] },
    { id: 'lst_4', name: 'Dagim_Telebirr_Pro', rate: 119.00, limitMin: 5, limitMax: 1000, completed: 2190, score: '99.6%', methods: ['Telebirr'] }
  ]);

  // State controls for Forms
  const [p2pSelectedListing, setP2pSelectedListing] = useState<any | null>(null);
  const [buyUsdAmount, setBuyUsdAmount] = useState('');
  const [buyReferenceCode, setBuyReferenceCode] = useState('');

  // Sell form states
  const [sellUsdAmount, setSellUsdAmount] = useState('');
  const [sellRate, setSellRate] = useState('118.50');
  const [sellBank, setSellBank] = useState('Commercial Bank of Ethiopia (CBE)');
  const [sellAccount, setSellAccount] = useState('');

  // USD Transfer states
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // ---------------- HANDLERS FOR P2P OPERATIONS ----------------
  const handleInitiateBuyEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.status === 'suspended') {
      alert(lang === 'en' ? "Suspended accounts cannot use P2P trading." : "የታገዱ ሂሳቦች P2P መጠቀም አይችሉም።");
      return;
    }

    if (!p2pSelectedListing) return;
    const usd = parseFloat(buyUsdAmount);
    if (!usd || isNaN(usd) || usd <= 0) {
      alert(lang === 'en' ? "Please enter a valid amount." : "ትክክለኛ መጠን ያስገቡ።");
      return;
    }

    if (usd < p2pSelectedListing.limitMin || usd > p2pSelectedListing.limitMax) {
      alert(lang === 'en'
        ? `Amount must be between $${p2pSelectedListing.limitMin} and $${p2pSelectedListing.limitMax} USD.`
        : `መጠኑ በ $${p2pSelectedListing.limitMin} እና $${p2pSelectedListing.limitMax} መሆን አለበት።`
      );
      return;
    }

    const newEscId = `esc_buy_${Date.now()}`;
    // Spawn escrow contract
    const newEsc: P2PEscrow = {
      id: newEscId,
      type: 'buy',
      partyName: p2pSelectedListing.name,
      usdAmount: usd,
      exchangeRate: p2pSelectedListing.rate,
      etbAmount: usd * p2pSelectedListing.rate,
      method: p2pSelectedListing.methods[0],
      bankAccount: p2pSelectedListing.name === 'Alula_Trader_VIP' ? '1000492817342' : '1000384719283',
      status: 'pending_payment',
      createdAt: new Date().toLocaleString()
    };

    const initialMsg: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'counterparty',
      senderName: p2pSelectedListing.name,
      text: lang === 'en' 
        ? `Hello! Welcome to secure escrow. Please send exactly ${newEsc.etbAmount.toLocaleString()} ETB via ${newEsc.method} to bank account: ${newEsc.bankAccount}. After transferring, please click the "📷 Attach Screenshot" button below in this chat to send your screenshot receipt. Do not use external forms; upload the screenshot here so I can approve and release your funds!`
        : `ሰላም! እንኳን ደህና መጡ:: እባክዎን በትክክል ${newEsc.etbAmount.toLocaleString()} ETB በ ${newEsc.method} ወደዚህ ባንክ አካውንት ያስገቡ:: ${newEsc.bankAccount}. ካስተላለፉ በኋላ ፎቶ ደረሰኝ (Screenshot) ከታች ባለው "📷 Attach Screenshot" ቁልፍ በመጫን ይላኩልኝ:: ወዲያውኑ አረጋግጬ የኢንቨስትመንት ዶላርዎን እለቃለሁ::`,
      timestamp: new Date().toLocaleTimeString()
    };

    setP2pChats(prev => ({
      ...prev,
      [newEscId]: [initialMsg]
    }));

    setEscrows([newEsc, ...escrows]);
    setP2pSelectedListing(null);
    setBuyUsdAmount('');
    alert(lang === 'en'
      ? "🔒 Escrow Order locked! Please complete the local bank transfer to retrieve deposit."
      : "🔒 የገንዘብ ማስያዣ እገዳ ተጀምሯል! እባክዎን ወደ ሻጩ አካውንት በባንክ ያስተላልፉ።"
    );
  };

  const handleSubmitBuyProof = (escrowId: string, refCode: string) => {
    if (!refCode.trim()) {
      alert(lang === 'en' ? "Please enter payment transaction reference index." : "እባክዎን የትራንዛክሽን ማጣቀሻ ቁጥር ያስገቡ።");
      return;
    }

    setEscrows(prev => prev.map(esc => {
      if (esc.id === escrowId) {
        // Trigger simulated automatic blockchain release in 3.5 seconds
        setTimeout(() => {
          setEscrows(current => current.map(item => {
            if (item.id === escrowId && item.status === 'submitted_proof') {
              // Credit balance safely!
              const updatedUser = {
                ...user,
                balance: user.balance + item.usdAmount
              };
              onUpdateUser(updatedUser);
              alert(lang === 'en'
                ? `🚀 Escrow Cleared! Commercial Bank reference ${refCode} has been verified! +$${item.usdAmount.toFixed(2)} USD added to your balance!`
                : `🚀 የኤስክሮው ማስያዣ ተለቅቋል! +$${item.usdAmount.toFixed(2)} ዶላር በሒሳብዎ ላይ ተጨምሯል!`
              );
              return { ...item, status: 'released' as const };
            }
            return item;
          }));
        }, 3500);

        return { ...esc, status: 'submitted_proof' as const, proofRef: refCode };
      }
      return esc;
    }));

    alert(lang === 'en'
      ? "Proof submitted! System is verifying the transaction logs on-chain..."
      : "ማስረጃው ተልኳል! ሲስተሙ በማጣቀሻ ቁጥሩ ትክክለኛነቱን እያጣራ ነው..."
    );
  };

  const handleInitiateSellEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.status === 'suspended') {
      alert(lang === 'en' ? "Suspended accounts cannot use P2P trading." : "የታገዱ ሂሳቦች P2P መጠቀም አይችሉም።");
      return;
    }

    const usd = parseFloat(sellUsdAmount);
    const rate = parseFloat(sellRate);
    if (!usd || isNaN(usd) || usd <= 0) {
      alert(lang === 'en' ? "Please enter a valid USD amount." : "ትክክለኛ መጠን ያስገቡ።");
      return;
    }

    if (!sellAccount.trim()) {
      alert(lang === 'en' ? "Please input your local target account number." : "እባክዎን የገንዘብ መቀበያ አካውንትዎን ያስገቡ።");
      return;
    }

    if (user.balance < usd) {
      alert(lang === 'en' ? "Inadequate USD account balance to place in escrow!" : "ለመሸጥ የሚያስችል በቂ ቀሪ ሂሳብ የለዎትም!");
      return;
    }

    // Deduct core user funds safely
    const updatedUser = {
      ...user,
      balance: user.balance - usd
    };
    onUpdateUser(updatedUser);

    const newEscId = `esc_sell_${Date.now()}`;
    // Create escrow contract
    const newEsc: P2PEscrow = {
      id: newEscId,
      type: 'sell',
      partyName: 'Express_Liquidity_Buyer',
      usdAmount: usd,
      exchangeRate: rate,
      etbAmount: usd * rate,
      method: sellBank,
      bankAccount: sellAccount.trim(),
      status: 'pending_payment',
      createdAt: new Date().toLocaleString()
    };

    const initialMsg: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'counterparty',
      senderName: 'Express_Liquidity_Buyer',
      text: lang === 'en'
        ? `Greetings! I accept your sell offer. Processing bank transfer of ${newEsc.etbAmount.toLocaleString()} ETB to your account ${newEsc.bankAccount} (${newEsc.method}) now. Please hold! I will attach the screenshot receipt into this chat tab for your approval shortly.`
        : `ሰላም! ክፍያውን ወደተቀባይ አካውንትዎ ${newEsc.bankAccount} (${newEsc.method}) ለመላክ በማስተላለፍ ላይ ነኝ:: ጥቂት ሰከንዶች ይጠብቁኝ፣ የክፍያ ማረጋገጫ ፎቶ (Receipt screenshot) እዚህ ውይይት ላይ እልካለሁ::`,
      timestamp: new Date().toLocaleTimeString()
    };

    setP2pChats(prev => ({
      ...prev,
      [newEscId]: [initialMsg]
    }));

    setEscrows([newEsc, ...escrows]);
    setSellUsdAmount('');
    setSellAccount('');

    // Simulate merchant/buyer sending the screenshot receipt in chat 6 seconds later
    setTimeout(() => {
      const buyerReceiptMsg: ChatMessage = {
        id: `msg_proof_${Date.now()}`,
        sender: 'counterparty',
        senderName: 'Express_Liquidity_Buyer',
        text: lang === 'en'
          ? `I have successfully completed the bank transfer! Below is my official payment receipt transaction record screenshot. Please tap and review the screenshot receipt, and click approved right here in our chat session to release the USD escrow funds.`
          : `የባንክ ሐዋላውን በትክክል ፈጽሜያለሁ! የክፍያ ማረጋገጫ የስክሪንሾት ፎቶ (Receipt screenshot) ከታች ተያይዟል:: እባክዎን ደረሰኙን በማረጋገጥ እዚህ ውይይት ላይ "Approve" በተጫኑ ጊዜ የኤስክሮው ዶላር ይልቀቁልኝ::`,
        timestamp: new Date().toLocaleTimeString(),
        screenshotUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=640&auto=format&fit=crop',
        isReceipt: true
      };

      setP2pChats(currentChats => {
        const list = currentChats[newEscId] || [];
        return {
          ...currentChats,
          [newEscId]: [...list, buyerReceiptMsg]
        };
      });

      setEscrows(current => current.map(item => {
        if (item.id === newEscId && item.status === 'pending_payment') {
          return { ...item, status: 'submitted_proof' as const, proofRef: `ETB-TXN-${Math.floor(100000 + Math.random() * 900000)}` };
        }
        return item;
      }));
    }, 6000);

    alert(lang === 'en'
      ? `🔒 Escrow Activated! $${usd.toFixed(2)} USD is secured. Wait for the buyer to transfer ${ (usd * rate).toLocaleString() } ETB to your account.`
      : `🔒 ኤስክሮው ተጀምሯል! $${usd.toFixed(2)} ዶላር በደህንነት ተይዟል። ገዢው የ ${ (usd * rate).toLocaleString() } የኢትዮጵያ ብር ክፍያ እስኪያደርግ ይጠብቁ።`
    );
  };

  const handleReleaseSellFunds = (escrowId: string) => {
    setEscrows(prev => prev.map(esc => {
      if (esc.id === escrowId) {
        alert(lang === 'en'
          ? "🎉 USD Escrow released to Buyer! Order finished successfully."
          : "🎉 ዶላሩ ለገዢው ተለቋል! ግብይቱ በተሳካ ሁኔታ ተጠናቋል።"
        );
        return { ...esc, status: 'released' as const };
      }
      return esc;
    }));
  };

  const handleCancelEscrow = (escrowId: string) => {
    const esc = escrows.find(e => e.id === escrowId);
    if (!esc) return;

    if (esc.status !== 'pending_payment') {
      alert(lang === 'en' ? "Only pending payment orders can be cancelled." : "ክፍያ ያልተፈጸመባቸውን ብቻ መሰረዝ ይቻላል።");
      return;
    }

    // Refund if it's a sell escrow
    if (esc.type === 'sell') {
      const updatedUser = {
        ...user,
        balance: user.balance + esc.usdAmount
      };
      onUpdateUser(updatedUser);
    }

    setEscrows(prev => prev.filter(e => e.id !== escrowId));
    alert(lang === 'en' ? "Escrow cancelled and funds returned if applicable." : "የኤስክሮው ግብይት ተሰርዟል።");
  };

  // Direct peer transfers
  const handleDirectTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.status === 'suspended') {
      alert(lang === 'en' ? "Suspended accounts cannot perform transfers." : "የታገዱ ሂሳቦች ማስተላለፍ አይችሉም።");
      return;
    }

    const amount = parseFloat(transferAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert(lang === 'en' ? "Please enter a valid transfer amount." : "ትክክለኛ የገንዘብ መጠን ያስገቡ።");
      return;
    }

    if (user.balance < amount) {
      alert(lang === 'en' ? "Inadequate balance to complete transfer." : "ሂሳብዎ ማስተላለፍ አይበቃም።");
      return;
    }

    const targetUsername = transferTarget.trim().toLowerCase();
    if (targetUsername === user.username.toLowerCase()) {
      alert(lang === 'en' ? "You cannot transfer USD to your own account." : "ለራስዎ መላክ አይችሉም።");
      return;
    }

    // Try finding the recipient user
    const recipient = users.find(u => u.username.toLowerCase() === targetUsername || u.email.toLowerCase() === targetUsername);
    if (!recipient) {
      alert(lang === 'en'
        ? `Recipient "${transferTarget}" was not found on ApexInvest nodes. Enter correct Username/Email or create dynamic node.`
        : `ተቀባይ "${transferTarget}" አልተገኘም። ትክክለኛ መለያ ያስገቡ።`
      );
      return;
    }

    // Execute transfer!
    // Deduct current user
    const updatedSender = {
      ...user,
      balance: user.balance - amount
    };
    onUpdateUser(updatedSender);

    // Simulate crediting other user
    recipient.balance = (recipient.balance || 0) + amount;
    // Note: since this updates local state array, we alert successfully!
    setTransferTarget('');
    setTransferAmount('');
    alert(lang === 'en'
      ? `💸 Transfer complete! Successfully sent $${amount.toFixed(2)} USD to @${recipient.username}! Instant settlement cleared.`
      : `💸 ማስተላለፍ ተሳክቷል! $${amount.toFixed(2)} ዶላር ወደ @${recipient.username} በትክክል ተልኳል!`
    );
  };

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

  // Referral Network tree states
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true });
  const [refSearch, setRefSearch] = useState('');
  const [refStatusFilter, setRefStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'tiers'>('tree');

  // Dynamic 3-Tier Referral Extraction
  const level1 = (users || []).filter(u => u.referredBy === user.referralCode);
  const level1Codes = level1.map(u => u.referralCode);
  const level2 = (users || []).filter(u => u.referredBy && level1Codes.includes(u.referredBy));
  const level2Codes = level2.map(u => u.referralCode);
  const level3 = (users || []).filter(u => u.referredBy && level2Codes.includes(u.referredBy));

  // Referral Calculations
  const allReferrals = [...level1, ...level2, ...level3];
  const activeReferralsCount = allReferrals.filter(u => u.activeInvestment > 0).length;
  
  const level1Investments = level1.reduce((sum, u) => sum + (u.activeInvestment || 0), 0);
  const level2Investments = level2.reduce((sum, u) => sum + (u.activeInvestment || 0), 0);
  const level3Investments = level3.reduce((sum, u) => sum + (u.activeInvestment || 0), 0);
  const totalNetworkInvestment = level1Investments + level2Investments + level3Investments;
  const estimatedCommission = (level1Investments * 0.10) + (level2Investments * 0.05) + (level3Investments * 0.025);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Filtered referrals list for search convenience
  const matchesSearchAndFilter = (u: User) => {
    const matchesQuery = refSearch === '' || 
      u.username.toLowerCase().includes(refSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(refSearch.toLowerCase()) ||
      u.phone.includes(refSearch);
    const matchesFilter = refStatusFilter === 'all' || u.status === refStatusFilter;
    return matchesQuery && matchesFilter;
  };

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
    if (!userAccountNo.trim()) {
      alert(lang === 'en' ? "Please enter your account number or transaction reference manually." : "እባክዎን የሂሳብ ቁጥርዎን ወይም ማጣቀሻዎን በእጅ ያስገቡ።");
      return;
    }
    if (!depScreenshot) {
      alert(lang === 'en' ? "Please upload transaction proof screenshot." : "እባክዎን የክፍያ ማረጋገጫ ፋይል ይስቀሉ።");
      return;
    }
    onSubmitDeposit(parsedAmount, depMethod, depScreenshot, userAccountNo.trim());
    setDepAmount('');
    setUserAccountNo('');
    setDepScreenshot('');
    alert(lang === 'en' ? "Deposit submitted! Please wait for administration approval." : "ገንዘብ ማስገቢያ ጥያቄ በትክክል ተልኳል! እባክዎ በአስተዳዳሪ እስከሚረጋገጥ ድረስ ይጠብቁ።");
  };

  // Withdrawal Submit
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withAmount);

    // Gated balance/referral requirements check: needs 50 dollars to withdraw OR 3 direct referrals
    const referralCount = level1.length;
    if (parsedAmount < 50 && referralCount < 3) {
      alert(lang === 'en' 
        ? `Gated Payout Security: A minimum withdrawal of $50.00 USD is required, OR you must have invited at least 3 direct active referrals. Currently, you have invited ${referralCount} direct referrals.` 
        : `የክፍያ ጥበቃ መመሪያ፡ ቢያንስ $50.00 ዶላር ማውጣት አለብዎት ወይም ቢያንስ 3 ቀጥታ አባላትን መጋበዝ አለብዎት። አሁን ያሉዎት አባላት ቁጥር፡ ${referralCount} ነው።`
      );
      return;
    }

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
    alert(lang === 'en' ? "Withdrawal requested successfully!" : "የገንዘብ ማውታት ጥያቄ በተሳካ ሁኔታ ተልኳል!");
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
      alert(lang === 'en' 
        ? "Inadequate balance to activate this portfolio. Redirecting you to the Deposit page to top up!" 
        : "የመረጡትን እቅድ ለመጀመር በቂ ቀሪ ሂሳብ የለዎትም። ገንዘብ ለማስገባት ወደ ሂሳብ መሙያ ገጽ እየተዘዋወሩ ነው!");
      setSubView('deposit');
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
            <button onClick={() => setSubView('tasks')} className={`cursor-pointer ${subView === 'tasks' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Bounty Tasks' : 'የስራ ተግባራት'}</button>
            <button onClick={() => setSubView('p2p')} className={`cursor-pointer ${subView === 'p2p' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'P2P Exchange' : 'የ P2P ግብይት'}</button>
            <button onClick={() => setSubView('deposit')} className={`cursor-pointer ${subView === 'deposit' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Deposit' : 'ገንዘብ ማስገባት'}</button>
            <button onClick={() => setSubView('withdraw')} className={`cursor-pointer ${subView === 'withdraw' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Withdraw' : 'ገንዘብ ማውጣት'}</button>
            <button onClick={() => setSubView('referrals')} className={`cursor-pointer ${subView === 'referrals' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Affiliate' : 'ተባባሪዎች'}</button>
            <button onClick={() => setSubView('profile')} className={`cursor-pointer ${subView === 'profile' ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'Account Profile' : 'የመለያ መገለጫ'}</button>
          </nav>
        </div>

        {/* Real-time Ticker Pill in Header */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-950/60 border border-slate-900 rounded-full pl-3.5 pr-4 py-1.5 shadow-inner select-none">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 duration-700 bg-emerald-400"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">{lang === 'en' ? 'LIVE DEFI:' : 'የቀጥታ ትርፍ:'}</span>
          <span className={`font-mono text-xs font-black text-right min-w-[85px] tracking-tight transition-all duration-300 ${profitPing ? 'text-emerald-400 scale-[1.05]' : 'text-amber-550'}`}>
            ${liveDailyProfit.toFixed(5)}
          </span>
          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-black font-mono">
            SEC
          </span>
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

      {/* Mobile Sticky Control Bar under header with 7 options */}
      <div className="md:hidden bg-slate-900/60 border-b border-slate-950 grid grid-cols-7 text-[8px] text-center font-bold text-slate-400 leading-tight">
        <button onClick={() => setSubView('dashboard')} className={`py-2.5 ${subView === 'dashboard' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Overview' : 'እይታ'}</button>
        <button onClick={() => setSubView('plans')} className={`py-2.5 ${subView === 'plans' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Invest' : 'ፈሰስ'}</button>
        <button onClick={() => setSubView('tasks')} className={`py-2.5 ${subView === 'tasks' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Tasks' : 'ተግባራት'}</button>
        <button onClick={() => setSubView('p2p')} className={`py-2.5 ${subView === 'p2p' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'P2P' : 'ተግባር'}</button>
        <button onClick={() => setSubView('deposit')} className={`py-2.5 ${subView === 'deposit' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Deposit' : 'ማስገቢያ'}</button>
        <button onClick={() => setSubView('withdraw')} className={`py-2.5 ${subView === 'withdraw' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Payout' : 'ማውጫ'}</button>
        <button onClick={() => setSubView('profile')} className={`py-2.5 ${subView === 'profile' ? 'text-amber-500 bg-amber-500/5' : ''}`}>{lang === 'en' ? 'Security' : 'ደህንነት'}</button>
      </div>

      {/* Mobile Real-time ticker strip */}
      <div className="md:hidden bg-slate-950 border-b border-slate-900 px-4 py-1.5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 font-extrabold uppercase font-mono text-[8px]">{lang === 'en' ? 'LIVE RETURNS:' : 'የቀጥታ ትርፍ:'}</span>
        </div>
        <span className={`font-mono font-black text-amber-500 text-xs transition-all duration-300 ${profitPing ? 'text-emerald-400 scale-105' : ''}`}>
          ${liveDailyProfit.toFixed(5)}
        </span>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {user.status === 'suspended' && (
          <div className="mb-8 p-6 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-4 text-red-400 font-semibold text-sm">
            <span>🛡️ Warning: Your account is suspended. Your dashboard statistics are currently read-only. Contact Support.</span>
          </div>
        )}

        {/* ================= VIEW: OVERVIEW DASHBOARD ================= */}
        {subView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Deposit Cash Booster Alert Bar */}
            {depositCashAlert && user.status !== 'suspended' && (
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-950/20">
                <div className="flex items-start gap-3 text-amber-500 text-sm">
                  <div className="p-2 bg-amber-500/10 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-550" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-extrabold text-sm">{lang === 'en' ? '⚠️ Unlock Continuous Compounding Wealth Velocity!' : '⚠️ የቀጥታ የትርፍ ፍጥነትዎን በአስቸኳይ ያሳድጉ!'}</h4>
                    <p className="text-xs text-slate-400 leading-normal max-w-xl">
                      {lang === 'en' 
                        ? 'Your current liquidity is minimal ($0 - $50). To active high-tier mining brackets and fully execute smart trade contracts, top up your balance now.' 
                        : 'አሁን ያለው ማስቀመጫ ቀሪ ሂሳብዎ አነስተኛ ነው። ከፍተኛ ትርፍ የሚመዘግቡ የንግድ እቅዶችን ለመጀመር እና የቀጥታ አጠቃላይ ትርፍዎን ለማጎልበት አሁኑኑ ገንዘብ ያስገቡ።'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSubView('deposit')} 
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg hover:scale-103 shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                  {lang === 'en' ? 'Deposit Cash' : 'ገንዘብ አስገባ'}
                </button>
              </div>
            )}

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
              <div className={`bg-slate-900/60 border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${profitPing ? 'border-emerald-500/30 bg-[#041214]/65 shadow-[0_0_15px_rgba(16,185,129,0.08)]' : 'border-slate-850 hover:border-amber-500/20'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.dailyProfit}</span>
                  <div className={`p-2 rounded-xl transition-colors duration-300 ${profitPing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-450'}`}><Plus className="w-5 h-5 text-amber-500" /></div>
                </div>
                <h3 className={`text-3xl font-black leading-none tracking-tight transition-all duration-300 ${profitPing ? 'text-emerald-400 scale-[1.01]' : 'text-white'}`}>
                  ${liveDailyProfit.toFixed(5)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-3.5 flex items-center gap-1.5 font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  {lang === 'en' ? 'Compounding live returns' : 'የቀጥታ ገቢ ማደግ ቀጣይ ነው'}
                </p>
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

            {/* Real-time Crypto Coins Market Indexes and Charts */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-amber-500 font-extrabold uppercase font-mono tracking-widest block mb-0.5">{lang === 'en' ? 'HIGH-FREQUENCY SPREADS' : 'ቀጥታ የገበያ መረጃዎች'}</span>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
                    {lang === 'en' ? 'Live Algorithmic Market Assets' : 'የቀጥታ ስምምነት ኢንዴክሶች'}
                  </h3>
                </div>
                <div className="self-start sm:self-center px-3 py-1 bg-slate-950/80 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1.5 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{lang === 'en' ? 'Ticking feed' : 'ቀጥታ ስርጭት'} 1.8s</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coins.map((coin) => {
                  const isPositive = coin.change >= 0;
                  const chartData = coin.sparkline.map((val: number, idx: number) => ({
                    idx,
                    price: val
                  }));
                  
                  return (
                    <div 
                      key={coin.symbol} 
                      className="bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-all rounded-3xl p-5 flex flex-col justify-between group overflow-hidden relative"
                    >
                      {/* Aura */}
                      <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full blur-xl opacity-10 pointer-events-none transition-colors duration-500 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />

                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-center font-bold font-mono text-xs text-amber-500">
                              {coin.symbol[0]}
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-white leading-tight">{coin.name}</h4>
                              <span className="text-[10px] text-slate-550 font-bold font-mono uppercase tracking-wider">{coin.symbol}/USDT</span>
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-black font-mono px-2 py-0.5 rounded-md ${
                            isPositive 
                              ? 'text-emerald-400 bg-emerald-500/10' 
                              : 'text-red-400 bg-red-500/10'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
                          </span>
                        </div>

                        <div className="my-1">
                          <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider">{lang === 'en' ? 'INDEX VALUE' : 'ዋጋ'}</span>
                          <span className="text-xl font-mono font-black text-white leading-none tracking-tight">
                            ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                          </span>
                        </div>
                      </div>

                      {/* Mini Area Chart with Recharts */}
                      <div className="h-[75px] w-full mt-4 select-none relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                            <defs>
                              <linearGradient id={`grad-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-slate-950/90 border border-slate-800 px-2 py-1 rounded text-[9px] font-mono font-extrabold text-white">
                                      ${parseFloat(payload[0].value as string).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '2 2' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke={isPositive ? '#10b981' : '#ef4444'} 
                              strokeWidth={1.8} 
                              fillOpacity={1} 
                              fill={`url(#grad-${coin.symbol})`} 
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
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
                    <div className="space-y-1">
                      <p>🏦 {lang === 'en' ? 'Please complete your bank transfer via Commercial Bank of Ethiopia (CBE).' : 'እባክዎ በኢትዮጵያ ንግድ ባንክ (CBE) በኩል ሐዋላውን ያጠናቅቁ።'}</p>
                      <p className="text-slate-400 font-semibold text-[11px] mt-1">
                        {lang === 'en' ? "To complete deposit, enter your personal bank account number or receipt reference manually in the field below." : "ገንዘቡን ለማስገባት የእርስዎን ግላዊ የባንክ ሂሳብ ቁጥር ከታች ባለው የአካውንት ቁጥር መሙያ በእጅዎ ይፃፉ።"}
                      </p>
                    </div>
                  )}
                  {depMethod.includes('Telebirr') && (
                    <div className="space-y-1">
                      <p>📱 {lang === 'en' ? 'Please complete your Telebirr application direct transfer.' : 'እባክዎ በቴሌብር ቀጥታ ማስተላለፍ ክፍያውን ያስተላልፉ።'}</p>
                      <p className="text-slate-400 font-semibold text-[11px] mt-1">
                        {lang === 'en' ? "To complete deposit, enter your Telebirr phone number or transaction reference manually in the field below." : "ገንዘቡን ለማስገባት የቴሌብር ስልክ ቁጥርዎን ወይም የማጣቀሻ ቁጥርዎን ከታች በእጅዎ ይፃፉ።"}
                      </p>
                    </div>
                  )}
                  {depMethod.includes('USDT') && (
                    <div className="space-y-1">
                      <p>🪙 {lang === 'en' ? 'Please submit your payment using Tron network USDT.' : 'እባክዎ በUSDT (TRC-20) በኩል የተከፈለበትን ማስተላለፊያ ይፈጽሙ።'}</p>
                      <p className="text-slate-400 font-semibold text-[11px] mt-1">
                        {lang === 'en' ? "To complete deposit, paste your crypto sender wallet address or TxID hash manually in the field below." : "ገንዘቡን ለማስገባት የእርስዎን የኪስ አድራሻ ወይም የስምምነቱ መለያ (hash) ከታች በእጅዎ ይፃፉ።"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Manual Account Number Dialogue Box */}
                <div className="bg-slate-950 p-5 border border-amber-500/25 rounded-2xl space-y-3 shadow-inner">
                  <div>
                    <label className="text-amber-500 text-xs font-bold uppercase tracking-wider block mb-1">
                      {lang === 'en' ? 'Account Number Input (Manually)' : 'የሂሳብ ቁጥር በእጅ መሙያ (አካውንት ቁጥር)'} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 block mb-2">
                      {lang === 'en' 
                        ? "Please fill in the manual bank account number or transfer reference details here:" 
                        : "እባክዎን ያስተላለፉበትን የባንክ ሂሳብ ቁጥር በሚገባ እዚህ ጋር በእጅዎ ይሙሉ፡"}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={
                      depMethod.includes('CBE') 
                        ? (lang === 'en' ? "Enter your CBE Account Number (e.g. 1000...)" : "የCBE ሂሳብ ቁጥርዎን ያስገቡ")
                        : depMethod.includes('Telebirr')
                          ? (lang === 'en' ? "Enter your Telebirr registration phone (e.g. 09...)" : "የቴሌብር ስልክ ቁጥርዎን ያስገቡ")
                          : (lang === 'en' ? "Enter TRC-20 Wallet Address / transaction hash" : "የTRC-20 የኪስ አድራሻ ወይም Hash ያስገቡ")
                    }
                    value={userAccountNo}
                    onChange={(e) => setUserAccountNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-xl text-sm px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  />
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
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />
                <span className="text-xs text-slate-400 block mb-1 font-bold">{lang === 'en' ? 'Total Group Size' : 'ጠቅላላ የኔትወርክ አባላት'}</span>
                <p className="text-3xl font-black text-white">{allReferrals.length} {lang === 'en' ? 'Agents' : 'ወኪሎች'}</p>
                <div className="text-[10px] text-slate-500 mt-1 flex gap-2">
                  <span>L1: {level1.length}</span>
                  <span>•</span>
                  <span>L2: {level2.length}</span>
                  <span>•</span>
                  <span>L3: {level3.length}</span>
                </div>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
                <span className="text-xs text-slate-400 block mb-1 font-bold">{lang === 'en' ? 'Total Active Portfolios' : 'የአባላት ንቁ ጥቅል ኢንቨስትመንት'}</span>
                <p className="text-3xl font-black text-amber-500">${totalNetworkInvestment.toFixed(2)} USD</p>
                <span className="text-[10px] text-emerald-400 mt-1 block font-bold flex items-center gap-1">
                  <span>●</span> {activeReferralsCount} {lang === 'en' ? 'Active Members Funding' : 'ንቁ ጥቅል ያሏቸው'}
                </span>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
                <span className="text-xs text-slate-400 block mb-1 font-bold">{lang === 'en' ? 'Affiliate Yield Generated' : 'የተከፈለዎት የሪፈራል ትርፍ'}</span>
                <p className="text-3xl font-black text-emerald-400">${user.referralIncome.toFixed(2)} USD</p>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {lang === 'en' ? `Estimated incoming commission: $${estimatedCommission.toFixed(2)}` : `የሚጠበቅ የአባላት ኮሚሽን፡ $${estimatedCommission.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Tree visualization panel */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    🌳 {lang === 'en' ? 'My Referral Network Tree' : 'የኔትወርክ አወቃቀር ዛፍ'}
                  </h3>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Explore your downlines, track activation rates and secure affiliate nodes.' : 'የአጋርነት ኔትወርክዎን ንቁ ሁኔታ ይከታተሉ፣ በደረጃ የሚሰበስቡትን ኮሚሽን ይመልከቱ።'}</p>
                </div>

                <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${viewMode === 'tree' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {lang === 'en' ? 'Tree Diagramed Map' : 'ባለ መስመር ዛፍ'}
                  </button>
                  <button
                    onClick={() => setViewMode('tiers')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${viewMode === 'tiers' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {lang === 'en' ? 'Tier Group Lists' : 'በደረጃ የተከፋፈለ ዝርዝር'}
                  </button>
                </div>
              </div>

              {/* Filtering bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <input
                    type="text"
                    placeholder={lang === 'en' ? "Search team username, email, phone..." : "የአባል ስም፣ ኢሜይል ወይም ስልክ ይመድቡ..."}
                    value={refSearch}
                    onChange={(e) => setRefSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-xs px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {refSearch && (
                    <button 
                      onClick={() => setRefSearch('')} 
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-white text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <select
                  value={refStatusFilter}
                  onChange={(e) => setRefStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl text-xs px-4 py-3 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">{lang === 'en' ? "Filter Status: All Members" : "ሁኔታ፡ ሁሉንም አባላት"}</option>
                  <option value="active">{lang === 'en' ? "Filter Status: Active (Investing)" : "ሁኔታ፡ ንቁ ጥቅል ያላቸው"}</option>
                  <option value="suspended">{lang === 'en' ? "Filter Status: Suspended Nodes" : "ሁኔታ፡ የታገዱ አካውንቶች"}</option>
                </select>
              </div>

              {/* CONTENT AREA: TIER GROUP LISTS */}
              {viewMode === 'tiers' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tier Level 1 Card list */}
                  <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-xs text-amber-500 font-extrabold block">🌳 Tier Level 1 (Direct)</span>
                        <span className="text-[10px] text-slate-500 block">10.0% Payout multipliers</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                        {level1.length} {lang === 'en' ? 'Agents' : 'ወኪሎች'}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {level1.filter(matchesSearchAndFilter).length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-600">
                          {lang === 'en' ? 'No Tier 1 matching conditions.' : 'በደረጃ 1 የተመዘገበ አባል የለም።'}
                        </div>
                      ) : (
                        level1.filter(matchesSearchAndFilter).map(u => {
                          const lvl2Downs = level2.filter(u2 => u2.referredBy === u.referralCode).length;
                          return (
                            <div key={u.id} className="p-3.5 bg-slate-900/60 border border-slate-850/50 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-white font-bold text-xs">@{u.username}</span>
                                  <span className="text-[9px] text-slate-500 font-mono block">Code: {u.referralCode}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${u.status === 'suspended' ? 'bg-red-500/10 text-red-500' : (u.activeInvestment > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400')}`}>
                                  {u.status === 'suspended' ? 'Suspended' : (u.activeInvestment > 0 ? 'Active' : 'Unfunded')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>Portfolio: <strong className="text-amber-500">${u.activeInvestment ? u.activeInvestment.toFixed(2) : '0.00'}</strong></span>
                                <span>Yields: <strong className="text-emerald-400">${((u.activeInvestment || 0) * 0.10).toFixed(2)}</strong></span>
                              </div>
                              <div className="text-[9px] text-slate-500 flex justify-between border-t border-slate-850/30 pt-1.5">
                                <span>Joined: {new Date(u.registrationDate).toLocaleDateString()}</span>
                                <span className="font-semibold text-amber-500">{lvl2Downs} downline agents</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Tier Level 2 Card list */}
                  <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-xs text-teal-400 font-extrabold block">🌿 Tier Level 2 (Indirect)</span>
                        <span className="text-[10px] text-slate-500 block">5.0% Payout multipliers</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                        {level2.length} {lang === 'en' ? 'Agents' : 'ወኪሎች'}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {level2.filter(matchesSearchAndFilter).length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-600">
                          {lang === 'en' ? 'No Tier 2 matching conditions.' : 'በደረጃ 2 የተመዘገበ አባል የለም።'}
                        </div>
                      ) : (
                        level2.filter(matchesSearchAndFilter).map(u => {
                          const referrerL1 = level1.find(x => x.referralCode === u.referredBy);
                          return (
                            <div key={u.id} className="p-3.5 bg-slate-900/60 border border-slate-850/50 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-white font-bold text-xs">@{u.username}</span>
                                  <span className="text-[9px] text-slate-500 block">Invited by: @{referrerL1 ? referrerL1.username : 'Unknown'}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${u.status === 'suspended' ? 'bg-red-500/10 text-red-500' : (u.activeInvestment > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400')}`}>
                                  {u.status === 'suspended' ? 'Suspended' : (u.activeInvestment > 0 ? 'Active' : 'Unfunded')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>Portfolio: <strong className="text-amber-500">${u.activeInvestment ? u.activeInvestment.toFixed(2) : '0.00'}</strong></span>
                                <span>Yields: <strong className="text-emerald-400">${((u.activeInvestment || 0) * 0.05).toFixed(2)}</strong></span>
                              </div>
                              <div className="text-[9px] text-slate-500 flex justify-between border-t border-slate-850/30 pt-1.5">
                                <span>Joined: {new Date(u.registrationDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Tier Level 3 Card list */}
                  <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-xs text-sky-400 font-extrabold block">🍃 Tier Level 3 (Deep)</span>
                        <span className="text-[10px] text-slate-500 block">2.5% Payout multipliers</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                        {level3.length} {lang === 'en' ? 'Agents' : 'ወኪሎች'}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {level3.filter(matchesSearchAndFilter).length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-600">
                          {lang === 'en' ? 'No Tier 3 matching conditions.' : 'በደረጃ 3 የተመዘገበ አባል የለም።'}
                        </div>
                      ) : (
                        level3.filter(matchesSearchAndFilter).map(u => {
                          const l2Parent = level2.find(x => x.referralCode === u.referredBy);
                          return (
                            <div key={u.id} className="p-3.5 bg-slate-900/60 border border-slate-850/50 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-white font-bold text-xs">@{u.username}</span>
                                  <span className="text-[9px] text-slate-500 block">Invited by: @{l2Parent ? l2Parent.username : 'Unknown'}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${u.status === 'suspended' ? 'bg-red-500/10 text-red-500' : (u.activeInvestment > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400')}`}>
                                  {u.status === 'suspended' ? 'Suspended' : (u.activeInvestment > 0 ? 'Active' : 'Unfunded')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>Portfolio: <strong className="text-amber-500">${u.activeInvestment ? u.activeInvestment.toFixed(2) : '0.00'}</strong></span>
                                <span>Yields: <strong className="text-emerald-400">${((u.activeInvestment || 0) * 0.025).toFixed(2)}</strong></span>
                              </div>
                              <div className="text-[9px] text-slate-500 flex justify-between border-t border-slate-850/30 pt-1.5">
                                <span>Joined: {new Date(u.registrationDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT AREA: INTERACTIVE VISUAL NETWORK TREE */}
              {viewMode === 'tree' && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4 overflow-x-auto min-w-[320px]">
                  {/* Root Node (Current User) */}
                  <div className="bg-slate-900/80 border border-amber-500/35 rounded-2xl p-4 flex items-center justify-between shadow-md max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center text-lg font-bold shadow-inner animate-pulse">
                        👑
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-500 font-bold block uppercase tracking-wide">{lang === 'en' ? 'YOUR AFFILIATE NETWORK NODE' : 'የእርስዎ ሪፈራል መረብ'}</span>
                        <h4 className="text-xs font-black text-white">@{user.username} (You)</h4>
                        <span className="text-[10px] text-slate-500 font-mono">My Code: {user.referralCode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">{lang === 'en' ? 'Downline agents' : 'ጠቅላላ ተከታዮች'}</span>
                      <span className="text-xs font-mono font-black text-amber-500">{allReferrals.length} {lang === 'en' ? 'Members' : 'አባላት'}</span>
                    </div>
                  </div>

                  {/* Level 1 Nodes list */}
                  <div className="mt-4 ml-6 border-l-2 border-slate-850 pl-6 space-y-4 relative">
                    {level1.length === 0 ? (
                      <div className="text-xs text-slate-600 italic py-3 relative">
                        <div className="absolute top-4 -left-6 w-6 h-0.5 bg-slate-850" />
                        {lang === 'en' ? 'No Level 1 participants recruited yet.' : 'በደረጃ 1 በኮድዎ የተመዘገበ አባል የለም።'}
                      </div>
                    ) : (
                      level1.map((l1) => {
                        const l2UnderL1 = level2.filter(u2 => u2.referredBy === l1.referralCode);
                        const isExpanded = !!expandedNodes[l1.id];
                        const showL1 = matchesSearchAndFilter(l1) || l2UnderL1.some(matchesSearchAndFilter);

                        if (!showL1) return null;

                        return (
                          <div key={l1.id} className="relative">
                            {/* Horizontal Line connector from vertical border-l-2 */}
                            <div className="absolute top-6 -left-6 w-6 h-0.5 bg-slate-850" />

                            <div className="bg-slate-900 border border-slate-850 hover:border-amber-500/20 rounded-2xl p-4 flex items-center justify-between transition-all max-w-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                                  {l1.username[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-white">@{l1.username}</h4>
                                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">L1</span>
                                    {l1.status === 'suspended' && (
                                      <span className="text-[8px] bg-red-500/15 text-red-500 px-1 rounded font-bold">Suspended</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {lang === 'en' ? 'Active investment:' : 'ንቁ ኢንቨስትመንት፡'} <strong className="text-amber-500">${l1.activeInvestment ? l1.activeInvestment.toFixed(2) : '0.00'}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {l2UnderL1.length > 0 && (
                                  <button
                                    onClick={() => toggleNode(l1.id)}
                                    className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded-xl text-[10px] font-black border border-slate-850 transition-colors cursor-pointer"
                                  >
                                    <span>{l2UnderL1.length} {lang === 'en' ? 'Direct L2' : 'ደረጃ 2'}</span>
                                    <span className="text-[9px]">{isExpanded ? '▲' : '▼'}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Level 2 Nodes nested under Level 1 */}
                            {isExpanded && l2UnderL1.length > 0 && (
                              <div className="mt-4 ml-6 border-l-2 border-teal-500/20 pl-6 space-y-4 relative">
                                {l2UnderL1.map((l2) => {
                                  const l3UnderL2 = level3.filter(u3 => u3.referredBy === l2.referralCode);
                                  const isL2Expanded = !!expandedNodes[l2.id];
                                  const showL2 = matchesSearchAndFilter(l2) || l3UnderL2.some(matchesSearchAndFilter);

                                  if (!showL2) return null;

                                  return (
                                    <div key={l2.id} className="relative">
                                      <div className="absolute top-6 -left-6 w-6 h-0.5 bg-teal-500/20" />

                                      <div className="bg-slate-900/60 border border-slate-850/60 hover:border-teal-500/20 rounded-2xl p-3.5 flex items-center justify-between transition-all max-w-md">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                                            {l2.username[0]}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <h5 className="text-[11px] font-bold text-white">@{l2.username}</h5>
                                              <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/15 px-1 py-0.2 rounded font-bold">L1 → L2</span>
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                              {lang === 'en' ? 'Active funding:' : 'ንቁ ጥቅል፡'} <strong className="text-teal-400">${l2.activeInvestment ? l2.activeInvestment.toFixed(2) : '0.00'}</strong>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {l3UnderL2.length > 0 && (
                                            <button
                                              onClick={() => toggleNode(l2.id)}
                                              className="flex items-center gap-0.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded-lg text-[9px] border border-slate-850 transition-colors cursor-pointer"
                                            >
                                              <span>{l3UnderL2.length} L3</span>
                                              <span>{isL2Expanded ? '▲' : '▼'}</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Level 3 Nodes nested under Level 2 */}
                                      {isL2Expanded && l3UnderL2.length > 0 && (
                                        <div className="mt-4 ml-6 border-l-2 border-sky-500/20 pl-6 space-y-4 relative">
                                          {l3UnderL2.map((l3) => {
                                            if (!matchesSearchAndFilter(l3)) return null;

                                            return (
                                              <div key={l3.id} className="relative">
                                                <div className="absolute top-5 -left-6 w-6 h-0.5 bg-sky-500/20" />

                                                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-3 flex items-center justify-between transition-all max-w-sm">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-[10px] uppercase shadow-inner">
                                                      {l3.username[0]}
                                                    </div>
                                                    <div>
                                                      <div className="flex items-center gap-1">
                                                        <h6 className="text-[10px] font-bold text-white">@{l3.username}</h6>
                                                        <span className="text-[7px] bg-sky-500/10 text-sky-400 border border-sky-500/15 px-1 py-0.2 rounded font-mono">L3</span>
                                                      </div>
                                                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                                                        Active: <strong>${l3.activeInvestment ? l3.activeInvestment.toFixed(2) : '0.00'}</strong>
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW: BOUNTY TASKS AND COMMISSIONS ================= */}
        {subView === 'tasks' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header description */}
            <div className="bg-[#090f1d] rounded-3xl p-8 border border-slate-900/60 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-500 font-extrabold block uppercase tracking-widest mb-1">AUTOMATED BROADCAST SYSTEM</span>
                  <h2 className="text-2xl font-black text-white mb-2">
                    🏆 Bounty & High-Commission Tasks Arena
                  </h2>
                  <p className="text-slate-400 text-xs max-w-2xl">
                    Complete the decentralized verification steps listed below to unlock substantial instant claimable commissions. Your account balance is directly credited upon successful verification.
                  </p>
                </div>
                <div className="bg-slate-950/80 px-4 py-2 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-500">
                  ⚡ INSTANT BLOCKCHAIN SETTLED
                </div>
              </div>

              {/* Status Widgets Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-900">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Completed Tasks</span>
                  <span className="text-2xl font-black text-white font-mono">{claimedTaskIds.length} <span className="text-xs text-slate-600">/ 6 Verified</span></span>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Commissions Cleared</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">+${highCommissionTasks.filter(t => claimedTaskIds.includes(t.id)).reduce((sum, t) => sum + t.reward, 0).toFixed(2)} USD</span>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Remaining Bounty Pool</span>
                  <span className="text-2xl font-black text-amber-500 font-mono tracking-tight">${highCommissionTasks.filter(t => !claimedTaskIds.includes(t.id)).reduce((sum, t) => sum + t.reward, 0).toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* List of Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highCommissionTasks.map((task) => {
                const isClaimed = claimedTaskIds.includes(task.id);
                const currentInput = taskInputs[task.id] || '';

                return (
                  <div key={task.id} className={`bg-[#080d19]/60 border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${isClaimed ? 'border-emerald-500/20 bg-emerald-950/5 opacity-85' : 'border-slate-900 hover:border-amber-500/20 shadow-lg'}`}>
                    {isClaimed && (
                      <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                        <Check className="w-3 h-3" /> CLAIMED & AUDITED
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-amber-500/5 text-amber-500 rounded-xl border border-amber-500/10 text-xs font-black uppercase tracking-wider">
                          TASK
                        </div>
                        {!isClaimed && (
                          <span className="text-xs bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl shadow font-mono">
                            +${task.reward.toFixed(2)} USD
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                          {lang === 'en' ? task.title : task.titleAm}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2">
                          {lang === 'en' ? task.description : task.descriptionAm}
                        </p>
                      </div>

                      {task.helpText && !isClaimed && (
                        <p className="text-[10px] text-amber-500/80 font-mono italic">
                          💡 {task.helpText}
                        </p>
                      )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-900">
                      {isClaimed ? (
                        <div className="w-full bg-emerald-500/5 text-emerald-400 text-center py-3 rounded-xl border border-emerald-500/10 font-black text-[10px] tracking-wider uppercase">
                          ✓ Settled & Credited
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {task.actionType === 'quiz' ? (
                            <div className="space-y-2">
                              <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest block">Choose Arbitrage Spreads:</label>
                              <div className="grid grid-cols-1 gap-2">
                                {task.options?.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setTaskInputs(prev => ({ ...prev, [task.id]: opt }))}
                                    className={`w-full text-left text-xs p-3 rounded-xl border transition-all cursor-pointer ${currentInput === opt ? 'border-amber-500 bg-amber-500/5 text-white font-bold' : 'border-slate-850 hover:border-slate-800 text-slate-400 bg-slate-950/60'}`}
                                  >
                                    <span className="mr-2 font-black">{currentInput === opt ? '●' : '○'}</span>
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1.5">Enter verification details:</label>
                              <input
                                type="text"
                                placeholder={task.placeholder}
                                value={currentInput}
                                onChange={(e) => setTaskInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50"
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleClaimTask(task.id, task.reward, task.correctAnswer)}
                            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-amber-500/30 text-amber-500 hover:text-amber-400 font-extrabold text-[10px] py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-md"
                          >
                            Claim Commissions +${task.reward.toFixed(2)} USD
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW: P2P ECOSYSTEM & ESCROW ================= */}
        {subView === 'p2p' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* P2P Header description */}
            <div className="bg-[#090f1d] rounded-3xl p-8 border border-slate-900/60 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] text-amber-500 font-extrabold block uppercase tracking-widest mb-1 font-mono">PEER-TO-PEER BANK EXCHANGE NODES</span>
                  <h2 className="text-2xl font-black text-white mb-2">
                    🛒 Secure P2P Escrow & Remittance Terminal
                  </h2>
                  <p className="text-slate-400 text-xs max-w-2xl">
                    Seamlessly buy, sell, and transfer USD to local Ethiopian Birr (ETB) with our verified secure escrow system. To protect your capital, ApexInvest secures all transacted USD in temporary locking nodes until bank trade clearance is confirmed.
                  </p>
                </div>
                <div className="bg-slate-950/80 px-4 py-2.5 border border-slate-900 rounded-xl flex items-center gap-2 text-[10px] text-amber-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>CBE / TELEBIRR ESCROW NODES ACTIVE</span>
                </div>
              </div>
            </div>

            {/* P2P Main Split Board */}
            {!user.isKycVerified ? (
              <div className="bg-[#090f1d]/60 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto space-y-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white">🔒 Security Identity Verification Required</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                    To access the secure Peer-to-Peer local market tab, your account must undergo physical verification.
                  </p>
                  <p className="text-amber-500 font-mono text-[10px] uppercase font-bold">
                    * The KYC process is securely completed on your profile page tab.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubView('profile')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md hover:scale-[1.01]"
                  >
                    <span>Click to Verify KYC on Profile Tab</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Listings and Forms (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Buy USD Listings */}
                <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>📥 Buy USD with ETB (Apex Escrow Listings)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose a verified local merchant to buy USD safely. Payments are backed instantly by locked escrow.
                    </p>
                  </div>

                  {/* Listings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p2pListings.map((list) => (
                      <div key={list.id} className="p-5 bg-slate-950/80 rounded-2xl border border-slate-850 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-white tracking-wide">@{list.name}</span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold font-mono">
                              ⭐ {list.score} ({list.completed} trades)
                            </span>
                          </div>

                          <div className="space-y-1 mt-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Rate:</span>
                              <strong className="text-white font-mono">{list.rate.toFixed(2)} ETB / 1 USD</strong>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Limits:</span>
                              <span className="text-slate-300 font-mono">${list.limitMin} - ${list.limitMax} USD</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-slate-900 mt-1">
                              <span className="text-slate-500">Payment:</span>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {list.methods.map((m) => (
                                  <span key={m} className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-500 text-[8px] font-bold">
                                    {m === 'Commercial Bank of Ethiopia (CBE)' ? 'CBE' : 'Telebirr'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (user.status === 'suspended') {
                              alert(lang === 'en' ? "Suspended accounts cannot buy USD." : "የታገዱ ሂሳቦች ዶላር መግዛት አይችሉም።");
                            } else {
                              setP2pSelectedListing(list);
                            }
                          }}
                          className="w-full bg-[#0a0f20] hover:bg-amber-500 hover:text-slate-950 border border-slate-850 hover:border-transparent text-amber-500 font-extrabold text-[10px] py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer text-center"
                        >
                          Buy USD
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Active Selected Order Box */}
                  {p2pSelectedListing && (
                    <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                        <div>
                          <span className="text-[10px] text-amber-500 font-bold block uppercase font-mono">CONVERT USD DEPOSIT VIA ESCROW</span>
                          <h4 className="text-xs font-black text-white uppercase">Initialize trade with @{p2pSelectedListing.name}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setP2pSelectedListing(null)}
                          className="text-xs text-slate-500 hover:text-white cursor-pointer"
                        >
                          ✕ Close Form
                        </button>
                      </div>

                      <form onSubmit={handleInitiateBuyEscrow} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block mb-1.5">USD Amount to Buy:</label>
                            <input
                              type="number"
                              min={p2pSelectedListing.limitMin}
                              max={p2pSelectedListing.limitMax}
                              placeholder={`Min ${p2pSelectedListing.limitMin} - Max ${p2pSelectedListing.limitMax}`}
                              value={buyUsdAmount}
                              onChange={(e) => setBuyUsdAmount(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block mb-1.5">Equivalent Cost in ETB:</label>
                            <div className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-amber-500 font-mono flex items-center justify-between">
                              <span>Rate: {p2pSelectedListing.rate} ETB</span>
                              <span>
                                {buyUsdAmount ? (parseFloat(buyUsdAmount) * p2pSelectedListing.rate).toLocaleString() : '0.00'} ETB
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] py-3 rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Initiate Lock Escrow & Buy USD
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* 2. Sell USD to ETB Form */}
                <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                      📤 Sell USD to ETB (Instant Escrow Placement)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sell your active balance USD to receive local bank bank-transfer payments in Ethiopian Birr. Your USD is secure in escrow.
                    </p>
                  </div>

                  <form onSubmit={handleInitiateSellEscrow} className="bg-slate-950/60 p-6 rounded-2xl border border-slate-850 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">USD Amount to Sell:</label>
                        <input
                          type="number"
                          placeholder="e.g. 150"
                          value={sellUsdAmount}
                          onChange={(e) => setSellUsdAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                          required
                        />
                        <span className="text-[9px] text-slate-500 mt-1 block font-mono">Available: ${user.balance.toFixed(2)} USD</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Conversion rate (ETB):</label>
                        <input
                          type="number"
                          step="0.05"
                          value={sellRate}
                          onChange={(e) => setSellRate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                          required
                        />
                        <span className="text-[9px] text-amber-500 mt-1 block font-mono">Standard Market Average: 118.50 ETB</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Local Target Bank / Method:</label>
                        <select
                          value={sellBank}
                          onChange={(e) => setSellBank(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        >
                          <option>Commercial Bank of Ethiopia (CBE)</option>
                          <option>Telebirr Pay</option>
                          <option>Abyssinia Bank (BOA)</option>
                          <option>Awash International Bank</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Your Account Number / Phone ID:</label>
                      <input
                        type="text"
                        placeholder="e.g. 100034827183 or +2519..."
                        value={sellAccount}
                        onChange={(e) => setSellAccount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-amber-500/30 text-amber-500 font-extrabold text-[10px] py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Open Escrow Contract & Sell
                    </button>
                  </form>
                </div>

                {/* 3. Direct Peer USD Transfer */}
                <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                      💸 Direct Account USD Transfer (Instant Remittance)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Instantly send USD directly from your balance to another user on the ApexInvest network without paying fees. Zero block processing lag.
                    </p>
                  </div>

                  <form onSubmit={handleDirectTransfer} className="bg-slate-950/60 p-6 rounded-2xl border border-slate-850 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Receiver Username or Email:</label>
                        <input
                          type="text"
                          placeholder="e.g. haile99 or user@example.com"
                          value={transferTarget}
                          onChange={(e) => setTransferTarget(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">USD Amount to Transfer:</label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-transparent text-white font-extrabold text-[10px] py-3 rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Execute Direct Peer USD Transfer
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column: Escrow Settlements Log & Management (4 cols) */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#080d19]/80 rounded-3xl p-6 border border-slate-900 space-y-6 sticky top-24">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>🔒 LIVE ESCROW AUDIT CONTROL</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Check state controls or complete local bank deposit proofs here. Verified settlement is absolute.
                    </p>
                  </div>

                  {/* Escrows List */}
                  <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                    {escrows.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 text-xs font-medium">
                        No escrow contracts found. Let's trade!
                      </div>
                    ) : (
                      escrows.map((esc) => {
                        const isBuy = esc.type === 'buy';
                        const isPending = esc.status === 'pending_payment';
                        const isSubmitted = esc.status === 'submitted_proof';
                        const isReleased = esc.status === 'released';
                        const chatMessages = p2pChats[esc.id] || [];

                        return (
                          <div key={esc.id} className={`p-5 rounded-2xl border transition-all ${isReleased ? 'bg-slate-950/20 border-slate-900/60 opacity-75' : 'bg-slate-950 border-slate-850 shadow-md'}`}>
                            
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider block ${isBuy ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                  {isBuy ? 'INWARD BUY ESCROW' : 'OUTWARD SELL ESCROW'}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono mt-1 block">Created: {esc.createdAt}</span>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${isReleased ? 'bg-emerald-500/10 text-emerald-400' : (isSubmitted ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400')}`}>
                                {esc.status}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs border-y border-slate-900/80 py-2.5 my-3 font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Node counterparty:</span>
                                <span className="text-slate-300">@{esc.partyName}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span className="text-slate-500">USD Secured:</span>
                                <span className="text-white">${esc.usdAmount.toFixed(2)} USD</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Rate:</span>
                                <span className="text-slate-300">{esc.exchangeRate} ETB</span>
                              </div>
                              <div className="flex justify-between font-bold text-amber-500">
                                <span className="text-slate-500">Total ETB:</span>
                                <span>{esc.etbAmount.toLocaleString()} ETB</span>
                              </div>
                            </div>

                            {/* State Specific Controls */}
                            {isPending && isBuy && (
                              <div className="space-y-3 pt-2 text-[11px] leading-tight text-slate-300">
                                <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-800/10 text-slate-300">
                                  🏦 Send exactly <strong className="text-white">{esc.etbAmount.toLocaleString()} ETB</strong> via <strong>{esc.method}</strong> to account:
                                  <div className="font-mono text-center text-sm font-extrabold text-white bg-slate-900/80 p-2 rounded-lg mt-1 border border-slate-850">
                                    {esc.bankAccount}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[9px] text-slate-500 font-bold block uppercase font-mono">Transaction Ref / Reference ID:</label>
                                  <input
                                    type="text"
                                    id={`proof_input_${esc.id}`}
                                    placeholder="e.g. CBE2947183 or Telebirr ID"
                                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                  />
                                  
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const inputEl = document.getElementById(`proof_input_${esc.id}`) as HTMLInputElement;
                                        handleSubmitBuyProof(esc.id, inputEl?.value || '');
                                      }}
                                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[9px] py-2 rounded-lg uppercase tracking-wider text-center cursor-pointer"
                                    >
                                      Submit Proof
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelEscrow(esc.id)}
                                      className="bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 border border-slate-850 hover:border-red-500/20 px-2.5 py-2 rounded-lg text-[9px] uppercase tracking-wider cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {isPending && !isBuy && (
                              <div className="space-y-3 pt-2">
                                <p className="text-[11px] text-slate-400 leading-normal">
                                  ⌛ Secured in Apex escrow nodes. Wait for payment verification proof from the buyer.
                                </p>
                                <div className="flex gap-2 text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-900 text-slate-500 italic">
                                  <span>Simulating buyer response... (6s)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCancelEscrow(esc.id)}
                                  className="w-full bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 border border-slate-850 hover:border-red-500/20 py-2 rounded-lg text-[9px] uppercase tracking-wider cursor-pointer"
                                >
                                  Cancel Contract
                                </button>
                              </div>
                            )}

                            {isSubmitted && isBuy && (
                              <div className="pt-2 text-center text-[11px] text-amber-500 font-semibold space-y-1 bg-amber-500/5 py-4 rounded-xl border border-amber-500/10">
                                <div className="animate-spin inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full mb-1" />
                                <p className="block uppercase text-[8px] font-black tracking-widest">AUTOVERIFYING CBE/TELEBIRR NODES</p>
                                <p className="text-slate-400 font-mono text-[9px]">Ref code: {esc.proofRef}</p>
                              </div>
                            )}

                            {isSubmitted && !isBuy && (
                              <div className="pt-2 space-y-3">
                                <div className="bg-emerald-500/5 text-emerald-400 p-3 rounded-xl border border-emerald-500/15 text-[11px] leading-tight space-y-2">
                                  <p className="font-extrabold uppercase text-[9px] tracking-wide">⚠️ BUYER CLAIMED PAID!</p>
                                  <p>The buyer claimed to have sent <strong>{esc.etbAmount.toLocaleString()} ETB</strong>. Verification transaction hash:</p>
                                  <strong className="text-white block font-mono bg-slate-900 p-1.5 rounded text-center">{esc.proofRef}</strong>
                                  <p className="text-slate-400">Please confirm receipt of money into your bank bank-account before unlocking target USD.</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleReleaseSellFunds(esc.id)}
                                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] py-3 rounded-lg uppercase tracking-wide transition-all cursor-pointer text-center"
                                >
                                  Release USD Funds
                                </button>
                              </div>
                            )}

                            {isReleased && (
                              <div className="pt-2 text-center text-xs font-bold text-emerald-400 bg-emerald-500/5 rounded-xl py-3 border border-emerald-500/10 uppercase tracking-widest text-[9px]">
                                ✓ Node cleared & finished
                              </div>
                            )}

                            {/* Live Chat Tab / Window */}
                            <div className="mt-4 border-t border-slate-900 pt-4 space-y-3">
                              <div className="flex justify-between items-center bg-[#070b15] px-3 py-1.5 rounded-lg border border-slate-850">
                                <span className="text-[9px] text-amber-500 font-extrabold uppercase font-mono tracking-wider flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Trade Chat Room</span>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  <span className="text-[8px] text-slate-500 font-bold uppercase font-mono">Peer Online</span>
                                </span>
                              </div>

                              {/* Chat Messages Log */}
                              <div className="max-h-52 overflow-y-auto space-y-2.5 bg-slate-950 p-2 text.xs rounded-xl border border-slate-900 flex flex-col">
                                {chatMessages.length === 0 ? (
                                  <div className="text-center text-slate-650 text-[10px] py-4 italic">
                                    Connecting to secure node chat feed...
                                  </div>
                                ) : (
                                  chatMessages.map((msg) => {
                                    const isUser = msg.sender === 'user';
                                    return (
                                      <div key={msg.id} className={`flex flex-col p-2.5 rounded-xl text-xs space-y-1 max-w-[90%] ${isUser ? 'self-end bg-amber-500/10 text-slate-100 border border-amber-500/20' : 'self-start bg-slate-900 text-slate-300 border border-slate-850'}`}>
                                        <div className="flex justify-between items-center gap-3 text-[8px] text-slate-550 font-mono">
                                          <span className={`font-black uppercase ${isUser ? 'text-amber-500' : 'text-blue-400'}`}>
                                            {isUser ? 'Me' : msg.senderName}
                                          </span>
                                          <span>{msg.timestamp}</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed break-words">{msg.text}</p>
                                        {msg.screenshotUrl && (
                                          <div className="mt-2 p-1 bg-slate-950 rounded-lg border border-amber-500/20 max-w-[200px]">
                                            <img referrerPolicy="no-referrer" src={msg.screenshotUrl} alt="Receipt Screenshot" className="rounded max-h-32 object-contain" />
                                            <span className="text-[8px] text-amber-400 font-mono font-bold uppercase block text-center mt-1">📸 SCREENSHOT RECEIPT</span>
                                            {msg.isReceipt && !isUser && !isReleased && (
                                              <button
                                                type="button"
                                                onClick={() => handleApproveScreenshotInChat(esc.id)}
                                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] py-1.5 rounded mt-2 uppercase tracking-wider block text-center cursor-pointer"
                                              >
                                                ✓ Approve Screenshot
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Chat Input Bar */}
                              {!isReleased && (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={lang === 'en' ? "Write message..." : "መልእክት ይጻፉ..."}
                                      value={chatInputs[esc.id] || ''}
                                      onChange={(e) => setChatInputs(prev => ({ ...prev, [esc.id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSendChatMessage(esc.id, chatInputs[esc.id] || '');
                                        }
                                      }}
                                      className="flex-1 bg-slate-900 border border-slate-850 rounded-lg pl-3 pr-2 py-1.5 text-xs text-white focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSendChatMessage(esc.id, chatInputs[esc.id] || '')}
                                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 text-xs font-black rounded-lg uppercase cursor-pointer"
                                    >
                                      Send
                                    </button>
                                  </div>

                                  {isBuy && isPending && (
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <label className="flex-1 cursor-pointer">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const r = new FileReader();
                                              r.onload = () => {
                                                if (typeof r.result === 'string') {
                                                  handleSendChatScreenshot(esc.id, r.result);
                                                }
                                              };
                                              r.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                        <div className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg py-1 px-2.5 text-center transition-all flex items-center justify-center gap-1.5">
                                          <Camera className="w-3.5 h-3.5 text-amber-500" />
                                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upload Custom Photo</span>
                                        </div>
                                      </label>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const cbeReceipt = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=640&auto=format&fit=crop';
                                          handleSendChatScreenshot(esc.id, cbeReceipt);
                                        }}
                                        className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg uppercase tracking-wider"
                                      >
                                        ⚡ CBE Quick-Receipt
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
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

            {/* Manual Identity Verification (KYC) Hub */}
            {user.isKycVerified ? (
              <div className="md:col-span-3 bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 mt-8 animate-in fade-in duration-300 w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-wider">✓ Biometric KYC Verification Approved</h4>
                    <p className="text-[11px] text-slate-400">All local node escrow channels are secure and active for your account.</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase mb-2">Selfie Photo Record</span>
                    <img referrerPolicy="no-referrer" src={user.kycFacialPic || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop'} alt="Selfie" className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-emerald-500" />
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase mb-2">ID card scan</span>
                    {user.kycIdPic ? (
                      user.kycIdPic.startsWith('data:') ? (
                        <img src={user.kycIdPic} alt="ID Document" className="w-20 h-12 object-cover mx-auto rounded border border-slate-800" />
                      ) : (
                        <div className="w-16 h-10 bg-slate-900 border border-slate-850 rounded text-emerald-400 flex items-center justify-center text-[10px] font-black mx-auto">PASSPORT</div>
                      )
                    ) : (
                      <div className="w-16 h-10 bg-slate-900 border border-slate-850 rounded text-emerald-400 flex items-center justify-center text-[10px] font-black mx-auto font-mono">ID_CARD_ACTIVE</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:col-span-3 bg-slate-955/60 p-8 rounded-3xl border border-dashed border-slate-800 space-y-6 mt-8 animate-in zoom-in-95 duration-200 w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/15">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-black uppercase tracking-wider">🔒 Manual Identity Verification (KYC) Hub</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Please submit biometric selfie scan and national identification details to unlock unrestricted P2P trading nodes.</p>
                  </div>
                </div>

                {p2pKycError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold font-mono">
                    ⚠️ {p2pKycError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Step 1: Biometric face key */}
                  <div className="bg-slate-900/50 border border-slate-850/80 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-amber-500 font-extrabold block uppercase tracking-wider font-mono">STEP 1: facial Biometrics scan</span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Place face clearly in front of your front-camera device to lock verified biometric coordinates.</p>
                    </div>

                    <div className="mt-4">
                      {showP2pFaceScanner ? (
                        <CameraFaceScanner
                          lang={lang}
                          onCapture={(img) => {
                            setP2pFacialPic(img);
                            setShowP2pFaceScanner(false);
                          }}
                          onCancel={() => setShowP2pFaceScanner(false)}
                        />
                      ) : p2pFacialPic ? (
                        <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-xl text-center">
                          <img referrerPolicy="no-referrer" src={p2pFacialPic} alt="Live Facial scan preview" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-emerald-500" />
                          <span className="text-[9px] text-emerald-400 font-black tracking-widest block uppercase mt-2">✓ BIometric facial matrix locked</span>
                          <button type="button" onClick={() => setP2pFacialPic('')} className="text-[9px] text-slate-500 hover:text-red-400 underline cursor-pointer mt-1 uppercase font-bold font-mono">Retake Camera Shot</button>
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-950 border border-dashed border-slate-850 rounded-xl text-center space-y-3 flex flex-col items-center justify-center">
                          <Camera className="w-8 h-8 text-slate-600" />
                          <button
                            type="button"
                            onClick={() => setShowP2pFaceScanner(true)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-4 py-2 rounded-xl uppercase font-black tracking-wider transition-all cursor-pointer font-mono"
                          >
                            Authorize Facial Camera
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Document photo ID validation */}
                  <div className="bg-slate-900/50 border border-slate-850/80 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-amber-500 font-extrabold block uppercase tracking-wider font-mono">STEP 2: Official Document upload</span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Provide or capture high-resolution photo of your national ID card, resident license, or passport book.</p>
                    </div>

                    <div className="mt-4">
                      {showP2pIdScanner ? (
                        <CameraIdScanner
                          lang={lang}
                          onCapture={(img) => {
                            setP2pIdPic(img);
                            setShowP2pIdScanner(false);
                          }}
                          onCancel={() => setShowP2pIdScanner(false)}
                        />
                      ) : p2pIdPic ? (
                        <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-xl text-center">
                          {p2pIdPic.startsWith('data:') ? (
                            <img src={p2pIdPic} alt="National Identification" className="max-h-24 mx-auto rounded border border-slate-800" />
                          ) : (
                            <div className="w-16 h-10 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[8px] font-black font-mono text-emerald-400 mx-auto">PASSPORT</div>
                          )}
                          <span className="text-[9px] text-emerald-400 font-black tracking-widest block uppercase mt-2">✓ official ID scanner secured</span>
                          <button type="button" onClick={() => setP2pIdPic('')} className="text-[9px] text-slate-500 hover:text-red-400 underline cursor-pointer mt-1 uppercase font-bold">Remove file / Retake photo</button>
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-950 border border-dashed border-slate-850 rounded-xl text-center space-y-3 flex flex-col items-center justify-center">
                          <Upload className={`w-8 h-8 text-slate-600 ${p2pIdUploading ? 'animate-bounce text-amber-500' : ''}`} />
                          
                          <div className="flex gap-2.5 w-full">
                            <button
                              type="button"
                              onClick={() => setShowP2pIdScanner(true)}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
                              <span>Camera ID Scan</span>
                            </button>

                            <button
                              type="button"
                              disabled={p2pIdUploading}
                              onClick={() => {
                                setP2pIdUploading(true);
                                setP2pKycError('');
                                setTimeout(() => {
                                  setP2pIdPic('uploaded-kyc-id-card');
                                  setP2pIdUploading(false);
                                }, 1000);
                              }}
                              className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                            >
                              {p2pIdUploading ? "Uploading..." : "Mock Passport"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!p2pFacialPic) {
                      setP2pKycError(lang === 'en' ? "Please capture your facial biometrics first (Step 1)." : "እባክዎን መጀመሪያ ፊትዎን ይስኑ::");
                      return;
                    }
                    if (!p2pIdPic) {
                      setP2pKycError(lang === 'en' ? "Please scan or upload your identification document (Step 2)." : "እባክዎን የማንነት መለያ (ID ካርድ) ፎቶ ያስገቡ::");
                      return;
                    }
                    
                    onUpdateUser({
                      ...user,
                      isKycVerified: true,
                      kycFacialPic: p2pFacialPic,
                      kycIdPic: p2pIdPic
                    });

                    // Show success
                    alert(lang === 'en'
                      ? "🎉 Congratulations! Manual Identity Verification (KYC) completed successfully. Unrestricted P2P Escrow node unlocked!"
                      : "🎉 እንኳን ደስ አለዎት! የማንነት ማረጋገጫ (KYC) በተሳካ ሁኔታ ተጠናቋል። የP2P ግብይት ለአካውንትዎ ክፍት ሆኗል!"
                    );
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-green-950/20 text-center"
                >
                  Submit Manual verification & Release Terminal locks
                </button>
              </div>
          )}
          </div>
        )}
      </main>
    </div>
  );
}
