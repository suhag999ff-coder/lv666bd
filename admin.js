/* =========================================================
   LV666 ADMIN PANEL — Full Professional Edition
   ========================================================= */

const firebaseConfig = {
  apiKey:            "AIzaSyB9CF7K77_Oe0DQD1_muVdKYmqqD4D22dc",
  authDomain:        "lv666-af324.firebaseapp.com",
  databaseURL:       "https://lv666-af324-default-rtdb.firebaseio.com",
  projectId:         "lv666-af324",
  storageBucket:     "lv666-af324.firebasestorage.app",
  messagingSenderId: "763877978854",
  appId:             "1:763877978854:web:a2d00783111a464b7d0127"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.database();

/* =========================================================
   OUTCOME MODES
   ========================================================= */
const OUTCOME_MODES = [
  { value: 'auto',         label: 'Auto (RTP based)' },
  { value: 'user_profit',  label: 'User Profit (user wins more)' },
  { value: 'house_profit', label: 'House Profit (house wins more)' }
];
const MODE_META = {
  auto:         { cls: 'mode-auto',   icon: 'fa-shuffle',          label: 'Auto' },
  user_profit:  { cls: 'mode-profit', icon: 'fa-arrow-trend-up',   label: 'User Profit' },
  house_profit: { cls: 'mode-loss',   icon: 'fa-arrow-trend-down', label: 'House Profit' }
};

/* =========================================================
   SCHEMAS
   ========================================================= */
const SCHEMAS = {
  dashboard:   { type: 'dashboard',   label: 'Dashboard',   icon: 'fa-gauge-high' },
  gameControl: { type: 'gameControl', label: 'Game Control', icon: 'fa-sliders' },
  betHistory:  { type: 'betHistory',  label: 'Bet History',  icon: 'fa-chart-line' },

  banners: {
    type: 'crud', label: 'Banners & Slider', icon: 'fa-images', path: 'config/banners',
    fields: [
      { name: 'imageUrl', label: 'Banner Image URL', type: 'text', required: true, thumb: true, placeholder: 'https://example.com/banner.jpg' },
      { name: 'title',    label: 'Title', type: 'text' },
      { name: 'link',     label: 'Direct Link URL', type: 'text', placeholder: 'https://... (click করলে যাবে)' },
      { name: 'openInNew', label: 'Open in new tab', type: 'checkbox', default: true },
      { name: 'order',    label: 'Display Order', type: 'number', default: 0 },
      { name: 'active',   label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['imageUrl', 'title', 'link', 'order', 'active']
  },

  promoBanners: {
    type: 'crud', label: 'Promotion Banners', icon: 'fa-rectangle-ad', path: 'config/promoBanners',
    fields: [
      { name: 'imageUrl', label: 'Banner Image URL', type: 'text', required: true, thumb: true },
      { name: 'title',    label: 'Title', type: 'text' },
      { name: 'link',     label: 'Direct Link URL', type: 'text' },
      { name: 'position', label: 'Position', type: 'select', options: ['top', 'middle', 'bottom', 'popup'] },
      { name: 'order',    label: 'Order', type: 'number', default: 0 },
      { name: 'active',   label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['imageUrl', 'title', 'link', 'position', 'active']
  },

  games: {
    type: 'crud', label: 'Games', icon: 'fa-gamepad', path: 'games',
    fields: [
      { name: 'name',        label: 'Game Name', type: 'text', required: true },
      { name: 'key',         label: 'Unique Key (id)', type: 'text', required: true },
      { name: 'imageUrl',    label: 'Image URL', type: 'text', required: true, thumb: true },
      { name: 'category',    label: 'Category', type: 'select', options: ['live','slots','crash','sports','table','arcade','fishing'] },
      { name: 'provider',    label: 'Provider', type: 'text', placeholder: 'JILI / PG / PP' },
      { name: 'badge',       label: 'Badge', type: 'select', options: ['','LIVE','NEW','HOT'] },
      { name: 'link',        label: 'Game URL / Function', type: 'text', placeholder: 'https://... or openGame()' },
      { name: 'outcomeMode', label: 'Outcome Mode', type: 'select', options: ['auto','user_profit','house_profit'], default: 'auto' },
      { name: 'winRate',     label: 'User Win Rate (%)', type: 'number', default: 45 },
      { name: 'rtp',         label: 'RTP (%)', type: 'number', default: 95 },
      { name: 'minBet',      label: 'Min Bet (৳)', type: 'number', default: 10 },
      { name: 'maxBet',      label: 'Max Bet (৳)', type: 'number', default: 10000 },
      { name: 'maxWin',      label: 'Max Win Multiplier', type: 'number', default: 100 },
      { name: 'order',       label: 'Display Order', type: 'number', default: 0 },
      { name: 'active',      label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['imageUrl','name','key','category','provider','outcomeMode','winRate','active']
  },

  categories: {
    type: 'crud', label: 'Categories', icon: 'fa-tags', path: 'categories',
    fields: [
      { name: 'name',  label: 'Name', type: 'text', required: true },
      { name: 'key',   label: 'Unique Key', type: 'text', required: true },
      { name: 'icon',  label: 'Icon Class', type: 'text', placeholder: 'fa-fire' },
      { name: 'order', label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['name','key','icon','order']
  },

  providers: {
    type: 'crud', label: 'Providers', icon: 'fa-building', path: 'providers',
    fields: [
      { name: 'name',    label: 'Provider Name', type: 'text', required: true },
      { name: 'logoUrl', label: 'Logo Image URL', type: 'text', thumb: true },
      { name: 'order',   label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['logoUrl','name','order']
  },

  depositMethods: {
    type: 'crud', label: 'Deposit Methods', icon: 'fa-credit-card', path: 'deposit/methods',
    fields: [
      { name: 'name',    label: 'Method Name (bKash/Nagad/Rocket)', type: 'text', required: true },
      { name: 'iconUrl', label: 'Icon / Logo Image URL', type: 'text', thumb: true, placeholder: 'https://.../bkash-logo.png' },
      { name: 'number',  label: 'Payment Number', type: 'text', placeholder: '01XXXXXXXXX' },
      { name: 'min',     label: 'Min Amount (৳)', type: 'number', default: 100 },
      { name: 'max',     label: 'Max Amount (৳)', type: 'number', default: 100000 },
      { name: 'bonus',   label: 'Bonus (%)', type: 'number', default: 0 },
      { name: 'order',   label: 'Order', type: 'number', default: 0 },
      { name: 'active',  label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['iconUrl','name','number','min','max','bonus','active']
  },

  depositAmounts: {
    type: 'crud', label: 'Quick Deposit Amounts', icon: 'fa-money-bill', path: 'deposit/amounts',
    fields: [
      { name: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { name: 'bonus',  label: 'Bonus (%)', type: 'number', default: 0 },
      { name: 'order',  label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['amount','bonus','order']
  },

  withdrawMethods: {
    type: 'crud', label: 'Withdraw Methods', icon: 'fa-money-bill-transfer', path: 'withdraw/methods',
    fields: [
      { name: 'name',    label: 'Method Name', type: 'text', required: true },
      { name: 'iconUrl', label: 'Icon / Logo Image URL', type: 'text', thumb: true },
      { name: 'min',     label: 'Min Amount (৳)', type: 'number', default: 100 },
      { name: 'max',     label: 'Max Amount (৳)', type: 'number', default: 50000 },
      { name: 'fee',     label: 'Fee (%)', type: 'number', default: 0 },
      { name: 'time',    label: 'Processing Time', type: 'text', placeholder: '5-30 minutes' },
      { name: 'order',   label: 'Order', type: 'number', default: 0 },
      { name: 'active',  label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['iconUrl','name','min','max','fee','time','active']
  },

  withdrawAmounts: {
    type: 'crud', label: 'Quick Withdraw Amounts', icon: 'fa-money-check', path: 'withdraw/amounts',
    fields: [
      { name: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { name: 'order',  label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['amount','order']
  },

  events: {
    type: 'crud', label: 'Events & Promotions', icon: 'fa-calendar-star', path: 'events',
    fields: [
      { name: 'title',       label: 'Title', type: 'text', required: true },
      { name: 'imageUrl',    label: 'Image URL', type: 'text', thumb: true },
      { name: 'link',        label: 'Direct Link', type: 'text' },
      { name: 'reward',      label: 'Reward Amount (৳)', type: 'number', default: 0 },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'order',       label: 'Order', type: 'number', default: 0 },
      { name: 'active',      label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['imageUrl','title','reward','link','active']
  },

  notifications: {
    type: 'crud', label: 'Notifications', icon: 'fa-bell', path: 'notifications',
    fields: [
      { name: 'title',   label: 'Title', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      { name: 'type',    label: 'Type', type: 'select', options: ['info','success','warning','promo'] },
      { name: 'link',    label: 'Action Link (optional)', type: 'text' },
      { name: 'active',  label: 'Active', type: 'checkbox', default: true }
    ],
    listFields: ['title','message','type','active']
  },

  avatars: {
    type: 'crud', label: 'Avatars', icon: 'fa-circle-user', path: 'avatars',
    fields: [
      { name: 'url',   label: 'Image URL', type: 'text', required: true, thumb: true },
      { name: 'order', label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['url','order']
  },

  drawer: {
    type: 'crud', label: 'Drawer Menu', icon: 'fa-bars', path: 'config/drawer',
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'icon',  label: 'Icon Class', type: 'text', placeholder: 'fa-star' },
      { name: 'link',  label: 'Link / Action', type: 'text' },
      { name: 'order', label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['label','icon','link','order']
  },

  vipTiers: {
    type: 'crud', label: 'VIP Tiers', icon: 'fa-crown', path: 'vipTiers',
    fields: [
      { name: 'level',       label: 'Level', type: 'number', required: true },
      { name: 'name',        label: 'Tier Name', type: 'text', required: true },
      { name: 'iconUrl',     label: 'Icon URL', type: 'text', thumb: true },
      { name: 'requirement', label: 'Requirement (৳)', type: 'number' },
      { name: 'reward',      label: 'Reward Text', type: 'text' },
      { name: 'cashback',    label: 'Cashback (%)', type: 'number', default: 0 },
      { name: 'order',       label: 'Order', type: 'number', default: 0 }
    ],
    listFields: ['level','name','iconUrl','requirement','reward','cashback']
  },

  social: {
    type: 'singleton', label: 'Social Links', icon: 'fa-share-nodes', path: 'config/social',
    fields: [
      { name: 'whatsapp',  label: 'WhatsApp URL', type: 'text' },
      { name: 'facebook',  label: 'Facebook URL', type: 'text' },
      { name: 'telegram',  label: 'Telegram URL', type: 'text' },
      { name: 'youtube',   label: 'YouTube URL', type: 'text' },
      { name: 'instagram', label: 'Instagram URL', type: 'text' },
      { name: 'tiktok',    label: 'TikTok URL', type: 'text' },
      { name: 'x',         label: 'X / Twitter URL', type: 'text' },
      { name: 'liveChat',  label: 'Live Chat URL', type: 'text' }
    ]
  },

  theme: {
    type: 'singleton', label: 'Theme & Branding', icon: 'fa-palette', path: 'config/theme',
    fields: [
      { name: 'brandName',     label: 'Brand Name', type: 'text' },
      { name: 'logoUrl',       label: 'Logo URL', type: 'text', thumb: true },
      { name: 'splashUrl',     label: 'Splash Background URL', type: 'text', thumb: true },
      { name: 'authBannerUrl', label: 'Auth Banner URL', type: 'text', thumb: true },
      { name: 'primaryColor',  label: 'Primary Color', type: 'color' },
      { name: 'goldColor',     label: 'Gold Color', type: 'color' },
      { name: 'bgColor',       label: 'Dark Background', type: 'color' },
      { name: 'textColor',     label: 'Text Color', type: 'color' }
    ]
  },

  authSettings: {
    type: 'singleton', label: 'Auth Settings', icon: 'fa-shield-halved', path: 'config/auth',
    fields: [
      { name: 'terms',          label: 'Terms & Conditions', type: 'textarea' },
      { name: 'inviteRequired', label: 'Invite Code Required', type: 'checkbox' },
      { name: 'captchaOn',      label: 'Captcha on Register', type: 'checkbox' },
      { name: 'registerBonus',  label: 'Register Bonus (৳)', type: 'number' },
      { name: 'referralCommission', label: 'Referral Commission (%)', type: 'number', default: 0 }
    ]
  },

  bonusRewards: {
    type: 'singleton', label: 'Bonus & Rewards', icon: 'fa-gift', path: 'config/bonus',
    fields: [
      { name: 'registerBonus',           label: 'Register Bonus (৳)', type: 'number', default: 0 },
      { name: 'firstDepositPercent',     label: 'First Deposit Bonus (%)', type: 'number', default: 0 },
      { name: 'firstDepositMax',         label: 'First Deposit Max Bonus (৳)', type: 'number', default: 0 },
      { name: 'recurringDepositPercent', label: 'Recurring Deposit Bonus (%)', type: 'number', default: 0 },
      { name: 'dailyBonus',              label: 'Daily Login Bonus (৳)', type: 'number', default: 0 },
      { name: 'referralPercent',         label: 'Referral Commission (%)', type: 'number', default: 0 },
      { name: 'rebatePercent',           label: 'Betting Rebate (%)', type: 'number', default: 0 },
      { name: 'withdrawFeePercent',      label: 'Withdraw Fee (%)', type: 'number', default: 0 },
      { name: 'minWithdraw',             label: 'Min Withdraw (৳)', type: 'number', default: 100 }
    ]
  },

  gameConfig: {
    type: 'singleton', label: 'Global Game Config', icon: 'fa-gears', path: 'gameConfig',
    fields: [
      { name: 'globalMode',           label: 'Global Outcome Mode', type: 'select', options: ['auto','user_profit','house_profit'], default: 'auto' },
      { name: 'globalWinRate',        label: 'Global User Win Rate (%)', type: 'number', default: 45 },
      { name: 'globalRTP',            label: 'Global RTP (%)', type: 'number', default: 95 },
      { name: 'defaultMinBet',        label: 'Default Min Bet (৳)', type: 'number', default: 10 },
      { name: 'defaultMaxBet',        label: 'Default Max Bet (৳)', type: 'number', default: 10000 },
      { name: 'wingoDuration',        label: 'Wingo Round (sec)', type: 'number', default: 60 },
      { name: 'aviatorMaxMultiplier', label: 'Aviator Max Multiplier', type: 'number', default: 100 },
      { name: 'maxWinMultiplier',     label: 'Max Win Multiplier', type: 'number', default: 5000 }
    ]
  },

  users:        { type: 'users',        label: 'Users',        icon: 'fa-users' },
  transactions: { type: 'transactions', label: 'Transactions', icon: 'fa-receipt' }
};

const NAV = [
  { group: 'Overview', items: ['dashboard', 'gameControl', 'betHistory'] },
  { group: 'Content',  items: ['banners','promoBanners','games','categories','providers','events','notifications','avatars','drawer'] },
  { group: 'Finance',  items: ['depositMethods','depositAmounts','withdrawMethods','withdrawAmounts','transactions'] },
  { group: 'Users',    items: ['users'] },
  { group: 'System',   items: ['theme','authSettings','social','vipTiers','bonusRewards','gameConfig'] }
];

let currentSection = 'dashboard';
let searchQuery = '';

/* =========================================================
   AUTH
   ========================================================= */
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const snap = await db.ref('admins/' + user.uid).once('value');
      if (snap.exists() && snap.val() === true) showApp(user);
      else {
        await auth.signOut();
        showLogin('Access denied. UID <code>' + user.uid + '</code> is not registered as admin.<br>Add this to Realtime DB: <code>admins/' + user.uid + ': true</code>');
      }
    } catch (e) {
      await auth.signOut();
      showLogin('Verify failed: ' + e.message);
    }
  } else showLogin();
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  const btn   = document.getElementById('loginBtn');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Signing in...';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (err) {
    console.error('[Auth]', err.code, err.message);
    errEl.innerHTML = friendlyAuthError(err.code, err.message);
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Sign In';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  toast('Signed out', 'success');
});

function friendlyAuthError(code, msg) {
  const m = {
    'auth/invalid-api-key': '<strong>Invalid API Key</strong><br>Check <code>apiKey</code>.',
    'auth/invalid-email': '<strong>Invalid email</strong>',
    'auth/user-not-found': '<strong>User not found</strong><br>Create admin in Firebase → Authentication → Users.',
    'auth/wrong-password': '<strong>Wrong password</strong>',
    'auth/invalid-credential': '<strong>Invalid credentials</strong><br>Check email/password.',
    'auth/invalid-login-credentials': '<strong>Invalid login</strong><br>Check credentials or enable Email/Password provider.',
    'auth/too-many-requests': '<strong>Too many attempts</strong><br>Wait a few minutes.',
    'auth/network-request-failed': '<strong>Network error</strong><br>Check internet / disable VPN.',
    'auth/operation-not-allowed': '<strong>Email/Password disabled</strong><br>Enable in Firebase → Auth → Sign-in method.',
    'auth/unauthorized-domain': '<strong>Domain not authorized</strong><br>Add to Firebase → Auth → Settings → Authorized domains.'
  };
  return m[code] || '<strong>Login failed</strong><br>Code: <code>' + code + '</code><br>' + msg;
}

function showLogin(msg) {
  document.getElementById('appView').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
  if (msg) {
    const err = document.getElementById('loginError');
    err.innerHTML = msg;
    err.classList.remove('hidden');
  }
}
function showApp(user) {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appView').classList.remove('hidden');
  document.getElementById('adminEmail').textContent = user.email;
  buildSidebar();
  navigate('dashboard');
}

/* =========================================================
   SIDEBAR
   ========================================================= */
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = NAV.map(g => {
    const links = g.items.map(k => {
      const s = SCHEMAS[k];
      return `<a data-key="${k}" onclick="navigate('${k}')"><i class="fas ${s.icon}"></i><span>${s.label}</span></a>`;
    }).join('');
    return `<div class="nav-section"><span class="nav-label">${g.group}</span>${links}</div>`;
  }).join('');
}
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
});

/* =========================================================
   NAVIGATION
   ========================================================= */
async function navigate(key) {
  currentSection = key;
  searchQuery = '';
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.toggle('active', a.dataset.key === key));
  document.getElementById('pageTitle').textContent = SCHEMAS[key].label;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  await render();
}

async function render() {
  const c = document.getElementById('mainContent');
  c.innerHTML = loadingState();
  const s = SCHEMAS[currentSection];
  try {
    if (s.type === 'dashboard')        c.innerHTML = await renderDashboard();
    else if (s.type === 'gameControl') c.innerHTML = await renderGameControl();
    else if (s.type === 'betHistory')  c.innerHTML = await renderBetHistory();
    else if (s.type === 'crud')        c.innerHTML = await renderCrud(currentSection);
    else if (s.type === 'singleton')   c.innerHTML = await renderSingleton(currentSection);
    else if (s.type === 'users')       c.innerHTML = await renderUsers();
    else if (s.type === 'transactions')c.innerHTML = await renderTransactions();
  } catch (e) {
    console.error(e);
    c.innerHTML = emptyState('Error: ' + e.message);
  }
}

/* =========================================================
   DASHBOARD
   ========================================================= */
async function renderDashboard() {
  const [uS, tS, bS, gS] = await Promise.all([
    db.ref('users').once('value'),
    db.ref('transactions').once('value'),
    db.ref('bets').once('value'),
    db.ref('games').once('value')
  ]);
  const users = uS.val() || {};
  const txs   = Object.values(tS.val() || {});
  const bets  = Object.values(bS.val() || {});
  const games = Object.values(gS.val() || {});

  const totalUsers = Object.keys(users).length;
  const dep = txs.filter(t => t.type === 'deposit' && ['approved','complete','accepted','success'].includes(String(t.status).toLowerCase()));
  const wd  = txs.filter(t => t.type === 'withdraw' && ['approved','complete','accepted','success'].includes(String(t.status).toLowerCase()));
  const pend = txs.filter(t => t.type === 'withdraw' && String(t.status).toLowerCase() === 'pending');
  const totalDep = dep.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const totalWd  = wd.reduce((s,t) => s + (Number(t.amount)||0), 0);
  const totalBetAmount = bets.reduce((s,b) => s + (Number(b.amount)||0), 0);
  const totalPayout    = bets.reduce((s,b) => s + (Number(b.payout)||0), 0);
  const houseProfit    = totalBetAmount - totalPayout;
  const userProfit     = totalPayout - totalBetAmount;

  const stat = (i, c, v, l) => `<div class="stat-card ${c}"><div class="stat-icon"><i class="fas ${i}"></i></div><div class="stat-value">${v}</div><div class="stat-label">${l}</div></div>`;

  return `
    <div class="stats-grid">
      ${stat('fa-users','blue',totalUsers,'Total Users')}
      ${stat('fa-arrow-down','green','৳'+fmtNum(totalDep),'Total Deposits')}
      ${stat('fa-arrow-up','orange','৳'+fmtNum(totalWd),'Total Withdraws')}
      ${stat('fa-clock','red',pend.length,'Pending Withdraws')}
      ${stat('fa-dice','purple',bets.length,'Total Bets')}
      ${stat('fa-gamepad','slate',games.length,'Active Games')}
    </div>
    <div class="pl-grid">
      <div class="pl-card profit">
        <h4><i class="fas fa-arrow-trend-up"></i> House Profit</h4>
        <div class="pl-value">৳${fmtNum(houseProfit)}</div>
        <div class="pl-sub">Total bets: ৳${fmtNum(totalBetAmount)}</div>
      </div>
      <div class="pl-card loss">
        <h4><i class="fas fa-arrow-trend-down"></i> Total Payout</h4>
        <div class="pl-value">৳${fmtNum(totalPayout)}</div>
        <div class="pl-sub">User profit: ৳${fmtNum(userProfit)}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title"><i class="fas fa-bolt"></i> Quick Actions</h3></div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" onclick="navigate('gameControl')"><i class="fas fa-sliders"></i> Game Control</button>
        <button class="btn btn-success btn-sm" onclick="navigate('games')"><i class="fas fa-plus"></i> Add Game</button>
        <button class="btn btn-warning btn-sm" onclick="navigate('banners')"><i class="fas fa-image"></i> Banners</button>
        <button class="btn btn-secondary btn-sm" onclick="navigate('transactions')"><i class="fas fa-receipt"></i> Transactions</button>
        <button class="btn btn-secondary btn-sm" onclick="navigate('users')"><i class="fas fa-users"></i> Users</button>
      </div>
    </div>
  `;
}

/* =========================================================
   GAME CONTROL
   ========================================================= */
async function renderGameControl() {
  const [gcSnap, gSnap, uSnap] = await Promise.all([
    db.ref('gameConfig').once('value'),
    db.ref('games').once('value'),
    db.ref('users').once('value')
  ]);
  const gc = gcSnap.val() || {};
  const games = Object.entries(gSnap.val() || {}).map(([id, g]) => ({ id, ...g }));
  const users = Object.entries(uSnap.val() || {}).map(([uid, u]) => ({ uid, ...u }));
  games.sort((a,b) => (a.order ?? 9999) - (b.order ?? 9999));
  users.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

  const globalMode = gc.globalMode || 'auto';
  const globalWinRate = gc.globalWinRate ?? 45;
  const globalRTP = gc.globalRTP ?? 95;

  const modeOpts = (sel) => OUTCOME_MODES.map(m => `<option value="${m.value}" ${sel===m.value?'selected':''}>${m.label}</option>`).join('');

  const gameRows = games.map(g => `
    <tr>
      <td><span class="text-truncate" style="max-width:140px"><strong>${escapeHtml(g.name||'')}</strong></span></td>
      <td>${escapeHtml(g.key||'')}</td>
      <td><select class="mode-select" onchange="updateGameMode('${g.id}', this.value)">${modeOpts(g.outcomeMode || 'auto')}</select></td>
      <td><input type="number" class="num-input" value="${g.winRate ?? 45}" min="0" max="100" onchange="updateGameField('${g.id}','winRate',this.value)"></td>
      <td><input type="number" class="num-input" value="${g.rtp ?? 95}" min="0" max="100" onchange="updateGameField('${g.id}','rtp',this.value)"></td>
      <td><input type="number" class="num-input" value="${g.minBet ?? 10}" min="0" onchange="updateGameField('${g.id}','minBet',this.value)"></td>
      <td><input type="number" class="num-input" value="${g.maxBet ?? 10000}" min="0" onchange="updateGameField('${g.id}','maxBet',this.value)"></td>
      <td><input type="number" class="num-input" value="${g.maxWin ?? 100}" min="0" onchange="updateGameField('${g.id}','maxWin',this.value)"></td>
    </tr>
  `).join('');

  const userRows = users.slice(0, 100).map(u => `
    <tr>
      <td><span class="text-truncate" style="max-width:120px">${escapeHtml(u.phone || u.uid)}</span></td>
      <td><span class="text-truncate" style="max-width:120px">${escapeHtml(u.uid)}</span></td>
      <td>৳${fmtNum(u.balance||0)}</td>
      <td><select class="mode-select" onchange="updateUserMode('${u.uid}', this.value)">${modeOpts(u.outcomeMode || 'auto')}</select></td>
    </tr>
  `).join('');

  return `
    <div class="info-banner">
      <i class="fas fa-circle-info"></i>
      <div><strong>Profit/Loss Control:</strong> এখান থেকে আপনি নির্ধারণ করতে পারেন — <strong>Auto</strong> = RTP based, <strong>User Profit</strong> = ইউজার বেশি জিতবে, <strong>House Profit</strong> = হাউজ বেশি জিতবে (ইউজার বেশি হারবে)।<br>Priority: <strong>User Override > Game Override > Global</strong></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-earth-americas"></i> Global Control</h3>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="saveGlobalControl()"><i class="fas fa-check"></i> Save Global</button>
        </div>
      </div>
      <div class="global-control">
        <div class="gc-field">
          <label>Global Mode</label>
          <select id="gc_globalMode">${modeOpts(globalMode)}</select>
        </div>
        <div class="gc-field">
          <label>Global Win Rate (%)</label>
          <input type="number" id="gc_globalWinRate" value="${globalWinRate}" min="0" max="100">
        </div>
        <div class="gc-field">
          <label>Global RTP (%)</label>
          <input type="number" id="gc_globalRTP" value="${globalRTP}" min="0" max="100">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-gamepad"></i> Per-Game Control</h3>
        <div class="card-actions"><span class="badge badge-info">${games.length} games</span></div>
      </div>
      ${games.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Game</th><th>Key</th><th>Outcome Mode</th><th>Win %</th><th>RTP %</th><th>Min Bet</th><th>Max Bet</th><th>Max Win x</th></tr></thead>
          <tbody>${gameRows}</tbody>
        </table>
      </div>` : emptyState('No games. Add games first.')}
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-users"></i> Per-User Override</h3>
        <div class="card-actions"><span class="badge badge-info">${users.length} users</span></div>
      </div>
      <div class="info-banner warn">
        <i class="fas fa-triangle-exclamation"></i>
        <div><strong>Override:</strong> Specific user এর mode set করলে সেটাই সেই user এর সব game এ apply হবে।</div>
      </div>
      ${users.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>User</th><th>UID</th><th>Balance</th><th>Outcome Mode</th></tr></thead>
          <tbody>${userRows}</tbody>
        </table>
      </div>` : emptyState('No users yet.')}
    </div>
  `;
}

async function saveGlobalControl() {
  const data = {
    globalMode: document.getElementById('gc_globalMode').value,
    globalWinRate: Number(document.getElementById('gc_globalWinRate').value),
    globalRTP: Number(document.getElementById('gc_globalRTP').value)
  };
  try {
    await db.ref('gameConfig').update(data);
    toast('Global controls saved', 'success');
  } catch (e) { toast('Save failed: ' + e.message, 'error'); }
}
async function updateGameMode(id, mode) {
  try { await db.ref('games/' + id + '/outcomeMode').set(mode); toast('Game mode → ' + MODE_META[mode].label, 'success'); }
  catch (e) { toast('Failed: ' + e.message, 'error'); }
}
async function updateGameField(id, field, value) {
  try { await db.ref('games/' + id + '/' + field).set(Number(value)); toast(field + ' updated', 'success'); }
  catch (e) { toast('Failed: ' + e.message, 'error'); }
}
async function updateUserMode(uid, mode) {
  try { await db.ref('users/' + uid + '/outcomeMode').set(mode); toast('User mode → ' + MODE_META[mode].label, 'success'); }
  catch (e) { toast('Failed: ' + e.message, 'error'); }
}

/* =========================================================
   BET HISTORY
   ========================================================= */
async function renderBetHistory() {
  const snap = await db.ref('bets').once('value');
  let items = Object.entries(snap.val() || {}).map(([id, b]) => ({ id, ...b }));
  items.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(b => String(b.uid||'').toLowerCase().includes(q) || String(b.game||b.gameId||b.gameKey||'').toLowerCase().includes(q) || String(b.result||'').toLowerCase().includes(q));
  }
  items = items.slice(0, 300);
  const totalStake   = items.reduce((s,b) => s + (Number(b.amount)||0), 0);
  const totalPayout  = items.reduce((s,b) => s + (Number(b.payout)||0), 0);
  const houseProfit  = totalStake - totalPayout;
  const userWinCount = items.filter(b => String(b.result||'').toLowerCase() === 'win').length;
  const userLoseCount= items.filter(b => String(b.result||'').toLowerCase() === 'lose').length;

  const rows = items.map(b => {
    const result = String(b.result||'-').toLowerCase();
    const cls = result === 'win' ? 'badge-success' : result === 'lose' ? 'badge-danger' : 'badge-slate';
    return `<tr>
      <td><span class="text-truncate" style="max-width:110px">${escapeHtml(b.uid||'')}</span></td>
      <td><span class="badge badge-info">${escapeHtml(b.game||b.gameId||b.gameKey||'-')}</span></td>
      <td>৳${fmtNum(b.amount||0)}</td>
      <td>৳${fmtNum(b.payout||0)}</td>
      <td><span class="badge ${cls}">${result}</span></td>
      <td>${formatDate(b.createdAt)}</td>
    </tr>`;
  }).join('');

  return `
    <div class="pl-grid">
      <div class="pl-card profit">
        <h4><i class="fas fa-arrow-trend-up"></i> House Profit</h4>
        <div class="pl-value">৳${fmtNum(houseProfit)}</div>
        <div class="pl-sub">User wins: ${userWinCount} · User losses: ${userLoseCount}</div>
      </div>
      <div class="pl-card loss">
        <h4><i class="fas fa-coins"></i> Total Payout</h4>
        <div class="pl-value">৳${fmtNum(totalPayout)}</div>
        <div class="pl-sub">Total stake: ৳${fmtNum(totalStake)}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-chart-line"></i> Bet History <span class="badge badge-info">${items.length}</span></h3>
        <div class="card-actions">
          <div class="search-bar">
            <i class="fas fa-magnifying-glass"></i>
            <input type="text" placeholder="Search UID / game / result..." value="${escapeHtml(searchQuery)}" oninput="onSearch(this.value)">
          </div>
        </div>
      </div>
      <div class="table-wrap">
        ${items.length ? `<table><thead><tr><th>UID</th><th>Game</th><th>Stake</th><th>Payout</th><th>Result</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>` : emptyState('No bet history')}
      </div>
    </div>
  `;
}

/* =========================================================
   CRUD
   ========================================================= */
async function renderCrud(key) {
  const s = SCHEMAS[key];
  const snap = await db.ref(s.path).once('value');
  let items = Object.entries(snap.val() || {}).map(([id, v]) => ({ id, ...v }));
  items.sort((a,b) => (a.order ?? 9999) - (b.order ?? 9999));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(it => s.fields.some(f => String(it[f.name] ?? '').toLowerCase().includes(q)));
  }
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas ${s.icon}"></i> ${s.label} <span class="badge badge-info">${items.length}</span></h3>
        <div class="card-actions">
          <div class="search-bar">
            <i class="fas fa-magnifying-glass"></i>
            <input type="text" placeholder="Search..." value="${escapeHtml(searchQuery)}" oninput="onSearch(this.value)">
          </div>
          <button class="btn btn-primary btn-sm" onclick="openEditModal('${key}')"><i class="fas fa-plus"></i> Add New</button>
        </div>
      </div>
      <div class="table-wrap">${renderCrudTable(key, s, items)}</div>
    </div>
  `;
}

function renderCrudTable(key, s, items) {
  if (!items.length) return emptyState('No records. Click "Add New" to create.');
  let head = '<tr>';
  s.listFields.forEach(f => {
    const field = s.fields.find(x => x.name === f);
    head += `<th>${field ? field.label : f}</th>`;
  });
  head += '<th>Actions</th></tr>';
  const body = items.map(item => {
    let row = '<tr>';
    s.listFields.forEach(f => {
      const field = s.fields.find(x => x.name === f);
      row += `<td>${renderCell(field, item[f])}</td>`;
    });
    row += `<td><div class="row-actions">
      <button class="btn-icon" title="Edit" onclick="openEditModal('${key}','${item.id}')"><i class="fas fa-pen"></i></button>
      <button class="btn-icon danger" title="Delete" onclick="confirmDelete('${key}','${item.id}')"><i class="fas fa-trash"></i></button>
    </div></td></tr>`;
    return row;
  }).join('');
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

function renderCell(field, value) {
  if (!field) return escapeHtml(String(value ?? ''));
  if (field.name === 'active') return value ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-slate">Inactive</span>';
  if (field.name === 'outcomeMode') {
    const m = MODE_META[value || 'auto'];
    return `<span class="mode-badge ${m.cls}"><i class="fas ${m.icon}"></i> ${m.label}</span>`;
  }
  if (field.thumb && value) {
    const isAvatar = field.name === 'url' || field.name === 'iconUrl' || field.name === 'logoUrl';
    return `<img src="${escapeHtml(value)}" class="img-thumb${isAvatar ? ' avatar' : ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22%236b4a4a%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z%22/%3E%3C/svg%3E'">`;
  }
  if (field.type === 'checkbox') return value ? 'Yes' : 'No';
  if (field.name === 'badge' && value) return `<span class="badge badge-danger">${escapeHtml(value)}</span>`;
  return `<span class="text-truncate">${escapeHtml(String(value ?? ''))}</span>`;
}

function onSearch(v) { searchQuery = v; render(); }

/* =========================================================
   SINGLETON
   ========================================================= */
async function renderSingleton(key) {
  const s = SCHEMAS[key];
  const snap = await db.ref(s.path).once('value');
  const data = snap.val() || {};
  const formFields = s.fields.map(f => renderFormField(f, data[f.name])).join('');
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas ${s.icon}"></i> ${s.label}</h3>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="saveSingleton('${key}')"><i class="fas fa-check"></i> Save Changes</button>
        </div>
      </div>
      <div id="singletonForm">${formFields}</div>
    </div>
  `;
}
async function saveSingleton(key) {
  const s = SCHEMAS[key];
  const data = {};
  for (const f of s.fields) {
    const el = document.getElementById('fld_' + f.name);
    if (!el) continue;
    if (f.type === 'checkbox') data[f.name] = el.checked;
    else if (f.type === 'number') data[f.name] = el.value === '' ? null : Number(el.value);
    else data[f.name] = el.value;
  }
  try {
    await db.ref(s.path).set(data);
    toast(s.label + ' saved', 'success');
  } catch (e) { toast('Failed: ' + e.message, 'error'); }
}

/* =========================================================
   USERS
   ========================================================= */
async function renderUsers() {
  const snap = await db.ref('users').once('value');
  let items = Object.entries(snap.val() || {}).map(([uid, u]) => ({ uid, ...u }));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(u => String(u.phone||'').toLowerCase().includes(q) || String(u.email||'').toLowerCase().includes(q) || String(u.uid||'').toLowerCase().includes(q));
  }
  items.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
  const rows = items.map(u => {
    const mode = u.outcomeMode || 'auto';
    const m = MODE_META[mode];
    return `<tr>
      <td><span class="text-truncate" style="max-width:120px">${escapeHtml(u.uid||'')}</span></td>
      <td>${escapeHtml(u.phone||'-')}</td>
      <td>৳${fmtNum(u.balance||0)}</td>
      <td><span class="badge badge-info">Lv ${u.vipLevel||1}</span></td>
      <td><span class="mode-badge ${m.cls}"><i class="fas ${m.icon}"></i> ${m.label}</span></td>
      <td>${u.banned ? '<span class="badge badge-danger">Banned</span>' : '<span class="badge badge-success">Active</span>'}</td>
      <td>${formatDate(u.createdAt)}</td>
      <td><div class="row-actions">
        <button class="btn-icon success" title="Adjust Balance" onclick="openBalanceModal('${u.uid}')"><i class="fas fa-wallet"></i></button>
        <button class="btn-icon" title="Set Outcome Mode" onclick="openUserModeModal('${u.uid}','${mode}')"><i class="fas fa-sliders"></i></button>
        <button class="btn-icon ${u.banned ? 'success' : 'danger'}" title="${u.banned ? 'Unban' : 'Ban'}" onclick="toggleBan('${u.uid}', ${u.banned ? 'false' : 'true'})"><i class="fas ${u.banned ? 'fa-unlock' : 'fa-lock'}"></i></button>
        <button class="btn-icon danger" title="Delete" onclick="confirmDeleteUser('${u.uid}')"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-users"></i> Users <span class="badge badge-info">${items.length}</span></h3>
        <div class="card-actions">
          <div class="search-bar">
            <i class="fas fa-magnifying-glass"></i>
            <input type="text" placeholder="Search UID / phone / email..." value="${escapeHtml(searchQuery)}" oninput="onSearch(this.value)">
          </div>
        </div>
      </div>
      <div class="table-wrap">
        ${items.length ? `<table>
          <thead><tr><th>UID</th><th>Phone</th><th>Balance</th><th>VIP</th><th>Mode</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : emptyState('No users found')}
      </div>
    </div>
  `;
}

function openUserModeModal(uid, current) {
  const opts = OUTCOME_MODES.map(m => `<option value="${m.value}" ${current===m.value?'selected':''}>${m.label}</option>`).join('');
  openModal({
    title: 'Set User Outcome Mode',
    bodyHTML: `
      <div class="info-banner">
        <i class="fas fa-circle-info"></i>
        <div><strong>Auto</strong> = RTP based. <strong>User Profit</strong> = এই user বেশি জিতবে। <strong>House Profit</strong> = এই user বেশি হারবে।</div>
      </div>
      <div class="form-group"><label>Outcome Mode</label><select id="fld_mode">${opts}</select></div>
    `,
    onSave: async () => {
      const mode = document.getElementById('fld_mode').value;
      try {
        await db.ref('users/' + uid + '/outcomeMode').set(mode);
        closeModal();
        toast('Mode updated → ' + MODE_META[mode].label, 'success');
        render();
      } catch (e) { toast('Failed: ' + e.message, 'error'); }
    }
  });
}

function openBalanceModal(uid) {
  openModal({
    title: 'Adjust Balance',
    bodyHTML: `
      <div class="form-group"><label>Operation</label>
        <select id="fld_op">
          <option value="add">Add Balance</option>
          <option value="subtract">Subtract Balance</option>
          <option value="set">Set Exact Balance</option>
        </select>
      </div>
      <div class="form-group"><label>Amount (৳)</label><input type="number" id="fld_amt" min="0"></div>
      <div class="form-group"><label>Note</label><input type="text" id="fld_note"></div>
    `,
    onSave: async () => {
      const op = document.getElementById('fld_op').value;
      const amt = Number(document.getElementById('fld_amt').value);
      const note = document.getElementById('fld_note').value || '';
      if (!amt || amt < 0) { toast('Invalid amount', 'error'); return; }
      const snap = await db.ref('users/' + uid + '/balance').once('value');
      const cur = Number(snap.val() || 0);
      let nb = cur;
      if (op === 'add') nb = cur + amt;
      if (op === 'subtract') nb = Math.max(0, cur - amt);
      if (op === 'set') nb = amt;
      await db.ref('users/' + uid + '/balance').set(nb);
      await db.ref('transactions').push({ uid, type:'admin_adjust', op, amount:amt, note, before:cur, after:nb, status:'complete', createdAt:Date.now() });
      closeModal();
      toast('Balance updated', 'success');
      render();
    }
  });
}

async function toggleBan(uid, ban) {
  try { await db.ref('users/' + uid + '/banned').set(ban); toast(ban ? 'Banned' : 'Unbanned', 'success'); render(); }
  catch (e) { toast('Failed: ' + e.message, 'error'); }
}
function confirmDeleteUser(uid) {
  openConfirm('Delete this user permanently?', async () => {
    try { await db.ref('users/' + uid).remove(); toast('Deleted', 'success'); render(); }
    catch (e) { toast('Failed: ' + e.message, 'error'); }
  });
}

/* =========================================================
   TRANSACTIONS
   ========================================================= */
async function renderTransactions() {
  const snap = await db.ref('transactions').once('value');
  let items = Object.entries(snap.val() || {}).map(([id, t]) => ({ id, ...t }));
  items.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(t => String(t.uid||'').toLowerCase().includes(q) || String(t.type||'').toLowerCase().includes(q) || String(t.status||'').toLowerCase().includes(q));
  }
  items = items.slice(0, 300);
  const rows = items.map(t => {
    const status = String(t.status||'pending').toLowerCase();
    const cls = ['approved','complete','success','accepted'].includes(status) ? 'badge-success'
      : ['rejected','cancelled'].includes(status) ? 'badge-danger' : 'badge-warning';
    const can = status === 'pending' && (t.type === 'deposit' || t.type === 'withdraw');
    return `<tr>
      <td><span class="text-truncate" style="max-width:110px">${escapeHtml(t.uid||'')}</span></td>
      <td><span class="badge badge-info">${escapeHtml(t.type||'-')}</span></td>
      <td>৳${fmtNum(t.amount||0)}</td>
      <td><span class="badge ${cls}">${status}</span></td>
      <td>${formatDate(t.createdAt)}</td>
      <td><div class="row-actions">
        ${can ? `<button class="btn-icon success" title="Approve" onclick="txAction('${t.id}','approved')"><i class="fas fa-check"></i></button>
                 <button class="btn-icon danger" title="Reject" onclick="txAction('${t.id}','rejected')"><i class="fas fa-xmark"></i></button>` : '<span class="text-muted">-</span>'}
      </div></td>
    </tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i class="fas fa-receipt"></i> Transactions <span class="badge badge-info">${items.length}</span></h3>
        <div class="card-actions">
          <div class="search-bar">
            <i class="fas fa-magnifying-glass"></i>
            <input type="text" placeholder="Search UID / type / status..." value="${escapeHtml(searchQuery)}" oninput="onSearch(this.value)">
          </div>
        </div>
      </div>
      <div class="table-wrap">
        ${items.length ? `<table>
          <thead><tr><th>UID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : emptyState('No transactions')}
      </div>
    </div>
  `;
}

async function txAction(id, status) {
  try {
    const txSnap = await db.ref('transactions/' + id).once('value');
    const tx = txSnap.val();
    if (!tx) return;
    await db.ref('transactions/' + id + '/status').set(status);
    if (status === 'approved') {
      const balSnap = await db.ref('users/' + tx.uid + '/balance').once('value');
      const cur = Number(balSnap.val() || 0);
      const amt = Number(tx.amount || 0);
      let nb = cur;
      if (tx.type === 'deposit') nb = cur + amt;
      if (tx.type === 'withdraw') nb = Math.max(0, cur - amt);
      await db.ref('users/' + tx.uid + '/balance').set(nb);
    }
    toast('Transaction ' + status, 'success');
    render();
  } catch (e) { toast('Failed: ' + e.message, 'error'); }
}

/* =========================================================
   EDIT MODAL
   ========================================================= */
async function openEditModal(key, id) {
  const s = SCHEMAS[key];
  let existing = {};
  if (id) {
    const snap = await db.ref(s.path + '/' + id).once('value');
    existing = snap.val() || {};
  } else {
    s.fields.forEach(f => { if (f.default !== undefined) existing[f.name] = f.default; });
  }
  const formHTML = s.fields.map(f => renderFormField(f, existing[f.name])).join('');
  openModal({
    title: (id ? 'Edit ' : 'Add ') + s.label.replace(/s$/,''),
    bodyHTML: formHTML,
    onSave: async () => {
      const data = {};
      for (const f of s.fields) {
        const el = document.getElementById('fld_' + f.name);
        if (!el) continue;
        if (f.type === 'checkbox') data[f.name] = el.checked;
        else if (f.type === 'number') data[f.name] = el.value === '' ? null : Number(el.value);
        else data[f.name] = el.value;
        if (f.required && !data[f.name]) { toast(f.label + ' required', 'error'); return; }
      }
      try {
        if (id) await db.ref(s.path + '/' + id).update(data);
        else { data.createdAt = Date.now(); await db.ref(s.path).push(data); }
        closeModal();
        toast('Saved', 'success');
        render();
      } catch (e) { toast('Failed: ' + e.message, 'error'); }
    }
  });
}

function renderFormField(f, value) {
  const v = value ?? (f.default ?? '');
  const req = f.required ? 'required' : '';
  let inner = '';
  if (f.type === 'checkbox') {
    return `<div class="form-group"><div class="form-check">
      <input type="checkbox" id="fld_${f.name}" ${v ? 'checked' : ''}>
      <label for="fld_${f.name}">${f.label}</label>
    </div></div>`;
  }
  if (f.type === 'select') {
    const opts = f.options.map(o => `<option value="${escapeHtml(o)}" ${String(v)===String(o)?'selected':''}>${o || '(none)'}</option>`).join('');
    inner = `<select id="fld_${f.name}" ${req}>${opts}</select>`;
  } else if (f.type === 'textarea') {
    inner = `<textarea id="fld_${f.name}" ${req} placeholder="${f.placeholder||''}">${escapeHtml(String(v))}</textarea>`;
  } else if (f.type === 'color') {
    inner = `<input type="color" id="fld_${f.name}" value="${escapeHtml(String(v||'#f5b72a'))}" ${req}>`;
  } else if (f.type === 'number') {
    inner = `<input type="number" id="fld_${f.name}" value="${escapeHtml(String(v))}" ${req} placeholder="${f.placeholder||''}">`;
  } else {
    const onInput = f.thumb ? `oninput="previewImg('fld_${f.name}','prev_${f.name}')"` : '';
    const preview = f.thumb ? `<img id="prev_${f.name}" class="img-preview${v?' show':''}" src="${escapeHtml(String(v||''))}" onerror="this.classList.remove('show')">` : '';
    inner = `<input type="text" id="fld_${f.name}" value="${escapeHtml(String(v))}" ${req} ${onInput} placeholder="${f.placeholder||''}">${preview}`;
  }
  return `<div class="form-group"><label for="fld_${f.name}">${f.label}</label>${inner}</div>`;
}

function previewImg(inputId, previewId) {
  const i = document.getElementById(inputId), p = document.getElementById(previewId);
  if (!i || !p) return;
  const v = i.value.trim();
  if (v) { p.src = v; p.classList.add('show'); } else p.classList.remove('show');
}

function confirmDelete(key, id) {
  const s = SCHEMAS[key];
  openConfirm('Delete this record?', async () => {
    try { await db.ref(s.path + '/' + id).remove(); toast('Deleted', 'success'); render(); }
    catch (e) { toast('Failed: ' + e.message, 'error'); }
  });
}

/* =========================================================
   MODAL / CONFIRM / TOAST
   ========================================================= */
let modalSaveHandler = null;
function openModal({ title, bodyHTML, onSave }) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalOverlay').classList.remove('hidden');
  modalSaveHandler = onSave;
  document.getElementById('modalSaveBtn').onclick = () => modalSaveHandler && modalSaveHandler();
  document.querySelectorAll('#modalBody input[id^="fld_"]').forEach(inp => {
    const t = 'prev_' + inp.id.replace('fld_', '');
    if (document.getElementById(t)) previewImg(inp.id, t);
  });
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  modalSaveHandler = null;
}
let confirmHandler = null;
function openConfirm(msg, onYes) {
  document.getElementById('confirmMessage').textContent = msg;
  document.getElementById('confirmOverlay').classList.remove('hidden');
  confirmHandler = onYes;
  document.getElementById('confirmYesBtn').onclick = () => {
    document.getElementById('confirmOverlay').classList.add('hidden');
    if (confirmHandler) confirmHandler();
    confirmHandler = null;
  };
}
function closeConfirm() {
  document.getElementById('confirmOverlay').classList.add('hidden');
  confirmHandler = null;
}
function toast(msg, type) {
  type = type || 'info';
  const ic = { success:'fa-check-circle', error:'fa-circle-xmark', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<i class="fas ${ic[type]}"></i><span>${escapeHtml(msg)}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(120%)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* =========================================================
   HELPERS
   ========================================================= */
function escapeHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtNum(n) { n = Number(n) || 0; return n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
function formatDate(ts) {
  if (!ts) return '-';
  const d = new Date(Number(ts));
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function emptyState(m) { return `<div class="empty-state"><i class="fas fa-inbox"></i><p>${escapeHtml(m)}</p></div>`; }
function loadingState() { return `<div class="loading-state"><i class="fas fa-circle-notch"></i><p style="margin-top:10px">Loading...</p></div>`; }

/* =========================================================
   GLOBAL EXPOSURE
   ========================================================= */
window.navigate = navigate;
window.openEditModal = openEditModal;
window.confirmDelete = confirmDelete;
window.closeModal = closeModal;
window.closeConfirm = closeConfirm;
window.openBalanceModal = openBalanceModal;
window.openUserModeModal = openUserModeModal;
window.toggleBan = toggleBan;
window.confirmDeleteUser = confirmDeleteUser;
window.txAction = txAction;
window.saveSingleton = saveSingleton;
window.onSearch = onSearch;
window.previewImg = previewImg;
window.saveGlobalControl = saveGlobalControl;
window.updateGameMode = updateGameMode;
window.updateGameField = updateGameField;
window.updateUserMode = updateUserMode;