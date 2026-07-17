import { useState } from "react";
import VSCode from "./pages/home";
import Play from "./pages/play";

export type GameVersion = "1.5.2" | "1.8.8" | "1.12.2" | null;

export default function App() {
  const [gameVersion, setGameVersion] = useState<GameVersion>(null);

  return (
    <>
      <VSCode onLaunchGame={(v) => setGameVersion(v)} />
      {gameVersion && <Play version={gameVersion} onBack={() => setGameVersion(null)} />}
    </>
  );
}
