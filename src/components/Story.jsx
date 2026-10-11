import { motion } from "framer-motion";
import "./Story.css";
// import storyMain from "../assets/images/IMG_20251201_193954_081.jpg";
// import storySecondry from "../assets/images/IMG_20251201_193921_513.jpg";

// ...
// "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80"

// "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80"

/* ---------- Easy-to-replace content ---------- */
const STORY_IMAGES = {
  main: {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
    alt: "The couple together",
  },
  secondary: {
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80",
    alt: "A quiet moment between the couple",
  },
};

const STORY_PARAGRAPHS = [
  "Two people, two different journeys, and one beautiful story that brought them together.",
  "What began as a simple conversation slowly became a friendship, and then something far more certain. Every ordinary day became a little more meaningful.",
  "Now, we are beginning a new chapter, and we would love for you to be part of it.",
];

const STORY_CAPTION = "And so, the beginning of forever.";

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

/* Spread onto any motion element to make it animate when scrolled into view */
const reveal = (variants, delay = 0) => ({
  variants,
  custom: delay,
  initial: "hidden",
  whileInView: "visible",
  viewport: VIEWPORT,
});

/* ---------- Component ---------- */
function Story() {
  return (
    <section className="story" id="story">
      <div className="story__inner">
        {/* ---------- Top row: text + images ---------- */}
        <div className="story__top">
          <div className="story__text">
            <motion.p className="story__label" {...reveal(fadeIn, 0)}>
              OUR STORY
            </motion.p>

            <motion.div {...reveal(fadeUp, 0.2)}>
              <h2 className="story__heading">
                A story <em>worth remembering.</em>
              </h2>
              <span className="story__rule" />
            </motion.div>

            <motion.div className="story__body" {...reveal(fadeUp, 0.4)}>
              {STORY_PARAGRAPHS.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </motion.div>
          </div>

          <div className="story__media">
            <motion.figure
              className="story__img story__img--main"
              {...reveal(fadeUp, 0.5)}
            >
              <img
                src={STORY_IMAGES.main.src}
                alt={STORY_IMAGES.main.alt}
                loading="lazy"
              />
            </motion.figure>

            <motion.figure
              className="story__img story__img--secondary"
              {...reveal(fadeUp, 0.9)}
            >
              <img
                src={STORY_IMAGES.secondary.src}
                alt={STORY_IMAGES.secondary.alt}
                loading="lazy"
              />
            </motion.figure>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Story;