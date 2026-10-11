import { useState } from "react";
import Envelope from "./components/Envelope";
import StarBackground from "./components/StarBackground"; // NEW
import Hero from "./components/Hero";
import Story from "./components/Story";
import EventDetails from "./components/EventDetails";
import Gallery from "./components/Gallery";
import RSVP from "./components/RSVP";

function App() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [envelopeDone, setEnvelopeDone] = useState(false);

  return (
    <>
      {heroVisible && ( // CHANGED: wrapped in a fragment
        <>
          <StarBackground /> {/* NEW */}
          <main>
            <Hero />
            <Story />
            <EventDetails />
            <Gallery />
            <RSVP />
          </main>
        </>
      )}

      {!envelopeDone && (
        <Envelope
          onOpen={() => setHeroVisible(true)}
          onComplete={() => setEnvelopeDone(true)}
        />
      )}
    </>
  );
}

export default App;