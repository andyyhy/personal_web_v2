"use client";

import { useEffect, useRef } from "react";
import type { Point } from "./introScene";
import { FONT_FAMILY } from "./message";

// Soft, bright colours that all read well on the dark background.
// The first is the site's original green.
const COLORS = [
  "#8BC34A",
  "#4FC3F7",
  "#FF8A80",
  "#FFD54F",
  "#B39DDB",
  "#F48FB1",
  "#80DEEA",
];

// The text first appears in soft white, like the stardust it emerges from,
// and takes on a colour at its first bounce.
const START_COLOR = "#EDEDED";

// Speed scales with the screen so the drift feels the same on a phone and a
// large monitor: a fraction of the shorter side per second, within limits.
const SPEED_FRACTION = 0.16;
const MIN_SPEED = 60;
const MAX_SPEED = 240;

// Seconds to ease up to full speed after appearing.
const RAMP_UP = 2.6;

// Font size follows the viewport so the text always has room to move:
// - phones: about half the screen width (5.5vw)
// - short landscape screens: limited by height (8vh)
// - large monitors: keeps growing, but more slowly (1.5rem + 2.5vw),
//   about a third of the width on a 4K screen
const FONT_SIZE = "clamp(1rem, min(5.5vw, 8vh, 1.5rem + 2.5vw), 10rem)";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function nextColor(current: string) {
  const choices = COLORS.filter((c) => c !== current);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function BouncingText({
  text,
  waiting = false,
  origin = null,
}: {
  text: string;
  /** Hidden and still until the intro hands over. */
  waiting?: boolean;
  /** Where to appear (CSS px from the viewport's top-left); defaults to the centre. */
  origin?: Point | null;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (waiting) return;
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let color = START_COLOR;

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

    // Start centred on `origin` (where the intro's stardust burst), kept on
    // screen; otherwise in the middle, where the server rendered it.
    measure();
    let x = maxX / 2;
    let y = maxY / 2;
    const fromOrigin = !!origin && !reduceMotion;
    if (origin && fromOrigin) {
      const rect = box.getBoundingClientRect();
      // Leave a little room so it doesn't bounce the moment it appears.
      const padX = Math.min(maxX / 2, box.clientWidth * 0.06);
      const padY = Math.min(maxY / 2, box.clientHeight * 0.06);
      x = clamp(origin.x - rect.left - el.offsetWidth / 2, padX, maxX - padX);
      y = clamp(origin.y - rect.top - el.offsetHeight / 2, padY, maxY - padY);
    }
    el.style.left = "0";
    el.style.top = "0";
    place(x, y);

    // A diagonal: toward the open side when it emerges from the intro,
    // otherwise random. Direction only (+1 / -1); `speed` sets the pace.
    let dx = fromOrigin ? (x < maxX / 2 ? 1 : -1) : Math.random() < 0.5 ? -1 : 1;
    let dy = fromOrigin ? (y < maxY / 2 ? 1 : -1) : Math.random() < 0.5 ? -1 : 1;

    // Watches both the container and the text, so it also catches phone
    // rotation, mobile browser bars showing/hiding, the font loading, and
    // the font size changing with the viewport.
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

    // Users who ask for less motion get the text still and centred.
    if (reduceMotion) return () => observer.disconnect();

    let frame = 0;
    const start = performance.now();
    let last = start;

    const tick = (now: number) => {
      // Cap the step so a dropped frame or a return to a background tab
      // doesn't make the text jump.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      // Drift away gently from where it appeared, easing up to full speed.
      const r = clamp((now - start) / 1000 / RAMP_UP, 0, 1);
      const pace = speed * r * r * (3 - 2 * r);
      x += dx * pace * dt;
      y += dy * pace * dt;

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
  }, [waiting, origin]);

  return (
    <h1
      ref={ref}
      data-waiting={waiting ? "" : undefined}
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        color: START_COLOR,
        fontSize: FONT_SIZE,
        fontFamily: `"${FONT_FAMILY}", system-ui, sans-serif`,
      }}
      className="bouncing-text absolute m-0 whitespace-nowrap font-normal leading-tight tracking-wide will-change-transform select-none"
    >
      <span className="bouncing-text-inner">{text}</span>
    </h1>
  );
}
