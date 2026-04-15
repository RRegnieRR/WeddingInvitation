(function () {
  var eventDate = new Date("2026-09-12T14:00:00+02:00");
  var audio = document.getElementById("site-audio");
  var audioToggle = document.getElementById("audio-toggle");
  var countdownNodes = {
    days: document.querySelector("[data-count='days']"),
    hours: document.querySelector("[data-count='hours']"),
    minutes: document.querySelector("[data-count='minutes']"),
  };
  var form = document.getElementById("rsvp-form");
  var successMessage = document.getElementById("rsvp-success");
  var guestCount = document.getElementById("guest-count");
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
      audioToggle.querySelector(".audio-toggle__text").textContent = "Música activada";
      audioToggle.querySelector(".audio-toggle__icon").textContent = "II";
      attemptPlay();
    } else {
      audio.pause();
      audioToggle.setAttribute("aria-pressed", "false");
      audioToggle.querySelector(".audio-toggle__text").textContent = "Música desactivada";
      audioToggle.querySelector(".audio-toggle__icon").textContent = "♪";
    }
  }

  function updateChoiceStates() {
    document.querySelectorAll(".choice").forEach(function (choice) {
      var input = choice.querySelector("input");
      choice.classList.toggle("choice--active", input.checked);
    });
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

  document.querySelectorAll("[data-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      var step = Number(button.getAttribute("data-step"));
      var current = Number(guestCount.value || 1);
      guestCount.value = String(Math.max(1, current + step));
    });
  });

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
  setAudioState(true);
})();
