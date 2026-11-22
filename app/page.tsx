import Landing from "./Landing";
import { MESSAGE } from "./message";

export default function Home() {
  return (
    <main className="stage relative h-dvh w-full overflow-hidden">
      <Landing text={MESSAGE} />
    </main>
  );
}
