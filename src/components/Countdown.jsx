import { useEffect, useState } from "react";

function getCountdown(targetDate) {
  const difference = Math.max(new Date(targetDate).getTime() - Date.now(), 0);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  return { days, hours, minutes };
}

export function Countdown({ targetDate, units }) {
  const [time, setTime] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getCountdown(targetDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-3 gap-6 text-center md:gap-10">
      {Object.entries(time).map(([key, value]) => (
        <div key={key}>
          <div className="font-serif text-5xl font-semibold leading-none text-mocha md:text-7xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.36em] text-taupe/75 md:text-xs">
            {units[key]}
          </div>
        </div>
      ))}
    </div>
  );
}
