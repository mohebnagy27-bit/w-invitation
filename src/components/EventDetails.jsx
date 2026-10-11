import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./EventDetails.css";

/* ---------- Easy-to-replace content ---------- */
const EVENT = {
  day: "04",
  month: "MAY",
  year: "2027",
  time: "7:00 PM",
};

const LOCATION = {
  venue: "THE GRAND VENUE",
  addressLines: ["123 Wedding Avenue", "Cairo, Egypt"],
  mapsUrl: "#", // <- replace with the real Google Maps link
};

/* ---------- Countdown ----------
   Written without a timezone, so it counts down to 7:00 PM in each
   visitor's own timezone. To pin it to the venue's time, add its UTC offset,
   e.g. "2027-05-04T19:00:00+03:00" (check the offset for that date).
   Keep it in sync with EVENT above. */
const WEDDING_DATE = new Date("2027-05-04T19:00:00");

const UNITS = [
  { key: "days", label: "DAYS" },
  { key: "hours", label: "HOURS" },
  { key: "minutes", label: "MINUTES" },
  { key: "seconds", label: "SECONDS" },
];

/* Time calculation (never negative) */
function getTimeLeft(target) {
  const raw = target.getTime() - Date.now();
  const totalSeconds = Math.floor(Math.max(0, raw) / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: raw <= 0,
  };
}

const pad = (n) => String(n).padStart(2, "0");

/* ---------- Animation ---------- */
const EASE = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, amount: 0.2 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.4, delay, ease: EASE },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 1.6, delay, ease: "easeInOut" },
  }),
};

/* Spread onto any motion element to animate it when scrolled into view */
const reveal = (variants, delay = 0) => ({
  variants,
  custom: delay,
  initial: "hidden",
  whileInView: "visible",
  viewport: VIEWPORT,
});

/* ---------- Component ---------- */
function EventDetails() {
  // Calculated immediately, so a refresh never shows stale or zero values
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(WEDDING_DATE));

  useEffect(() => {
    if (getTimeLeft(WEDDING_DATE).done) return undefined;

    const id = setInterval(() => {
      const next = getTimeLeft(WEDDING_DATE);
      setTimeLeft(next);
      if (next.done) clearInterval(id); // stop ticking at zero
    }, 1000);

    return () => clearInterval(id); // cleanup on unmount
  }, []);

  const isPlaceholderLink = LOCATION.mapsUrl === "#";

  return (
    <motion.section
      className="event"
      id="details"
      variants={fadeIn}
      custom={0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
    >
      <div className="event__inner">
        <motion.h2 className="event__heading" {...reveal(fadeUp, 0.1)}>
          The day <em>we&rsquo;ve been waiting for.</em>
        </motion.h2>

        <div className="event__grid">
          {/* ---------- Left: location ---------- */}
          <motion.div {...reveal(fadeUp, 0.3)}>
            <h3 className="event__label">LOCATION</h3>
            <p className="event__venue">{LOCATION.venue}</p>
            <address className="event__address">
              {LOCATION.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <a
              className="event__button"
              href={LOCATION.mapsUrl}
              target={isPlaceholderLink ? undefined : "_blank"}
              rel={isPlaceholderLink ? undefined : "noopener noreferrer"}
              onClick={(e) => {
                if (isPlaceholderLink) e.preventDefault();
              }}
            >
              VIEW ON GOOGLE MAPS
            </a>
          </motion.div>

          {/* ---------- Right: date, time, and the countdown right below ---------- */}
          <div>
            <motion.div {...reveal(fadeUp, 0.45)}>
              <h3 className="event__label">EVENT DETAILS</h3>
              <p className="event__date">
                {EVENT.day} {EVENT.month} {EVENT.year}
              </p>
              <p className="event__time">{EVENT.time}</p>
            </motion.div>

            <div className="event__countdown">
              <motion.h3 className="event__label" {...reveal(fadeIn, 0.6)}>
                COUNTDOWN
              </motion.h3>

              {timeLeft.done ? (
                <motion.p className="event__done" {...reveal(fadeIn, 0.3)}>
                  TODAY IS THE DAY
                </motion.p>
              ) : (
                <div
                  className="event__timer"
                  role="timer"
                  aria-label="Time until the wedding"
                >
                  {UNITS.map(({ key, label }, i) => (
                    <motion.div
                      key={key}
                      className="event__unit"
                      {...reveal(fadeUp, 0.7 + i * 0.12)}
                    >
                      <span className="event__value">{pad(timeLeft[key])}</span>
                      <span className="event__unit-label">{label}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default EventDetails;