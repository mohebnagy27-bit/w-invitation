import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./Envelope.css";

const EASE = [0.65, 0, 0.35, 1];
const TRAIL_PHASE_SECONDS = 3.8;

const LIGHT_TRAILS = [
  { left: "7%", delay: "0.16s", duration: "3.08s", height: "24vh", swayA: "1.5vw", swayB: "-2.2vw" },
  { left: "17%", delay: "0.58s", duration: "2.72s", height: "18vh", swayA: "-1.7vw", swayB: "1.1vw", reverse: true },
  { left: "28%", delay: "0.28s", duration: "3.34s", height: "29vh", swayA: "2.1vw", swayB: "-1.2vw" },
  { left: "39%", delay: "0.88s", duration: "2.92s", height: "21vh", swayA: "-1.2vw", swayB: "2.4vw", reverse: true },
  { left: "49%", delay: "0.45s", duration: "3.18s", height: "26vh", swayA: "1.1vw", swayB: "-2.8vw" },
  { left: "58%", delay: "1.05s", duration: "2.56s", height: "17vh", swayA: "-2.3vw", swayB: "1.2vw", reverse: true },
  { left: "68%", delay: "0.08s", duration: "3.44s", height: "30vh", swayA: "2.5vw", swayB: "-1.4vw" },
  { left: "77%", delay: "0.72s", duration: "2.84s", height: "20vh", swayA: "-1vw", swayB: "2.1vw", reverse: true },
  { left: "87%", delay: "0.38s", duration: "3.02s", height: "23vh", swayA: "1.8vw", swayB: "-2.1vw" },
];

function planTimeline(withTrails) {
  if (!withTrails) {
    return { heroAt: 1.2, fadeDelay: 1.4, fadeDuration: 1.6, trailDuration: 0 };
  }

  return {
    heroAt: 1.25,
    fadeDelay: 2.15,
    fadeDuration: 1.55,
    trailDuration: TRAIL_PHASE_SECONDS,
  };
}

const fadeOut = {
  closed: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const flapVariants = {
  closed: { rotateX: 0, zIndex: 4 },
  open: {
    rotateX: 180,
    zIndex: 1,
    transition: {
      rotateX: { duration: 1.0, ease: EASE },
      zIndex: { delay: 0.45, duration: 0 },
    },
  },
};

const cardVariants = {
  closed: { y: "0%" },
  open: { y: "-55%", transition: { delay: 0.5, duration: 1.1, ease: EASE } },
};

const cardTextVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { delay: 0.9, duration: 0.6 } },
};

function LightTrails() {
  return (
    <div className="envelope-trails" aria-hidden="true">
      {LIGHT_TRAILS.map((trail, index) => (
        <span
          key={index}
          className={`envelope-trail${trail.reverse ? " envelope-trail--reverse" : ""}`}
          style={{
            left: trail.left,
            "--trail-delay": trail.delay,
            "--trail-duration": trail.duration,
            "--trail-height": trail.height,
            "--trail-sway-a": trail.swayA,
            "--trail-sway-b": trail.swayB,
          }}
        >
          <span className="envelope-trail__core" />
        </span>
      ))}
    </div>
  );
}

function Envelope({
  names = "MARYAM & AHMED",
  initials = "M & A",
  onOpen,
  onComplete,
}) {
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState(null);
  const [screenDone, setScreenDone] = useState(false);
  const [trailsDone, setTrailsDone] = useState(false);
  const isOpen = run !== null;

  const callbacks = useRef({ onOpen, onComplete });
  useEffect(() => {
    callbacks.current = { onOpen, onComplete };
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!run) return undefined;

    const timers = [];
    const at = (seconds, fn) => timers.push(setTimeout(fn, seconds * 1000));

    at(run.heroAt, () => callbacks.current.onOpen?.());
    at(run.fadeDelay + run.fadeDuration, () => setScreenDone(true));
    if (run.withTrails) at(run.trailDuration, () => setTrailsDone(true));

    return () => timers.forEach(clearTimeout);
  }, [run]);

  useEffect(() => {
    if (isOpen && screenDone && trailsDone) callbacks.current.onComplete?.();
  }, [isOpen, screenDone, trailsDone]);

  const handleOpen = () => {
    if (isOpen) return;

    const withTrails = !reduceMotion;
    setRun({ withTrails, ...planTimeline(withTrails) });
    if (!withTrails) setTrailsDone(true);
  };

  return (
    <>
      <motion.div
        className="envelope-screen"
        initial={{ opacity: 0 }}
        animate={
          run
            ? {
                opacity: 0,
                transition: {
                  delay: run.fadeDelay,
                  duration: run.fadeDuration,
                  ease: "easeInOut",
                },
              }
            : { opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } }
        }
      >
        <motion.button
          type="button"
          className={`envelope${isOpen ? " is-open" : ""}`}
          onClick={handleOpen}
          disabled={isOpen}
          aria-label={`Open the invitation from ${names}`}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          whileHover={isOpen ? undefined : { y: -4 }}
          whileTap={isOpen ? undefined : { scale: 0.99 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="envelope__back" />
          <motion.span className="envelope__card" variants={cardVariants}>
            <motion.span className="envelope__card-content" variants={cardTextVariants}>
              <span className="envelope__small">The Wedding of</span>
              <span className="envelope__rule" />
              <span className="envelope__monogram">{initials}</span>
            </motion.span>
          </motion.span>
          <span className="envelope__front" />
          <svg className="envelope__front-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,0 50,52 100,0" />
          </svg>
          <motion.span className="envelope__print" variants={fadeOut}>
            <span className="envelope__small">You are invited</span>
            <span className="envelope__names">{names}</span>
          </motion.span>
          <motion.span className="envelope__flap" variants={flapVariants}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="0,0 100,0 50,100" />
            </svg>
          </motion.span>
          <motion.span className="envelope__seal" variants={fadeOut}>
            {initials}
          </motion.span>
        </motion.button>
      </motion.div>

      {run?.withTrails && !trailsDone && <LightTrails />}
    </>
  );
}

export default Envelope;
