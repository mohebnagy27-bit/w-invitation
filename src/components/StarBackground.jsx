import "./StarBackground.css";

/* ---------- Easy-to-tweak settings ---------- */
const COLUMNS = 10; // 10 x 7 = 70 stars on desktop (about 24 on small phones)
const ROWS = 7;
const SEED = 20270504; // change for a different (but stable) star pattern

// halo = glow color ("r, g, b"), core = the small bright center
const STAR_TONES = [
  { halo: "216, 199, 163", core: "#FFF4D8" }, // muted champagne (#D8C7A3)
  { halo: "216, 199, 163", core: "#FFF4D8" },
  { halo: "226, 206, 158", core: "#FFF6DC" }, // warm beige
  { halo: "232, 208, 138", core: "#FFF0C4" }, // soft warm yellow
];

const round = (n) => Number(n.toFixed(2));

/* Small seeded random generator: the same stars on every load */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* One star per grid cell, jittered inside it, so they spread evenly
   without clumping. */
function createStars() {
  const rand = mulberry32(SEED);
  const stars = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const index = row * COLUMNS + col;
      const big = rand() < 0.25;
      const hi = 0.5 + rand() * 0.45; // halo at its brightest
      const lo = 0.12 + rand() * 0.12; // halo at its dimmest
      const tone = STAR_TONES[Math.floor(rand() * STAR_TONES.length)];

      stars.push({
        id: index,
        left: ((col + 0.15 + rand() * 0.7) / COLUMNS) * 100,
        top: ((row + 0.15 + rand() * 0.7) / ROWS) * 100,
        size: big ? 2.5 + rand() * 0.5 : 1.9 + rand() * 0.4, // px
        halo: tone.halo,
        core: tone.core,
        lo: round(lo),
        mid: round(lo + (hi - lo) * 0.5), // "soft glow" stage
        hi: round(hi),
        bloom: round(1.12 + rand() * 0.25), // how much the halo swells
        coreLo: round(0.55 + rand() * 0.2), // core brightness when dim
        duration: Number((4.5 + rand() * 4).toFixed(1)), // 4.5s - 8.5s
        delay: -Number((rand() * 8).toFixed(1)), // negative: already mid-cycle
        extra: index % 3 !== 0, // hidden on small phones
      });
    }
  }

  return stars;
}

const STARS = createStars();

function StarBackground() {
  return (
    <div className="stars" aria-hidden="true">
      {STARS.map((s) => (
        <span
          key={s.id}
          className={`star${s.extra ? " star--extra" : ""}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            "--size": `${s.size.toFixed(1)}px`,
            "--halo": s.halo,
            "--core": s.core,
            "--lo": s.lo,
            "--mid": s.mid,
            "--hi": s.hi,
            "--bloom": s.bloom,
            "--core-lo": s.coreLo,
            "--dur": `${s.duration}s`,
            "--delay": `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default StarBackground;