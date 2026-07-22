/* ============================================================
   US.EXE — script.js (Dark Arcade Edition)
   ============================================================ */

const MKEY = "usexe_playing",
  TKEY = "usexe_time";
let audio = null,
  isPlaying = false;

function initMusic() {
  if (audio) return;
  audio = document.createElement("audio");
  audio.loop = true;
  audio.src = "asset/music.mp3";
  audio.volume = 0.55;
  document.body.appendChild(audio);
  const saved = parseFloat(sessionStorage.getItem(TKEY) || "0");
  if (saved > 0) audio.currentTime = saved;
  setInterval(() => {
    if (audio && !audio.paused) sessionStorage.setItem(TKEY, audio.currentTime);
  }, 1000);
  if (sessionStorage.getItem(MKEY) === "true") playMusic();
  updateMusicUI();
}

function playMusic() {
  if (!audio) return;
  audio
    .play()
    .then(() => {
      isPlaying = true;
      sessionStorage.setItem(MKEY, "true");
      updateMusicUI();
    })
    .catch(() => {});
}
function pauseMusic() {
  if (!audio) return;
  audio.pause();
  isPlaying = false;
  sessionStorage.setItem(MKEY, "false");
  updateMusicUI();
}
function toggleMusic() {
  isPlaying ? pauseMusic() : playMusic();
}
function updateMusicUI() {
  const btn = document.getElementById("music-btn");
  const player = document.getElementById("music-player");
  if (btn) btn.textContent = isPlaying ? "⏸" : "▶";
  player?.classList.toggle("playing", isPlaying);
}

function setupAutoplay() {
  const go = () => {
    if (sessionStorage.getItem(MKEY) !== "false" && !isPlaying) playMusic();
    document.removeEventListener("click", go);
    document.removeEventListener("touchstart", go);
  };
  document.addEventListener("click", go);
  document.addEventListener("touchstart", go, { passive: true });
}

async function navigateTo(url) {
  if (audio && !audio.paused) {
    sessionStorage.setItem(TKEY, audio.currentTime);
    sessionStorage.setItem(MKEY, "true");
  }
  const ov = document.getElementById("page-transition");
  if (ov) ov.classList.add("active");
  try {
    const html = await fetch(url).then((r) => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    setTimeout(() => {
      document.title = doc.title;
      const fresh = doc.getElementById("app-content");
      const current = document.getElementById("app-content");
      if (fresh && current) current.innerHTML = fresh.innerHTML;
      history.pushState(null, "", url);
      window.scrollTo({ top: 0, behavior: "auto" });
      bindPage();
      if (ov) ov.classList.remove("active");
    }, 450);
  } catch (e) {
    window.location.href = url;
  }
}

function setupNavLinks() {
  document.querySelectorAll("a[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(el.href);
    });
  });
}
window.addEventListener("popstate", () => navigateTo(location.href));

function setupReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}

/* ── Cinematic Netflix Sequence (index.html) ── */
function setupCinema() {
  const pAbel = document.getElementById("profile-abel");
  const selectScreen = document.getElementById("profile-select");
  const trailer = document.getElementById("cinema-trailer");
  const skipBtn = document.getElementById("cinema-skip");
  const lines = document.querySelectorAll(".cine-text");

  if (!pAbel) return;

  pAbel.addEventListener("click", () => {
    selectScreen.style.display = "none";
    trailer.style.display = "flex";
    if (!isPlaying) playMusic();

    let delay = 1000;
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add("show");
        if (index < lines.length - 1) {
          setTimeout(() => line.classList.remove("show"), 2500);
        } else {
          setTimeout(() => (skipBtn.style.opacity = "1"), 1000);
        }
      }, delay);
      delay += 4000;
    });
  });
}

/* ── Trading Cards (Sequential Flow + Two-Way Flip) ── */
function setupCards() {
  const wraps = document.querySelectorAll(".card-wrap");
  if (!wraps.length) return;
  let uniqueFlippedCount = 0;
  const nextStageBtn = document.getElementById("next-stage-btn");

  // Deal animation
  wraps.forEach((w, i) => {
    setTimeout(() => {
      w.style.opacity = "1";
    }, i * 150);
  });

  wraps.forEach((wrap) => {
    const inner = wrap.querySelector(".card-inner");
    if (!inner || inner.dataset.bound) return;
    inner.dataset.bound = "1";

    inner.addEventListener("click", () => {
      inner.classList.toggle("flipped");

      // 2. Only count the flip towards progression if it's their FIRST time flipping this specific card
      if (!inner.dataset.flippedOnce) {
        inner.dataset.flippedOnce = "true";
        uniqueFlippedCount++;

        // Unlock next stage if all cards have been viewed at least once
        if (uniqueFlippedCount === wraps.length && nextStageBtn) {
          nextStageBtn.classList.add("show");
        }
      }
    });
  });
}

function setupFishing() {
  const castBtn = document.getElementById("cast-btn");
  if (!castBtn) return;

  const fishes = document.querySelectorAll(".px-fish");
  const catchOverlay = document.getElementById("catch-overlay");
  const winOverlay = document.getElementById("win-screen");
  const pips = document.querySelectorAll(".f-pip");
  const rodLine = document.getElementById("rod-line");

  const messages = [
    {
      icon: "🐟",
      title: "PESAN #1",
      msg: "Makasih udah selalu ada buat aku, love.",
    },
    {
      icon: "🐠",
      title: "PESAN #2",
      msg: "Kamu itu ajaib. Cara kamu diem aja udah cukup buat bikin aku ngerasa gak sendirian.",
    },
    {
      icon: "🦈",
      title: "PESAN #3",
      msg: "Aku gatau gimana cara jelasin betapa bersyukurnya aku punya kamu.",
    },
    {
      icon: "🐡",
      title: "PESAN #4",
      msg: "Di antara semua keajaiban duni, ketemu kamu is the best one.",
    },
    {
      icon: "🎣",
      title: "PESAN #5",
      msg: "Makasih ya udah milih aku juga. Every single day. I love you.",
    },
  ];

  let caught = 0,
    casting = false;

  castBtn.addEventListener("click", () => {
    if (casting || caught >= messages.length) return;
    casting = true;
    castBtn.textContent = "WAITING...";

    // Tali pancing memanjang ke bawah
    if (rodLine) rodLine.style.height = "140px";

    setTimeout(() => {
      const activeFish = fishes[Math.floor(Math.random() * fishes.length)];
      activeFish.style.left = 20 + Math.random() * 60 + "%";
      activeFish.style.top = 20 + Math.random() * 40 + "%";
      activeFish.classList.add("show");
      castBtn.textContent = "👆 TAP THE FISH!";

      activeFish.onclick = () => {
        activeFish.classList.remove("show");
        activeFish.onclick = null;
        openCatch();
      };
    }, 1500);
  });

  function openCatch() {
    const m = messages[caught];
    document.getElementById("catch-icon").textContent = m.icon;
    document.getElementById("catch-title").textContent = m.title;
    document.getElementById("catch-msg").textContent = m.msg;
    catchOverlay.classList.add("show");
    pips[caught].classList.add("got");
    caught++;
  }

  document.getElementById("catch-close").addEventListener("click", () => {
    catchOverlay.classList.remove("show");
    casting = false;
    castBtn.textContent = "🎣 CAST ROD";

    // Tali pancing ditarik kembali ke atas
    if (rodLine) rodLine.style.height = "0px";

    if (caught >= messages.length) {
      setTimeout(() => winOverlay.classList.add("show"), 500);
    }
  });
}

/* ── Slot Machine (reasons.html) - LOGIC UPGRADE ── */
function setupSlot() {
  const lever = document.getElementById("lever-ball");
  if (!lever) return;
  const screen = document.getElementById("slot-screen");
  const reelEls = document.querySelectorAll(".reel-win");
  const card = document.getElementById("reason-card");
  const counter = document.getElementById("slot-count");
  const nextStageBtn = document.getElementById("next-stage-btn");

  const photos = [
    "asset/7.jpg",
    "asset/8.jpg",
    "asset/9.jpg",
    "asset/10.jpg",
    "asset/11.jpg",
  ];
  const icons = ["✨", "💌", "🌸", "🌙", "🎵"];
  const reasons = [
    {
      title: "You always make me feel safe.",
      body: "I don't know how u do it, but everytime i'm with u, everything just feels better.. Sesibuk atau sekacau apapun hari hari aku, kamu beneran jadi tempat yang bikin aku merasa nyaman. Being with u feels like home, and that's one of the biggest reason why i love you so much.",
    },
    {
      title: "I love the way you care about me.",
      body: "Bukan cuma omong kosong yang kamu kasih, tapi hal hal kecil yang mungkin kamu sendiri bahkan ga sadar. Kaya nanyain hari hari aku, ingetin aku istirahat, atau sekedar nemenin aku pas lagi capek capeknya. Those little things may seem simple, tapi itu malah bikin aku ngerasa dicintai setiap harinya.",
    },
    {
      title: "You make me want to be a better person.",
      body: "Since u came into my life, aku beneran jadi punya alasan buat terus menerus berkembang. Bukan karna waktu itu kamu pernah negur aku atau gimana, tapi kamu beneran bikin aku jadi pingin buat nunjukin versi terbaik dari diri aku sendiri, bek. I want to become someone you're always proud of, cz u deserve nothing less.",
    },
    {
      title: "With you, I can always be myself.",
      body: "Aku ga pernah ngerasa harus pura pura jadi orang lain waktu bareng kamu. I can be weird, annoying, quiet, or talkactive and u still accept me for who i am, dan aku rasa itu baru bisa di kamu doang dek. I'm really grateful i found it in you",
    },
    {
      title: "I love you simply cz you're you.",
      body: 'Honestly, aku beneran ga ada alasan spesifik kenapa aku bisa jatuh cinta ke kamu bek. Kamu beneran punya daya tarik sendiri tau, yang bisa bikin aku ngerasa " Wah dia nih orang nya nih " Semua yang ada di kamu tuh bener bener ga bisa diganti sama siapapun, bek. And if i had to choose all over again, i\'d still choose u, always.',
    },
  ];

  let current = 0,
    spinning = false;

  lever.addEventListener("click", () => {
    if (spinning || current >= reasons.length) return;
    spinning = true;
    reelEls.forEach((r) => r.classList.add("spinning"));

    if (screen) {
      const ph = screen.querySelector(".slot-placeholder");
      if (ph) ph.style.display = "none";

      let img = screen.querySelector("img");
      if (!img) {
        img = document.createElement("img");
        screen.appendChild(img);
      }

      // 1. Turn the screen dark while spinning
      screen.classList.remove("revealed");

      // Load the new photo while it's dark
      setTimeout(() => {
        img.src = photos[current];
      }, 200);
    }

    setTimeout(() => {
      reelEls.forEach((r, i) => {
        setTimeout(() => {
          r.classList.remove("spinning");
          r.textContent = icons[Math.floor(Math.random() * icons.length)];

          if (i === reelEls.length - 1) {
            // 2. Turn the screen ON (bright and clear) when spinning stops!
            if (screen) screen.classList.add("revealed");
            showReason();
          }
        }, i * 350); // Slightly staggered stop for arcade feel
      });
    }, 900);
  });

  function showReason() {
    const r = reasons[current];
    card.querySelector(".reason-tag").textContent =
      `REASON 0${current + 1} / 05`;
    card.querySelector(".reason-heading").textContent = r.title;
    card.querySelector(".reason-body").textContent = r.body;
    card.classList.add("show");
    current++;
    counter.textContent = `${current} / 5 UNLOCKED`;

    setTimeout(() => {
      spinning = false;

      // 3. Perfect Logic: Unlock Next Level Button ONLY at 5/5
      if (current >= reasons.length) {
        lever.style.opacity = ".3"; // Dim lever to show it's done

        if (nextStageBtn) {
          nextStageBtn.classList.add("show");
          // UX Magic: Smoothly scroll down so they see the button!
          setTimeout(() => {
            nextStageBtn.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 600);
        }
      }
    }, 600);
  }
}

function setupLetter() {
  const dialogText = document.getElementById("dialogue-text");
  const indicator = document.getElementById("dialogue-indicator");
  const box = document.getElementById("rpg-box");
  const cutscene = document.getElementById("cutscene-container");
  const finale = document.getElementById("finale");

  if (!dialogText || !box) return;

  const messages = [
    "Hey, selamat sampai di level terakhir ini! Dari awal sampai akhir, semuanya aku buat khusus buat kamu.",
    "Mungkin hadiah ini cuma hal kecil, tapi aku harap ini bisa ngingetin kamu seberapa berartinya kamu buat aku.",
    "Makasih ya udah selalu sabar, udah selalu dengerin, dan udah milih aku. I'm really lucky to have you as my player 2.",
    "Happy Mensive! Let's clear more stages of life together. I love you, unconditionally. ♡",
  ];

  let currentMsg = 0;
  let isTyping = false;
  let typeTimer;

  function typeMessage() {
    if (currentMsg >= messages.length) {
      cutscene.style.display = "none";
      finale.style.display = "flex";
      setTimeout(() => finale.classList.add("show"), 100);
      return;
    }

    isTyping = true;
    indicator.style.display = "none";
    dialogText.innerHTML = "";
    let text = messages[currentMsg];
    let charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        dialogText.innerHTML += text.charAt(charIndex);
        charIndex++;
        typeTimer = setTimeout(typeChar, 35);
      } else {
        isTyping = false;
        indicator.style.display = "block";
      }
    }
    typeChar();
  }

  box.addEventListener("click", () => {
    if (isTyping) {
      clearTimeout(typeTimer);
      dialogText.innerHTML = messages[currentMsg];
      isTyping = false;
      indicator.style.display = "block";
    } else {
      currentMsg++;
      typeMessage();
    }
  });

  setTimeout(typeMessage, 800);

  // ── Hold Heart Logic (UPGRADED: Pixel Particle System) ──
  const holdBtn = document.getElementById("hold-btn");
  const ring = document.getElementById("ring-fill");
  let progress = 0,
    interval = null;
  if (!holdBtn) return;

  const startHold = () => {
    clearInterval(interval);
    interval = setInterval(() => {
      progress += 2.5;
      if (ring)
        ring.style.background = `conic-gradient(var(--accent-rose) ${progress}%, transparent ${progress}%)`;

      if (progress >= 100) {
        clearInterval(interval);
        document.getElementById("hold-hint").innerHTML =
          "<span style='color:var(--accent-cyan); font-size:12px;'>♡ THANK YOU ♡</span>";

        // 🎇 THE UPGRADE: Custom Midnight Arcade Particles 🎇
        for (let i = 0; i < 45; i++) {
          let c = document.createElement("div");

          // Using 8-bit symbols and strictly our palette hex codes
          const symbols = ["♡", "★", "+", "✧"];
          const colors = ["#FF3366", "#00E5FF", "#FFD166", "#9CA3AF"]; // Rose, Cyan, Gold, Muted Slate

          const randomSymbol =
            symbols[Math.floor(Math.random() * symbols.length)];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];

          c.textContent = randomSymbol;
          c.style.color = randomColor;
          c.style.fontFamily = "var(--f-pixel)"; // Forces the 8-bit font
          c.style.textShadow = `0 0 10px ${randomColor}`; // Adds the neon glow

          c.style.position = "fixed";
          c.style.left = Math.random() * 100 + "vw";
          c.style.top = "-30px";
          c.style.zIndex = 9999;

          // Randomize sizes slightly for 3D depth
          c.style.fontSize = Math.random() * 12 + 12 + "px";
          c.style.transition =
            "transform 3.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 3.5s ease-out";

          document.body.appendChild(c);

          // Trigger the falling animation
          setTimeout(() => {
            c.style.transform = `translateY(110vh) rotate(${Math.random() * 720}deg)`;
            c.style.opacity = "0";
          }, 50);

          // Clean up the DOM so the website doesn't lag
          setTimeout(() => c.remove(), 3500);
        }
      }
    }, 30);
  };

  const stopHold = () => {
    clearInterval(interval);
    if (progress < 100) {
      progress = 0;
      ring.style.background = "none";
    }
  };

  holdBtn.addEventListener("mousedown", startHold);
  holdBtn.addEventListener("mouseup", stopHold);
  holdBtn.addEventListener("mouseleave", stopHold);
  holdBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startHold();
  });
  holdBtn.addEventListener("touchend", stopHold);
}

function bindPage() {
  setupNavLinks();
  setupReveal();
  setupCards();
  setupFishing();
  setupSlot();
  setupLetter();
  setupCinema();
  const btn = document.getElementById("music-btn");
  if (btn) {
    btn.removeEventListener("click", toggleMusic);
    btn.addEventListener("click", toggleMusic);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMusic();
  setupAutoplay();
  bindPage();
});
