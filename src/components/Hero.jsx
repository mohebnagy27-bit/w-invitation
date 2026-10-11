import { motion } from "framer-motion";
import "./Hero.css";
// import heroImage from "../assets/images/IMG_20251201_193914_188.jpg";
// const HERO_IMAGE = heroImage;

/* Temporary image. Replace later (see "Replace the image" below). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80";

const EASE = [0.22, 1, 0.36, 1];

/* ---------- Animation variants ---------- */
const backgroundVariants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 2, ease: "easeInOut" },
      scale: { duration: 7, ease: "easeOut" },
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.5, duration: 1.8, ease: "easeInOut" } },
};

const taglineVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 1.4, duration: 1.4, ease: "easeInOut" } },
};

const namesVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { delay: 2.0, duration: 2, ease: EASE } },
};

const lineVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 3.0, duration: 1.4, ease: "easeInOut" } },
};

const dateVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { delay: 3.1, duration: 1.6, ease: EASE } },
};

/* ---------- Component ---------- */
function Hero({
  partnerOne = "MARYAM",
  partnerTwo = "AHMED",
  date = "04 MAY 2027",
  tagline = "WE ARE GETTING MARRIED",
}) {
  return (
    <motion.section
      className="hero"
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="hero__bg"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        variants={backgroundVariants}
      />
      <motion.div className="hero__overlay" variants={overlayVariants} />

      <div className="hero__content">
        <motion.p className="hero__tagline" variants={taglineVariants}>
          {tagline}
        </motion.p>

        <motion.h1 className="hero__names" variants={namesVariants}>
          <span>{partnerOne}</span>
          <span className="hero__amp">&amp;</span>
          <span>{partnerTwo}</span>
        </motion.h1>

        <motion.span className="hero__line" variants={lineVariants} />

        <motion.p className="hero__date" variants={dateVariants}>
          {date}
        </motion.p>
      </div>
    </motion.section>
  );
}

export default Hero;