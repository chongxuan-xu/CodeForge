import type { GameVersion } from "../App";

const VERSION_CLIENTS: Record<string, { label: string; client: string }> = {
  "1.5.2": { label: "1.5.2", client: "client_1.5.2.html" },
  "1.8.8": { label: "1.8.8", client: "client.html" },
  "1.12.2": { label: "1.12.2", client: "client_1.12.2.html" },
  "1.12.2_u3": { label: "1.12.2 U3", client: "client_1.12.2_u3.html" },
};

interface PlayProps {
  version: GameVersion;
  onBack: () => void;
}

export default function Play({ version, onBack }: PlayProps) {
  const v = version
    ? (VERSION_CLIENTS[version] ?? VERSION_CLIENTS["1.8.8"])
    : VERSION_CLIENTS["1.8.8"];
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .play-bar { font-family: 'Press Start 2P', 'Courier New', monospace; }
        .return-btn:hover { color: #ffffff !important; }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "black",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
      >
        <div
          className="play-bar"
          style={{
            height: "48px",
            background: "#1a1a1a",
            borderBottom: "1px solid #2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            flexShrink: 0,
          }}
        >
          <button
            className="return-btn"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "none",
              border: "none",
              color: "#888888",
              fontSize: "10px",
              fontFamily: "inherit",
              cursor: "pointer",
              letterSpacing: "1px",
              padding: 0,
              transition: "color 0.15s",
            }}
          >
            ← BACK TO EDITOR
          </button>
          <span
            style={{ color: "#888888", fontSize: "10px", letterSpacing: "1px" }}
          >
            EAGLERCRAFT {v.label}
          </span>
        </div>
        <div style={{ flex: 1, width: "100%", background: "black" }}>
          <iframe
            src={`${base}${v.client}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            title={`Eaglercraft ${v.label}`}
            allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          />
        </div>
      </div>
    </>
  );
}
