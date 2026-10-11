import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./RSVP.css";

/* ---------- Easy-to-replace content ---------- */
const MAX_GUESTS = 5;

const THANK_YOU_TEXT = {
  accept: "We can’t wait to celebrate with you.",
  decline: "We’ll miss you on the day, but thank you for letting us know.",
};

/* ---------- Form setup ---------- */
const INITIAL_FORM = {
  name: "",
  email: "",
  attendance: "", // "accept" | "decline"
  guests: "1",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER = ["name", "email", "attendance"];
const FIELD_IDS = {
  name: "rsvp-name",
  email: "rsvp-email",
  attendance: "rsvp-attendance-accept",
};

function validate({ name, email, attendance }) {
  const errors = {};
  if (!name.trim()) errors.name = "Please enter your full name.";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Please enter a valid email address.";
  if (!attendance) errors.attendance = "Please let us know if you can join us.";
  return errors;
}

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

const reveal = (variants, delay = 0) => ({
  variants,
  custom: delay,
  initial: "hidden",
  whileInView: "visible",
  viewport: VIEWPORT,
});

/* ---------- Component ---------- */
function RSVP() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null); // set after a successful submit

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      attendance: form.attendance,
      guests: form.attendance === "accept" ? Number(form.guests) : 0,
      message: form.message.trim(),
    };

    // TODO: frontend only for now. Send `payload` to a backend / form service later.
    console.log("RSVP (not saved anywhere yet):", payload);

    setResult(payload);
  };

  const firstName = result ? result.name.split(/\s+/)[0] : "";

  return (
    <section className="rsvp" id="rsvp">
      <div className="rsvp__inner">
        {/* ---------- Header ---------- */}
        <header className="rsvp__header">
          {/* <motion.p className="rsvp__label" {...reveal(fadeIn, 0)}>
            RSVP
          </motion.p> */}

          <motion.h2 className="rsvp__heading" {...reveal(fadeUp, 0.2)}>
            Will you <em>celebrate with us?</em>
          </motion.h2>

          <motion.p className="rsvp__intro" {...reveal(fadeUp, 0.4)}>
            Please let us know if you&rsquo;ll be joining us.
          </motion.p>
        </header>

        {/* ---------- Form / success ---------- */}
        <motion.div className="rsvp__panel" {...reveal(fadeUp, 0.5)}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="done"
                className="rsvp__done"
                role="status"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
              >
                <span className="rsvp__rule" />
                <h3 className="rsvp__done-title">Thank you, {firstName}.</h3>
                <p className="rsvp__done-text">{THANK_YOU_TEXT[result.attendance]}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="rsvp__form"
                noValidate
                onSubmit={handleSubmit}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Full name */}
                <div className="rsvp__field">
                  <label className="rsvp__label-field" htmlFor="rsvp-name">
                    Full Name
                  </label>
                  <input
                    className="rsvp__input"
                    id="rsvp-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "rsvp-name-error" : undefined}
                  />
                  {errors.name && (
                    <p className="rsvp__error" id="rsvp-name-error" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                {/* <div className="rsvp__field">
                  <label className="rsvp__label-field" htmlFor="rsvp-email">
                    Email
                  </label>
                  <input
                    className="rsvp__input"
                    id="rsvp-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    aria-required="true"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "rsvp-email-error" : undefined}
                  />
                  {errors.email && (
                    <p className="rsvp__error" id="rsvp-email-error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div> */}

                {/* Attendance */}
                <fieldset className="rsvp__fieldset">
                  <legend className="rsvp__label-field">Attendance</legend>

                  <div className="rsvp__options">
                    <label className="rsvp__option">
                      <input
                        type="radio"
                        id="rsvp-attendance-accept"
                        name="attendance"
                        value="accept"
                        checked={form.attendance === "accept"}
                        onChange={handleChange}
                      />
                      <span>Joyfully accepts</span>
                    </label>

                    <label className="rsvp__option">
                      <input
                        type="radio"
                        id="rsvp-attendance-decline"
                        name="attendance"
                        value="decline"
                        checked={form.attendance === "decline"}
                        onChange={handleChange}
                      />
                      <span>Regretfully declines</span>
                    </label>
                  </div>

                  {errors.attendance && (
                    <p className="rsvp__error" role="alert">
                      {errors.attendance}
                    </p>
                  )}
                </fieldset>

                {/* Number of guests (only when accepting) */}
                {form.attendance === "accept" && (
                  <motion.div
                    className="rsvp__field"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                  >
                    <label className="rsvp__label-field" htmlFor="rsvp-guests">
                      Number of guests 
                      {/* <span className="rsvp__optional">(optional)</span> */}
                    </label>
                    <select
                      className="rsvp__select"
                      id="rsvp-guests"
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                    >
                      {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {/* Message */}
                <div className="rsvp__field">
                  <label className="rsvp__label-field" htmlFor="rsvp-message">
                    Message 
                    {/* <span className="rsvp__optional">(optional)</span> */}
                  </label>
                  <textarea
                    className="rsvp__textarea"
                    id="rsvp-message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="rsvp__submit">
                  SEND 
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="rsvp__attribution">
          3D model: <a href="https://sketchfab.com/3d-models/free-ring-f08e7362b9cc4cacaa5e99a323f8de05" target="_blank" rel="noopener noreferrer">Free Ring</a> by <a href="https://sketchfab.com/busanello" target="_blank" rel="noopener noreferrer">Busanello</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
        </p>
      </div>
    </section>
  );
}

export default RSVP;
