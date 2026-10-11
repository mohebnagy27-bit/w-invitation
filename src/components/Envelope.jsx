import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./Envelope.css";

const EASE = [0.65, 0, 0.35, 1];

/* ---------- Lottie transition ----------
   The animation file lives in the public folder:
   public/animations/fireworks.json */
const LOTTIE_URL = `${import.meta.env.BASE_URL}animations/fireworks.json`;
const LOTTIE_START_AT = 0.4; // seconds after the click

/* ---------- Timeline (seconds after the click) ---------- */
function planTimeline(lottieSeconds) {
  // No animation (still loading, missing, or reduced motion): a calm fade only
  if (!lottieSeconds) {
    return { heroAt: 1.2, fadeDelay: 1.4, fadeDuration: 1.6 };
  }

  // With the animation: the Hero mounts about a third of the way in, and the
  // screen finishes fading just before the animation ends
  const heroAt = LOTTIE_START_AT + lottieSeconds * 0.35;
  return {
    heroAt,
    fadeDelay: heroAt + 0.2,
    fadeDuration: lottieSeconds * 0.55,
  };
}

/* ---------- Envelope animation variants (unchanged) ---------- */
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

/* ---------- Lottie player (small wrapper around lottie-web) ---------- */
function FireworksPlayer({ engine, data, playing, onComplete }) {
  const stageRef = useRef(null);
  const animationRef = useRef(null);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  });

  // Build the animation once; destroy it when the component goes away
  useEffect(() => {
    const animation = engine.loadAnimation({
      container: stageRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: structuredClone(data), // lottie-web edits what it is given
    });

    animation.addEventListener("complete", () => completeRef.current());
    animationRef.current = animation;

    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, [engine, data]);

  // Start playing when told to
  useEffect(() => {
    if (playing) animationRef.current?.play();
  }, [playing]);

  return <div ref={stageRef} className="envelope-lottie__stage" />;
}

/* ---------- Component ---------- */
function Envelope({
  names = "MARYAM & AHMED",
  initials = "M & A",
  onOpen,       // the Hero can mount now (hidden under the screen)
  onComplete,   // the transition is finished: remove the envelope
}) {
  const reduceMotion = useReducedMotion();

  const [lottie, setLottie] = useState(null); // { engine, data } once loaded
  const [run, setRun] = useState(null); // set once, on the first click
  const [lottieStarted, setLottieStarted] = useState(false);
  const [lottieDone, setLottieDone] = useState(false);
  const [screenDone, setScreenDone] = useState(false);

  const isOpen = run !== null;

  // Always call the latest callbacks without restarting the timers
  const callbacks = useRef({ onOpen, onComplete });
  useEffect(() => {
    callbacks.current = { onOpen, onComplete };
  });

  // Load the Lottie file and the (small) player while the visitor is still
  // looking at the envelope. If either fails, the transition is a plain fade.
  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch(LOTTIE_URL, { signal: controller.signal }).then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))
      ),
      import("lottie-web/build/player/lottie_light"),
    ])
      .then(([data, player]) => setLottie({ data, engine: player.default }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn(
            `Envelope: could not load ${LOTTIE_URL}. Using a plain fade instead.`,
            err
          );
        }
      });

    return () => controller.abort();
  }, []);

  // Lock page scroll while the envelope is on screen
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // After the click: schedule the Lottie, the Hero, and the end of the fade
  useEffect(() => {
    if (!run) return undefined;

    const timers = [];
    const at = (seconds, fn) => timers.push(setTimeout(fn, seconds * 1000));

    at(run.heroAt, () => callbacks.current.onOpen?.());
    at(run.fadeDelay + run.fadeDuration, () => setScreenDone(true));

    if (run.withLottie) {
      at(LOTTIE_START_AT, () => setLottieStarted(true));
      // Safety net in case the player never reports completion
      at(LOTTIE_START_AT + run.seconds + 1, () => setLottieDone(true));
    }

    return () => timers.forEach(clearTimeout);
  }, [run]);

  // Hand control back once the screen has faded AND the animation has ended
  useEffect(() => {
    if (isOpen && screenDone && lottieDone) callbacks.current.onComplete?.();
  }, [isOpen, screenDone, lottieDone]);

  const handleOpen = () => {
    if (isOpen) return;

    const seconds =
      lottie && !reduceMotion
        ? (lottie.data.op - lottie.data.ip) / lottie.data.fr
        : 0;
    const withLottie = Number.isFinite(seconds) && seconds > 0;

    setRun({ withLottie, seconds, ...planTimeline(withLottie ? seconds : 0) });
    if (!withLottie) setLottieDone(true);
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

          {/* Invitation card (revealed) */}
          <motion.span className="envelope__card" variants={cardVariants}>
            <motion.span
              className="envelope__card-content"
              variants={cardTextVariants}
            >
              <span className="envelope__small">The Wedding of</span>
              <span className="envelope__rule" />
              <span className="envelope__monogram">{initials}</span>
            </motion.span>
          </motion.span>

          {/* Front pocket with printed text */}
          <span className="envelope__front" />
          <svg
            className="envelope__front-line"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points="0,0 50,52 100,0" />
          </svg>

          <motion.span className="envelope__print" variants={fadeOut}>
            <span className="envelope__small">You are invited</span>
            <span className="envelope__names">{names}</span>
          </motion.span>

          {/* Flap */}
          <motion.span className="envelope__flap" variants={flapVariants}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="0,0 100,0 50,100" />
            </svg>
          </motion.span>

          {/* Seal */}
          <motion.span className="envelope__seal" variants={fadeOut}>
            {initials}
          </motion.span>
        </motion.button>
      </motion.div>

      {/* The Lottie sits outside the fading screen, so it stays visible.
          It is removed from the page as soon as it finishes. */}
      {run?.withLottie && !lottieDone && (
        <div
          className={`envelope-lottie${lottieStarted ? " is-playing" : ""}`}
          aria-hidden="true"
        >
          <FireworksPlayer
            engine={lottie.engine}
            data={lottie.data}
            playing={lottieStarted}
            onComplete={() => setLottieDone(true)}
          />
        </div>
      )}
    </>
  );
}

export default Envelope;