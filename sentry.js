/**
 * CyberShield SL — Cyber Sentry 3D AI Robot Assistant Mascot
 * Floating animated 3D robot character with interactive website tour.
 */

const CyberSentry = (() => {

  const SVG_SENTRY = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="robot-3d-svg">
    <defs>
      <linearGradient id="botHeadGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="botBodyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="botVisorGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="headsetGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
      <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Floating Glow Ring Underneath -->
    <ellipse cx="50" cy="90" rx="26" ry="6" fill="rgba(59, 130, 246, 0.35)" filter="url(#glowBlue)">
      <animate attributeName="rx" values="26;20;26" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
    </ellipse>

    <!-- Headset Band -->
    <path d="M22 36 C 22 14, 78 14, 78 36" fill="none" stroke="url(#headsetGrad)" stroke-width="5.5" stroke-linecap="round"/>

    <!-- Headset Ear Pads -->
    <rect x="18" y="30" width="9" height="18" rx="4.5" fill="url(#headsetGrad)"/>
    <rect x="73" y="30" width="9" height="18" rx="4.5" fill="url(#headsetGrad)"/>

    <!-- Headset Microphone -->
    <path d="M22 42 C 16 52, 28 62, 40 60" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="41" cy="60" r="3.5" fill="#60a5fa" filter="url(#glowBlue)"/>

    <!-- 3D Body / Torso -->
    <path d="M30 55 C 30 48, 70 48, 70 55 L 65 78 C 65 83, 35 83, 35 78 Z" fill="url(#botBodyGrad)" stroke="#94a3b8" stroke-width="1"/>
    <!-- Chest Core Glow -->
    <circle cx="50" cy="65" r="7" fill="#3b82f6" filter="url(#glowBlue)">
      <animate attributeName="r" values="7;8.5;7" dur="2s" repeatCount="indefinite"/>
    </circle>
    <path d="M50 61 L46 64 L46 67 Q46 70 50 71 Q54 70 54 67 L54 64 Z" fill="white" opacity="0.9"/>

    <!-- 3D Head -->
    <rect x="25" y="18" width="50" height="36" rx="18" fill="url(#botHeadGrad)" stroke="#cbd5e1" stroke-width="1.2"/>

    <!-- Visor Screen -->
    <rect x="29" y="22" width="42" height="24" rx="12" fill="url(#botVisorGrad)" stroke="#3b82f6" stroke-width="1.5"/>

    <!-- Glowing Expressive Eyes -->
    <g class="bot-eyes">
      <ellipse cx="40" cy="33" rx="4.5" ry="6" fill="#38bdf8" filter="url(#glowBlue)">
        <animate attributeName="ry" values="6;1;6" dur="3.5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="60" cy="33" rx="4.5" ry="6" fill="#38bdf8" filter="url(#glowBlue)">
        <animate attributeName="ry" values="6;1;6" dur="3.5s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="41.5" cy="31" r="1.5" fill="white"/>
      <circle cx="61.5" cy="31" r="1.5" fill="white"/>
    </g>

    <!-- Smile Line -->
    <path d="M44 40 Q50 43 56 40" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>

    <!-- Left Arm -->
    <path d="M28 56 C 18 62, 16 72, 22 76" fill="none" stroke="url(#botHeadGrad)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="22" cy="76" r="4.5" fill="#3b82f6"/>

    <!-- Right Arm (Animated Waving & Pointing) -->
    <g class="robot-waving-arm">
      <path d="M72 56 C 84 48, 88 36, 84 28" fill="none" stroke="url(#botHeadGrad)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="84" cy="26" r="5" fill="#3b82f6"/>
      <path d="M84 21 L 84 15" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
      <path d="M81 22 L 78 18" stroke="#60a5fa" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M87 22 L 90 18" stroke="#60a5fa" stroke-width="1.8" stroke-linecap="round"/>
    </g>
  </svg>`;

  const TIPS = {
    login: [
      { title: "Hi! I'm Cyber Sentry AI 🤖", text: "I'm your 3D Assistant! I'll guide you through your cybersecurity awareness training. Register or sign in to begin!" },
      { title: "Security Tip 🛡️", text: "Always use a strong password when registering. Try a passphrase like 'BlueMango!River42'." },
      { title: "Did You Know?", text: "Over 90% of cyberattacks begin with a simple human error. Training can prevent this!" }
    ],
    dashboard: [
      { title: "Hi Officer! 🤖", text: "I'm Cyber Sentry, your 3D AI Assistant! Click 'Website Tour' below to let me guide you through the platform!" },
      { title: "Pro Tip 💡", text: "Complete all 5 modules with 70%+ quiz score to earn your official Divisional Secretariat Certificate!" },
      { title: "SIEM Live Telemetry ⚡", text: "Check out the live SIEM telemetry monitor to observe real-time cyber incident logging!" }
    ],
    module: [
      { title: "Before You Start 🎬", text: "Review the guide carefully before attempting the quiz. The explanations will help you pass!" },
      { title: "Quiz Tip 💡", text: "Read each scenario carefully. Think about what a careful professional would do." },
      { title: "Stay Focused 🎯", text: "A 70% score is required to pass and unlock the next module. Take your time!" }
    ],
    quiz_fail: [
      { title: "Don't Give Up! 💪", text: "You didn't pass this time. Review the module content and try again — you've got this!" }
    ],
    quiz_pass: [
      { title: "Excellent Work! 🎉", text: "Outstanding! You've mastered this module. The next one awaits your skills!" }
    ]
  };

  const TOUR_STEPS = [
    {
      target: '.topbar',
      title: "1/5 — Topbar & Profile 👤",
      text: "Welcome to CyberShield SL! Here in the topbar, you can see your Employee ID, Division, Language Toggle (EN | සි), and Live Wallpaper Controls!",
      pos: { bottom: 'auto', top: '80px', right: '40px', left: 'auto' }
    },
    {
      target: '.welcome-hero',
      title: "2/5 — Executive Progress 📊",
      text: "This Executive Banner tracks your Overall Training Completion (% progress bar) and personal details in real-time!",
      pos: { bottom: 'auto', top: '160px', right: '50px', left: 'auto' }
    },
    {
      target: '.stats-row',
      title: "3/5 — Statistics & Badges 🏆",
      text: "Track Total Modules (5), Completed Lessons, Avg. Quiz Score, and Earned Champion Badges right here!",
      pos: { bottom: 'auto', top: '340px', right: '50px', left: 'auto' }
    },
    {
      target: '.modules-grid, .main',
      title: "4/5 — 5 Awareness Modules 🔐",
      text: "Complete all 5 Interactive Modules: Phishing, Passwords, Safe Browsing, Social Engineering, & Data Classification!",
      pos: { bottom: 'auto', top: '500px', right: '50px', left: 'auto' }
    },
    {
      target: '.bottom-grid',
      title: "5/5 — SIEM Telemetry & Certificate 📜",
      text: "Simulate live security events in the SIEM Live Dashboard and claim your official Government Certificate!",
      pos: { bottom: '30px', top: 'auto', right: '30px', left: 'auto' }
    }
  ];

  let tipIndex = 0;
  let tourIndex = 0;
  let inTourMode = false;
  let currentContext = 'login';
  let isVisible = false;

  function detectContext() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('module')) return 'module';
    if (path.includes('dashboard')) return 'dashboard';
    return 'login';
  }

  function injectDOM() {
    if (document.getElementById('cyberSentryWrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'sentry-wrapper';
    wrapper.id = 'cyberSentryWrapper';

    wrapper.innerHTML = `
      <div class="sentry-bubble" id="sentryBubble">
        <button class="bubble-close" onclick="CyberSentry.hideBubble()" title="Close">×</button>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="font-size:16px;">🤖</span>
          <strong id="sentryBubbleTitle" style="color:#60a5fa; font-size:14px;"></strong>
        </div>
        <div id="sentryBubbleText" style="font-size:13px; line-height:1.5; color:#cbd5e1;"></div>
        <div id="sentryControls" style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <button onclick="CyberSentry.nextTip()" class="sentry-btn-primary">Next Tip →</button>
          <button onclick="CyberSentry.startTour()" class="sentry-btn-tour">Website Tour 🚀</button>
        </div>
      </div>
      <div class="sentry-avatar" id="sentryAvatar" onclick="CyberSentry.toggleBubble()" title="Click for AI Assistant Guide & Tour">
        ${SVG_SENTRY}
      </div>
    `;

    document.body.appendChild(wrapper);
  }

  function showTip(context, tipSet) {
    if (inTourMode) return;
    currentContext = context || detectContext();
    const tips = tipSet || TIPS[currentContext] || TIPS['login'];
    tipIndex = 0;
    renderTip(tips[tipIndex]);
    document.getElementById('sentryBubble').classList.add('show');
    isVisible = true;
  }

  function renderTip(tip) {
    const titleEl = document.getElementById('sentryBubbleTitle');
    const textEl = document.getElementById('sentryBubbleText');
    if (titleEl) titleEl.textContent = tip.title;
    if (textEl) textEl.textContent = tip.text;
  }

  function nextTip() {
    if (inTourMode) {
      nextTourStep();
      return;
    }
    const tips = TIPS[currentContext] || TIPS['login'];
    tipIndex = (tipIndex + 1) % tips.length;
    renderTip(tips[tipIndex]);
  }

  function hideBubble() {
    if (inTourMode) endTour();
    const bubble = document.getElementById('sentryBubble');
    if (bubble) bubble.classList.remove('show');
    isVisible = false;
  }

  function toggleBubble() {
    if (isVisible) {
      hideBubble();
    } else {
      showTip(currentContext);
    }
  }

  // ── GUIDED WEBSITE TOUR ENGINE ──────────────────────────────────────
  function startTour() {
    inTourMode = true;
    tourIndex = 0;
    const wrapper = document.getElementById('cyberSentryWrapper');
    if (wrapper) wrapper.classList.add('tour-mode');
    showTourStep(tourIndex);
  }

  function showTourStep(index) {
    if (index < 0 || index >= TOUR_STEPS.length) {
      endTour();
      return;
    }

    const step = TOUR_STEPS[index];
    const wrapper = document.getElementById('cyberSentryWrapper');
    const controls = document.getElementById('sentryControls');

    // Remove previous highlights
    document.querySelectorAll('.tour-highlight-box').forEach(el => el.classList.remove('tour-highlight-box'));

    // Highlight target element if present
    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      targetEl.classList.add('tour-highlight-box');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Position assistant
    if (wrapper && step.pos) {
      wrapper.style.top = step.pos.top;
      wrapper.style.bottom = step.pos.bottom;
      wrapper.style.right = step.pos.right;
      wrapper.style.left = step.pos.left;
    }

    renderTip({ title: step.title, text: step.text });

    if (controls) {
      controls.innerHTML = `
        <div style="display:flex; gap:6px; width:100%; justify-content:space-between; align-items:center;">
          <button onclick="CyberSentry.prevTourStep()" class="sentry-btn-tour" ${index === 0 ? 'disabled style="opacity:0.5"' : ''}>← Prev</button>
          <span style="font-size:11px; color:#94a3b8; font-weight:700;">${index + 1} / ${TOUR_STEPS.length}</span>
          <button onclick="CyberSentry.nextTourStep()" class="sentry-btn-primary">${index === TOUR_STEPS.length - 1 ? 'Finish 🎉' : 'Next →'}</button>
        </div>
      `;
    }

    document.getElementById('sentryBubble')?.classList.add('show');
    isVisible = true;
  }

  function nextTourStep() {
    tourIndex++;
    if (tourIndex >= TOUR_STEPS.length) {
      endTour();
    } else {
      showTourStep(tourIndex);
    }
  }

  function prevTourStep() {
    if (tourIndex > 0) {
      tourIndex--;
      showTourStep(tourIndex);
    }
  }

  function endTour() {
    inTourMode = false;
    document.querySelectorAll('.tour-highlight-box').forEach(el => el.classList.remove('tour-highlight-box'));

    const wrapper = document.getElementById('cyberSentryWrapper');
    if (wrapper) {
      wrapper.classList.remove('tour-mode');
      wrapper.style.top = 'auto';
      wrapper.style.bottom = '24px';
      wrapper.style.right = '28px';
      wrapper.style.left = 'auto';
    }

    const controls = document.getElementById('sentryControls');
    if (controls) {
      controls.innerHTML = `
        <button onclick="CyberSentry.nextTip()" class="sentry-btn-primary">Next Tip →</button>
        <button onclick="CyberSentry.startTour()" class="sentry-btn-tour">Website Tour 🚀</button>
      `;
    }

    renderTip({ title: "Tour Completed! 🎉", text: "You're all set! Explore the modules and let me know if you need any tips." });
  }

  function celebrate() {
    const avatar = document.getElementById('sentryAvatar');
    if (!avatar) return;
    avatar.classList.add('celebrating');
    showTip(null, TIPS.quiz_pass);
    launchConfetti();
    setTimeout(() => avatar.classList.remove('celebrating'), 4000);
  }

  function showFailTip() {
    showTip(null, TIPS.quiz_fail);
  }

  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#ffffff'];
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.8}s;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 4000);
  }

  function init(context) {
    injectDOM();
    currentContext = context || detectContext();
    setTimeout(() => showTip(currentContext), 1200);
  }

  return { init, showTip, hideBubble, toggleBubble, nextTip, startTour, nextTourStep, prevTourStep, endTour, celebrate, showFailTip, launchConfetti };
})();
