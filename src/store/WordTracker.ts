import hljs from "highlight.js";
import { Accessor, createSignal } from "solid-js";
import { TextCarouselStatus } from "../components/TextCarousel";

interface WordTrackerInput {
  script: string;
}

interface WordTrackerStore {
  code: Accessor<string>;
  onKeyPress: (event: KeyboardEvent) => void;
}

export function setupWordTrackerStore(
  input: WordTrackerInput
): WordTrackerStore {
  const [startAt, setStartAt] = createSignal<Date | null>(null);
  const [endAt, setEndAt] = createSignal<Date | null>(null);
  const [before, setBefore] = createSignal("");
  const [after, setAfter] = createSignal(input.script);
  const [code, setCode] = createSignal(
    generateTsSyntax(input.script, "", {}, "untouched")
  );
  const [occurrenceMap, setOccurrenceMap] = createSignal<
    Record<string, number>
  >({});
  const [errorMap, setErrorMap] = createSignal<Record<string, number>>({});

  const onKeyPress = (e: KeyboardEvent) => {
    const current = after();
    const start = startAt();
    const character = current[0];

    if (endAt()) {
      return;
    }

    if (!start) {
      setStartAt(new Date());
    }

    if (e.key !== character && !(e.key === "Enter" && character === "\n")) {
      setCode(
        generateTsSyntax(current, before(), occurrenceMap(), "messed-up")
      );
      setErrorMap((map) => ({
        ...map,
        [character]: (map[character] ?? 0) + 1,
      }));
      return;
    }

    const beforeValue = before();
    setAfter(current.slice(1));
    setBefore(`${beforeValue}${character}`);
    setOccurrenceMap((map) => ({
      ...map,
      [character]: (map[character] ?? 0) + 1,
    }));
    setCode(
      generateTsSyntax(
        current.slice(1),
        `${beforeValue}${character}`,
        occurrenceMap(),
        "free-flow"
      )
    );

    if (current.length === 1) {
      const endAt = new Date();
      setEndAt(endAt);

      if (start) {
        setCode(
          hljs.highlight(formatResult(input.script, start, endAt, errorMap()), {
            language: "ts",
          }).value
        );
      }
    }
  };

  return {
    code,
    onKeyPress,
  };
}

function decodeHtmlElement(html: string) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function encodeHtmlElement(html: string) {
  var el = document.createElement("div");
  el.innerText = el.textContent = html;
  html = el.innerHTML;

  if (html === "<br>") {
    return "↵<br>";
  }

  return html;
}

function replaceNthOccurrence(
  text: string,
  char: string,
  n: number,
  replacement: string
): string {
  let result = "";
  let count = 0;

  for (let i = 0; i < text.length; i++) {
    let character = text[i];
    let isSymbol = false;

    if (character === "<") {
      result += character;

      do {
        character = text[++i];
        result += character;
      } while (character !== ">");
      continue;
    }

    if (character === "&") {
      let sym = "";
      for (let y = i; y <= i + 5; ++y) {
        let secondary = text[y];
        sym += secondary;

        if (secondary === ";") {
          character = decodeHtmlElement(sym);
          i = y;
          isSymbol = true;
          break;
        }
      }
    }

    if (character !== char) {
      result += isSymbol ? encodeHtmlElement(character) : character;
      continue;
    }

    count++;

    if (count === n) {
      result += replacement;
      continue;
    }

    result += isSymbol ? encodeHtmlElement(character) : character;
  }

  return result;
}

function generateTsSyntax(
  after: string,
  before: string,
  occurrenceMap: Record<string, number>,
  status: TextCarouselStatus
): string {
  const current = after[0];

  const result = hljs.highlight(before + after, {
    language: "ts",
  });

  return replaceNthOccurrence(
    result.value,
    current,
    (occurrenceMap[current] ?? 0) + 1,
    `<span class="${status}">${encodeHtmlElement(current)}</span>`
  );
}

function formatResult(
  text: string,
  startAt: Date,
  endAt: Date,
  errorMap: Record<string, number>
): string {
  return `/**
  * Words per minute: ${calculateWordsPerMinute(text, startAt, endAt)}
  * 
  * Accuracy: ${calculateAccuracyPercentage(text, errorMap)}%
  * 
  * Error count per character: 
  * ${Object.entries(errorMap)
    .map(
      ([character, count]) =>
        `\`${character === "\n" ? "↵" : character}\`: ${count}`
    )
    .join("\n  * ")}
  * 
  * Refresh the page to race again!
  */`;
}

function calculateWordsPerMinute(
  text: string,
  startAt: Date,
  endAt: Date
): number {
  const count = text.split(" ").length;

  const differenceInMilliseconds = endAt.getTime() - startAt.getTime();

  return Math.round(count / (differenceInMilliseconds / 1000 / 60) / 10) * 10;
}

function calculateAccuracyPercentage(
  text: string,
  errorMap: Record<string, number>
): number {
  const errorCount = Object.values(errorMap).reduce(
    (prev, cur) => prev + cur,
    0
  );

  return Math.round(((text.length - errorCount) / text.length) * 10000) / 100;
}
