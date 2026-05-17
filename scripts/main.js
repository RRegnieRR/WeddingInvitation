(function () {
  var eventDate = new Date("2027-02-20T14:00:00+01:00");
  var audio = document.getElementById("site-audio");
  var audioToggle = document.getElementById("audio-toggle");
  var hero = document.getElementById("top");
  var heroVideo = document.getElementById("hero-video");
  var scrollProgress = document.querySelector(".scroll-progress");
  var gallery = document.querySelector("[data-gallery]");
  var countdownNodes = {
    days: document.querySelector("[data-count='days']"),
    hours: document.querySelector("[data-count='hours']"),
    minutes: document.querySelector("[data-count='minutes']"),
  };
  var form = document.getElementById("rsvp-form");
  var statusMessage = document.getElementById("rsvp-status");
  var choiceInputs = document.querySelectorAll(".choice input");
  var submitButton = form ? form.querySelector("button[type='submit']") : null;
  var configuredRsvpEndpoint = form
    ? form.getAttribute("data-rsvp-endpoint") || ""
    : "";
  var rsvpEndpoint = configuredRsvpEndpoint ||
    (window.location.protocol === "file:"
      ? "http://127.0.0.1:3001/api/rsvp"
      : "/api/rsvp");
  var browserIdStorageKey = "wedding_rsvp_browser_id";
  var submissionStorageKey = "wedding_rsvp_submission";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateCountdown() {
    var now = new Date().getTime();
    var remaining = Math.max(eventDate.getTime() - now, 0);
    var days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    var hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((remaining / (1000 * 60)) % 60);

    countdownNodes.days.textContent = pad(days);
    countdownNodes.hours.textContent = pad(hours);
    countdownNodes.minutes.textContent = pad(minutes);
  }

  function updateAudioVisibility() {
    var threshold = Math.max(window.innerHeight * 0.45, 60);
    if (window.scrollY > threshold) {
      audioToggle.classList.add("is-visible");
    } else {
      audioToggle.classList.remove("is-visible");
    }
  }

  function updateScrollProgress() {
    if (!scrollProgress) {
      return;
    }

    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    scrollProgress.style.setProperty(
      "--scroll-progress",
      Math.min(Math.max(progress, 0), 100).toFixed(2) + "%",
    );
  }

  function attemptPlay() {
    if (!audio) {
      return;
    }

    audio.volume = 0.5;
    var promise = audio.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function setAudioState(isEnabled) {
    if (!audio) {
      return;
    }

    if (isEnabled) {
      audioToggle.setAttribute("aria-pressed", "true");
      audioToggle.setAttribute("aria-label", "Pausar música");
      attemptPlay();
    } else {
      audio.pause();
      audioToggle.setAttribute("aria-pressed", "false");
      audioToggle.setAttribute("aria-label", "Reproducir música");
    }
  }

  function updateChoiceStates() {
    document.querySelectorAll(".choice").forEach(function (choice) {
      var input = choice.querySelector("input");
      choice.classList.toggle("choice--active", input.checked);
    });
  }

  function getStorageItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStorageItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {}
  }

  function getBrowserId() {
    var existing = getStorageItem(browserIdStorageKey);

    if (existing) {
      return existing;
    }

    var nextValue =
      window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : "browser-" + Date.now() + "-" + Math.random().toString(16).slice(2);

    setStorageItem(browserIdStorageKey, nextValue);
    return nextValue;
  }

  function getStoredSubmission() {
    var raw = getStorageItem(submissionStorageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function setRsvpStatus(kind, message) {
    if (!statusMessage) {
      return;
    }

    statusMessage.hidden = false;
    statusMessage.className = "rsvp-form__status is-" + kind;
    statusMessage.textContent = message;
  }

  function setSubmitPending(isPending) {
    if (!form || !submitButton) {
      return;
    }

    form.classList.toggle("is-submitting", isPending);
    submitButton.textContent = isPending
      ? "Enviando confirmación..."
      : submitButton.dataset.defaultLabel || "Enviar confirmación";
  }

  function lockRsvpForm(statusKind, message) {
    if (!form) {
      return;
    }

    Array.from(form.elements).forEach(function (field) {
      field.disabled = true;
    });

    form.classList.remove("is-submitting");
    form.classList.add("is-locked");

    if (submitButton) {
      submitButton.textContent = "Confirmación enviada";
    }

    if (message) {
      setRsvpStatus(statusKind || "success", message);
    }
  }

  function fallbackHeroVideo() {
    if (!hero) {
      return;
    }

    hero.classList.add("is-video-fallback");
  }

  function freezeHeroVideo() {
    if (!hero || !heroVideo) {
      return;
    }

    hero.classList.add("is-video-ended");
    heroVideo.pause();

    if (Number.isFinite(heroVideo.duration) && heroVideo.duration > 0) {
      try {
        heroVideo.currentTime = Math.max(heroVideo.duration - 0.001, 0);
      } catch (error) {}
    }
  }

  function setupHeroVideo() {
    if (!heroVideo || !hero) {
      return;
    }

    var introSrc = heroVideo.getAttribute("data-intro-src");
    var desktopQuery = window.matchMedia("(min-width: 768px)");

    function tryPlayHero() {
      var promise = heroVideo.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          fallbackHeroVideo();
        });
      }
    }

    function disableHeroVideo() {
      heroVideo.pause();
      hero.classList.add("is-video-fallback");
      hero.classList.remove("is-video-ended");

      if (heroVideo.getAttribute("src")) {
        heroVideo.removeAttribute("src");
        heroVideo.load();
      }
    }

    function enableHeroVideo() {
      if (!introSrc) {
        fallbackHeroVideo();
        return;
      }

      hero.classList.remove("is-video-fallback");
      hero.classList.remove("is-video-ended");

      if (heroVideo.getAttribute("src") !== introSrc) {
        heroVideo.src = introSrc;
        heroVideo.load();
      }

      try {
        heroVideo.currentTime = 0;
      } catch (error) {}

      tryPlayHero();
    }

    function syncHeroMediaMode() {
      if (desktopQuery.matches) {
        disableHeroVideo();
      } else {
        enableHeroVideo();
      }
    }

    heroVideo.addEventListener("ended", freezeHeroVideo);
    heroVideo.addEventListener("error", fallbackHeroVideo, { once: true });
    heroVideo.addEventListener("stalled", fallbackHeroVideo, { once: true });
    heroVideo.loop = false;
    syncHeroMediaMode();

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", syncHeroMediaMode);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(syncHeroMediaMode);
    }

    window.addEventListener(
      "pointerdown",
      function () {
        if (
          !desktopQuery.matches &&
          !hero.classList.contains("is-video-fallback") &&
          !hero.classList.contains("is-video-ended")
        ) {
          tryPlayHero();
        }
      },
      { once: true },
    );
  }

  function setupReveal() {
    var revealNodes = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      revealNodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function setupGallery() {
    if (!gallery) {
      return;
    }

    var stage = gallery.querySelector(".gallery-stage");
    var track = gallery.querySelector("[data-gallery-track]");
    var countNode = gallery.querySelector("[data-gallery-count]");
    var thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
    var slides = track ? Array.from(track.querySelectorAll("[data-gallery-slide]")) : [];
    var activeIndex = 0;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragDeltaX = 0;
    var isDragging = false;

    function getSlideCount() {
      return slides.length || thumbs.length;
    }

    function setTrackPosition(value) {
      if (track) {
        track.style.setProperty("--gallery-x", value + "px");
      }
    }

    function syncGalleryState() {
      var total = getSlideCount();

      if (!total) {
        return;
      }

      if (countNode) {
        countNode.textContent = pad(activeIndex + 1) + " / " + pad(total);
      }

      thumbs.forEach(function (thumb, thumbIndex) {
        var isActive = thumbIndex === activeIndex;
        thumb.classList.toggle("is-active", isActive);

        if (isActive) {
          thumb.setAttribute("aria-current", "true");
        } else {
          thumb.removeAttribute("aria-current");
        }
      });
    }

    function setActiveGalleryItem(index) {
      var total = getSlideCount();

      if (!total) {
        return;
      }

      activeIndex = Math.min(Math.max(index, 0), total - 1);
      snapToActiveGalleryItem();
      syncGalleryState();
    }

    function snapToActiveGalleryItem() {
      var width = stage ? stage.getBoundingClientRect().width : 0;
      setTrackPosition(activeIndex * width * -1);
    }

    function showPrevious() {
      setActiveGalleryItem(activeIndex - 1);
    }

    function showNext() {
      setActiveGalleryItem(activeIndex + 1);
    }

    function startGalleryDrag(event) {
      if (!stage || !track || event.button > 0) {
        return;
      }

      isDragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragDeltaX = 0;
      stage.classList.add("is-dragging");

      if (typeof stage.setPointerCapture === "function") {
        stage.setPointerCapture(event.pointerId);
      }
    }

    function moveGalleryDrag(event) {
      if (!isDragging || !stage || !track) {
        return;
      }

      var total = getSlideCount();
      var rect = stage.getBoundingClientRect();
      var deltaX = event.clientX - dragStartX;
      var deltaY = event.clientY - dragStartY;

      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
        return;
      }

      dragDeltaX = deltaX;
      var dragOffset = dragDeltaX;

      if (
        (activeIndex === 0 && dragOffset > 0) ||
        (activeIndex === total - 1 && dragOffset < 0)
      ) {
        dragOffset *= 0.28;
      }

      setTrackPosition(activeIndex * rect.width * -1 + dragOffset);
    }

    function endGalleryDrag(event) {
      if (!isDragging || !stage) {
        return;
      }

      var rect = stage.getBoundingClientRect();
      var threshold = Math.max(rect.width * 0.16, 54);
      isDragging = false;
      stage.classList.remove("is-dragging");

      if (typeof stage.releasePointerCapture === "function") {
        try {
          stage.releasePointerCapture(event.pointerId);
        } catch (error) {}
      }

      if (dragDeltaX <= threshold * -1) {
        showNext();
      } else if (dragDeltaX >= threshold) {
        showPrevious();
      } else {
        snapToActiveGalleryItem();
      }

      dragDeltaX = 0;
    }

    if (stage && window.matchMedia("(hover: hover)").matches) {
      stage.addEventListener("pointermove", function (event) {
        var rect = stage.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        stage.style.setProperty("--tilt-x", (0.5 - y) * 4 + "deg");
        stage.style.setProperty("--tilt-y", (x - 0.5) * 5 + "deg");
        stage.style.setProperty("--spot-x", x * 100 + "%");
        stage.style.setProperty("--spot-y", y * 100 + "%");
      });

      stage.addEventListener("pointerleave", function () {
        stage.style.setProperty("--tilt-x", "0deg");
        stage.style.setProperty("--tilt-y", "0deg");
        stage.style.setProperty("--spot-x", "50%");
        stage.style.setProperty("--spot-y", "50%");
      });
    }

    if (stage) {
      stage.addEventListener("pointerdown", startGalleryDrag);
      stage.addEventListener("pointermove", moveGalleryDrag);
      stage.addEventListener("pointerup", endGalleryDrag);
      stage.addEventListener("pointercancel", endGalleryDrag);
      stage.addEventListener("lostpointercapture", function () {
        if (isDragging) {
          isDragging = false;
          stage.classList.remove("is-dragging");
          snapToActiveGalleryItem();
        }
      });
      window.addEventListener("resize", snapToActiveGalleryItem);
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener("click", function () {
        setActiveGalleryItem(index);
      });
    });

    document.addEventListener("keydown", function (event) {
      var isGalleryFocused = gallery.contains(document.activeElement);

      if (!isGalleryFocused) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    });

    setActiveGalleryItem(0);
  }

  choiceInputs.forEach(function (input) {
    input.addEventListener("change", updateChoiceStates);
  });

  if (submitButton) {
    submitButton.dataset.defaultLabel = submitButton.textContent.trim();
  }

  if (form) {
    var storedSubmission = getStoredSubmission();

    if (storedSubmission) {
      lockRsvpForm(
        "warning",
        "Este dispositivo ya envió una confirmación. Si necesitas cambiarla, habrá que editar el registro guardado en GitHub.",
      );
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var honeypot = form.querySelector("input[name='website']");

      if (honeypot && honeypot.value) {
        return;
      }

      if (form.classList.contains("is-locked")) {
        return;
      }

      var formData = new FormData(form);
      var payload = {
        website: String(formData.get("website") || "").trim(),
        attendance: String(formData.get("attendance") || "").trim(),
        name: String(formData.get("name") || "").trim(),
        children: String(formData.get("children") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        deviceId: getBrowserId(),
      };

      if (!payload.name) {
        setRsvpStatus("error", "Escribe tu nombre para poder guardar la confirmación.");
        return;
      }

      setSubmitPending(true);

      try {
        var response = await fetch(rsvpEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        var result = await response.json().catch(function () {
          return {};
        });

        if (response.ok && result.ok) {
          setStorageItem(
            submissionStorageKey,
            JSON.stringify({
              name: payload.name,
              deviceId: payload.deviceId,
              sentAt: new Date().toISOString(),
            }),
          );
          lockRsvpForm(
            "success",
            result.message ||
              "Gracias. Tu confirmación quedó guardada correctamente.",
          );
          return;
        }

        if (response.status === 409) {
          if (result.reason === "device") {
            setStorageItem(
              submissionStorageKey,
              JSON.stringify({
                name: payload.name,
                deviceId: payload.deviceId,
                sentAt: new Date().toISOString(),
              }),
            );
            lockRsvpForm(
              "warning",
              result.message ||
                "Este dispositivo ya había enviado una confirmación anteriormente.",
            );
            return;
          }

          setRsvpStatus(
            "warning",
            result.message || "Ya existe una confirmación registrada con ese nombre.",
          );
          return;
        }

        setRsvpStatus(
          "error",
          result.message ||
            "No se pudo guardar la confirmación. Intenta nuevamente en un momento.",
        );
      } catch (error) {
        setRsvpStatus(
          "error",
          "No se pudo conectar con el sistema RSVP. Intenta de nuevo en unos momentos.",
        );
      } finally {
        if (!form.classList.contains("is-locked")) {
          setSubmitPending(false);
        }
      }
    });
  }

  audioToggle.addEventListener("click", function () {
    var enabled = audioToggle.getAttribute("aria-pressed") !== "true";
    setAudioState(enabled);
  });

  window.addEventListener(
    "pointerdown",
    function () {
      if (audioToggle.getAttribute("aria-pressed") === "true") {
        attemptPlay();
      }
    },
    { once: true },
  );

  window.addEventListener(
    "scroll",
    function () {
      updateAudioVisibility();
      updateScrollProgress();
    },
    { passive: true },
  );
  window.addEventListener("resize", updateScrollProgress);

  updateCountdown();
  setInterval(updateCountdown, 1000);
  updateChoiceStates();
  updateAudioVisibility();
  updateScrollProgress();
  setupReveal();
  setupGallery();
  setupHeroVideo();
  setAudioState(true);
})();
