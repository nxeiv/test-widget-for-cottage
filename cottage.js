(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.querySelector(".progress span");
  const topnav = document.querySelector(".topnav");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive:true });
  const updateNav = () => {
    if (topnav) topnav.classList.toggle("scrolled", window.scrollY > 24);
  };
  updateNav();
  window.addEventListener("scroll", updateNav, { passive:true });

  const items = document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.home-transition");
  if ("IntersectionObserver" in window && !reduced) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:.12, rootMargin:"0px 0px -7% 0px" });
    items.forEach((el) => observer.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  if (reduced) return;

  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    document.addEventListener("pointermove", (event) => {
      glow.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
      glow.classList.add("on");
    }, { passive:true });
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));
  }

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (!window.matchMedia("(pointer:fine)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - .5) * 7;
      const rotateX = (.5 - y) * 6;
      card.style.transform = "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-7px)";
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  const parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length) {
    let ticking = false;
    const updateParallax = () => {
      const scroll = window.scrollY;
      parallax.forEach((el) => {
        const speed = Number(el.dataset.parallax) || .15;
        el.style.transform = "translate3d(0," + (scroll * speed * -1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive:true });
  }

  document.querySelectorAll(".btn.primary").forEach((btn) => {
    btn.addEventListener("pointermove", (event) => {
      if (!window.matchMedia("(pointer:fine)").matches) return;
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .08;
      const y = (event.clientY - rect.top - rect.height / 2) * .08;
      btn.style.transform = "translate3d(" + x + "px," + y + "px,0) translateY(-5px)";
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
})();

  const roomDetails = {
    home: {label:"01 · THE HOME", title:"The people are the center.", text:"There is no activity you have to do to belong here. The Cottage★ is the group first.", link:"#about", linkText:"Read the story →"},
    discord: {label:"02 · DISCORD", title:"Where the everyday stuff happens.", text:"Talk, calls, updates, jokes, quiet company, and the conversations that make the community feel like a home.", link:"#join", linkText:"Come to the door →"},
    smp: {label:"03 · THE BACKYARD", title:"A place to play together.", text:"The SMP is one shared Minecraft world inside the wider community — something to wander into when people feel like playing.", link:"smp.html", linkText:"Explore the backyard →"},
    other: {label:"04 · EVERYTHING ELSE", title:"The rooms don't need a name.", text:"Other games, projects, screenshots, calls, and random memories can all belong here. The structure exists to serve the people.", link:"#moments", linkText:"See the little moments →"}
  };
  document.querySelectorAll(".room-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".room-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      const data = roomDetails[card.dataset.room];
      const detail = document.querySelector(".room-detail");
      if (!data || !detail) return;
      detail.animate([{opacity:.45,transform:"translateY(5px)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.16,1,.3,1)"});
      detail.querySelector(".room-detail-label").textContent=data.label;
      detail.querySelector("h3").textContent=data.title;
      detail.querySelector("p").textContent=data.text;
      const link=detail.querySelector(".room-detail-link");
      link.href=data.link;
      link.textContent=data.linkText;
    });
  });

  const setOfflineState = () => document.body.classList.toggle("is-offline", !navigator.onLine);
  setOfflineState();
  window.addEventListener("online", setOfflineState);
  window.addEventListener("offline", setOfflineState);

  const liveMessages = document.querySelectorAll(".live-message,.smp-live-message");
  const liveStates = document.querySelectorAll(".live-state,.smp-live-state");
  const liveTimes = document.querySelectorAll(".live-time,.smp-live-time");
  const updateLiveShell = () => {
    const now = new Date();
    const label = now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    liveMessages.forEach((el) => el.textContent = navigator.onLine ? "The page is connected. Live server data will appear here when the Cottage backend exposes it." : "Your connection is offline right now.");
    liveStates.forEach((el) => el.textContent = navigator.onLine ? "Connected" : "Offline");
    liveTimes.forEach((el) => el.textContent = navigator.onLine ? "checked " + label : "connection lost");
  };
  updateLiveShell();
  window.addEventListener("online", updateLiveShell);
  window.addEventListener("offline", updateLiveShell);

  const intro = document.querySelector(".entrance-screen");
  if (intro) {
    window.setTimeout(() => intro.remove(), 2400);
  }
})();