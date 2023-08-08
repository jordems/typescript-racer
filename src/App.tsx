import { onCleanup, onMount } from "solid-js";
import "./App.css";
import { SCRIPTS } from "./Scripts";
import { TextCarousel } from "./components/TextCarousel";
import { setupWordTrackerStore } from "./store/WordTracker";

function App() {
  const { code, onKeyPress } = setupWordTrackerStore({
    script: SCRIPTS[Math.round(Math.random() * SCRIPTS.length - 1)],
  });

  onMount(() => {
    document.addEventListener("keypress", onKeyPress);
  });

  onCleanup(() => {
    document.removeEventListener("keypress", onKeyPress);
  });

  return (
    <>
      <h1>Typescript Racer</h1>
      <TextCarousel code={code()} />
    </>
  );
}

export default App;
