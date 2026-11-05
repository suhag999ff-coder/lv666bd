/* ═══════════════════════════════════════════════════════════
   LV666 ADMIN — Firebase config
   (Copy the SAME config from your app.js)
   ═══════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ─── Admin Credentials ─── */
const DEFAULT_ADMIN = { id: "admin", pass: "Admin@2026" };
const getAdminId = () => localStorage.getItem('adAdminId') || DEFAULT_ADMIN.id;
const getAdminPass = () => localStorage.getItem('adAdminPass') || DEFAULT_ADMIN.pass;

/* ─── State ─── */
let USERS = {}, CHATS = {}, DEPOSITS = {}, WITHDRAWS = {};
let GAMES = {}, BANNERS = {}, NOTIFS = {}, SETTINGS = {};
let activeChatUid = null, chatListener = null;
let depFilter = 'pending', withFilter = 'pending';

/* ═══════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════ */
function adLogin() {
  const id = document.getElementById('adEmail').value.trim();
  const pass = document.getElementById('adPass').value;
  const err = document.getElementById('adErr');
  if (id === getAdminId() && pass === getAdminPass()) {
    sessionStorage.setItem('adLogged', '1');
    document.getElementById('loginPage').classList.add('hidden-el');
    document.getElementById('mainApp').classList.remove('hidden-el');
    adInit();
    adToast('Welcome back!', 'success');
  } else {
    err.textContent = '❌ Invalid credentials';
    err.classList.remove('hidden-el');
  }
}
function adTogglePass() {
  const p = document.getElementById('adPass');
  p.type = p.type === 'password' ? 'text' : 'password';
}
function adLogout() {
  if (confirm('Logout?')) {
    sessionStorage.removeItem('adLogged');
    location.reload();
  }
}
if (sessionStorage.getItem('adLogged') === '1') {
  document.getElementById('loginPage').classList.add('hidden-el');
  document.getElementById('mainApp').classList.remove('hidden-el');
  setTimeout(adInit, 100);
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function adTab(tab, el) {
  document.querySelectorAll('.ad-nav-item').forEach(x => x.classList.remove('on'));
  if (el) el.classList.add('on');
  document.querySelectorAll('.ad-tab-content').forEach(x => x.classList.add('hidden-el'));
  const t = document.getElementById('tab-' + tab);
  if (t) t.classList.remove('hidden-el');
  const titles = {
    dashboard:['Dashboard','Platform overview'], users:['Users','Manage user accounts'],
    chat:['Live Chat','Real-time support'], deposits:['Deposits','Approve / reject deposits'],
    withdraws:['Withdraws','Approve / reject withdraws'], games:['Games','Manage game library'],
    banners:['Banners','Homepage banners'], notifications:['Notifications','Broadcast messages'],
    settings:['Settings','Platform config'], security:['Security','Admin credentials']
  };
  document.getElementById('adTitle').textContent = titles[tab][0];
  document.getElementById('adSub').textContent = titles[tab][1];
  if (window.innerWidth < 900) document.getElementById('adSidebar').classList.remove('show');
}
function adToggleSidebar() {
  document.getElementById('adSidebar').classList.toggle('show');
}

/* ═══════════════════════════════════════════════════════════
   INIT — Real-time listeners
   ═══════════════════════════════════════════════════════════ */
function adInit() {
  db.ref('users').on('value', s => { USERS = s.val()||{}; renderDash(); renderUsers(); renderChatList(); });
  db.ref('chats').on('value', s => { CHATS = s.val()||{}; renderChatList(); updateBadges(); });
  db.ref('deposits').on('value', s => { DEPOSITS = s.val()||{}; renderDash(); renderDeposits(); updateBadges(); });
  db.ref('withdraws').on('value', s => { WITHDRAWS = s.val()||{}; renderWithdraws(); });
  db.ref('settings').on('value', s => { SETTINGS = s.val()||{}; fillSettings(); });
  db.ref('games').on('value', s => { GAMES = s.val()||{}; renderGames(); });
  db.ref('banners').on('value', s => { BANNERS = s.val()||{}; renderBanners(); });
  db.ref('notifications').on('value', s => { NOTIFS = s.val()||{}; renderNotifHistory(); });
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function renderDash() {
  const users = Object.values(USERS);
  const totalBal = users.reduce((a,u)=> a + parseFloat(u.balance||0), 0);
  const pending = Object.values(DEPOSITS).filter(d=>d.status==='pending').length;
  const activeChats = Object.values(CHATS).filter(c=>c.messages && Object.keys(c.messages).length>0).length;

  document.getElementById('stUsers').textContent = users.length;
  document.getElementById('stBalance').textContent = '৳' + totalBal.toFixed(2);
  document.getElementById('stPending').textContent = pending;
  document.getElementById('stChats').textContent = activeChats;

  const recUsers = users.sort((a,b)=>(b.joined||0)-(a.joined||0)).slice(0,6);
  document.getElementById('recentUsers').innerHTML = recUsers.length
    ? recUsers.map(u=>`
      <div class="ad-recent-item">
        <div class="ad-av">${(u.phone||'U').charAt(0)}</div>
        <div><b>${u.phone||'N/A'}</b><small>৳${parseFloat(u.balance||0).toFixed(2)}</small></div>
      </div>`).join('')
    : '<div class="ad-empty">No users yet</div>';

  const recDeps = Object.entries(DEPOSITS).map(([id,d])=>({...d,id}))
    .sort((a,b)=>(b.time||0)-(a.time||0)).slice(0,6);
  document.getElementById('recentDeposits').innerHTML = recDeps.length
    ? recDeps.map(d=>`
      <div class="ad-recent-item">
        <div class="ad-av" style="background:#22c55e">৳</div>
        <div><b>৳${parseFloat(d.amount||0).toFixed(2)}</b>
          <small>${d.phone||'-'} · ${d.method||'-'}</small></div>
        <span class="ad-pill ${d.status==='approved'?'green':d.status==='rejected'?'red':'yellow'}">${d.status||'pending'}</span>
      </div>`).join('')
    : '<div class="ad-empty">No deposits yet</div>';
}

/* ═══════════════════════════════════════════════════════════
   USERS
   ═══════════════════════════════════════════════════════════ */
function renderUsers() {
  const q = (document.getElementById('userSearch')?.value||'').toLowerCase();
  const f = document.getElementById('userFilter')?.value||'all';
  const tbody = document.getElementById('usersTable');
  if (!tbody) return;

  let list = Object.entries(USERS).map(([uid,u])=>({...u,uid}));
  list = list.filter(u=>{
    if (f!=='all' && (u.status||'active')!==f) return false;
    if (q && !(u.phone||'').toLowerCase().includes(q) && !uid.toLowerCase().includes(q)) return false;
    return true;
  });

  tbody.innerHTML = list.length ? list.map(u=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="ad-mini-av">${(u.phone||'U').charAt(0)}</span>
          <span style="font-weight:600">${u.nickname||'-'}</span>
        </div>
      </td>
      <td>${u.phone||'-'}</td>
      <td><b>৳${parseFloat(u.balance||0).toFixed(2)}</b></td>
      <td><span class="ad-pill ${u.status==='blocked'?'red':'green'}">${u.status||'active'}</span></td>
      <td style="font-size:11px;color:#64748b">${u.joined?new Date(u.joined).toLocaleDateString():'-'}</td>
      <td>
        <button class="ad-action-btn" onclick="openEditUser('${u.uid}')">Edit</button>
        <button class="ad-action-btn ${u.status==='blocked'?'approve':'reject'}" onclick="toggleBlock('${u.uid}')">${u.status==='blocked'?'Unblock':'Block'}</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="6" class="ad-empty">No users found</td></tr>';
}

function openEditUser(uid) {
  const u = USERS[uid] || {};
  adModal('Edit User', `
    <label class="ad-label">Phone</label>
    <input class="ad-input" value="${u.phone||''}" readonly>
    <label class="ad-label">Nickname</label>
    <input class="ad-input" id="editNick" value="${u.nickname||''}">
    <label class="ad-label">Balance (৳)</label>
    <input class="ad-input" type="number" step="0.01" id="editBal" value="${u.balance||0}">
    <label class="ad-label">VIP Level</label>
    <input class="ad-input" type="number" id="editVip" value="${u.vip||0}">
    <button class="ad-btn-primary" style="margin-top:12px;width:100%" onclick="saveUser('${uid}')">Save Changes</button>
  `);
}
function saveUser(uid) {
  db.ref(`users/${uid}`).update({
    nickname: document.getElementById('editNick').value,
    balance: parseFloat(document.getElementById('editBal').value)||0,
    vip: parseInt(document.getElementById('editVip').value)||0
  }).then(()=>{ adModalClose(); adToast('User updated','success'); });
}
function toggleBlock(uid) {
  const u = USERS[uid]||{};
  const newStatus = u.status==='blocked'?'active':'blocked';
  if (!confirm(`Set user status to ${newStatus}?`)) return;
  db.ref(`users/${uid}/status`).set(newStatus).then(()=>adToast('Status updated','success'));
}
function exportUsers() {
  const rows = [['UID','Phone','Nickname','Balance','Status','Joined']];
  Object.entries(USERS).forEach(([uid,u])=>{
    rows.push([uid,u.phone||'',u.nickname||'',u.balance||0,u.status||'active',
      u.joined?new Date(u.joined).toISOString():'']);
  });
  const csv = rows.map(r=>r.map(x=>`"${x}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'users.csv'; a.click();
}

/* ═══════════════════════════════════════════════════════════
   DEPOSITS
   ═══════════════════════════════════════════════════════════ */
function setDepFilter(f, el) {
  depFilter = f;
  document.querySelectorAll('#depTabs button').forEach(b=>b.classList.remove('on'));
  if (el) el.classList.add('on');
  renderDeposits();
}
function renderDeposits() {
  const tbody = document.getElementById('depositsTable');
  if (!tbody) return;
  let list = Object.entries(DEPOSITS).map(([id,d])=>({...d,id}));
  if (depFilter !== 'all') list = list.filter(d=>d.status===depFilter);
  list.sort((a,b)=>(b.time||0)-(a.time||0));

  tbody.innerHTML = list.length ? list.map(d=>`
    <tr>
      <td>${d.phone||'-'}</td>
      <td><b>৳${parseFloat(d.amount||0).toFixed(2)}</b></td>
      <td>${d.method||'-'}</td>
      <td><span class="ad-pill ${d.status==='approved'?'green':d.status==='rejected'?'red':'yellow'}">${d.status||'pending'}</span></td>
      <td style="font-size:11px">${d.time?new Date(d.time).toLocaleString():'-'}</td>
      <td>
        ${d.status==='pending' ? `
          <button class="ad-action-btn approve" onclick="approveDep('${d.id}')">✓ Approve</button>
          <button class="ad-action-btn reject" onclick="rejectDep('${d.id}')">✗ Reject</button>
        ` : '-'}
      </td>
    </tr>`).join('') : '<tr><td colspan="6" class="ad-empty">No deposits</td></tr>';
}
function approveDep(id) {
  const d = DEPOSITS[id]; if (!d) return;
  if (!confirm(`Approve ৳${d.amount} deposit for ${d.phone}?`)) return;
  const amount = parseFloat(d.amount)||0;
  const uid = d.uid;
  // Get user current balance & add
  db.ref(`users/${uid}/balance`).transaction(cur=>{
    return (parseFloat(cur)||0) + amount;
  }).then(()=>{
    db.ref(`deposits/${id}/status`).set('approved');
    db.ref(`deposits/${id}/approvedAt`).set(Date.now());
    adToast('Deposit approved & balance added','success');
  });
}
function rejectDep(id) {
  if (!confirm('Reject this deposit?')) return;
  db.ref(`deposits/${id}/status`).set('rejected');
  db.ref(`deposits/${id}/rejectedAt`).set(Date.now());
  adToast('Deposit rejected','success');
}

/* ═══════════════════════════════════════════════════════════
   WITHDRAWS
   ═══════════════════════════════════════════════════════════ */
function setWithFilter(f, el) {
  withFilter = f;
  document.querySelectorAll('#withTabs button').forEach(b=>b.classList.remove('on'));
  if (el) el.classList.add('on');
  renderWithdraws();
}
function renderWithdraws() {
  const tbody = document.getElementById('withdrawsTable');
  if (!tbody) return;
  let list = Object.entries(WITHDRAWS).map(([id,w])=>({...w,id}));
  if (withFilter !== 'all') list = list.filter(w=>w.status===withFilter);
  list.sort((a,b)=>(b.time||0)-(a.time||0));

  tbody.innerHTML = list.length ? list.map(w=>`
    <tr>
      <td>${w.phone||'-'}</td>
      <td><b>৳${parseFloat(w.amount||0).toFixed(2)}</b></td>
      <td>${w.number||'-'} <br><small style="color:#64748b">${w.method||''}</small></td>
      <td><span class="ad-pill ${w.status==='approved'?'green':w.status==='rejected'?'red':'yellow'}">${w.status||'pending'}</span></td>
      <td style="font-size:11px">${w.time?new Date(w.time).toLocaleString():'-'}</td>
      <td>
        ${w.status==='pending' ? `
          <button class="ad-action-btn approve" onclick="approveWith('${w.id}')">✓ Approve</button>
          <button class="ad-action-btn reject" onclick="rejectWith('${w.id}')">✗ Reject</button>
        ` : '-'}
      </td>
    </tr>`).join('') : '<tr><td colspan="6" class="ad-empty">No withdraws</td></tr>';
}
function approveWith(id) {
  const w = WITHDRAWS[id]; if (!w) return;
  if (!confirm(`Approve ৳${w.amount} withdraw for ${w.phone}?`)) return;
  // Balance already deducted when user requested; just mark approved
  db.ref(`withdraws/${id}/status`).set('approved');
  db.ref(`withdraws/${id}/approvedAt`).set(Date.now());
  adToast('Withdraw approved','success');
}
function rejectWith(id) {
  const w = WITHDRAWS[id]; if (!w) return;
  if (!confirm(`Reject withdraw? ৳${w.amount} will be refunded.`)) return;
  const amount = parseFloat(w.amount)||0;
  const uid = w.uid;
  // Refund balance
  db.ref(`users/${uid}/balance`).transaction(cur=>{
    return (parseFloat(cur)||0) + amount;
  }).then(()=>{
    db.ref(`withdraws/${id}/status`).set('rejected');
    db.ref(`withdraws/${id}/rejectedAt`).set(Date.now());
    adToast('Withdraw rejected & refunded','success');
  });
}

/* ═══════════════════════════════════════════════════════════
   LIVE CHAT
   ═══════════════════════════════════════════════════════════ */
function renderChatList() {
  const el = document.getElementById('chatList');
  if (!el) return;
  const list = Object.entries(CHATS).map(([uid,c])=>({...c,uid}))
    .filter(c=>c.messages && Object.keys(c.messages).length>0)
    .sort((a,b)=>(b.lastTime||0)-(a.lastTime||0));

  el.innerHTML = list.length ? list.map(c=>{
    const user = USERS[c.uid]||{};
    const phone = user.phone || c.phone || c.uid;
    const unread = c.unreadAdmin ? 1 : 0;
    return `<div class="ad-conv ${activeChatUid===c.uid?'on':''}" onclick="openChat('${c.uid}')">
      <div class="ad-av">${phone.charAt(0)}</div>
      <div class="ad-conv-info">
        <b>${phone}</b>
        <small>${c.lastMsg||'(no messages)'}</small>
      </div>
      ${unread?'<span class="unread">●</span>':''}
    </div>`;
  }).join('') : '<div class="ad-chat-empty">No conversations yet</div>';
}

function openChat(uid) {
  activeChatUid = uid;
  const user = USERS[uid]||{};
  const c = CHATS[uid]||{};
  const phone = user.phone || c.phone || uid;
  document.getElementById('chatHeaderAv').textContent = phone.charAt(0);
  document.getElementById('chatHeaderName').textContent = phone;
  document.getElementById('chatHeaderPhone').textContent = 'UID: ' + uid;

  // Mark read
  db.ref(`chats/${uid}/unreadAdmin`).set(false);

  if (chatListener) db.ref(`chats/${uid}/messages`).off('value', chatListener);
  chatListener = db.ref(`chats/${uid}/messages`).on('value', snap=>{
    const msgs = snap.val()||{};
    const win = document.getElementById('chatWindow');
    const arr = Object.entries(msgs).map(([id,m])=>({...m,id})).sort((a,b)=>(a.time||0)-(b.time||0));
    win.innerHTML = arr.length ? arr.map(m=>`
      <div class="chat-bubble ${m.from==='admin'?'admin':'user'}">
        ${escapeHtml(m.text||'')}
        <small>${m.time?new Date(m.time).toLocaleTimeString():''}</small>
      </div>`).join('') : '<div class="ad-empty">No messages yet</div>';
    win.scrollTop = win.scrollHeight;
  });

  renderChatList();
}

function sendAdminMsg() {
  const input = document.getElementById('adminChatInput');
  const text = input.value.trim();
  if (!text || !activeChatUid) return;
  const uid = activeChatUid;
  db.ref(`chats/${uid}/messages`).push({
    from:'admin', text, time:Date.now(), read:false
  });
  db.ref(`chats/${uid}`).update({
    lastMsg:text, lastTime:Date.now(), unreadUser:true, unreadAdmin:false
  });
  input.value = '';
}

function updateBadges() {
  const unreadChats = Object.values(CHATS).filter(c=>c.unreadAdmin).length;
  const badge = document.getElementById('navChatBadge');
  if (badge) {
    badge.textContent = unreadChats;
    badge.classList.toggle('hidden-el', unreadChats===0);
  }
  const pendingDeps = Object.values(DEPOSITS).filter(d=>d.status==='pending').length;
  const db_ = document.getElementById('navDepBadge');
  if (db_) {
    db_.textContent = pendingDeps;
    db_.classList.toggle('hidden-el', pendingDeps===0);
  }
}

function escapeHtml(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

/* ═══════════════════════════════════════════════════════════
   GAMES
   ═══════════════════════════════════════════════════════════ */
function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;
  const list = Object.entries(GAMES);
  grid.innerHTML = list.length ? list.map(([key,g])=>`
    <div class="ad-game-card ${g.on===false?'off':''}">
      <button class="ad-del" onclick="delGame('${key}')">✗</button>
      <img src="${g.img||''}" onerror="this.style.display='none'">
      <b>${g.name||key}</b>
      <small>${g.category||'—'}</small>
    </div>`).join('') : '<div class="ad-empty" style="grid-column:1/-1">No games yet — click Add Game</div>';
}
function addGame() {
  adModal('Add Game', `
    <label class="ad-label">Game Key</label>
    <input class="ad-input" id="gKey" placeholder="e.g. wingo">
    <label class="ad-label">Game Name</label>
    <input class="ad-input" id="gName">
    <label class="ad-label">Image URL</label>
    <input class="ad-input" id="gImg" placeholder="https://...">
    <label class="ad-label">Category</label>
    <select class="ad-input" id="gCat">
      <option value="slots">Slots</option>
      <option value="live">Live Casino</option>
      <option value="crash">Crash</option>
      <option value="sports">Sports</option>
      <option value="table">Table</option>
    </select>
    <button class="ad-btn-primary" style="width:100%;margin-top:12px" onclick="saveGame()">Save</button>
  `);
}
function saveGame() {
  const key = document.getElementById('gKey').value.trim();
  if (!key) return alert('Key required');
  db.ref(`games/${key}`).set({
    key, name:document.getElementById('gName').value,
    img:document.getElementById('gImg').value,
    category:document.getElementById('gCat').value,
    on:true, order:Date.now()
  }).then(()=>{ adModalClose(); adToast('Game added','success'); });
}
function delGame(key) {
  if (!confirm('Delete this game?')) return;
  db.ref(`games/${key}`).remove().then(()=>adToast('Deleted','success'));
}

/* ═══════════════════════════════════════════════════════════
   BANNERS
   ═══════════════════════════════════════════════════════════ */
function renderBanners() {
  const grid = document.getElementById('bannersGrid');
  if (!grid) return;
  const list = Object.entries(BANNERS);
  grid.innerHTML = list.length ? list.map(([id,b])=>`
    <div class="ad-banner-card">
      <button class="ad-del" onclick="delBanner('${id}')">✗</button>
      <img src="${b.img||''}" onerror="this.style.display='none'">
      <b>Order: ${b.order||'-'}</b>
    </div>`).join('') : '<div class="ad-empty" style="grid-column:1/-1">No banners</div>';
}
function addBanner() {
  adModal('Add Banner', `
    <label class="ad-label">Image URL</label>
    <input class="ad-input" id="bImg" placeholder="https://...">
    <label class="ad-label">Link (optional)</label>
    <input class="ad-input" id="bLink">
    <label class="ad-label">Display Order</label>
    <input class="ad-input" id="bOrder" type="number" value="1">
    <button class="ad-btn-primary" style="width:100%;margin-top:12px" onclick="saveBanner()">Save</button>
  `);
}
function saveBanner() {
  const img = document.getElementById('bImg').value.trim();
  if (!img) return alert('Image URL required');
  db.ref('banners').push({
    img, link:document.getElementById('bLink').value,
    order:parseInt(document.getElementById('bOrder').value)||1
  }).then(()=>{ adModalClose(); adToast('Banner added','success'); });
}
function delBanner(id) {
  if (!confirm('Delete?')) return;
  db.ref(`banners/${id}`).remove().then(()=>adToast('Deleted','success'));
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */
function sendNotif() {
  const title = document.getElementById('notifTitle').value.trim();
  const body = document.getElementById('notifBody').value.trim();
  if (!title || !body) return alert('Title & body required');
  db.ref('notifications').push({
    title, body, target:document.getElementById('notifTarget').value,
    time:Date.now()
  }).then(()=>{
    document.getElementById('notifTitle').value = '';
    document.getElementById('notifBody').value = '';
    adToast('Notification sent','success');
  });
}
function renderNotifHistory() {
  const el = document.getElementById('notifHistory');
  if (!el) return;
  const list = Object.entries(NOTIFS).map(([id,n])=>({...n,id}))
    .sort((a,b)=>(b.time||0)-(a.time||0)).slice(0,15);
  el.innerHTML = list.length ? list.map(n=>`
    <div class="ad-recent-item">
      <div class="ad-av" style="background:#3b82f6"><i class="fas fa-bell" style="font-size:12px"></i></div>
      <div><b>${n.title}</b><small>${new Date(n.time).toLocaleString()} → ${n.target}</small></div>
    </div>`).join('') : '<div class="ad-empty">No notifications sent</div>';
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS
   ═══════════════════════════════════════════════════════════ */
function fillSettings() {
  const s = SETTINGS;
  const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.value = v??''; };
  const chk = (id,v)=>{ const el=document.getElementById(id); if(el) el.checked = !!v; };
  set('setMinDep', s.minDeposit??100);
  set('setMaxDep', s.maxDeposit??25000);
  set('setMinWith', s.minWithdraw??500);
  set('setTurnover', s.turnoverMultiplier??1);
  set('setJackpot', s.jackpot??7777);
  set('setBkashNum', s.bkash?.number||'');
  set('setNagadNum', s.nagad?.number||'');
  set('setDepBonus', s.depositBonus??0);
  chk('setBkashOn', s.bkash?.on ?? true);
  chk('setNagadOn', s.nagad?.on ?? true);
  chk('setMaintenance', s.maintenance);
  chk('setRegOpen', s.regOpen ?? true);
  chk('setWithOn', s.withdrawOn ?? true);
}
function saveSettings() {
  const num = id => parseFloat(document.getElementById(id).value)||0;
  const chk = id => document.getElementById(id).checked;
  const val = id => document.getElementById(id).value;
  db.ref('settings').update({
    minDeposit:num('setMinDep'),
    maxDeposit:num('setMaxDep'),
    minWithdraw:num('setMinWith'),
    turnoverMultiplier:num('setTurnover'),
    jackpot:num('setJackpot'),
    depositBonus:num('setDepBonus'),
    bkash:{ on:chk('setBkashOn'), number:val('setBkashNum') },
    nagad:{ on:chk('setNagadOn'), number:val('setNagadNum') },
    maintenance:chk('setMaintenance'),
    regOpen:chk('setRegOpen'),
    withdrawOn:chk('setWithOn')
  }).then(()=>adToast('Settings saved','success'));
}

/* ═══════════════════════════════════════════════════════════
   SECURITY
   ═══════════════════════════════════════════════════════════ */
function changeAdminPass() {
  const cur = document.getElementById('secCurr').value;
  const nw = document.getElementById('secNew').value;
  const cf = document.getElementById('secConf').value;
  if (cur !== getAdminPass()) return alert('Current password wrong');
  if (nw.length < 6) return alert('New password too short (min 6)');
  if (nw !== cf) return alert('Passwords do not match');
  localStorage.setItem('adAdminPass', nw);
  document.getElementById('secCurr').value = '';
  document.getElementById('secNew').value = '';
  document.getElementById('secConf').value = '';
  adToast('Password updated','success');
}

/* ═══════════════════════════════════════════════════════════
   MODAL + TOAST
   ═══════════════════════════════════════════════════════════ */
function adModal(title, html) {
  document.getElementById('adModalTitle').textContent = title;
  document.getElementById('adModalBody').innerHTML = html;
  document.getElementById('adModal').classList.remove('hidden-el');
}
function adModalClose() {
  document.getElementById('adModal').classList.add('hidden-el');
}
function adToast(msg, type='info') {
  const t = document.createElement('div');
  t.className = 'ad-toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 2500);
}
