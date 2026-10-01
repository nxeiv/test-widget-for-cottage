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
        if (!entry.isIntersecting) return;

        const target = entry.target;
        if (!target.style.getPropertyValue("--delay")) {
          const siblings = Array.from(target.parentElement?.children || [])
            .filter((el) =>
              el.matches?.(".reveal,.reveal-left,.reveal-right,.home-transition")
            );
          const siblingIndex = Math.max(0, siblings.indexOf(target));
          const stagger = Math.min(siblingIndex, 6) * 65;
          target.style.setProperty("--delay", stagger + "ms");
        }

        target.classList.add("in");
        observer.unobserve(target);
      });
    }, { threshold:.12, rootMargin:"0px 0px -7% 0px" });
    items.forEach((el) => observer.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  if (!reduced) {
    const glow = document.querySelector(".cursor-glow");
    if (glow && window.matchMedia("(pointer:fine)").matches) {
      let glowX = window.innerWidth / 2;
      let glowY = window.innerHeight / 2;
      let targetGlowX = glowX;
      let targetGlowY = glowY;
      let glowFrame = 0;

      const animateGlow = () => {
        glowX += (targetGlowX - glowX) * 0.16;
        glowY += (targetGlowY - glowY) * 0.16;
        glow.style.transform = "translate3d(" + glowX + "px," + glowY + "px,0)";
        glowFrame = requestAnimationFrame(animateGlow);
      };

      document.addEventListener("pointermove", (event) => {
        targetGlowX = event.clientX;
        targetGlowY = event.clientY;
        glow.classList.add("on");
      }, { passive:true });

      document.addEventListener("mouseleave", () => glow.classList.remove("on"));

      animateGlow();

      window.addEventListener("beforeunload", () => {
        cancelAnimationFrame(glowFrame);
      }, { once:true });
    }

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let tiltFrame = 0;

      const animateTilt = () => {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;

        if (Math.abs(targetX - currentX) < 0.01 && Math.abs(targetY - currentY) < 0.01) {
          currentX = targetX;
          currentY = targetY;
        }

        card.style.transform =
          "perspective(900px) rotateX(" + currentX + "deg) rotateY(" + currentY + "deg) translateY(-7px)";

        tiltFrame = requestAnimationFrame(animateTilt);
      };

      card.addEventListener("pointermove", (event) => {
        if (!window.matchMedia("(pointer:fine)").matches) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        targetX = (.5 - y) * 5.5;
        targetY = (x - .5) * 6.5;
      });

      card.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
        window.setTimeout(() => {
          if (Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
            card.style.transform = "";
          }
        }, 220);
      });

      animateTilt();
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

  const statusMeta = document.querySelector('meta[name="cottage-status-api"]');
  const STATUS_API_URL = statusMeta?.content?.trim() || "/api/status";
  const liveMessages = document.querySelectorAll(".live-message,.smp-live-message");
  const liveStates = document.querySelectorAll(".live-state,.smp-live-state");
  const liveTimes = document.querySelectorAll(".live-time,.smp-live-time");
  const liveDots = document.querySelectorAll(".live-dot");

  let lastStatusCheck = null;
  let statusRequestInFlight = false;

  const formatRelativeCheck = () => {
    if (!lastStatusCheck) return "not checked yet";
    const elapsed = Math.max(0, Math.floor((Date.now() - lastStatusCheck) / 1000));
    if (elapsed < 10) return "checked just now";
    if (elapsed < 60) return "checked " + elapsed + "s ago";
    const minutes = Math.floor(elapsed / 60);
    return "checked " + minutes + "m ago";
  };

  const setLiveVisual = ({message, state, colorState}) => {
    liveMessages.forEach((el) => { el.textContent = message; });
    liveStates.forEach((el) => { el.textContent = state; });
    liveTimes.forEach((el) => { el.textContent = formatRelativeCheck(); });
    liveDots.forEach((el) => {
      el.dataset.state = colorState;
      el.classList.toggle("live-dot-offline", colorState === "offline");
      el.classList.toggle("live-dot-warning", colorState === "warning");
    });
  };

  const renderMinecraftStatus = (data) => {
    lastStatusCheck = Date.now();

    const players = Number.isFinite(Number(data.players)) ? Number(data.players) : 0;
    const playerText = players === 0
      ? "Nobody else is playing right now."
      : players === 1
        ? "1 person is playing."
        : players + " people are playing.";

    if (data.state === "online") {
      setLiveVisual({
        message: players > 0 ? "The backyard is awake. People are around." : "The backyard is awake, just a little quiet.",
        state: players > 0 ? playerText : "Online",
        colorState: "online",
      });
      return;
    }

    if (data.state === "connecting" || data.state === "reconnecting") {
      setLiveVisual({
        message: "The backyard is waking up. The Cottage bot is reconnecting.",
        state: data.state === "connecting" ? "Connecting" : "Reconnecting",
        colorState: "warning",
      });
      return;
    }

    setLiveVisual({
      message: "The backyard is asleep right now.",
      state: "Offline",
      colorState: "offline",
    });
  };

  const fetchMinecraftStatus = async () => {
    if (statusRequestInFlight) return;
    statusRequestInFlight = true;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(STATUS_API_URL, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Status API returned " + response.status);
      }

      const data = await response.json();
      renderMinecraftStatus(data);
    } catch (error) {
      setLiveVisual({
        message: "The backyard status bridge is unavailable right now.",
        state: "Unavailable",
        colorState: "offline",
      });
    } finally {
      window.clearTimeout(timeout);
      statusRequestInFlight = false;
    }
  };

  fetchMinecraftStatus();
  window.setInterval(fetchMinecraftStatus, 30_000);
  window.setInterval(() => {
    if (lastStatusCheck) {
      liveTimes.forEach((el) => { el.textContent = formatRelativeCheck(); });
    }
  }, 5000);

  window.addEventListener("online", fetchMinecraftStatus);


  const intro = document.querySelector(".entrance-screen");
  if (intro) window.setTimeout(() => intro.remove(), 2400);

  // Cinematic image viewer
  const galleryImages = Array.from(document.querySelectorAll(".moment-image, .smp-shot img, .gallery-photo"));
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
    let originElement = null;
    let isOpen = false;
    let isAnimating = false;
    let hasNavigated = false;
    let touchStartX = 0;
    let touchDeltaX = 0;

    galleryImages.forEach((img, index) => {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Open image " + (index + 1));
      img.addEventListener("click", () => open(index));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(index);
        }
      });
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

    const getElementRect = (img) => {
      if (!img) return null;
      const rect = img.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return null;
      return { left:rect.left, top:rect.top, width:rect.width, height:rect.height };
    };

    const setGeometry = (rect) => {
      if (!rect) return;
      imageWrap.style.left = rect.left + "px";
      imageWrap.style.top = rect.top + "px";
      imageWrap.style.width = rect.width + "px";
      imageWrap.style.height = rect.height + "px";
    };

    const cancelViewerAnimations = () => {
      imageWrap.getAnimations().forEach((animation) => animation.cancel());
      lightbox.getAnimations().forEach((animation) => animation.cancel());
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

    const animateTo = async (fromRect, toRect, duration, easing) => {
      if (!fromRect || !toRect) return;
      setGeometry(fromRect);
      const animation = imageWrap.animate(
        [
          { left:fromRect.left + "px", top:fromRect.top + "px", width:fromRect.width + "px", height:fromRect.height + "px", borderRadius:"24px" },
          { left:toRect.left + "px", top:toRect.top + "px", width:toRect.width + "px", height:toRect.height + "px", borderRadius:"28px" }
        ],
        { duration, easing, fill:"forwards" }
      );
      try {
        await animation.finished;
      } catch (_) {}
      setGeometry(toRect);
    };

    const getImageMetrics = async (img) => {
      if (img.naturalWidth && img.naturalHeight) {
        return { width: img.naturalWidth, height: img.naturalHeight };
      }
      return await new Promise((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve({ width: probe.naturalWidth || 1600, height: probe.naturalHeight || 900 });
        probe.onerror = () => resolve({ width:1600, height:900 });
        probe.src = img.currentSrc || img.src;
      });
    };

    const getTargetRectFromMetrics = (metrics) => {
      const ratio = metrics.width / Math.max(metrics.height, 1);
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

    const getCurrentViewerRect = () => ({
      left: parseFloat(imageWrap.style.left) || 0,
      top: parseFloat(imageWrap.style.top) || 0,
      width: parseFloat(imageWrap.style.width) || lightbox.offsetWidth,
      height: parseFloat(imageWrap.style.height) || lightbox.offsetHeight
    });

    const animateBetween = async (direction) => {
      if (!isOpen || isAnimating || galleryImages.length < 2) return;
      isAnimating = true;
      hasNavigated = true;
      imageWrap.classList.remove("is-dragging");
      imageWrap.style.removeProperty("--drag-x");

      const nextIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
      const nextSource = galleryImages[nextIndex];
      const nextMetrics = await getImageMetrics(nextSource);
      const currentRect = getCurrentViewerRect();
      const nextRect = getTargetRectFromMetrics(nextMetrics);

      const outAnimation = lightboxImage.animate(
        [
          { opacity:1, transform:"translate3d(0,0,0) scale(1)" },
          { opacity:0, transform:(direction > 0 ? "translate3d(-28px,0,0)" : "translate3d(28px,0,0)") + " scale(.985)" }
        ],
        { duration:190, easing:"cubic-bezier(.7,0,.84,0)", fill:"forwards" }
      );

      try { await outAnimation.finished; } catch (_) {}

      applyImage(nextIndex);
      setGeometry(currentRect);

      const geometryAnimation = imageWrap.animate(
        [
          { left:currentRect.left + "px", top:currentRect.top + "px", width:currentRect.width + "px", height:currentRect.height + "px" },
          { left:nextRect.left + "px", top:nextRect.top + "px", width:nextRect.width + "px", height:nextRect.height + "px" }
        ],
        { duration:420, easing:"cubic-bezier(.16,1,.3,1)", fill:"forwards" }
      );

      const inAnimation = lightboxImage.animate(
        [
          { opacity:0, transform:(direction > 0 ? "translate3d(28px,0,0)" : "translate3d(-28px,0,0)") + " scale(.985)" },
          { opacity:1, transform:"translate3d(0,0,0) scale(1)" }
        ],
        { duration:390, easing:"cubic-bezier(.16,1,.3,1)", fill:"forwards" }
      );

      try { await Promise.all([geometryAnimation.finished, inAnimation.finished]); } catch (_) {}

      setGeometry(nextRect);
      imageWrap.style.transform = "";
      lightboxImage.style.transform = "";
      lightboxImage.style.opacity = "1";
      isAnimating = false;
    };

        const open = async (index) => {
      if (isOpen || !galleryImages[index]) return;

      cancelViewerAnimations();
      const source = galleryImages[index];
      const sourceRect = getElementRect(source);
      const target = getTargetRect(source);
      if (!sourceRect) return;

      previousFocused = document.activeElement;
      originElement = source;
      hasNavigated = false;
      currentIndex = index;
      applyImage(index);
      setGeometry(sourceRect);
      imageWrap.style.opacity = "1";
      imageWrap.style.transform = "";

      isOpen = true;
      isAnimating = true;
      document.body.classList.add("lightbox-open");
      lightbox.classList.add("is-open", "is-opening");
      lightbox.setAttribute("aria-hidden", "false");

      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      await animateTo(
        sourceRect,
        target,
        reduced ? 180 : 760,
        reduced ? "ease-out" : "cubic-bezier(.16,1,.3,1)"
      );

      lightbox.classList.remove("is-opening");
      imageWrap.style.opacity = "1";
      isAnimating = false;
      window.setTimeout(() => closeButton.focus(), 80);
    };

    const finishClose = () => {
      cancelViewerAnimations();
      lightbox.classList.remove("is-open", "is-closing", "is-opening");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      imageWrap.style.cssText = "";
      isOpen = false;
      isAnimating = false;
      hasNavigated = false;
      originElement = null;
      if (previousFocused && typeof previousFocused.focus === "function") previousFocused.focus();
    };

    const close = async () => {
      if (!isOpen || isAnimating) return;

      isAnimating = true;
      cancelViewerAnimations();
      lightbox.classList.add("is-closing");

      const source = hasNavigated ? null : originElement;
      const sourceRect = getElementRect(source);

      if (hasNavigated || !sourceRect) {
        const animation = imageWrap.animate(
          [
            { opacity:1, transform:"scale(1)" },
            { opacity:0, transform:"scale(.94) translateY(10px)" }
          ],
          { duration: reduced ? 140 : 300, easing:"cubic-bezier(.7,0,.84,0)", fill:"forwards" }
        );
        try { await animation.finished; } catch (_) {}
        finishClose();
        return;
      }

      const currentRect = {
        left:parseFloat(imageWrap.style.left) || getTargetRect(originElement).left,
        top:parseFloat(imageWrap.style.top) || getTargetRect(originElement).top,
        width:parseFloat(imageWrap.style.width) || getTargetRect(originElement).width,
        height:parseFloat(imageWrap.style.height) || getTargetRect(originElement).height
      };

      await animateTo(
        currentRect,
        sourceRect,
        reduced ? 160 : 600,
        reduced ? "ease-out" : "cubic-bezier(.7,0,.84,0)"
      );

      finishClose();
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
      if (!isOpen || isAnimating) return;
      touchStartX = event.clientX;
      touchDeltaX = 0;
      stage.setPointerCapture?.(event.pointerId);
    });

    stage.addEventListener("pointermove", (event) => {
      if (!isOpen || isAnimating || !touchStartX) return;
      touchDeltaX = event.clientX - touchStartX;
      if (Math.abs(touchDeltaX) > 12) {
        imageWrap.style.setProperty("--drag-x", touchDeltaX + "px");
        imageWrap.classList.add("is-dragging");
      }
    });

    stage.addEventListener("pointerup", () => {
      if (!isOpen || isAnimating) return;
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
      setGeometry(target);
    });
  }

})();