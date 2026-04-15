import { useEffect, useRef, useState } from "react";
import { content } from "./data/content";
import { AudioToggle } from "./components/AudioToggle";
import { Reveal } from "./components/Reveal";
import { HeroSection } from "./sections/HeroSection";
import { CountdownSection } from "./sections/CountdownSection";
import { WelcomeSection } from "./sections/WelcomeSection";
import { VenueSection } from "./sections/VenueSection";
import { ProgrammeSection } from "./sections/ProgrammeSection";
import { DressCodeSection } from "./sections/DressCodeSection";
import { PreWeddingSection } from "./sections/PreWeddingSection";
import { LocationSection } from "./sections/LocationSection";
import { GiftsSection } from "./sections/GiftsSection";
import { RsvpSection } from "./sections/RsvpSection";
import { FooterSection } from "./sections/FooterSection";
import weddingSong from "../Joy in the Little Things.mp3";

function App() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showAudioToggle, setShowAudioToggle] = useState(false);
  const audioRef = useRef(null);
  const page = content.es;

  useEffect(() => {
    document.documentElement.lang = "es";
    document.title = page.meta.title;
  }, [page.meta.title]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    audio.volume = 0.5;

    if (audioEnabled) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      audio.pause();
    }

    return undefined;
  }, [audioEnabled]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const resumePlayback = () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", resumePlayback, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resumePlayback);
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      const nextVisible = window.scrollY > 48;

      setShowAudioToggle((current) => (
        current === nextVisible ? current : nextVisible
      ));

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleAudioToggle() {
    setAudioEnabled((current) => !current);
  }

  return (
    <div className="relative overflow-x-hidden bg-[#fffefc] bg-paper text-mocha">
      <audio ref={audioRef} src={weddingSong} loop preload="auto" autoPlay playsInline />

      <div
        className={`fixed bottom-5 right-4 z-40 transition duration-500 md:bottom-8 md:right-8 ${
          showAudioToggle
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <AudioToggle
          enabled={audioEnabled}
          onToggle={handleAudioToggle}
          labels={page.audio}
        />
      </div>

      <div className="relative z-10">
        <HeroSection page={page} />

        <Reveal>
          <CountdownSection page={page} />
        </Reveal>

        <Reveal>
          <WelcomeSection page={page} />
        </Reveal>

        <Reveal>
          <VenueSection page={page} />
        </Reveal>

        <Reveal>
          <ProgrammeSection page={page} />
        </Reveal>

        <Reveal>
          <DressCodeSection page={page} />
        </Reveal>

        <Reveal>
          <PreWeddingSection page={page} />
        </Reveal>

        <Reveal>
          <LocationSection page={page} />
        </Reveal>

        <Reveal>
          <GiftsSection page={page} />
        </Reveal>

        <Reveal>
          <RsvpSection page={page} />
        </Reveal>

        <Reveal>
          <FooterSection page={page} />
        </Reveal>
      </div>
    </div>
  );
}

export default App;
