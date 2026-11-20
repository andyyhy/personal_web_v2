import BouncingText from "./BouncingText";
import { MESSAGE } from "./message";

export default function Home() {
  return (
    <main className="stage relative h-dvh w-full overflow-hidden">
      <BouncingText text={MESSAGE} />
    </main>
  );
}
