export const SCRIPTS = [
  `function getRandomItemFromResult<T>(result: { items: T[] }): T {
  const index = Math.round(Math.random() * (result.items.length - 1));

  return result.items[index];
}`,
  `export type TextCarouselStatus = "untouched" | "free-flow" | "messed-up";

interface TextCarouselProps {
  code: string;
}

export const TextCarousel: Component<TextCarouselProps> = (props) => {
  return (
    <div id="text-carousel">
      <code innerHTML={props.code} />
    </div>
  );
};`,
  `function App() {
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
}`,
  `function calculateWordsPerMinute(
  text: string,
  startAt: Date,
  endAt: Date
): number {
  const count = text.split(" ").length;

  const differenceInMilliseconds = endAt.getTime() - startAt.getTime();

  return Math.round(count / (differenceInMilliseconds / 1000 / 60) * 10) / 10;
}`,
];
