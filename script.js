"use strict";

/* =========================================================
   Bloom Into My World  |  script.js
   ========================================================= */

/* ---------- Helpers ---------- */

const $ = (id) => document.getElementById(id);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TOTAL = 8;
const HEARTS = ["💗", "💕", "💖", "♡", "💘"];
const THEME_KEY = "rhea-bloom-theme";

/* ---------- Elements ---------- */

const petals = document.querySelectorAll(".petal");
const modal = $("story-modal");
const modalBox = $("modal-box");
const title = $("story-title");
const content = $("story-content");
const number = $("story-number");
const heartLayer = $("heart-layer");
const toastEl = $("toast");
const dotsEl = $("dots");
const stage = $("stage");
const flower = $("flower");
const center = $("flower-center");
const centerIcon = $("center-icon");
const centerQuote = $("center-quote");
const progressEl = $("progress");
const progressBar = $("progress-bar");
const progressText = $("progress-text");
const rain = $("petal-rain");

/* ---------- App state ---------- */

const visited = new Set();
let current = 0;
let lastFocus = null;
let finaleShown = false;

// Remembered while the page is open, so petals keep their progress
const state = {
  sleepy: 0,
  garden: [0, 0, 0, 0, 0],
  steps: 0,
  letterOpen: false,
  love: 0,
  fb: { rating: 0, enjoy: "", text: "", done: false }
};

/* ---------- Small effects: hearts, sparkles, confetti, toast ---------- */

function burst(x, y, emojis = HEARTS, count = 10) {
  if (reduceMotion) count = Math.min(count, 3);
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = pick(emojis);
    heart.style.left = x + (Math.random() * 40 - 20) + "px";
    heart.style.top = y + "px";
    heart.style.fontSize = 16 + Math.random() * 16 + "px";
    heart.style.setProperty("--dx", Math.random() * 160 - 80 + "px");
    heart.style.animationDelay = Math.random() * 0.3 + "s";
    heartLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 2400);
  }
}

function burstFrom(el, emojis, count) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, emojis, count);
}

function sparkle(x, y) {
  const s = document.createElement("span");
  s.className = "sparkle";
  s.textContent = pick(["✦", "✧", "♡", "·"]);
  s.style.left = x + "px";
  s.style.top = y + "px";
  heartLayer.appendChild(s);
  setTimeout(() => s.remove(), 750);
}

function confetti() {
  if (reduceMotion) return;
  const items = ["🌸", "🌷", "💗", "✨", "🎀", "💮"];
  for (let i = 0; i < 42; i++) {
    const c = document.createElement("span");
    c.className = "confetti";
    c.textContent = pick(items);
    c.style.left = Math.random() * 100 + "vw";
    c.style.fontSize = 16 + Math.random() * 18 + "px";
    c.style.setProperty("--dx", Math.random() * 200 - 100 + "px");
    c.style.setProperty("--dur", 2.6 + Math.random() * 2 + "s");
    c.style.setProperty("--delay", Math.random() * 1.2 + "s");
    heartLayer.appendChild(c);
    setTimeout(() => c.remove(), 6200);
  }
}

let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

/* ---------- Themes + falling petals ---------- */

const RAIN_EMOJI = { pink: "🌸", lavender: "💜", mint: "🍃", sunset: "🌼" };

function buildRain(theme) {
  rain.innerHTML = "";
  if (reduceMotion) return;
  const count = window.innerWidth < 600 ? 9 : 16;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "rain";
    p.textContent = RAIN_EMOJI[theme] || "🌸";
    p.style.setProperty("--x", Math.random() * 100 + "%");
    p.style.setProperty("--size", 14 + Math.random() * 14 + "px");
    p.style.setProperty("--dur", 12 + Math.random() * 10 + "s");
    p.style.setProperty("--delay", -Math.random() * 20 + "s");
    p.style.setProperty("--sway", Math.random() * 120 - 60 + "px");
    rain.appendChild(p);
  }
}

function applyTheme(name, save) {
  document.documentElement.setAttribute("data-theme", name);
  document.querySelectorAll(".theme-dot").forEach((dot) => {
    const on = dot.dataset.theme === name;
    dot.classList.toggle("active", on);
    dot.setAttribute("aria-pressed", String(on));
  });
  buildRain(name);
  if (save) {
    try { localStorage.setItem(THEME_KEY, name); } catch (e) { /* storage not available */ }
  }
}

document.querySelectorAll(".theme-dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    applyTheme(dot.dataset.theme, true);
    burstFrom(dot, [RAIN_EMOJI[dot.dataset.theme]], 5);
  });
});

/* ---------- Story building blocks ---------- */

const flip = (front, back) => `
  <button type="button" class="flip-card" aria-pressed="false">
    <span class="flip-inner">
      <span class="flip-face flip-front"><b>${front}</b><small>tap to flip</small></span>
      <span class="flip-face flip-back">${back}</span>
    </span>
  </button>`;

const RATINGS = ["", "1 - Needs Improvement", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"];

/* ---------- Stories ---------- */

const stories = [
  {
    title: "About Me",
    content: `<h3>Hi, I'm Rhea Rocel! 🌸</h3>
      <p>I am a BSIT student who enjoys learning about technology and discovering new things.</p>
      <div class="flip-grid">${flip("What do I believe? ✨", "I believe that every small step helps me improve.")}</div>`
  },

  {
    title: "My Favorites",
    content: `<h3>Things I Like 💗</h3>
      <div class="flip-grid">
        ${flip("Favorite color 🎨", "<strong>💗 Pink</strong>")}
        ${flip("Favorite activity 🎬", "Watching movies and exploring social media.")}
        ${flip("Favorite place 🌿", "A peaceful place where I can relax.")}
      </div>
      <p class="tiny">Psst… try the colored dots at the top of the page to change the mood of my world 🎨</p>`
  },

  {
    title: "My Interests",
    content: `<h3>Things That Catch My Interest ✨</h3>
      <p>I enjoy exploring technology, web design, and coding tutorials.</p>
      <p>Sometimes, coding tutorials make me sleepy, but I still try to learn something new! 😂</p>
      <div class="sleepy">
        <div class="meter-face" id="sleepy-face">😄</div>
        <div class="meter"><div class="meter-fill" id="sleepy-fill"></div></div>
        <p class="tiny" id="sleepy-text"></p>
        <button type="button" class="pill-btn" id="sleepy-btn">Watch a coding tutorial 💻</button>
      </div>`,
    init: initSleepy
  },

  {
    title: "My Skills & Goals",
    content: `<h3>Still Learning, Still Growing 🌱</h3>
      <p>My skills include basic HTML, CSS, JavaScript, simple UI design, and basic programming logic.</p>
      <p class="tiny">Tap a skill to water it 💧 and watch it grow!</p>
      <div class="garden" id="garden"></div>
      <p class="garden-msg" id="garden-msg"></p>
      <p>My goal is to improve my coding skills, build useful websites, and become more confident in programming.</p>`,
    init: initGarden
  },

  {
    title: "My Fun Side",
    content: `<h3>Life Beyond Coding 🎀</h3>
      <p>Aside from studying, I enjoy watching movies, playing games, and browsing Facebook, TikTok, and Instagram.</p>
      <p>These activities help me relax and enjoy my free time.</p>
      <p class="tiny">Can't decide what to do with your free time? Let the dice choose! 🎲</p>
      <div class="spin-result" id="spin-result" aria-live="polite">🎲 Roll to see!</div>
      <div class="center-row"><button type="button" class="pill-btn" id="spin-btn">Roll the dice 🎲</button></div>`,
    init: initDice
  },

  {
    title: "Growth & Motivation",
    content: `<h3>One Step at a Time 🌷</h3>
      <p>I may not know everything yet, but I am willing to learn and improve.</p>
      <blockquote>Small progress is still progress.</blockquote>
      <p>Every challenge is an opportunity to become better.</p>
      <div class="steps" aria-hidden="true">
        <div class="step" style="height:25%"></div>
        <div class="step" style="height:42%"></div>
        <div class="step" style="height:58%"></div>
        <div class="step" style="height:78%"></div>
        <div class="step" style="height:100%"></div>
      </div>
      <p class="tiny center-row" id="step-text" aria-live="polite"></p>
      <div class="center-row"><button type="button" class="pill-btn" id="step-btn">Take a step 👣</button></div>`,
    init: initSteps
  },

  {
    title: "A Thank-You Letter for Sir",
    content: `<h3>Thank You, Sir! 💖</h3>
      <button type="button" class="envelope" id="envelope" aria-label="Open the letter">💌<small>Tap to open</small></button>
      <div class="letter" id="letter" tabindex="-1" hidden>
        <p>Thank you for giving us the opportunity to express ourselves through this personal website.</p>
        <p>This activity helped me explore my creativity and practice HTML, CSS, and JavaScript.</p>
        <p>I hope you enjoy exploring my little world!</p>
        <p>Made with appreciation and a little bit of love for learning. ♡</p>
      </div>
      <div class="center-row" id="love-row" hidden>
        <button type="button" class="pill-btn" id="love-btn">Send some love 💖</button>
        <p class="tiny" id="love-count"></p>
      </div>`,
    init: initLetter
  },

  {
    title: "Your Feedback",
    content: `<h3>I'd Love to Hear From You! 💌</h3>
      <div id="feedback-holder"></div>`,
    init: initFeedback
  }
];

/* ---------- Story widgets ---------- */

function initSleepy(root) {
  const faces = ["😄", "🙂", "😐", "🥱", "😪", "😴"];
  const msgs = [
    "Wide awake and ready to code!",
    "Still focused… 💪",
    "Hmm, my eyes feel a little heavy…",
    "*yawn* Is it break time yet?",
    "So… sleepy…",
    "Zzz… but I still learned something new! 😂"
  ];
  const face = root.querySelector("#sleepy-face");
  const fill = root.querySelector("#sleepy-fill");
  const text = root.querySelector("#sleepy-text");
  const btn = root.querySelector("#sleepy-btn");

  function paint() {
    face.textContent = faces[state.sleepy];
    face.classList.toggle("snooze", state.sleepy === 5);
    fill.style.width = state.sleepy * 20 + "%";
    text.textContent = `Sleepiness: ${state.sleepy * 20}% — ${msgs[state.sleepy]}`;
    btn.textContent = state.sleepy === 5 ? "Drink some coffee ☕" : "Watch a coding tutorial 💻";
  }

  btn.addEventListener("click", () => {
    state.sleepy = state.sleepy === 5 ? 0 : state.sleepy + 1;
    paint();
    if (state.sleepy === 5) burstFrom(btn, ["💤", "😴"], 8);
    if (state.sleepy === 0) burstFrom(btn, ["☕", "✨"], 8);
  });
  paint();
}

function initGarden(root) {
  const skills = ["HTML", "CSS", "JavaScript", "UI Design", "Logic"];
  const stages = ["🌱", "🌿", "🌷", "🌸"];
  const names = ["Seedling", "Sprouting", "Budding", "Blooming"];
  const garden = root.querySelector("#garden");
  const msg = root.querySelector("#garden-msg");

  garden.innerHTML = skills.map((name, i) => `
    <button type="button" class="skill" data-i="${i}">
      <span class="plant"></span><b>${name}</b><small></small>
    </button>`).join("");

  function paint() {
    garden.querySelectorAll(".skill").forEach((btn, i) => {
      const level = state.garden[i];
      btn.querySelector(".plant").textContent = stages[level];
      btn.querySelector("small").textContent = names[level];
      btn.classList.toggle("grown", level === 3);
    });
    const total = state.garden.reduce((a, b) => a + b, 0);
    msg.textContent = state.garden.every((l) => l === 3)
      ? "Everything is blooming! 🌸 Thanks for cheering me on."
      : `💧 Waterings: ${total} / ${skills.length * 3}`;
  }

  garden.addEventListener("click", (e) => {
    const btn = e.target.closest(".skill");
    if (!btn) return;
    const i = Number(btn.dataset.i);
    if (state.garden[i] < 3) {
      state.garden[i]++;
      burstFrom(btn, state.garden[i] === 3 ? ["🌸", "✨"] : ["💧"], state.garden[i] === 3 ? 8 : 3);
    } else {
      burstFrom(btn, ["💗"], 2);
    }
    paint();
  });
  paint();
}

function initDice(root) {
  const options = [
    "🎬 Watching a movie",
    "🎮 Playing games",
    "📘 Browsing Facebook",
    "🎵 Scrolling TikTok",
    "📸 Checking Instagram"
  ];
  const box = root.querySelector("#spin-result");
  const btn = root.querySelector("#spin-btn");

  btn.addEventListener("click", () => {
    btn.disabled = true;
    box.classList.add("rolling");
    let rolls = 0;
    const timer = setInterval(() => {
      if (!document.body.contains(box)) { clearInterval(timer); return; }
      box.textContent = pick(options);
      rolls++;
      if (rolls >= 11) {
        clearInterval(timer);
        box.classList.remove("rolling");
        box.textContent = pick(options) + " ✨";
        btn.disabled = false;
        btn.textContent = "Roll again 🎲";
        burstFrom(box, ["🎲", "✨", "💗"], 8);
      }
    }, 90);
  });
}

function initSteps(root) {
  const stepEls = root.querySelectorAll(".step");
  const text = root.querySelector("#step-text");
  const btn = root.querySelector("#step-btn");

  function paint() {
    stepEls.forEach((el, i) => el.classList.toggle("lit", i < state.steps));
    if (state.steps === 0) text.textContent = "Tap the button to take a step 👣";
    else if (state.steps < 5) text.textContent = `Step ${state.steps} of 5 — keep going!`;
    else text.textContent = "You made it to the top! 🎉 Small progress adds up.";
    btn.textContent = state.steps === 5 ? "Start again ↺" : "Take a step 👣";
  }

  btn.addEventListener("click", () => {
    state.steps = state.steps === 5 ? 0 : state.steps + 1;
    paint();
    if (state.steps === 5) burstFrom(btn, ["🎉", "🌷", "✨", "💗"], 14);
  });
  paint();
}

function initLetter(root) {
  const env = root.querySelector("#envelope");
  const letter = root.querySelector("#letter");
  const loveRow = root.querySelector("#love-row");
  const loveBtn = root.querySelector("#love-btn");
  const loveCount = root.querySelector("#love-count");

  function paint() {
    env.hidden = state.letterOpen;
    letter.hidden = !state.letterOpen;
    loveRow.hidden = !state.letterOpen;
    loveCount.textContent = state.love
      ? `Hearts sent: ${state.love} 💗`
      : "Tap as many times as you like!";
  }

  env.addEventListener("click", () => {
    burstFrom(env, ["💖", "💌", "✨"], 14);
    state.letterOpen = true;
    paint();
    letter.focus({ preventScroll: true });
  });

  loveBtn.addEventListener("click", () => {
    state.love++;
    paint();
    burstFrom(loveBtn, HEARTS, 8);
  });
  paint();
}

function initFeedback(root) {
  const holder = root.querySelector("#feedback-holder");

  function renderForm() {
    holder.innerHTML = `
      <form id="feedback-form" novalidate>
        <p class="field-label" id="rating-label">How would you rate my website?</p>
        <div class="stars" role="group" aria-labelledby="rating-label">
          ${[1, 2, 3, 4, 5].map((n) =>
            `<button type="button" class="star" aria-label="${n} star${n > 1 ? "s" : ""}" aria-pressed="false">★</button>`
          ).join("")}
        </div>
        <p class="star-label" id="star-label"></p>

        <p class="field-label" id="enjoy-label">Did you enjoy my website?</p>
        <div class="choices" role="group" aria-labelledby="enjoy-label">
          <button type="button" class="choice" data-value="Yes!" aria-pressed="false"><span class="e">😍</span>Yes!</button>
          <button type="button" class="choice" data-value="Somewhat" aria-pressed="false"><span class="e">🙂</span>Somewhat</button>
          <button type="button" class="choice" data-value="No" aria-pressed="false"><span class="e">😕</span>No</button>
        </div>

        <label for="suggestion">Suggestions or recommendations:</label>
        <textarea id="suggestion" rows="3" maxlength="300" placeholder="Write your feedback here..."></textarea>
        <p class="counter" id="counter">0 / 300</p>

        <p class="form-error" id="feedback-error" role="alert"></p>
        <div class="center-row" style="margin-top:4px">
          <button type="submit" class="pill-btn">Submit Feedback ♡</button>
        </div>
      </form>`;

    const form = holder.querySelector("form");
    const starBtns = [...holder.querySelectorAll(".star")];
    const starLabel = holder.querySelector("#star-label");
    const choiceBtns = [...holder.querySelectorAll(".choice")];
    const textarea = holder.querySelector("#suggestion");
    const counter = holder.querySelector("#counter");
    const error = holder.querySelector("#feedback-error");

    function paintStars(n) {
      starBtns.forEach((b, i) => b.classList.toggle("on", i < n));
      starLabel.textContent = n ? RATINGS[n] : "Tap a star";
    }

    function paintAll() {
      paintStars(state.fb.rating);
      starBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i < state.fb.rating)));
      choiceBtns.forEach((b) => {
        const on = b.dataset.value === state.fb.enjoy;
        b.classList.toggle("selected", on);
        b.setAttribute("aria-pressed", String(on));
      });
      textarea.value = state.fb.text;
      counter.textContent = `${state.fb.text.length} / 300`;
    }

    starBtns.forEach((b, i) => {
      b.addEventListener("click", () => {
        state.fb.rating = i + 1;
        error.textContent = "";
        paintAll();
        burstFrom(b, ["⭐", "✨"], 4);
      });
      b.addEventListener("mouseenter", () => paintStars(i + 1));
    });
    holder.querySelector(".stars").addEventListener("mouseleave", () => paintStars(state.fb.rating));

    choiceBtns.forEach((b) => {
      b.addEventListener("click", () => {
        state.fb.enjoy = b.dataset.value;
        error.textContent = "";
        paintAll();
      });
    });

    textarea.addEventListener("input", () => {
      state.fb.text = textarea.value;
      counter.textContent = `${textarea.value.length} / 300`;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!state.fb.rating || !state.fb.enjoy) {
        error.textContent = "Please pick a star rating and tell me if you enjoyed it ♡";
        return;
      }
      state.fb.done = true;
      renderThanks();
      confetti();
      burstFrom(holder, HEARTS, 14);
    });

    paintAll();
  }

  function renderThanks() {
    const r = state.fb.rating;
    holder.innerHTML = `
      <div class="thanks">
        <div class="big">🎉</div>
        <h3>Thank you so much!</h3>
        <div class="summary">
          <p><b>Rating:</b> <span id="s-rating"></span></p>
          <p><b>Enjoyed it?</b> <span id="s-enjoy"></span></p>
          <p id="s-note-row"><b>Your note:</b> <span id="s-note"></span></p>
        </div>
        <p class="tiny">Thank you for your feedback! ♡ Your response is not saved or sent anywhere.</p>
        <div class="center-row">
          <button type="button" class="pill-btn ghost" id="again">Write another</button>
        </div>
      </div>`;
    // textContent keeps whatever was typed from being treated as HTML
    holder.querySelector("#s-rating").textContent = "★".repeat(r) + "☆".repeat(5 - r) + "  " + RATINGS[r];
    holder.querySelector("#s-enjoy").textContent = state.fb.enjoy;
    const note = state.fb.text.trim();
    holder.querySelector("#s-note").textContent = note;
    holder.querySelector("#s-note-row").hidden = !note;
    holder.querySelector("#again").addEventListener("click", () => {
      state.fb = { rating: 0, enjoy: "", text: "", done: false };
      renderForm();
    });
  }

  state.fb.done ? renderThanks() : renderForm();
}

/* ---------- Progress + discovery ---------- */

function updateProgress() {
  const n = visited.size;
  progressBar.style.width = (n / TOTAL) * 100 + "%";
  progressEl.setAttribute("aria-valuenow", String(n));
  progressText.textContent =
    n === TOTAL ? "All 8 petals discovered! 🌸" : `${n} of ${TOTAL} petals discovered`;
}

function markVisited(index) {
  if (visited.has(index)) return;
  visited.add(index);
  petals[index].classList.add("visited");
  petals[index].setAttribute("aria-label", petals[index].getAttribute("aria-label") + " (visited)");
  updateProgress();
  if (visited.size === TOTAL) toast("🌸 All 8 petals found! Close this to see a surprise");
  else toast(`✨ ${visited.size} of ${TOTAL} petals discovered`);
}

function finale() {
  finaleShown = true;
  flower.classList.add("bloomed");
  center.classList.add("bloomed");
  centerIcon.textContent = "🌸";
  setQuote("You found all eight petals! Thank you for visiting my little world 🌷");
  confetti();
  toast("🎉 You bloomed the whole flower!");
}

/* ---------- Modal ---------- */

function buildDots() {
  dotsEl.innerHTML = "";
  stories.forEach((story, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to petal ${i + 1}: ${story.title}`);
    dot.addEventListener("click", () => openStory(i));
    dotsEl.appendChild(dot);
  });
}

function updateDots() {
  [...dotsEl.children].forEach((dot, i) => {
    dot.classList.toggle("current", i === current);
    dot.classList.toggle("visited", visited.has(i) && i !== current);
    if (i === current) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
}

function openStory(index, trigger) {
  const firstOpen = !modal.classList.contains("active");
  if (firstOpen) lastFocus = trigger || document.activeElement;

  current = (index + TOTAL) % TOTAL;
  const story = stories[current];

  title.textContent = story.title;
  content.innerHTML = story.content;
  if (story.init) story.init(content);

  number.textContent = "PETAL " + String(current + 1).padStart(2, "0") + " / 08";
  markVisited(current);
  updateDots();

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalBox.scrollTop = 0;

  if (firstOpen) {
    modalBox.focus({ preventScroll: true });
    if (trigger) burstFrom(trigger, HEARTS, 12);
    else burst(window.innerWidth / 2, window.innerHeight * 0.5, HEARTS, 12);
  } else {
    burst(window.innerWidth / 2, window.innerHeight * 0.45, HEARTS, 6);
  }
}

function closeStory() {
  if (!modal.classList.contains("active")) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  if (visited.size === TOTAL && !finaleShown) setTimeout(finale, 350);
}

petals.forEach((petal) => {
  petal.addEventListener("click", () => openStory(Number(petal.dataset.story), petal));
});

$("close-modal").addEventListener("click", closeStory);
$("close-bottom").addEventListener("click", closeStory);
$("backdrop").addEventListener("click", closeStory);
$("prev-btn").addEventListener("click", () => openStory(current - 1));
$("next-btn").addEventListener("click", () => openStory(current + 1));

// Flip cards (one listener covers every story)
content.addEventListener("click", (event) => {
  const card = event.target.closest(".flip-card");
  if (!card) return;
  card.classList.toggle("flipped");
  card.setAttribute("aria-pressed", String(card.classList.contains("flipped")));
});

// Keyboard: Esc closes, arrows browse, Tab stays inside the modal
document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("active")) return;

  if (event.key === "Escape") {
    closeStory();
    return;
  }

  const typing = event.target.matches("textarea, input, select");
  if (!typing && event.key === "ArrowRight") openStory(current + 1);
  if (!typing && event.key === "ArrowLeft") openStory(current - 1);

  if (event.key === "Tab") {
    const focusable = [...modalBox.querySelectorAll("button, select, textarea, input, [tabindex]:not([tabindex='-1'])")]
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modalBox)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// Swipe left/right on touch screens
let touchX = 0;
let touchY = 0;
let touchOk = false;
modalBox.addEventListener("touchstart", (event) => {
  touchOk = !event.target.closest("textarea, select, input");
  touchX = event.changedTouches[0].clientX;
  touchY = event.changedTouches[0].clientY;
}, { passive: true });
modalBox.addEventListener("touchend", (event) => {
  if (!touchOk) return;
  const dx = event.changedTouches[0].clientX - touchX;
  const dy = event.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    openStory(dx < 0 ? current + 1 : current - 1);
  }
}, { passive: true });

/* ---------- The flower: center tap, surprise, tilt ---------- */

const quotes = [
  "Small progress is still progress. 🌱",
  "Every challenge is an opportunity to become better. 🌷",
  "I may not know everything yet, but I'm willing to learn. 💗",
  "Every small step helps me improve. ✨",
  "Thanks for visiting my little world! 🌸",
  "Still learning, still growing. 🎀"
];
let lastQuote = -1;

function setQuote(text) {
  centerQuote.textContent = text;
  centerQuote.classList.remove("fade");
  void centerQuote.offsetWidth; // restart the fade animation
  centerQuote.classList.add("fade");
}

center.addEventListener("click", () => {
  let i;
  do { i = Math.floor(Math.random() * quotes.length); } while (i === lastQuote);
  lastQuote = i;
  setQuote(quotes[i]);
  center.classList.remove("spin");
  void center.offsetWidth;
  center.classList.add("spin");
  burstFrom(center, HEARTS, 10);
});

center.addEventListener("animationend", (event) => {
  if (event.animationName === "center-spin") center.classList.remove("spin");
});

$("surprise").addEventListener("click", () => {
  const unseen = [...Array(TOTAL).keys()].filter((i) => !visited.has(i));
  const index = pick(unseen.length ? unseen : [...Array(TOTAL).keys()]);
  openStory(index, petals[index]);
});

// The flower leans toward your mouse (desktop only)
if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  stage.addEventListener("pointermove", (event) => {
    const r = stage.getBoundingClientRect();
    const px = (event.clientX - r.left) / r.width - 0.5;
    const py = (event.clientY - r.top) / r.height - 0.5;
    flower.style.setProperty("--ry", px * 12 + "deg");
    flower.style.setProperty("--rx", -py * 12 + "deg");
  });
  stage.addEventListener("pointerleave", () => {
    flower.style.setProperty("--ry", "0deg");
    flower.style.setProperty("--rx", "0deg");
  });
}

/* ---------- Sparkles on tap and mouse trail ---------- */

let lastSpark = 0;
document.addEventListener("pointermove", (event) => {
  if (reduceMotion || event.pointerType !== "mouse" || modal.classList.contains("active")) return;
  const now = performance.now();
  if (now - lastSpark < 70) return;
  lastSpark = now;
  sparkle(event.clientX, event.clientY);
});

document.addEventListener("pointerdown", (event) => {
  if (reduceMotion) return;
  for (let i = 0; i < 4; i++) {
    sparkle(event.clientX + Math.random() * 30 - 15, event.clientY + Math.random() * 30 - 15);
  }
});

/* ---------- Start ---------- */

let savedTheme = "pink";
try { savedTheme = localStorage.getItem(THEME_KEY) || "pink"; } catch (e) { /* storage not available */ }
if (!RAIN_EMOJI[savedTheme]) savedTheme = "pink";

buildDots();
updateProgress();
applyTheme(savedTheme, false);
