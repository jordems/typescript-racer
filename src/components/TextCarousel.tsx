import { Component } from "solid-js";
import "./TextCarousel.css";

export type TextCarouselStatus = "untouched" | "free-flow" | "messed-up";

interface TextCarouselProps {
  code: string;
}

export const TextCarousel: Component<TextCarouselProps> = (props) => {
  return (
    <div id="text-carousel">
      <code innerHTML={props.code} />
    </div>
  );
};
