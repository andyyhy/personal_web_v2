"use client";

import { useEffect, useRef } from "react";
import { startIntro, type Point } from "./introScene";

export default function Intro({
  onReveal,
  onDone,
}: {
  onReveal: (at: Point) => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return startIntro(canvas, { onReveal, onDone });
  }, [onReveal, onDone]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
    />
  );
}
