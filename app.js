// --- Dynamic Team Theming Config ---
const teamConfig = { 
  primary: "#1D4E89",
  secondary: "#F5A623",
  name: "City FC" 
};

// Security: Initialize Theme Safely via CSSOM
document.documentElement.style.setProperty('--theme-primary', teamConfig.primary);
document.documentElement.style.setProperty('--theme-secondary', teamConfig.secondary);
const hexToRgb = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));
const [r, g, b] = hexToRgb(teamConfig.primary);
const [sr, sg, sb] = hexToRgb(teamConfig.secondary);
document.documentElement.style.setProperty('--theme-primary-alpha', `rgba(${r}, ${g}, ${b}, 0.2)`);
document.documentElement.style.setProperty('--theme-secondary-alpha', `rgba(${sr}, ${sg}, ${sb}, 0.2)`);

let data = null;
let currentEventId = null;

// DOM Elements
const _sel = id => document.getElementById(id);
const splash = _sel('splash');
const ticketPortal = _sel('ticket-portal');
const ticketInput = _sel('ticket-input');
const authError = _sel('auth-error');
const qaFeed = _sel('qa-feed');
const quickActions = _sel('quick-actions-grid');
const mapRoute = _sel('active-route');
const settingsModal = _sel('settings-modal');
const timesheetModal = _sel('timesheet-modal');

let currentUserContext = null;

const gridCoords = {
  'north': { x: 200, y: 60 }, 'south': { x: 200, y: 340 },
  'west': { x: 60, y: 200 }, 'east': { x: 340, y: 200 } // Adjusted coordinates for new layout
};

const iconMap = {
  food: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
  restroom: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  seat: `<svg viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-6H4v3zM19 10h-3V7c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4v-1c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v1z"/></svg>`,
  time: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>`,
  exit: `<svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
  transport: `<svg viewBox="0 0 24 24"><path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H13.7l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm4 0h-5V6h5v4zm1.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
  alert: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  schedule: `<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-7-5h5v5h-5z"/></svg>`
};

async function init() {
  // Taskbar Tab Switching
  const tabDiscover = _sel('tab-discover');
  const tabOrganizer = _sel('tab-organizer');
  const viewDiscover = _sel('view-discover');
  const viewOrganizer = _sel('view-organizer');

  tabDiscover.addEventListener('click', () => {
    tabDiscover.classList.add('active'); tabOrganizer.classList.remove('active');
    viewDiscover.classList.add('active'); viewOrganizer.classList.remove('active');
  });

  tabOrganizer.addEventListener('click', () => {
    tabOrganizer.classList.add('active'); tabDiscover.classList.remove('active');
    viewOrganizer.classList.add('active'); viewDiscover.classList.remove('active');
  });

  // Load events into Grid
  const eventsGrid = _sel('events-grid');
  try {
    const res = await fetch('/api/events');
    const events = await res.json();
    eventsGrid.innerHTML = events.map(e => `
      <div class="event-card" style="background-image: url('${e.imageUrl}')">
        <div class="event-hover-overlay">
          <button class="join-event-btn tap-target" data-event-id="${e.id}">Register / Join</button>
        </div>
        <div class="event-card-content">
          <h3>${e.name}</h3>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.join-event-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const val = e.target.getAttribute('data-event-id');
        try {
          const res = await fetch('/api/events/' + val);
          data = await res.json();
          currentEventId = val;
          checkSession();
        } catch(err) {
          _sel('landing-msg-discover').textContent = "Failed to load event data.";
        }
      });
    });
  } catch(err) {
    _sel('landing-msg-discover').textContent = "Failed to load events from backend.";
  }

  _sel('upload-event-btn').addEventListener('click', async () => {
    const name = _sel('new-event-name').value.trim();
    const image = _sel('new-event-image').value.trim();
    let jsonStr = _sel('new-event-json').value.trim();
    if(!name || !jsonStr) { _sel('landing-msg-organizer').textContent = "Please provide name and JSON."; return; }
    let parsed;
    try { parsed = JSON.parse(jsonStr); } catch(e) { _sel('landing-msg-organizer').textContent = "Invalid JSON format."; return; }
    if(image) parsed.imageUrl = image;
    
    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name, data: parsed})
      });
      if(res.ok) {
        const d = await res.json();
        _sel('landing-msg-organizer').style.color = 'var(--wait-good)';
        alert(`CRITICAL: Event Published.\n\nYour unique Host Key is: ${d.host_key}\n\nPlease save this secure string in your records! You will not be able to update or drop your event without it.`);
        _sel('landing-msg-organizer').textContent = "Event successfully uploaded! Refreshing list...";
        setTimeout(() => location.reload(), 1500);
      }
    } catch(err) {
      _sel('landing-msg-organizer').textContent = "Upload failed.";
    }
  });

  _sel('mode-create-btn').addEventListener('click', () => {
    _sel('mode-create-btn').classList.add('active');
    _sel('mode-manage-btn').classList.remove('active');
    _sel('manage-banner').style.display = 'none';
    _sel('create-actions').style.display = 'block';
    _sel('manage-actions').style.display = 'none';
    _sel('new-event-name').value = '';
    _sel('new-event-image').value = '';
    _sel('new-event-json').value = '';
    _sel('landing-msg-organizer').textContent = '';
  });

  _sel('mode-manage-btn').addEventListener('click', () => {
    _sel('mode-manage-btn').classList.add('active');
    _sel('mode-create-btn').classList.remove('active');
    _sel('manage-banner').style.display = 'block';
    _sel('create-actions').style.display = 'none';
    _sel('manage-actions').style.display = 'none';
    _sel('new-event-name').value = '';
    _sel('new-event-image').value = '';
    _sel('new-event-json').value = '';
    _sel('landing-msg-organizer').textContent = '';
  });

  let currentManageId = null;
  _sel('load-event-btn').addEventListener('click', async () => {
    const hostKey = _sel('manage-host-key').value.trim();
    if(!hostKey) return;
    try {
      const res = await fetch('/api/events/manage/' + encodeURIComponent(hostKey));
      if(!res.ok) throw new Error();
      const payload = await res.json();
      currentManageId = payload.id;
      const eventData = payload.data;
      
      _sel('new-event-name').value = "Loading Event ID: " + currentManageId;
      _sel('new-event-json').value = JSON.stringify(eventData, null, 2);
      if(eventData.imageUrl) _sel('new-event-image').value = eventData.imageUrl;
      
      _sel('create-actions').style.display = 'none';
      _sel('manage-actions').style.display = 'flex';
      _sel('landing-msg-organizer').textContent = "Event Configuration Loaded. Awaiting modifications...";
      _sel('landing-msg-organizer').style.color = "var(--theme-primary)";
    } catch(err) {
      _sel('landing-msg-organizer').style.color = "var(--wait-bad)";
      _sel('landing-msg-organizer').textContent = "Failed to locate event via sequence key.";
    }
  });

  _sel('update-event-btn').addEventListener('click', async () => {
    const name = _sel('new-event-name').value.trim();
    const image = _sel('new-event-image').value.trim();
    let jsonStr = _sel('new-event-json').value.trim();
    const eventId = currentManageId;
    const hostKey = _sel('manage-host-key').value.trim();
    
    if(!name || !jsonStr || !hostKey || !eventId) { _sel('landing-msg-organizer').style.color = "var(--wait-bad)"; _sel('landing-msg-organizer').textContent = "Ensure Host Key and payload is present."; return; }
    
    let parsed;
    try { parsed = JSON.parse(jsonStr); } catch(e) { _sel('landing-msg-organizer').textContent = "Invalid JSON architecture."; return; }
    if(image) parsed.imageUrl = image;
    
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name, data: parsed, host_key: hostKey})
      });
      if(res.ok) {
        _sel('landing-msg-organizer').style.color = 'var(--wait-good)';
        _sel('landing-msg-organizer').textContent = "Configuration successfully updated! Validating...";
        setTimeout(() => location.reload(), 1500);
      } else {
         _sel('landing-msg-organizer').style.color = "var(--wait-bad)";
         _sel('landing-msg-organizer').textContent = "Host Key validation failed!";
      }
    } catch(err) {
      _sel('landing-msg-organizer').textContent = "Server rejection.";
    }
  });

  _sel('delete-event-btn').addEventListener('click', async () => {
    const eventId = currentManageId;
    const hostKey = _sel('manage-host-key').value.trim();
    if(!hostKey || !eventId) { _sel('landing-msg-organizer').style.color = "var(--wait-bad)"; _sel('landing-msg-organizer').textContent = "Missing Host Key."; return; }
    if(!confirm('Are you certain you want to permanently drop this event configuration?')) return;
    
    try {
      const res = await fetch(`/api/events/${eventId}?host_key=${encodeURIComponent(hostKey)}`, {
        method: 'DELETE'
      });
      if(res.ok) {
        _sel('landing-msg-organizer').style.color = 'var(--wait-bad)';
        _sel('landing-msg-organizer').textContent = "Event dropped gracefully. Refreshing grid...";
        setTimeout(() => location.reload(), 1500);
      } else {
         _sel('landing-msg-organizer').style.color = "var(--wait-bad)";
         _sel('landing-msg-organizer').textContent = "Host Key verification failed.";
      }
    } catch(err) {
      _sel('landing-msg-organizer').textContent = "Operation failed.";
    }
  });

  // Settings Handlers
  _sel('settings-btn').addEventListener('click', () => settingsModal.setAttribute('aria-hidden', 'false'));
  _sel('close-modal-btn').addEventListener('click', () => settingsModal.setAttribute('aria-hidden', 'true'));
  _sel('save-key-btn').addEventListener('click', () => {
    localStorage.setItem('geminiKey', _sel('api-key-input').value);
    settingsModal.setAttribute('aria-hidden', 'true');
    postCard([], `API Key Saved. Try asking the Concierge for dynamic advice!`, []);
  });

  _sel('close-timesheet-btn').addEventListener('click', () => timesheetModal.setAttribute('aria-hidden', 'true'));

  // Auth Handlers
  _sel('landing-brand-btn').addEventListener('click', () => {
    _sel('tab-discover').click(); // Switch explicitly to Discover tab globally
    const tp = _sel('ticket-portal');
    if (tp && tp.getAttribute('aria-hidden') === 'false') {
      tp.style.transition = 'none';
      tp.style.opacity = '0';
      tp.setAttribute('aria-hidden', 'true');
      setTimeout(() => { tp.style.transition = ''; tp.style.opacity = ''; }, 50);
      _sel('landing-portal').setAttribute('aria-hidden', 'false');
    }
  });

  _sel('home-brand-btn').addEventListener('click', () => {
    localStorage.removeItem('venueUser');
    location.reload();
  });
  
  _sel('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('venueUser');
    location.reload();
  });
  
  _sel('back-events-btn').addEventListener('click', () => {
    ticketPortal.style.opacity = '0';
    setTimeout(() => {
      ticketPortal.setAttribute('aria-hidden', 'true');
      ticketPortal.style.opacity = '';
      _sel('landing-portal').setAttribute('aria-hidden', 'false');
    }, 400);
  });
  
  _sel('auth-btn').addEventListener('click', attemptAuth);
  ticketInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptAuth(); });

  setTimeout(() => {
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.setAttribute('aria-hidden', 'true');
      _sel('landing-portal').setAttribute('aria-hidden', 'false');
    }, 400);
  }, 1200);
}

function attemptAuth() {
  const id = ticketInput.value.trim().toUpperCase();
  if(!id) { authError.textContent = "Please enter a valid ticket ID."; return; }
  
  if (data.tickets[id]) {
    localStorage.setItem('venueUser', id);
    ticketPortal.style.opacity = '0';
    _sel('landing-portal').style.opacity = '0';
    setTimeout(() => {
      ticketPortal.setAttribute('aria-hidden', 'true');
      _sel('landing-portal').setAttribute('aria-hidden', 'true');
      _sel('landing-portal').style.opacity = '';
      loadUserContext(id);
    }, 400);
  } else {
    authError.textContent = "Ticket Number not found in system.";
  }
}

function checkSession() {
  const saved = localStorage.getItem('venueUser');
  if (saved && data && data.tickets && data.tickets[saved]) {
    loadUserContext(saved);
    const portal = _sel('landing-portal');
    portal.style.opacity = '0';
    setTimeout(() => {
        portal.setAttribute('aria-hidden', 'true');
        portal.style.opacity = '';
    }, 400);
  } else {
    ticketPortal.style.opacity = '';
    ticketPortal.setAttribute('aria-hidden', 'false');
  }
}

function loadUserContext(ticketId) {
  _sel('app-core').style.display = 'flex';
  currentUserContext = data.tickets[ticketId];
  document.body.className = `role-${currentUserContext.role}`;
  _sel('user-greeting').textContent = `Hi, ${currentUserContext.name.split(' ')[0]}`;
  
  // Initialize Zone Default
  data.user = { currentZone: 'north' };
  document.querySelectorAll('.zone-box').forEach(z => z.classList.remove('active'));
  _sel(`zone-north`).classList.add('active');

  buildTimesheet();
  renderQuickActions();
  
  let welcome = `Welcome! Your scheduled itinerary is loaded and we are routing you to your seat: ${currentUserContext.seat.label}.`;
  if (currentUserContext.role === 'vip') welcome = `⭐ VIP access granted. Routing you to Suite Level.`;
  if (currentUserContext.role === 'staff') welcome = `🔧 Security access confirmed. Routing to primary deployment sector.`;
  
  // Clear feed directly on init
  while (qaFeed.firstChild) qaFeed.removeChild(qaFeed.firstChild);
  postCard([], welcome, []);
  
  // Implicitly route to the seat immediately on load! (Do not clear the welcome message)
  setTimeout(() => handleIntent('seat', false), 500);
}

function buildTimesheet() {
  const list = _sel('schedule-list');
  while (list.firstChild) list.removeChild(list.firstChild);
  
  currentUserContext.itinerary.forEach((i, idx) => {
    const li = document.createElement('li');
    li.className = `schedule-item ${i.status}`;
    
    let content = `<div class="event-details"><span class="schedule-time">${i.time}</span> <span class="schedule-event">${i.event}</span></div>`;
    
    if (i.status === 'active') {
      content += `<button class="checkin-btn tap-target" onclick="triggerTimelineAction(${idx}, 'checkin')">Check In</button>`;
    } else if (i.status === 'checked-in') {
      content += `<button class="checkout-btn tap-target" onclick="triggerTimelineAction(${idx}, 'checkout')">Check Out</button>`;
    } else if (i.status === 'completed') {
      content += `<span class="checkin-stamp">✓ Verified</span>`;
    }

    li.innerHTML = content;
    list.appendChild(li);
  });
}

window.triggerTimelineAction = function(idx, actionStr) {
  const currentEvent = currentUserContext.itinerary[idx];
  let text = "";
  let targetNode = data.user.currentZone; 

  if (actionStr === 'checkin') {
    // Logic constraint: Check if actual system time has passed the event time
    const now = new Date();
    const [hrs, mins] = currentEvent.time.split(':');
    const evtTime = new Date();
    evtTime.setHours(parseInt(hrs), parseInt(mins), 0);

    if (now < evtTime) {
      document.getElementById('timesheet-error').textContent = `Event has not started yet.`;
      setTimeout(() => { document.getElementById('timesheet-error').textContent = ''; }, 3000);
      return; // Abort check-in logic
    }

    // User arrives at event venue
    currentEvent.status = 'checked-in';
    text = `Checked into: ${currentEvent.event}! We will notify you when it's time for the next item. Don't forget to Check Out when you leave.`;
    
    // UI Update
    buildTimesheet();
    postCard([{color: "var(--wait-good)", text: "ARRIVED"}], text, []);
    
  } else if (actionStr === 'checkout') {
    // User leaves event
    currentEvent.status = 'completed';
    text = `You have checked out of ${currentEvent.event}.`;
    
    const nextIdx = currentUserContext.itinerary.findIndex(i => i.status === 'upcoming');
    if (nextIdx !== -1) {
      currentUserContext.itinerary[nextIdx].status = 'active';
      const nextEvent = currentUserContext.itinerary[nextIdx];
      text += ` Your next event is ${nextEvent.event} at ${nextEvent.time}. Autonomous routing engaged.`;
      targetNode = nextEvent.zone;
    } else {
      text += ` That was your final scheduled event for today! Safe travels.`;
    }
    
    // UI Update & Route Generation
    buildTimesheet();
    timesheetModal.setAttribute('aria-hidden', 'true');
    drawPath(data.user.currentZone, targetNode);
    data.user.currentZone = targetNode; // update their physical location estimate
    
    document.querySelectorAll('.zone-box').forEach(z => z.classList.remove('active'));
    _sel(`zone-${targetNode}`).classList.add('active');
    
    postCard([{color: "var(--theme-secondary)", text: "TIMELINE ROUTING"}], text, []);
  }
}



function renderQuickActions() {
  while (quickActions.firstChild) quickActions.removeChild(quickActions.firstChild);

  const fanItems = [
    { label: "My Schedule", icon: "schedule", intent: "schedule", class: "tile-schedule" },
    { label: "My Seat", icon: "seat", intent: "seat" },
    { label: "Nearest Food", icon: "food", intent: "food" },
    { label: "Restrooms", icon: "restroom", intent: "restroom" },
    { label: "Transport", icon: "transport", intent: "transport" },
    { label: "Wait Times", icon: "time", intent: "waits" },
    { label: "Exit Route", icon: "exit", intent: "exit" },
    { label: "Ask Concierge", icon: "alert", intent: "assist" }
  ];
  
  const vipItems = [ { label: "My Schedule", icon: "schedule", intent: "schedule", class: "tile-schedule" }, { label: "VIP Lounges", icon: "food", intent: "lounge" }, ...fanItems.slice(1).filter(i=>i.intent!=='food') ];
  const staffItems = [ { label: "My Deployment", icon: "schedule", intent: "schedule", class: "tile-schedule" }, { label: "Crowd Alerts", icon: "alert", intent: "crowd" }, ...fanItems.slice(1).filter(i=>i.intent!=='food') ];

  const items = currentUserContext.role === 'vip' ? vipItems : (currentUserContext.role === 'staff' ? staffItems : fanItems);
  
  items.forEach(i => {
    const btn = document.createElement('button');
    btn.className = `action-tile tap-target ${i.class || ''}`;
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.innerHTML = `${iconMap[i.icon]} <span></span>`;
    btn.querySelector('span').textContent = i.label;
    
    btn.addEventListener('click', () => handleIntent(i.intent, true));
    quickActions.appendChild(btn);
  });
}

function drawPath(startZone, endZone) {
  const start = gridCoords[startZone];
  const end = gridCoords[endZone];
  if (startZone === endZone) {
     mapRoute.classList.remove('visible'); return;
  }
  mapRoute.setAttribute('d', `M ${start.x} ${start.y} Q 200 200 ${end.x} ${end.y}`);
  mapRoute.classList.add('visible');
}

async function invokeGeminiAPI() {
  const apiKey = localStorage.getItem('geminiKey');
  if (!apiKey) {
    postCard([], "Concierge feature requires a Gemini API Key. Click the Settings ⚙️ icon to add it.", [{label:"OK", intent:"none"}]);
    return;
  }

  postCard([], "Analyzng venue metrics...", []);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const prompt = `Act as StadiaSense AI. Look at this queue data: North zone density is Low. Burger stand wait is 5m. South zone density is High. Please formulate a 2-sentence helpful tip for a user sitting in the North Zone. Keep it under 20 words. No Markdown.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if(!response.ok) throw new Error('API failed');
    const resData = await response.json();
    const textOut = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate specific insight.";
    postCard([{color:"var(--theme-secondary)", text:"🤖 AI CONCIERGE"}], textOut, [{label:"Close", intent:"none"}]);
  } catch (error) {
    postCard([], "Error connecting to Google Services. Please check your API key.", [{label:"Close", intent:"none"}]);
  }
}

function handleIntent(intent, clearFeed = true) {
  if (clearFeed) {
    while (qaFeed.firstChild) qaFeed.removeChild(qaFeed.firstChild);
  }

  const cz = data.user.currentZone;
  let text = "";
  let btns = [];
  let badges = [];
  let targetNode = cz;
  
  if (intent === 'assist') { invokeGeminiAPI(); return; }
  if (intent === 'schedule') {
    timesheetModal.setAttribute('aria-hidden', 'false');
    return;
  }
  
  if (intent === 'schedule_reminder') {
    const next = currentUserContext.itinerary.find(i => i.status === 'active' || i.status === 'upcoming');
    if(next) {
      text = `Next on your itinerary: ${next.event} at ${next.time}.`;
      btns = [{label:"View Full Schedule", intent:"schedule"}];
    } else { return; }
  }
  else if (intent === 'seat') {
    targetNode = currentUserContext.seat.zone;
    text = `Routing you to your seat: ${currentUserContext.seat.label} located in the ${targetNode.toUpperCase()} zone.`;
    badges.push({color: "var(--theme-secondary)", text: "DESTINATION"});
  }
  else if (intent === 'food' || intent === 'restroom' || intent === 'lounge') {
    let fac = data.facilities.filter(f => f.type === intent);
    if (!fac.length) { text = `No ${intent} facilities found.`; }
    else {
      fac.sort((a,b) => a.waitTime - b.waitTime);
      let best = fac[0];
      targetNode = best.zone;
      text = `The quickest ${intent.toUpperCase()} is ${best.name} (${best.waitTime} min wait).`;
      if (best.waitTime <= 5) badges.push({color:'var(--wait-good)', text: 'FAST'});
      else badges.push({color:'var(--wait-bad)', text: 'LONG WAIT'});
      
      let other = fac.find(f => f.zone === cz && f.id !== best.id);
      if (other && other.waitTime > best.waitTime) text += ` (The one in your zone is a longer ${other.waitTime} min wait.)`;
    }
  } 
  else if (intent === 'exit') {
    targetNode = 'north'; text = `Head immediately to Gate N. Traffic is light.`;
    badges.push({color: "var(--wait-good)", text: "SAFE EXIT"});
  }
  else if (intent === 'transport') {
    let fac = data.facilities.filter(f => f.type === 'transport');
    text = `Select your preferred transit method to get venue directions:`;
    badges.push({color: "var(--theme-secondary)", text: "PUBLIC TRANSIT"});
    btns = fac.map(f => ({ label: f.name, intent: `route_transit_${f.id}` }));
  }
  else if (intent.startsWith('route_transit_')) {
    let tId = intent.replace('route_transit_', '');
    let tFac = data.facilities.find(f => f.id === tId);
    if (tFac) {
      targetNode = tFac.zone;
      text = `To catch the ${tFac.name}, please follow the route to ${tFac.gate} located in the ${targetNode.toUpperCase()} zone. Have a safe trip home!`;
      badges.push({color: "var(--wait-good)", text: "DEPARTURE"});
    }
  }
  else if (intent === 'waits') {
    text = `Food wait times are around 8 minutes. Restrooms are around 3 minutes.`;
    btns = [{label:"Show Fast Food", intent:"food"}];
  }
  else if (intent === 'crowd' && currentUserContext.role === 'staff') {
    text = `High density alert in South Stand. Requesting overflow stewards.`;
    targetNode = 'south';
  }
  else {
    text = `Acknowledged.`;
  }

  drawPath(cz, targetNode);
  postCard(badges, text, btns);
}

function postCard(badgesArr, textContent, followUps) {
  const card = document.createElement('div');
  card.className = 'answer-card';
  card.setAttribute('role', 'alert');
  card.setAttribute('aria-live', 'assertive');

  const contentDiv = document.createElement('div');
  if(badgesArr && badgesArr.length > 0) {
    badgesArr.forEach(b => {
      const span = document.createElement('strong');
      span.style.color = b.color;
      span.textContent = b.text + " - ";
      contentDiv.appendChild(span);
    });
  }
  const p = document.createElement('span');
  p.textContent = textContent;
  contentDiv.appendChild(p);
  card.appendChild(contentDiv);
  
  if (followUps && followUps.length > 0) {
    const fuWrap = document.createElement('div');
    fuWrap.className = 'follow-ups';
    followUps.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'follow-up-btn tap-target';
      btn.setAttribute('tabindex', '0');
      btn.textContent = f.label;
      btn.addEventListener('click', () => { 
        fuWrap.remove(); 
        if (f.intent !== 'none') handleIntent(f.intent, true); 
      });
      fuWrap.appendChild(btn);
    });
    card.appendChild(fuWrap);
  }

  qaFeed.appendChild(card);
  setTimeout(() => qaFeed.scrollTo({ top: qaFeed.scrollHeight, behavior: 'smooth' }), 50);
}

// Add SVG definition for map gradient
const svg = document.querySelector('svg.venue-map');
if (svg) {
  svg.insertAdjacentHTML('afterbegin', `
    <defs>
      <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="var(--theme-secondary)" />
        <stop offset="100%" stop-color="#fff" />
      </linearGradient>
    </defs>
  `);
}

init();
