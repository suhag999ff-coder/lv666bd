/* ═══════════════════════════════════════════════════════════
   LV666 — User Live Chat Widget
   Uses same Firebase as the rest of the app
   ═══════════════════════════════════════════════════════════ */

let lcOpen = false;
let lcListener = null;

/* Build widget once */
(function initChatWidget() {
  const fab = document.createElement('button');
  fab.className = 'lc-fab';
  fab.id = 'lcFab';
  fab.innerHTML = '<i class="fas fa-headset"></i><span class="lc-badge hidden-el" id="lcBadge">0</span>';
  fab.onclick = openCsChat;
  document.body.appendChild(fab);

  // Wait until firebase + user ready
  const watcher = setInterval(() => {
    if (window.firebase && window.db && getCurrentUser) {
      clearInterval(watcher);
      startBadgeListener();
    }
  }, 500);
})();

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('lvUser') || 'null');
}

function startBadgeListener() {
  const user = getCurrentUser();
  if (!user || !user.uid) return;
  db.ref(`chats/${user.uid}/unreadUser`).on('value', snap=>{
    const badge = document.getElementById('lcBadge');
    if (!badge) return;
    if (snap.val()) badge.classList.remove('hidden-el');
    else badge.classList.add('hidden-el');
  });
}

/* Called from existing menu / buttons */
function openCsChat() {
  const user = getCurrentUser();
  if (!user || !user.uid) { alert('Please login first'); return; }

  lcOpen = true;
  db.ref(`chats/${user.uid}/unreadUser`).set(false);

  const overlay = document.createElement('div');
  overlay.className = 'lc-overlay';
  overlay.id = 'lcOverlay';
  overlay.innerHTML = `
    <div class="lc-panel" onclick="event.stopPropagation()">
      <div class="lc-head">
        <div class="lc-head-av"><i class="fas fa-headset"></i></div>
        <div><b>Support Chat</b><small><i class="fas fa-circle" style="font-size:6px;color:#22c55e"></i> Online — usually replies in minutes</small></div>
        <i class="fas fa-xmark lc-close" onclick="closeCsChat()"></i>
      </div>
      <div class="lc-body" id="lcBody"></div>
      <div class="lc-input">
        <input id="lcInput" placeholder="Type a message..." onkeyup="if(event.key==='Enter')lcSend()">
        <button onclick="lcSend()"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>`;
  overlay.onclick = closeCsChat;
  document.body.appendChild(overlay);

  // Register user info for admin
  db.ref(`chats/${user.uid}`).update({
    phone: user.phone || '',
    lastTime: Date.now()
  });

  // Listen messages
  if (lcListener) db.ref(`chats/${user.uid}/messages`).off('value', lcListener);
  lcListener = db.ref(`chats/${user.uid}/messages`).on('value', snap=>{
    const msgs = snap.val() || {};
    const list = Object.entries(msgs).map(([id,m])=>({...m,id}))
      .sort((a,b)=>(a.time||0)-(b.time||0));
    const body = document.getElementById('lcBody');
    if (!body) return;
    body.innerHTML = list.length ? list.map(m=>`
      <div class="lc-msg ${m.from==='admin'?'admin':'user'}">
        ${escapeHtml(m.text||'')}
        <small>${m.time?new Date(m.time).toLocaleTimeString():''}</small>
      </div>`).join('') : '<div class="lc-empty">👋 Hi! How can we help you today?</div>';
    body.scrollTop = body.scrollHeight;
  });
}

function closeCsChat() {
  lcOpen = false;
  const o = document.getElementById('lcOverlay');
  if (o) o.remove();
  const user = getCurrentUser();
  if (user && user.uid && lcListener) {
    db.ref(`chats/${user.uid}/messages`).off('value', lcListener);
    lcListener = null;
  }
}

function lcSend() {
  const input = document.getElementById('lcInput');
  const text = input.value.trim();
  const user = getCurrentUser();
  if (!text || !user) return;
  db.ref(`chats/${user.uid}/messages`).push({
    from: 'user', text, time: Date.now(), read: false
  });
  db.ref(`chats/${user.uid}`).update({
    phone: user.phone || '',
    lastMsg: text,
    lastTime: Date.now(),
    unreadAdmin: true,
    unreadUser: false
  });
  input.value = '';
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
