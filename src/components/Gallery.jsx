import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./Gallery.css";

/* ---------- Easy-to-replace content ----------
   Add, remove, or reorder freely: the strip rebuilds itself. */
const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=80",
    alt: "Couple portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
    alt: "Wedding detail",
  },
  {
    src: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80",
    alt: "The wedding venue",
  },
  {
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80",
    alt: "The couple together",
  },
  {
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=80",
    alt: "A wedding moment",
  },
  {
    src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1000&q=80",
    alt: "A candid moment",
  },
];

/* ---------- Strip settings ---------- */
const COPIES = 3;           // the set is repeated so the loop never shows a gap
const AUTOPLAY_SPEED = 28;  // px per second, right to left
const EASE_RATE = 3;        // how softly it eases into and out of a pause
const MAX_FLICK = 2200;     // px per second, limit for a swipe's momentum
// Image shapes repeat in this order (the height is the same for all)
const RATIOS = ["4 / 5", "3 / 2", "4 / 5", "1 / 1", "3 / 4", "3 / 2"];

/* ---------- Animation (section header and strip entrance) ---------- */
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

const reveal = (variants, delay = 0) => ({
  variants,
  custom: delay,
  initial: "hidden",
  whileInView: "visible",
  viewport: VIEWPORT,
});

/* ---------- Component ---------- */
function Gallery() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  // Everything the moving strip needs lives in one ref (no re-renders)
  const strip = useRef({
    offset: 0,        // how far the strip has moved left (px)
    velocity: 0,      // current speed, px per second (positive = leftward)
    setWidth: 0,      // width of ONE copy of the images
    visible: false,
    hovering: false,
    reduced: false,
    dragging: false,
    lastX: 0,
    lastT: 0,
    flick: 0,
    raf: 0,
    last: 0,
    render: () => {},
    start: () => {},
  });

  useEffect(() => {
    const s = strip.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;

    // Respect the visitor's reduced-motion setting (no autoplay)
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      s.reduced = motionQuery.matches;
    };
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    // Width of one copy, so the loop can wrap without a visible jump
    const measure = () => {
      s.setWidth = track.getBoundingClientRect().width / COPIES;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    s.render = () => {
      if (s.setWidth) s.offset = ((s.offset % s.setWidth) + s.setWidth) % s.setWidth;
      track.style.transform = `translate3d(${-s.offset}px, 0, 0)`;
    };

    const tick = (now) => {
      const dt = Math.min((now - s.last) / 1000, 0.05);
      s.last = now;

      if (!s.dragging) {
        const target = s.visible && !s.hovering && !s.reduced ? AUTOPLAY_SPEED : 0;
        s.velocity += (target - s.velocity) * Math.min(1, dt * EASE_RATE);
        s.offset += s.velocity * dt;
        s.render();
      }

      // Keep going while it is on screen or still gliding after a swipe
      const keepRunning =
        (s.visible && !s.reduced) || Math.abs(s.velocity) > 0.5 || s.dragging;
      s.raf = keepRunning ? requestAnimationFrame(tick) : 0;
    };

    s.start = () => {
      if (!s.raf) {
        s.last = performance.now();
        s.raf = requestAnimationFrame(tick);
      }
    };

    // Start moving when the strip becomes visible, stop when it leaves
    const observer = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        if (s.visible) s.start();
      },
      { threshold: 0.15 }
    );
    observer.observe(viewport);

    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      observer.disconnect();
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", syncMotion);
    };
  }, []);

  /* ----- Pointer handling: hover pause (mouse) and swipe / drag (touch, pen, mouse) ----- */
  const handlePointerEnter = (e) => {
    if (e.pointerType === "mouse") strip.current.hovering = true;
  };

  const handlePointerLeave = (e) => {
    if (e.pointerType === "mouse") strip.current.hovering = false;
  };

  const handlePointerDown = (e) => {
    const s = strip.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.flick = 0;
    s.velocity = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    viewportRef.current.classList.add("is-dragging");
  };

  const handlePointerMove = (e) => {
    const s = strip.current;
    if (!s.dragging) return;

    const now = performance.now();
    const dx = e.clientX - s.lastX;
    const elapsed = Math.max(now - s.lastT, 1);

    s.offset -= dx; // the strip follows the finger
    s.flick = s.flick * 0.6 + ((-dx / elapsed) * 1000) * 0.4;
    s.lastX = e.clientX;
    s.lastT = now;
    s.render();
  };

  const endDrag = () => {
    const s = strip.current;
    if (!s.dragging) return;

    s.dragging = false;
    viewportRef.current.classList.remove("is-dragging");

    // A pause before letting go means no momentum
    if (performance.now() - s.lastT > 80) s.flick = 0;
    s.velocity = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, s.flick));
    s.start(); // momentum glides, then eases back into the slow autoplay
  };

  return (
    <section className="gallery" id="gallery">
      {/* ---------- Header ---------- */}
      <div className="gallery__inner">
        <header className="gallery__header">
          <motion.p className="gallery__label" {...reveal(fadeIn, 0)}>
            A GLIMPSE
          </motion.p>

          <motion.h2 className="gallery__heading" {...reveal(fadeUp, 0.2)}>
            Moments <em>we&rsquo;ll always remember.</em>
          </motion.h2>
        </header>
      </div>

      {/* ---------- Moving strip ---------- */}
      <motion.div className="gallery__strip" {...reveal(fadeUp, 0.4)}>
        <div
          ref={viewportRef}
          className="gallery__viewport"
          role="group"
          aria-label="Wedding photo gallery"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div ref={trackRef} className="gallery__track">
            {Array.from({ length: COPIES }, (_, copy) => (
              // Only the first copy is announced to screen readers
              <div
                key={copy}
                className="gallery__set"
                aria-hidden={copy > 0 ? "true" : undefined}
              >
                {GALLERY_IMAGES.map((img, i) => (
                  <figure
                    key={`${img.src}-${i}`}
                    className="gallery__item"
                    style={{ aspectRatio: RATIOS[i % RATIOS.length] }}
                  >
                    <img
                      src={img.src}
                      alt={copy === 0 ? img.alt : ""}
                      loading="lazy"
                      draggable={false}
                    />
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Gallery;