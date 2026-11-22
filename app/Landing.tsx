"use client";

import { useCallback, useState } from "react";
import BouncingText from "./BouncingText";
import Intro from "./Intro";
import type { Point } from "./introScene";

/** Plays the opening animation, then hands over to the bouncing text. */
export default function Landing({ text }: { text: string }) {
  const [introRunning, setIntroRunning] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [origin, setOrigin] = useState<Point | null>(null);

  const handleReveal = useCallback((at: Point) => {
    setOrigin(at);
    setRevealed(true);
  }, []);
  const handleDone = useCallback(() => setIntroRunning(false), []);

  return (
    <>
      <BouncingText text={text} waiting={!revealed} origin={origin} />
      {introRunning && <Intro onReveal={handleReveal} onDone={handleDone} />}
    </>
  );
}
