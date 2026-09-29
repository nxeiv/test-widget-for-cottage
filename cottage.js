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