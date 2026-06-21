import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { 
  Users, 
  Search, 
  GitCommit, 
  GitFork, 
  ChevronDown, 
  ChevronRight, 
  CircleDot, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  UserCheck, 
  Sparkles, 
  AlertCircle,
  FolderTree,
  Coins
} from 'lucide-react';

interface ReferralTreeViewerProps {
  lang: 'en' | 'am';
  users: User[];
  onAddSampleNodes?: () => void;
}

export function ReferralTreeViewer({ lang, users, onAddSampleNodes }: ReferralTreeViewerProps) {
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track open/collapsed state of non-root nodes by ID (default open for primary exploration)
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const t = {
    en: {
      title: "AFFILIATE NETWORK GRAPH & TREE VIEWER",
      desc: "Analyze multi-level structural downline connections, cryptographic referral flows, and network asset weights.",
      selectUser: "Select Network Tree Origin User:",
      searchPlaceholder: "Search users by name or email...",
      statsSub: "Downline Analytics Suite",
      networkSize: "Network Size",
      networkActive: "Active Members",
      networkInvest: "Total Network Assets",
      networkInvestDesc: "Sum of active investments in this sub-tree",
      maxDepth: "Max Sub-Tree Generation",
      noRoot: "No User Selected",
      noRootDesc: "Select an origin user from the dropdown above to initialize high-fidelity downline tree mappings.",
      noReferrals: "Solitary Node (0 Referrals)",
      noReferralsDesc: "This user registered directly or has not invited any network participants yet.",
      expandAll: "Expand All Nodes",
      collapseAll: "Collapse All Nodes",
      generateSample: "Generate Demo 5-Level Referral Network",
      copied: "Copied!",
      copiedDesc: "Node referral code copied to clipboard",
      level: "Layer",
      active: "Active",
      suspended: "Suspended",
      kycVerified: "KYC SECURED",
      kycNotVerified: "NO KYC",
      joinDate: "Joined"
    },
    am: {
      title: "የግብዣ ሰንሰለት መዋቅር መመልከቻ (Affiliate Tree)",
      desc: "የአባላት የግብዣ ግንኙነቶችን፣ ደረጃዎችን እና በእነሱ ስር የተፈጠሩ የፈሰስ ካፒታል መጠኖችን ይተንትኑ።",
      selectUser: "ዋናውን አባል ይምረጡ:",
      searchPlaceholder: "አባላትን በስም ወይም በኢሜይል ይፈልጉ...",
      statsSub: "የግብዣ ሰንሰለት ዝርዝር ስታቲስቲክስ",
      networkSize: "ጠቅላላ የአባላት ብዛት",
      networkActive: "ንቁ አባላት",
      networkInvest: "ጠቅላላ የኔትወርክ ፈሰስ",
      networkInvestDesc: "በዚህ ሰንሰለት ስር ያሉ አባላት ያፈሰሱት ጠቅላላ ገንዘብ",
      maxDepth: "ከፍተኛው ሰንሰለት ደረጃ",
      noRoot: "ምንም አባል አልተመረጠም",
      noRootDesc: "የግብዣ ሰንሰለቱን ለመመልከት እባክዎ ከላይ ካለው ሳጥን ውስጥ አንድ አባል ይምረጡ።",
      noReferrals: "እስካሁን ምንም አባል አልጋበዙም (0 ግብዣ)",
      noReferralsDesc: "ይህ አባል ለማንም ግብዣ አላስተላለፈም ወይም እስካሁን ማንም በእሱ ስር አልተመዘገበም።",
      expandAll: "ሁሉንም ክፈት",
      collapseAll: "ሁሉንም ዝጋ",
      generateSample: "የሙከራ ባለ 5-ደረጃ ሰንሰለት ፍጠር",
      copied: "ተቅድቷል!",
      copiedDesc: "የግብዣ ኮዱ ኮፒ ተደርጓል",
      level: "ደረጃ",
      active: "ንቁ",
      suspended: "የታገደ",
      kycVerified: "ባዮሜትሪክ የጸደቀ",
      kycNotVerified: "ባዮሜትሪክ የሌለው",
      joinDate: "የተመዘገቡበት"
    }
  }[lang];

  // Map each user's referral code to the user for quick lookup
  const userByCodeMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(u => {
      if (u.referralCode) {
        map.set(u.referralCode.toLowerCase(), u);
      }
    });
    return map;
  }, [users]);

  // Group users by parent referral code
  const referralsByParentCodeMap = useMemo(() => {
    const map = new Map<string, User[]>();
    users.forEach(u => {
      if (u.referredBy) {
        const key = u.referredBy.toLowerCase();
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(u);
      }
    });
    return map;
  }, [users]);

  // Active Users options list (sorted by username) for the selector
  const userOptions = useMemo(() => {
    return [...users].sort((a, b) => a.username.localeCompare(b.username));
  }, [users]);

  // Filtered selector options based on user query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return userOptions;
    const q = searchQuery.toLowerCase();
    return userOptions.filter(u => 
      u.username.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      u.referralCode.toLowerCase().includes(q)
    );
  }, [userOptions, searchQuery]);

  // Auto-select starting user if none is selected and we have users
  React.useEffect(() => {
    if (!selectedRootId && users.length > 0) {
      // Find a user who has referrals if possible to pre-populate beautifully, else choose first
      const userWithReferrals = users.find(u => {
        const code = u.referralCode?.toLowerCase();
        return code ? (referralsByParentCodeMap.get(code)?.length || 0) > 0 : false;
      });
      if (userWithReferrals) {
        setSelectedRootId(userWithReferrals.id);
      } else {
        // Find first normal user (non-admin)
        const firstUser = users.find(u => u.role === 'user');
        if (firstUser) {
          setSelectedRootId(firstUser.id);
        } else if (users.length > 0) {
          setSelectedRootId(users[0].id);
        }
      }
    }
  }, [users, selectedRootId, referralsByParentCodeMap]);

  const selectedRootUser = useMemo(() => {
    return users.find(u => u.id === selectedRootId);
  }, [users, selectedRootId]);

  // Build the tree recursively avoiding cycles
  interface TreeNode {
    user: User;
    level: number;
    parentCode: string;
    children: TreeNode[];
  }

  const buildTree = (user: User, level = 1, visited = new Set<string>()): TreeNode => {
    visited.add(user.id);
    const selfCode = (user.referralCode || '').toLowerCase();
    const childrenUsers = referralsByParentCodeMap.get(selfCode) || [];
    
    const childrenNodes: TreeNode[] = [];
    childrenUsers.forEach(child => {
      if (!visited.has(child.id)) {
        childrenNodes.push(buildTree(child, level + 1, new Set(visited)));
      }
    });

    return {
      user,
      level,
      parentCode: user.referredBy || '',
      children: childrenNodes
    };
  };

  const rootTreeNode = useMemo(() => {
    if (!selectedRootUser) return null;
    return buildTree(selectedRootUser, 1);
  }, [selectedRootUser, referralsByParentCodeMap]);

  // Flat array of all users inside the active tree for downline stat calculations
  const downlineUsersList = useMemo(() => {
    if (!rootTreeNode) return [];
    const list: User[] = [];
    const traverse = (node: TreeNode) => {
      // Don't include root in downline count, or do we? Downline is under root, let's keep root out for count
      if (node.user.id !== selectedRootId) {
        list.push(node.user);
      }
      node.children.forEach(traverse);
    };
    traverse(rootTreeNode);
    return list;
  }, [rootTreeNode, selectedRootId]);

  // Max depth calculated
  const maxTreeDepth = useMemo(() => {
    if (!rootTreeNode) return 0;
    let max = 1;
    const traverse = (node: TreeNode) => {
      if (node.level > max) max = node.level;
      node.children.forEach(traverse);
    };
    traverse(rootTreeNode);
    return max - 1; // absolute depth under origin
  }, [rootTreeNode]);

  const networkAssetWeight = useMemo(() => {
    return downlineUsersList.reduce((acc, u) => acc = acc + (u.activeInvestment || 0), 0);
  }, [downlineUsersList]);

  const activeDownlineCount = useMemo(() => {
    return downlineUsersList.filter(u => u.status === 'active').length;
  }, [downlineUsersList]);

  const toggleCollapseNode = (nodeId: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    setCollapsedNodes({});
  };

  const collapseAll = () => {
    const freshRecord: Record<string, boolean> = {};
    const traverse = (node: TreeNode) => {
      if (node.children.length > 0) {
        freshRecord[node.user.id] = true;
      }
      node.children.forEach(traverse);
    };
    if (rootTreeNode) {
      traverse(rootTreeNode);
    }
    setCollapsedNodes(freshRecord);
  };

  // Node Renderer - Dynamic recursive styled tree representation
  const renderNode = (node: TreeNode, isLastChild = false, parentSiblingsOpen: boolean[] = []) => {
    const u = node.user;
    const isRoot = node.level === 1;
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsedNodes[u.id] || false;
    
    return (
      <div key={u.id} className="flex flex-col relative">
        <div className="flex items-start gap-3 relative z-10">
          
          {/* visual timeline connectors list */}
          {!isRoot && (
            <div className="flex items-stretch select-none pointer-events-none self-stretch w-6">
              {parentSiblingsOpen.map((siblingLeftIsOpen, idx) => (
                <div 
                  key={idx} 
                  className={`w-6 flex justify-center self-stretch ${
                    siblingLeftIsOpen ? 'border-r border-slate-800' : ''
                  }`} 
                />
              ))}
              <div className="relative w-6 h-10">
                {/* Horizontal branch arm */}
                <div 
                  className="absolute top-1/2 left-0 right-0 h-px bg-slate-800"
                  style={{ width: '12px' }}
                />
                
                {/* Corner branch joint */}
                <div 
                  className={`absolute left-0 w-px bg-slate-800 ${
                    isLastChild 
                      ? 'top-0 bottom-1/2' 
                      : 'top-0 bottom-0'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Node Card Core */}
          <div 
            className={`flex-1 max-w-lg mb-4 rounded-2xl border transition-all duration-300 ${
              isRoot 
                ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-950/10' 
                : u.status === 'suspended'
                  ? 'bg-slate-900/30 border-red-500/20 text-slate-500'
                  : 'bg-slate-900/50 hover:bg-slate-900 border-slate-850 hover:border-slate-800 shadow-sm'
            }`}
          >
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* User avatar/Status indicator node */}
                <div className="relative">
                  {u.profilePic ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={u.profilePic} 
                      alt={u.username} 
                      className={`w-10 h-10 rounded-full object-cover border-2 ${
                        isRoot 
                          ? 'border-amber-400' 
                          : u.status === 'suspended'
                            ? 'border-red-500/50'
                            : 'border-slate-700'
                      }`} 
                    />
                  ) : (
                    <div 
                      className={`w-10 h-10 rounded-full font-black font-sans flex items-center justify-center text-sm ${
                        isRoot 
                          ? 'bg-amber-500/10 text-amber-400 border-2 border-amber-400/40 shadow-inner' 
                          : u.status === 'suspended'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Level text bubble */}
                  <span className="absolute -bottom-1 -right-1.5 bg-slate-950 text-[8px] font-extrabold font-mono px-1 rounded-md border border-slate-800 text-slate-400">
                    L{node.level}
                  </span>
                </div>

                {/* Account Credentials */}
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-white hover:text-amber-400 cursor-pointer" onClick={() => setSelectedRootId(u.id)}>
                      {u.username}
                    </span>
                    {u.role === 'admin' && (
                      <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase px-1 rounded">
                        SYS ADMIN
                      </span>
                    )}
                    {u.isKycVerified ? (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 rounded flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>KYC</span>
                      </span>
                    ) : (
                      <span className="bg-slate-950 border border-slate-850 text-slate-500 text-[8px] font-mono px-1 rounded">
                        NO KYC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono select-all">
                      Code: <strong className="text-slate-300 font-semibold">{u.referralCode}</strong>
                    </span>
                    <span className="text-[9px] text-slate-500">
                      • {t.joinDate}: {new Date(u.registrationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Balances and expandable controls */}
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Wallet className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      ${u.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  {u.activeInvestment > 0 && (
                    <div className="flex items-center gap-1 justify-end mt-0.5 text-amber-500 text-[9px] font-bold font-mono">
                      <TrendingUp className="w-3 h-3" />
                      <span>In play: ${u.activeInvestment.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Collapsing state button */}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggleCollapseNode(u.id)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isCollapsed 
                        ? 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800' 
                        : 'bg-slate-950 border-amber-500/20 text-amber-400 hover:bg-slate-900'
                    }`}
                  >
                    {isCollapsed ? (
                      <div className="flex items-center gap-1 px-1">
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono font-bold uppercase">{node.children.length}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-1">
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono font-bold uppercase">{node.children.length}</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Child Sub-Tree block recursively called */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col">
            {node.children.map((childNode, idx) => {
              const childIsLast = idx === node.children.length - 1;
              const nextSiblings = !isRoot ? [...parentSiblingsOpen, !isLastChild] : [];
              return renderNode(childNode, childIsLast, nextSiblings);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="referrals-tree-dashboard-section" className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-850 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
              <FolderTree className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{t.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">{t.desc}</p>
        </div>

        {/* Demo generator fallback if the base database has no referrals */}
        {onAddSampleNodes && downlineUsersList.length === 0 && (
          <button
            type="button"
            onClick={onAddSampleNodes}
            className="text-xs font-black font-mono transition-all px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-950/20 cursor-pointer self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{t.generateSample}</span>
          </button>
        )}
      </div>

      {/* Origin Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        
        {/* Dropdown selector */}
        <div className="md:col-span-6 space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
            {t.selectUser}
          </label>
          <div className="relative">
            <select
              id="referral-root-selector"
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl py-3 px-3.5 focus:border-amber-500 outline-none text-sm transition-all cursor-pointer font-medium appearance-none"
            >
              <option value="">-- Click to choose a system user --</option>
              {userOptions.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email}) — [{u.referralCode}]
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search tool for users inline */}
        <div className="md:col-span-4 space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
            Quick Finder Filters
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl py-2.5 pl-10 pr-3.5 focus:border-amber-500 outline-none text-xs transition-all font-mono"
            />
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Control toggles */}
        <div className="md:col-span-2 flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={expandAll}
            className="flex-1 bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-800 text-[10px] font-bold font-mono tracking-wide py-2.5 rounded-xl uppercase transition-all cursor-pointer"
            title={t.expandAll}
          >
            Expand Tree
          </button>
        </div>

      </div>

      {searchQuery && (
        <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850 max-h-40 overflow-y-auto space-y-1">
          <span className="text-[9px] text-slate-500 font-bold uppercase font-mono block mb-1">Found ({filteredOptions.length}) users matches:</span>
          {filteredOptions.length === 0 ? (
            <span className="text-slate-500 font-mono text-xs">No users matching search query</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredOptions.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedRootId(u.id);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    u.id === selectedRootId 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850'
                  }`}
                >
                  <CircleDot className="w-3 h-3" />
                  <span>{u.username}</span>
                  <span className="text-[9px] opacity-75">({u.referralCode})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Downline Analytics Dashboard Metrics summary */}
      {selectedRootUser && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-850/60 p-5 rounded-3xl">
          
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block tracking-wider">{t.networkSize}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">{downlineUsersList.length}</span>
              <span className="text-[10px] text-slate-400">members</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block tracking-wider">{t.networkActive}</span>
            <div className="flex items-baseline gap-1.5 text-emerald-400">
              <span className="text-xl font-black font-mono">{activeDownlineCount}</span>
              <span className="text-[10px] opacity-80">live</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block tracking-wider">{t.networkInvest}</span>
            <div className="flex items-baseline gap-1.5 text-amber-500">
              <span className="text-xl font-black font-mono">${networkAssetWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block tracking-wider">{t.maxDepth}</span>
            <div className="flex items-baseline gap-1.5 text-purple-400">
              <span className="text-xl font-black font-mono">{maxTreeDepth}</span>
              <span className="text-[10px] opacity-80">levels deep</span>
            </div>
          </div>

        </div>
      )}

      {/* Tree Render Output */}
      <div className="bg-slate-950 rounded-3xl border border-slate-850 p-6 min-h-[350px] overflow-x-auto relative shadow-inner">
        
        {/* Subtle grid background for high-tech network chart overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {!selectedRootUser ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 relative z-10">
            <AlertCircle className="w-10 h-10 text-slate-650 mb-3 animate-pulse" />
            <h4 className="text-slate-300 font-black text-sm uppercase tracking-wide">{t.noRoot}</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5">{t.noRootDesc}</p>
          </div>
        ) : downlineUsersList.length === 0 ? (
          <div className="space-y-4 relative z-10">
            {/* Still render the primary node beautiful and let them know it has 0 downline */}
            {rootTreeNode && renderNode(rootTreeNode)}
            
            <div className="border border-slate-850/60 bg-slate-900/10 rounded-2xl p-6 text-center max-w-md mx-auto mt-4">
              <GitCommit className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h5 className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t.noReferrals}</h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">{t.noReferralsDesc}</p>
            </div>
          </div>
        ) : (
          <div className="relative pb-6 z-10">
            {rootTreeNode && renderNode(rootTreeNode)}
          </div>
        )}

      </div>

    </div>
  );
}
