import { useState } from "react";
import VSCode from "./pages/home";
import Play from "./pages/play";

export type GameVersion =
  | "1.5.2"
  | "1.8.8"
  | "1.12.2"
  | "1.12.2_u3"
  | null;

export default function App() {
  const [gameVersion, setGameVersion] = useState<GameVersion>(null);

  return (
    <>
      {/* Always mounted so all editor state (files, tabs, terminal) is preserved.
          Hidden via CSS while the game is active — NOT unmounted. */}
      <div style={{ display: gameVersion ? "none" : "block", width: "100%", height: "100%" }}>
        <VSCode onLaunchGame={(v) => setGameVersion(v)} />
      </div>

      {/* Game fullscreen overlay — only rendered when a version is chosen */}
      {gameVersion && (
        <Play version={gameVersion} onBack={() => setGameVersion(null)} />
      )}
    </>
  );
}
