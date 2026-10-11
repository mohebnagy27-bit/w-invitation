import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./Envelope.css";

const EASE = [0.65, 0, 0.35, 1];
const PETAL_COLORS = ["#ffb7c5", "#ffa4b6", "#ffccd5", "#fbc4b6"];

function mulberry32(seed) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function createPetals() {
  const random = mulberry32(20261011);

  return Array.from({ length: 26 }, (_, id) => {
    const duration = 7 + random() * 5;
    return {
      id,
      color: PETAL_COLORS[Math.floor(random() * PETAL_COLORS.length)],
      size: 10 + random() * 12,
      left: random() * 100,
      duration,
      delay: -(random() * duration),
      sway: 3 + random() * 5,
      rotation: Math.round(random() * 360),
      opacity: 0.48 + random() * 0.28,
    };
  });
}

const ROSE_PETALS = createPetals();

function planTimeline() {
  return { heroAt: 1.2, fadeDelay: 1.4, fadeDuration: 1.6 };
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

function RosePetals() {
  return (
    <div className="envelope-petals" aria-hidden="true">
      {ROSE_PETALS.map((petal) => (
        <span
          key={petal.id}
          className="envelope-petal"
          style={{
            left: `${petal.left}%`,
            "--petal-color": petal.color,
            "--petal-size": `${petal.size.toFixed(1)}px`,
            "--petal-height": `${(petal.size * 0.72).toFixed(1)}px`,
            "--petal-start": `${(-petal.size * 2).toFixed(1)}px`,
            "--petal-duration": `${petal.duration.toFixed(1)}s`,
            "--petal-delay": `${petal.delay.toFixed(1)}s`,
            "--petal-sway": `${petal.sway.toFixed(1)}vw`,
            "--petal-sway-reverse": `${(-petal.sway * 0.7).toFixed(1)}vw`,
            "--petal-sway-small": `${(petal.sway * 0.45).toFixed(1)}vw`,
            "--petal-sway-end": `${(-petal.sway * 0.35).toFixed(1)}vw`,
            "--petal-rotation": `${petal.rotation}deg`,
            "--petal-opacity": petal.opacity.toFixed(2),
            "--petal-soft-opacity": (petal.opacity * 0.82).toFixed(2),
          }}
        />
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
  const [run, setRun] = useState(null);
  const [screenDone, setScreenDone] = useState(false);
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

    return () => timers.forEach(clearTimeout);
  }, [run]);

  useEffect(() => {
    if (isOpen && screenDone) callbacks.current.onComplete?.();
  }, [isOpen, screenDone]);

  const handleOpen = () => {
    if (isOpen) return;

    setRun(planTimeline());
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
        <RosePetals />
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
    </>
  );
}

export default Envelope;
