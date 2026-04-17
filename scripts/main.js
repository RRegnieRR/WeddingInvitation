(function () {
  var eventDate = new Date("2027-02-20T14:00:00+01:00");
  var audio = document.getElementById("site-audio");
  var audioToggle = document.getElementById("audio-toggle");
  var hero = document.getElementById("top");
  var heroVideo = document.getElementById("hero-video");
  var countdownNodes = {
    days: document.querySelector("[data-count='days']"),
    hours: document.querySelector("[data-count='hours']"),
    minutes: document.querySelector("[data-count='minutes']"),
  };
  var form = document.getElementById("rsvp-form");
  var successMessage = document.getElementById("rsvp-success");
  var choiceInputs = document.querySelectorAll(".choice input");

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

  choiceInputs.forEach(function (input) {
    input.addEventListener("change", updateChoiceStates);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var honeypot = form.querySelector("input[name='website']");

    if (honeypot && honeypot.value) {
      return;
    }

    successMessage.hidden = false;
  });

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

  window.addEventListener("scroll", updateAudioVisibility, { passive: true });

  updateCountdown();
  setInterval(updateCountdown, 1000);
  updateChoiceStates();
  updateAudioVisibility();
  setupReveal();
  setupHeroVideo();
  setAudioState(true);
})();
