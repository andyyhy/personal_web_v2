"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#8BC34A",
  "#FF5252",
  "#40C4FF",
  "#FFD740",
  "#E040FB",
  "#FF6E40",
  "#64FFDA",
  "#FFFFFF",
];

// Speed scales with the screen so the drift feels the same on a phone and a
// large monitor: a fraction of the shorter side per second, within limits.
const SPEED_FRACTION = 0.18;
const MIN_SPEED = 70;
const MAX_SPEED = 220;

function nextColor(current: string) {
  const choices = COLORS.filter((c) => c !== current);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function BouncingText({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let color = COLORS[0];
    el.style.color = color;

    let maxX = 0;
    let maxY = 0;
    let speed = MIN_SPEED;
    const measure = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      maxX = Math.max(0, w - el.offsetWidth);
      maxY = Math.max(0, h - el.offsetHeight);
      speed = Math.min(
        MAX_SPEED,
        Math.max(MIN_SPEED, Math.min(w, h) * SPEED_FRACTION)
      );
    };

    const place = (px: number, py: number) => {
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };

    measure();
    let x = reduceMotion ? maxX / 2 : Math.random() * maxX;
    let y = reduceMotion ? maxY / 2 : Math.random() * maxY;
    // Direction only (+1 / -1); magnitude comes from `speed`.
    let dx = Math.random() < 0.5 ? -1 : 1;
    let dy = Math.random() < 0.5 ? -1 : 1;
    place(x, y);
    el.style.visibility = "visible";

    // Watches both the container and the text, so it also catches mobile
    // browser bars showing/hiding and the font size changing with the viewport.
    const observer = new ResizeObserver(() => {
      measure();
      if (reduceMotion) {
        x = maxX / 2;
        y = maxY / 2;
      } else {
        x = Math.min(x, maxX);
        y = Math.min(y, maxY);
      }
      place(x, y);
    });
    observer.observe(box);
    observer.observe(el);

    // Users who ask for less motion get the text still and centered.
    if (reduceMotion) return () => observer.disconnect();

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Cap the step so a dropped frame or a return to a background tab
      // doesn't make the text jump.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      x += dx * speed * dt;
      y += dy * speed * dt;

      let hit = false;
      if (x <= 0) {
        x = 0;
        dx = 1;
        hit = true;
      } else if (x >= maxX) {
        x = maxX;
        dx = -1;
        hit = true;
      }
      if (y <= 0) {
        y = 0;
        dy = 1;
        hit = true;
      } else if (y >= maxY) {
        y = maxY;
        dy = -1;
        hit = true;
      }

      if (hit) {
        color = nextColor(color);
        el.style.color = color;
      }

      place(x, y);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <h1
      ref={ref}
      // Font size follows the viewport so the text always leaves room to
      // move: about half the width on phones, capped on large screens and
      // limited by height on short landscape screens.
      style={{
        visibility: "hidden",
        fontSize: "clamp(1rem, min(5.5vw, 9vh), 3.5rem)",
      }}
      className="absolute left-0 top-0 m-0 whitespace-nowrap font-bold leading-tight tracking-wide will-change-transform select-none"
    >
      {text}
    </h1>
  );
}
