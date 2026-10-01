(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.querySelector(".progress span");
  const topnav = document.querySelector(".topnav");

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };

  const updateNav = () => {
    if (topnav) topnav.classList.toggle("scrolled", window.scrollY > 24);
  };

  updateProgress();
  updateNav();
  window.addEventListener("scroll", updateProgress, { passive:true });
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

  if (!reduced) {
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
        card.style.transform = "perspective(900px) rotateX(" + ((.5 - y) * 6) + "deg) rotateY(" + ((x - .5) * 7) + "deg) translateY(-7px)";
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });

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
  }

  const parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduced) {
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
      detail.animate([{opacity:.45,transform:"translateY(5px)"},{opacity:1,transform:"none"}], {duration:380,easing:"cubic-bezier(.16,1,.3,1)"});
      detail.querySelector(".room-detail-label").textContent = data.label;
      detail.querySelector("h3").textContent = data.title;
      detail.querySelector("p").textContent = data.text;
      const link = detail.querySelector(".room-detail-link");
      link.href = data.link;
      link.textContent = data.linkText;
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
    liveMessages.forEach((el) => el.textContent = navigator.onLine
      ? "The page is connected. Live server data will appear here when the Cottage backend exposes it."
      : "Your connection is offline right now.");
    liveStates.forEach((el) => el.textContent = navigator.onLine ? "Connected" : "Offline");
    liveTimes.forEach((el) => el.textContent = navigator.onLine ? "checked " + label : "connection lost");
  };

  updateLiveShell();
  window.addEventListener("online", updateLiveShell);
  window.addEventListener("offline", updateLiveShell);

  const intro = document.querySelector(".entrance-screen");
  if (intro) window.setTimeout(() => intro.remove(), 2400);

  // Cinematic image viewer
  const galleryImages = Array.from(document.querySelectorAll(".moment-image, .smp-shot img"));
  if (galleryImages.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "cottage-lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <div class="lightbox-backdrop" data-lightbox-close></div>
      <div class="lightbox-ambient" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="lightbox-shell" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="lightbox-close" type="button" aria-label="Close image viewer">×</button>
        <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">‹</button>
        <div class="lightbox-stage">
          <div class="lightbox-image-wrap">
            <img class="lightbox-image" alt="">
            <span class="lightbox-image-sheen" aria-hidden="true"></span>
          </div>
        </div>
        <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">›</button>
        <div class="lightbox-meta">
          <span class="lightbox-counter"></span>
          <span class="lightbox-caption"></span>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const backdrop = lightbox.querySelector(".lightbox-backdrop");
    const imageWrap = lightbox.querySelector(".lightbox-image-wrap");
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const closeButton = lightbox.querySelector(".lightbox-close");
    const prevButton = lightbox.querySelector(".lightbox-prev");
    const nextButton = lightbox.querySelector(".lightbox-next");
    const counter = lightbox.querySelector(".lightbox-counter");
    const caption = lightbox.querySelector(".lightbox-caption");
    const stage = lightbox.querySelector(".lightbox-stage");

    let currentIndex = 0;
    let previousFocused = null;
    let isOpen = false;
    let isAnimating = false;
    let touchStartX = 0;
    let touchDeltaX = 0;

    galleryImages.forEach((img, index) => {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Open image " + (index + 1));

      const openFromKeyboard = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(index);
        }
      };

      img.addEventListener("click", () => open(index));
      img.addEventListener("keydown", openFromKeyboard);
    });

    const getCaption = (img) => {
      const figure = img.closest("figure");
      const figureCaption = figure ? figure.querySelector("figcaption") : null;
      return figureCaption ? figureCaption.textContent.trim() : (img.alt || "The Cottage★");
    };

    const getTargetRect = (img) => {
      const naturalWidth = img.naturalWidth || 1600;
      const naturalHeight = img.naturalHeight || 900;
      const ratio = naturalWidth / naturalHeight;
      const maxWidth = Math.min(window.innerWidth * 0.90, 1220);
      const maxHeight = Math.min(window.innerHeight * 0.76, 860);
      let width = maxWidth;
      let height = width / ratio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }
      return {
        left: (window.innerWidth - width) / 2,
        top: Math.max(48, (window.innerHeight - height) / 2 - 22),
        width,
        height
      };
    };

    const setMeta = (img, index) => {
      counter.textContent = String(index + 1).padStart(2, "0") + " / " + String(galleryImages.length).padStart(2, "0");
      caption.textContent = getCaption(img);
      prevButton.disabled = galleryImages.length < 2;
      nextButton.disabled = galleryImages.length < 2;
    };

    const applyImage = (index) => {
      currentIndex = (index + galleryImages.length) % galleryImages.length;
      const source = galleryImages[currentIndex];
      lightboxImage.src = source.currentSrc || source.src;
      lightboxImage.alt = source.alt || "The Cottage★ image";
      setMeta(source, currentIndex);
    };

    const animateBetween = (direction) => {
      if (isAnimating || galleryImages.length < 2) return;
      isAnimating = true;

      if (reduced) {
        imageWrap.style.opacity = "0";
        imageWrap.style.transform = direction > 0 ? "translateX(22px) scale(.985)" : "translateX(-22px) scale(.985)";
        window.setTimeout(() => {
          applyImage(currentIndex + direction);
          imageWrap.animate(
            [
              { opacity:0, transform: direction > 0 ? "translateX(-22px) scale(.985)" : "translateX(22px) scale(.985)" },
              { opacity:1, transform:"none" }
            ],
            { duration:220, easing:"ease-out", fill:"forwards" }
          ).finished.finally(() => { isAnimating = false; });
        }, 40);
        return;
      }

      imageWrap.animate(
        [
          { opacity:1, transform:"translate3d(0,0,0) scale(1)" },
          { opacity:0, transform:(direction > 0 ? "translate3d(-42px,0,0)" : "translate3d(42px,0,0)") + " scale(.965)" }
        ],
        { duration:230, easing:"cubic-bezier(.7,0,.84,0)", fill:"forwards" }
      ).finished.then(() => {
        applyImage(currentIndex + direction);
        imageWrap.animate(
          [
            { opacity:0, transform:(direction > 0 ? "translate3d(42px,0,0)" : "translate3d(-42px,0,0)") + " scale(.965)" },
            { opacity:1, transform:"translate3d(0,0,0) scale(1)" }
          ],
          { duration:380, easing:"cubic-bezier(.16,1,.3,1)", fill:"forwards" }
        ).finished.finally(() => { isAnimating = false; });
      }).catch(() => { isAnimating = false; });
    };

    const animateOpen = (source) => {
      const sourceRect = source.getBoundingClientRect();
      const target = getTargetRect(source);
      const dx = target.left - sourceRect.left;
      const dy = target.top - sourceRect.top;
      const sx = target.width / Math.max(sourceRect.width, 1);
      const sy = target.height / Math.max(sourceRect.height, 1);

      imageWrap.style.left = "0px";
      imageWrap.style.top = "0px";
      imageWrap.style.width = sourceRect.width + "px";
      imageWrap.style.height = sourceRect.height + "px";
      imageWrap.style.transform = "translate3d(" + sourceRect.left + "px," + sourceRect.top + "px,0) scale(1)";
      imageWrap.style.transformOrigin = "top left";
      imageWrap.style.opacity = "1";

      if (reduced) {
        imageWrap.animate([{opacity:0, transform:"translate3d(" + target.left + "px," + target.top + "px,0) scale(" + sx + "," + sy + ")"},{opacity:1, transform:"translate3d(" + target.left + "px," + target.top + "px,0) scale(" + sx + "," + sy + ")"}], {duration:180, fill:"forwards"}).finished.finally(() => { isAnimating = false; });
        return;
      }

      imageWrap.animate(
        [
          { transform:"translate3d(" + sourceRect.left + "px," + sourceRect.top + "px,0) scale(1)", borderRadius:"24px" },
          { transform:"translate3d(" + target.left + "px," + target.top + "px,0) scale(" + sx + "," + sy + ")", borderRadius:"28px" }
        ],
        { duration:760, easing:"cubic-bezier(.16,1,.3,1)", fill:"forwards" }
      ).finished.finally(() => { isAnimating = false; });
    };

    const resetLightboxGeometry = () => {
      imageWrap.style.width = "";
      imageWrap.style.height = "";
      imageWrap.style.left = "";
      imageWrap.style.top = "";
      imageWrap.style.transform = "";
      imageWrap.style.transformOrigin = "";
      imageWrap.style.opacity = "";
    };

    const open = (index) => {
      if (isOpen) return;
      const source = galleryImages[index];
      if (!source) return;

      previousFocused = document.activeElement;
      currentIndex = index;
      applyImage(index);
      isOpen = true;
      isAnimating = true;
      document.body.classList.add("lightbox-open");
      lightbox.classList.add("is-open", "is-opening");
      lightbox.setAttribute("aria-hidden", "false");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateOpen(source);
          lightbox.classList.remove("is-opening");
          window.setTimeout(() => closeButton.focus(), 420);
        });
      });
    };

    const close = () => {
      if (!isOpen || isAnimating) return;

      const source = galleryImages[currentIndex];
      const sourceRect = source ? source.getBoundingClientRect() : null;
      const target = getTargetRect(source || galleryImages[0]);
      isAnimating = true;

      if (reduced || !sourceRect) {
        lightbox.animate([{opacity:1},{opacity:0}], {duration:180, fill:"forwards"}).finished.finally(finishClose);
        return;
      }

      const currentX = target.left;
      const currentY = target.top;
      const currentScaleX = target.width / Math.max(sourceRect.width, 1);
      const currentScaleY = target.height / Math.max(sourceRect.height, 1);

      imageWrap.animate(
        [
          { transform:"translate3d(" + currentX + "px," + currentY + "px,0) scale(" + currentScaleX + "," + currentScaleY + ")", borderRadius:"28px", opacity:1 },
          { transform:"translate3d(" + sourceRect.left + "px," + sourceRect.top + "px,0) scale(1)", borderRadius:"24px", opacity:.92 }
        ],
        { duration:620, easing:"cubic-bezier(.7,0,.84,0)", fill:"forwards" }
      ).finished.finally(finishClose);
    };

    const finishClose = () => {
      lightbox.classList.remove("is-open", "is-closing");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      resetLightboxGeometry();
      isOpen = false;
      isAnimating = false;
      if (previousFocused && typeof previousFocused.focus === "function") previousFocused.focus();
    };

    closeButton.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    prevButton.addEventListener("click", () => animateBetween(-1));
    nextButton.addEventListener("click", () => animateBetween(1));

    window.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") animateBetween(-1);
      if (event.key === "ArrowRight") animateBetween(1);
    });

    stage.addEventListener("pointerdown", (event) => {
      if (!isOpen) return;
      touchStartX = event.clientX;
      touchDeltaX = 0;
      stage.setPointerCapture?.(event.pointerId);
    });

    stage.addEventListener("pointermove", (event) => {
      if (!isOpen || !touchStartX) return;
      touchDeltaX = event.clientX - touchStartX;
      if (Math.abs(touchDeltaX) > 12) {
        imageWrap.style.setProperty("--drag-x", touchDeltaX + "px");
        imageWrap.classList.add("is-dragging");
      }
    });

    stage.addEventListener("pointerup", () => {
      if (!isOpen) return;
      imageWrap.classList.remove("is-dragging");
      imageWrap.style.removeProperty("--drag-x");
      if (Math.abs(touchDeltaX) > 58) animateBetween(touchDeltaX < 0 ? 1 : -1);
      touchStartX = 0;
      touchDeltaX = 0;
    });

    stage.addEventListener("pointercancel", () => {
      imageWrap.classList.remove("is-dragging");
      imageWrap.style.removeProperty("--drag-x");
      touchStartX = 0;
      touchDeltaX = 0;
    });

    window.addEventListener("resize", () => {
      if (!isOpen || isAnimating) return;
      const target = getTargetRect(galleryImages[currentIndex]);
      imageWrap.style.transform = "translate3d(" + target.left + "px," + target.top + "px,0) scale(" + (target.width / Math.max(imageWrap.offsetWidth,1)) + "," + (target.height / Math.max(imageWrap.offsetHeight,1)) + ")";
    });
  }

})();