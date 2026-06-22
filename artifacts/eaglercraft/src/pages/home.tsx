import { useState, useRef, useEffect } from "react";
import type { GameVersion } from "../App";

interface Props {
  onLaunchGame: (v: GameVersion) => void;
}

const FILE_TREE = [
  { name: "my-project", isFolder: true, depth: 0 },
  { name: "src", isFolder: true, depth: 1 },
  { name: "index.ts", depth: 2, lang: "typescript", icon: "ts" },
  { name: "App.tsx", depth: 2, lang: "typescriptreact", icon: "tsx" },
  { name: "styles.css", depth: 2, lang: "css", icon: "css" },
  { name: "utils.py", depth: 2, lang: "python", icon: "py" },
  { name: "server.go", depth: 2, lang: "go", icon: "go" },
  { name: "public", isFolder: true, depth: 1 },
  { name: "index.html", depth: 2, lang: "html", icon: "html" },
  { name: "package.json", depth: 1, lang: "json", icon: "json" },
  { name: "README.md", depth: 1, lang: "markdown", icon: "md" },
  { name: ".gitignore", depth: 1, lang: "plaintext", icon: "git" },
];

const LANGUAGES = [
  "ABAP","ActionScript","Ada","Apex","APL","AppleScript","Arduino","Assembly",
  "Astro","AutoHotkey","Awk","Bash","Batch","C","C#","C++","Carbon","Clojure",
  "CoffeeScript","Crystal","CSS","D","Dart","Delphi","Dockerfile","Elixir","Elm",
  "Erlang","F#","Fish","Fortran","Go","Groovy","Hack","Haskell","HTML","Java",
  "JavaScript","Julia","Kotlin","LaTeX","Lisp","Lua","MATLAB","Nim","Nix",
  "Objective-C","OCaml","Pascal","Perl","PHP","PowerShell","Prolog","Python",
  "R","Ruby","Rust","Scala","Shell","Solidity","SQL","Svelte","Swift","Tcl",
  "TypeScript","V","Vala","Verilog","VHDL","Vue","Zig",
];

const STARTER_CODE: Record<string, string> = {
  "index.ts": `// TypeScript entry point
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

const main = async () => {
  const user = await fetchUser(1);
  console.log(\`Hello, \${user.name}!\`);
};

main();
`,
  "App.tsx": `import React, { useState } from 'react';

interface AppProps {
  title: string;
}

const App: React.FC<AppProps> = ({ title }) => {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>{title}</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
};

export default App;
`,
  "styles.css": `/* Global Styles */
:root {
  --primary: #007acc;
  --bg: #1e1e1e;
  --text: #d4d4d4;
}

body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
`,
  "utils.py": `"""Utility functions module."""
from typing import Optional
import json
import os


def read_json(path: str) -> Optional[dict]:
    """Read a JSON file and return its contents."""
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def write_json(path: str, data: dict) -> bool:
    """Write data to a JSON file."""
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        return True
    except Exception:
        return False


if __name__ == "__main__":
    print("Utils module loaded successfully.")
`,
  "server.go": `package main

import (
  "encoding/json"
  "fmt"
  "log"
  "net/http"
)

type Response struct {
  Message string \`json:"message"\`
  Status  int    \`json:"status"\`
}

func handler(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  resp := Response{
    Message: "Hello from Go!",
    Status:  200,
  }
  json.NewEncoder(w).Encode(resp)
}

func main() {
  http.HandleFunc("/", handler)
  fmt.Println("Server running on :8080")
  log.Fatal(http.ListenAndServe(":8080", nil))
}
`,
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.ts"></script>
</body>
</html>
`,
  "package.json": `{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
`,
  "README.md": `# My Project

A modern web application built with React and TypeScript.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run preview\` | Preview production build |
| \`npm run test\` | Run tests |

## License

MIT
`,
  ".gitignore": `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/

# Environment
.env
.env.local
.env.*.local

# Editor
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`,
};

const FILE_COLORS: Record<string, string> = {
  ts: "#3178c6", tsx: "#61dafb", css: "#264de4", py: "#3572A5",
  go: "#00add8", html: "#e34c26", json: "#cbcb41", md: "#519aba",
  git: "#f14e32",
};

const getFileColor = (icon: string) => FILE_COLORS[icon] ?? "#c5c8c6";

let cwdState = "~/my-project";

function runCommand(input: string): string {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case "": return "";
    case "clear": return "\x1bc";
    case "help": return [
      "Available commands:",
      "  ls           List directory contents",
      "  pwd          Print working directory",
      "  cd <dir>     Change directory",
      "  echo <text>  Print text",
      "  cat <file>   Show file contents",
      "  mkdir <dir>  Create directory",
      "  touch <file> Create empty file",
      "  date         Show current date/time",
      "  whoami       Show current user",
      "  node <file>  Run a JS/TS file",
      "  python <f>   Run a Python file",
      "  go run <f>   Run a Go file",
      "  npm <cmd>    Run npm commands",
      "  git <cmd>    Git commands",
      "  clear        Clear terminal",
    ].join("\n");
    case "ls":
      return "src/  public/  package.json  README.md  .gitignore";
    case "pwd": return cwdState;
    case "cd":
      if (!args[0] || args[0] === "~") { cwdState = "~"; return ""; }
      if (args[0] === "..") { const p = cwdState.split("/"); p.pop(); cwdState = p.join("/") || "~"; return ""; }
      cwdState = `${cwdState}/${args[0]}`; return "";
    case "echo": return args.join(" ");
    case "cat":
      if (!args[0]) return "cat: missing file operand";
      return STARTER_CODE[args[0]] ?? `cat: ${args[0]}: No such file or directory`;
    case "mkdir": return args[0] ? "" : "mkdir: missing operand";
    case "touch": return args[0] ? "" : "touch: missing file operand";
    case "date": return new Date().toString();
    case "whoami": return "user";
    case "node": case "ts-node":
      if (!args[0]) return `${cmd}: missing script`;
      return `[Running ${args[0]}...]\nHello from Node.js!\nProcess exited with code 0`;
    case "python": case "python3":
      if (!args[0]) return `${cmd}: missing script`;
      return `[Running ${args[0]}...]\nUtils module loaded successfully.\nProcess exited with code 0`;
    case "go":
      if (args[0] === "run" && args[1]) return `[Running ${args[1]}...]\nServer running on :8080`;
      if (args[0] === "build") return `[Building...]\nBuild complete.`;
      return "go: unknown subcommand";
    case "npm": case "pnpm": case "yarn":
      if (args[0] === "install" || args[0] === "i")
        return `\nadded 248 packages in 3.2s\n3 packages are looking for funding`;
      if (args[0] === "run")
        return `\n> ${args[1]}\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: http://0.0.0.0:5173/`;
      if (args[0] === "test")
        return `\n✓ 12 tests passed (2.1s)`;
      return `${cmd}: unknown command '${args[0] ?? ""}'`;
    case "git":
      if (args[0] === "status") return "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
      if (args[0] === "log") return `commit a1b2c3d (HEAD -> main)\nAuthor: User <user@example.com>\nDate:   ${new Date().toDateString()}\n\n    Initial commit`;
      if (args[0] === "init") return `Initialized empty Git repository in ${cwdState}/.git/`;
      if (args[0] === "add") return "";
      if (args[0] === "commit") return `[main a1b2c3d] ${args.slice(2).join(" ")}\n 8 files changed, 142 insertions(+)`;
      if (args[0] === "push") return `Enumerating objects: 10, done.\nTo github.com:user/repo.git\n   a1b2c3d..f4e5d6c  main -> main`;
      return `git: '${args[0]}' is not a git command`;
    default:
      return `${cmd}: command not found\nType 'help' for available commands`;
  }
}

export default function VSCode({ onLaunchGame }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [activeActivity, setActiveActivity] = useState<"explorer" | "search" | "git" | "debug" | "extensions">("explorer");
  const [activeTab, setActiveTab] = useState("Welcome");
  const [openTabs, setOpenTabs] = useState<string[]>(["Welcome"]);
  const [fileContents, setFileContents] = useState<Record<string, string>>(STARTER_CODE);
  const [selectedLanguage, setSelectedLanguage] = useState("TypeScript");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langFilter, setLangFilter] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "my-project": true, src: true, public: false });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [termLines, setTermLines] = useState<string[]>([
    "\x1b[1;32mWelcome to the integrated terminal\x1b[0m",
    "Type \x1b[33mhelp\x1b[0m to see available commands.",
    "",
  ]);
  const [termInput, setTermInput] = useState("");
  const [termHistory, setTermHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { termEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [termLines]);
  useEffect(() => { if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50); }, [searchOpen]);

  const openFile = (name: string, lang: string) => {
    if (!openTabs.includes(name)) setOpenTabs(t => [...t, name]);
    setActiveTab(name);
    const niceLang = lang.replace("typescriptreact", "TypeScript JSX").replace("typescript", "TypeScript").replace("javascript", "JavaScript").replace("plaintext", "Plain Text").replace("markdown", "Markdown");
    setSelectedLanguage(niceLang.charAt(0).toUpperCase() + niceLang.slice(1));
  };

  const closeTab = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = openTabs.indexOf(name);
    const next = openTabs.filter(t => t !== name);
    const remaining = next.length === 0 ? ["Welcome"] : next;
    setOpenTabs(remaining);
    if (activeTab === name) setActiveTab(remaining[Math.max(0, idx - 1)] ?? "Welcome");
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { setSearchOpen(false); setSearchValue(""); }
    if (e.key === "Enter") {
      const val = searchValue.trim().toLowerCase();
      setSearchOpen(false);
      setSearchValue("");
      if (val === "e1.5.2") onLaunchGame("1.5.2");
      else if (val === "e1.8.8") onLaunchGame("1.8.8");
      else if (val === "e1.12.2") onLaunchGame("1.12.2");
    }
  };

  const handleTermKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = termInput.trim();
      const result = runCommand(input);
      if (result === "\x1bc") {
        setTermLines([]);
      } else {
        setTermLines(l => [
          ...l,
          `\x1b[1;34m${cwdState}\x1b[0m \x1b[1;32m$\x1b[0m ${input}`,
          ...(result ? result.split("\n") : []),
        ]);
      }
      if (input) setTermHistory(h => [input, ...h].slice(0, 100));
      setHistoryIdx(-1);
      setTermInput("");
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, termHistory.length - 1);
      setHistoryIdx(idx);
      setTermInput(termHistory[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setTermInput(idx === -1 ? "" : termHistory[idx]);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const cmds = ["ls", "pwd", "cd", "echo", "cat", "mkdir", "touch", "date", "whoami", "node", "python", "go", "npm", "git", "clear", "help"];
      const match = cmds.find(c => c.startsWith(termInput));
      if (match) setTermInput(match + " ");
    }
  };

  const renderAnsi = (line: string) => {
    const parts = line.split(/(\x1b\[[0-9;]*m)/);
    let color = "#cccccc"; let bold = false;
    return parts.map((p, i) => {
      if (p.startsWith("\x1b[")) {
        const code = p.slice(2, -1);
        if (code === "0") { color = "#cccccc"; bold = false; }
        else if (code === "1") bold = true;
        else if (code === "1;32" || code === "32") { color = "#4ec9b0"; bold = code.includes("1"); }
        else if (code === "1;34" || code === "34") { color = "#569cd6"; bold = code.includes("1"); }
        else if (code === "1;33" || code === "33") { color = "#dcdcaa"; bold = code.includes("1"); }
        else if (code === "31") color = "#f44747";
        return null;
      }
      return <span key={i} style={{ color, fontWeight: bold ? "bold" : "normal" }}>{p}</span>;
    });
  };

  const filteredLangs = LANGUAGES.filter(l => l.toLowerCase().includes(langFilter.toLowerCase()));

  const openSearch = () => { setSearchOpen(true); setSearchValue(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", background: "#1e1e1e", color: "#cccccc", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: "13px", overflow: "hidden" }}>

      {/* ── Menu Bar ── */}
      <MenuBar
        onOpenSearch={openSearch}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
        onToggleTerminal={() => setTerminalOpen(t => !t)}
        onNewFile={() => {
          const name = `untitled-${Date.now()}.ts`;
          setFileContents(f => ({ ...f, [name]: "" }));
          openFile(name, "typescript");
        }}
      />

      {/* ── Command Palette ── */}
      {searchOpen && (
        <div
          onClick={() => { setSearchOpen(false); setSearchValue(""); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: "500px", background: "#252526", border: "1px solid #454545", borderRadius: "6px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
            <input
              ref={searchInputRef}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search files… or type e1.5.2 / e1.8.8 / e1.12.2 and press Enter"
              style={{ width: "100%", background: "#3c3c3c", border: "none", borderBottom: "1px solid #454545", color: "#cccccc", padding: "10px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {["Welcome", ...Object.keys(STARTER_CODE)]
                .filter(f => f.toLowerCase().includes(searchValue.toLowerCase()))
                .map(f => (
                  <div
                    key={f}
                    onClick={() => {
                      if (f === "Welcome") {
                        if (!openTabs.includes("Welcome")) setOpenTabs(t => [...t, "Welcome"]);
                        setActiveTab("Welcome");
                      } else {
                        const item = FILE_TREE.find(x => x.name === f);
                        openFile(f, item?.lang ?? "plaintext");
                      }
                      setSearchOpen(false);
                    }}
                    style={{ padding: "7px 16px", cursor: "pointer", color: "#cccccc", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "13px" }}>{f}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Activity Bar */}
        <div style={{ width: "48px", background: "#333333", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px", borderRight: "1px solid #252526", flexShrink: 0 }}>
          {([
            { id: "explorer", icon: "📁", title: "Explorer" },
            { id: "search", icon: "🔍", title: "Search" },
            { id: "git", icon: "⎇", title: "Source Control" },
            { id: "debug", icon: "▷", title: "Run and Debug" },
            { id: "extensions", icon: "⊞", title: "Extensions" },
          ] as const).map(item => (
            <div
              key={item.id}
              title={item.title}
              onClick={() => { setActiveActivity(item.id); setSidebarOpen(true); }}
              style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", color: activeActivity === item.id ? "#cccccc" : "#858585", borderLeft: activeActivity === item.id ? "2px solid #007acc" : "2px solid transparent" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#cccccc")}
              onMouseLeave={e => { if (activeActivity !== item.id) e.currentTarget.style.color = "#858585"; }}
            >
              {item.icon}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div title="Accounts" style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", color: "#858585" }} onMouseEnter={e => (e.currentTarget.style.color = "#cccccc")} onMouseLeave={e => (e.currentTarget.style.color = "#858585")}>👤</div>
          <div title="Settings" style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", color: "#858585" }} onMouseEnter={e => (e.currentTarget.style.color = "#cccccc")} onMouseLeave={e => (e.currentTarget.style.color = "#858585")}>⚙️</div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width: "240px", background: "#252526", borderRight: "1px solid #1e1e1e", overflow: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            {activeActivity === "explorer" && (
              <>
                <div style={{ padding: "10px 12px 6px", fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                  EXPLORER
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["⊕", "⊕", "⟳", "⊟"].map((ic, i) => (
                      <span key={i} style={{ cursor: "pointer", fontSize: "14px", color: "#858585" }} onMouseEnter={e => (e.currentTarget.style.color = "#cccccc")} onMouseLeave={e => (e.currentTarget.style.color = "#858585")}>{ic}</span>
                    ))}
                  </div>
                </div>
                <div style={{ overflow: "auto", flex: 1 }}>
                  {FILE_TREE.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (item.isFolder) setExpanded(e => ({ ...e, [item.name]: !e[item.name] }));
                        else openFile(item.name, item.lang ?? "plaintext");
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 0", paddingLeft: `${(item.depth ?? 0) * 12 + 8}px`, cursor: "pointer", color: "#cccccc", fontSize: "13px" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#2a2d2e")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {item.isFolder
                        ? <><span style={{ fontSize: "10px", width: "12px" }}>{expanded[item.name] ? "▾" : "▸"}</span><span style={{ fontSize: "14px" }}>{expanded[item.name] ? "📂" : "📁"}</span></>
                        : <><span style={{ width: "12px" }} /><span style={{ fontSize: "10px", fontWeight: "bold", color: getFileColor(item.icon ?? ""), minWidth: "20px" }}>{(item.icon ?? "").toUpperCase()}</span></>}
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {activeActivity === "search" && (
              <div style={{ padding: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 4px 8px" }}>SEARCH</div>
                <input placeholder="Search" autoFocus style={{ width: "100%", background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "13px", outline: "none", borderRadius: "2px", boxSizing: "border-box" }} />
                <div style={{ padding: "8px 4px", color: "#858585", fontSize: "12px" }}>Type to search across files…</div>
              </div>
            )}
            {activeActivity === "git" && (
              <div style={{ padding: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 4px 8px" }}>SOURCE CONTROL</div>
                <div style={{ padding: "4px", color: "#858585", fontSize: "12px" }}>⎇ main</div>
                <div style={{ padding: "4px", color: "#858585", fontSize: "12px" }}>No changes detected</div>
              </div>
            )}
            {activeActivity === "debug" && (
              <div style={{ padding: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 4px 8px" }}>RUN AND DEBUG</div>
                <button style={{ background: "#0e639c", color: "#fff", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: "12px", borderRadius: "2px", width: "100%" }}>▷ Run and Debug</button>
                <div style={{ padding: "8px 4px", color: "#858585", fontSize: "12px" }}>No launch configurations</div>
              </div>
            )}
            {activeActivity === "extensions" && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "10px 12px 6px" }}>EXTENSIONS</div>
                <input placeholder="Search Extensions…" autoFocus style={{ margin: "0 8px 8px", background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "12px", outline: "none", borderRadius: "2px" }} />
                <div style={{ overflow: "auto", flex: 1 }}>
                  {["Prettier - Code Formatter", "ESLint", "GitHub Copilot", "Python", "Go", "Rust Analyzer", "GitLens", "Tailwind CSS IntelliSense", "Auto Rename Tag", "Bracket Pair Colorizer"].map(ext => (
                    <div key={ext} style={{ padding: "8px 12px", borderBottom: "1px solid #1e1e1e", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#2a2d2e")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ color: "#cccccc", fontSize: "13px" }}>{ext}</div>
                      <div style={{ color: "#858585", fontSize: "11px", marginTop: "2px" }}>Microsoft · ★ 4.8M installs</div>
                      <button style={{ marginTop: "4px", background: "#0e639c", color: "#fff", border: "none", padding: "2px 8px", cursor: "pointer", fontSize: "11px", borderRadius: "2px" }}>Install</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Tab Bar */}
          <div style={{ display: "flex", background: "#252526", borderBottom: "1px solid #1e1e1e", overflowX: "auto", flexShrink: 0, height: "35px", alignItems: "stretch" }}>
            {openTabs.map(tab => {
              const ext = tab.split(".").pop() ?? "";
              const colMap: Record<string, string> = { ts: "#3178c6", tsx: "#61dafb", css: "#264de4", py: "#3572A5", go: "#00add8", html: "#e34c26", json: "#cbcb41", md: "#519aba" };
              const lbl: Record<string, string> = { ts: "TS", tsx: "TSX", css: "CSS", py: "PY", go: "GO", html: "HTM", json: "{}", md: "MD" };
              return (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 12px", borderRight: "1px solid #1e1e1e", cursor: "pointer", background: activeTab === tab ? "#1e1e1e" : "#2d2d2d", borderTop: activeTab === tab ? "1px solid #007acc" : "1px solid transparent", color: activeTab === tab ? "#ffffff" : "#969696", whiteSpace: "nowrap", userSelect: "none", minWidth: "100px" }}
                >
                  {tab === "Welcome"
                    ? <span style={{ fontSize: "12px" }}>⭐</span>
                    : tab.startsWith(".git")
                      ? <span style={{ color: "#f14e32", fontSize: "9px", fontWeight: "bold" }}>GIT</span>
                      : <span style={{ fontSize: "9px", fontWeight: "bold", color: colMap[ext] ?? "#858585" }}>{lbl[ext] ?? ext.toUpperCase()}</span>}
                  <span style={{ fontSize: "13px" }}>{tab}</span>
                  <span
                    onClick={e => closeTab(tab, e)}
                    style={{ marginLeft: "2px", padding: "1px 3px", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#404040")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >×</span>
                </div>
              );
            })}
          </div>

          {/* Editor */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
            {activeTab === "Welcome" ? (
              <div style={{ background: "#1e1e1e", height: "100%", overflow: "auto", padding: "40px 60px", display: "flex", gap: "60px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#007acc", fontSize: "11px", letterSpacing: "3px", marginBottom: "4px", textTransform: "uppercase" }}>Visual Studio Code</div>
                  <h1 style={{ color: "#cccccc", fontSize: "32px", fontWeight: 300, margin: "0 0 16px" }}>Editing evolved</h1>
                  <div style={{ borderBottom: "1px solid #454545", marginBottom: "24px" }} />
                  <h3 style={{ color: "#cccccc", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>Start</h3>
                  {[
                    { icon: "📄", label: "New File...", action: () => { const n = `untitled-${Date.now()}.ts`; setFileContents(f => ({...f,[n]:""})); openFile(n,"typescript"); } },
                    { icon: "📂", label: "Open...", action: () => {} },
                    { icon: "🔀", label: "Clone Git Repository...", action: () => {} },
                    { icon: "🔗", label: "Connect to...", action: () => {} },
                    { icon: "✨", label: "Generate New Workspace...", action: () => {} },
                  ].map(item => (
                    <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer", color: "#3794ff" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#5aafff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#3794ff")}>
                      <span>{item.icon}</span><span style={{ fontSize: "13px" }}>{item.label}</span>
                    </div>
                  ))}
                  <h3 style={{ color: "#cccccc", fontSize: "13px", fontWeight: 600, marginTop: "24px", marginBottom: "12px" }}>Recent</h3>
                  {["my-project ~/Projects", "api-server ~/Projects", "portfolio ~/Documents"].map(r => (
                    <div key={r} style={{ marginBottom: "6px", cursor: "pointer", fontSize: "13px" }}
                      onMouseEnter={e => { (e.currentTarget.children[0] as HTMLElement).style.color="#5aafff"; }}
                      onMouseLeave={e => { (e.currentTarget.children[0] as HTMLElement).style.color="#3794ff"; }}>
                      <span style={{ color: "#3794ff" }}>{r.split(" ")[0]}</span>
                      <span style={{ color: "#858585", marginLeft: "8px", fontSize: "12px" }}>{r.split(" ")[1]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ width: "320px" }}>
                  <h3 style={{ color: "#cccccc", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>Walkthroughs</h3>
                  {[
                    { icon: "⭐", label: "Get Started with VS Code", desc: "Customize your editor, learn the basics, and start coding", badge: "" },
                    { icon: "📚", label: "Learn the Fundamentals", desc: "", badge: "" },
                    { icon: "🤖", label: "GitHub Copilot", desc: "", badge: "Updated" },
                    { icon: "🐍", label: "Get Started with Python", desc: "", badge: "Updated" },
                    { icon: "📓", label: "Get Started with Jupyter Notebooks", desc: "", badge: "Updated" },
                  ].map(item => (
                    <div key={item.label} style={{ background: "#2a2d2e", borderRadius: "4px", padding: "10px 14px", marginBottom: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#37373d")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#2a2d2e")}>
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ color: "#cccccc", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                          {item.label}
                          {item.badge && <span style={{ background: "#0078d4", color: "#fff", fontSize: "10px", padding: "1px 5px", borderRadius: "8px" }}>{item.badge}</span>}
                        </div>
                        {item.desc && <div style={{ color: "#858585", fontSize: "11px", marginTop: "2px" }}>{item.desc}</div>}
                      </div>
                    </div>
                  ))}
                  <div style={{ color: "#3794ff", fontSize: "13px", cursor: "pointer", marginTop: "4px" }} onMouseEnter={e=>(e.currentTarget.style.color="#5aafff")} onMouseLeave={e=>(e.currentTarget.style.color="#3794ff")}>More…</div>
                  <div style={{ marginTop: "24px", padding: "10px 14px", background: "#252526", border: "1px solid #454545", borderRadius: "4px", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#2a2d2e")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#252526")}>
                    <div style={{ color: "#cccccc", fontSize: "13px" }}>🚀 Try out the new Agents window</div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", color: "#858585", fontSize: "12px", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked /> Show welcome page on startup
                  </label>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#1e1e1e" }}>
                <div style={{ background: "#1e1e1e", color: "#858585", padding: "8px 0", textAlign: "right", userSelect: "none", fontSize: "13px", lineHeight: "1.5", minWidth: "48px", paddingRight: "16px", paddingLeft: "8px", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", overflowY: "hidden", flexShrink: 0 }}>
                  {(fileContents[activeTab] ?? "").split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea
                  value={fileContents[activeTab] ?? ""}
                  onChange={e => setFileContents(f => ({ ...f, [activeTab]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const ta = e.currentTarget;
                      const s = ta.selectionStart; const end = ta.selectionEnd;
                      const newVal = ta.value.substring(0, s) + "  " + ta.value.substring(end);
                      setFileContents(f => ({ ...f, [activeTab]: newVal }));
                      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
                    }
                  }}
                  style={{ flex: 1, background: "#1e1e1e", color: "#d4d4d4", border: "none", outline: "none", resize: "none", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", fontSize: "14px", lineHeight: "1.5", padding: "8px 0", tabSize: 2, overflowY: "auto" }}
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Terminal */}
          {terminalOpen && (
            <div style={{ height: "220px", background: "#1e1e1e", borderTop: "1px solid #454545", display: "flex", flexDirection: "column", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", background: "#252526", padding: "0 12px", height: "32px", borderBottom: "1px solid #454545", gap: "12px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#cccccc", borderBottom: "1px solid #007acc", paddingBottom: "2px" }}>TERMINAL</span>
                <span style={{ fontSize: "11px", color: "#858585" }}>PROBLEMS</span>
                <span style={{ fontSize: "11px", color: "#858585" }}>OUTPUT</span>
                <span style={{ fontSize: "11px", color: "#858585" }}>DEBUG CONSOLE</span>
                <div style={{ flex: 1 }} />
                <button onClick={() => setTermLines([])} title="Clear terminal" style={{ background: "none", border: "none", color: "#858585", cursor: "pointer", fontSize: "14px", padding: "2px 6px" }} onMouseEnter={e=>(e.currentTarget.style.color="#cccccc")} onMouseLeave={e=>(e.currentTarget.style.color="#858585")}>⊘</button>
                <button onClick={() => setTermLines(l => [...l, ""])} title="New terminal" style={{ background: "none", border: "none", color: "#858585", cursor: "pointer", fontSize: "16px", padding: "2px 6px" }} onMouseEnter={e=>(e.currentTarget.style.color="#cccccc")} onMouseLeave={e=>(e.currentTarget.style.color="#858585")}>⊕</button>
                <button onClick={() => setTerminalOpen(false)} title="Close panel" style={{ background: "none", border: "none", color: "#858585", cursor: "pointer", fontSize: "16px", padding: "2px 6px" }} onMouseEnter={e=>(e.currentTarget.style.color="#cccccc")} onMouseLeave={e=>(e.currentTarget.style.color="#858585")}>×</button>
              </div>
              <div
                onClick={() => termInputRef.current?.focus()}
                style={{ flex: 1, overflow: "auto", padding: "8px 12px", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", fontSize: "13px", lineHeight: "1.6", cursor: "text" }}
              >
                {termLines.map((line, i) => (
                  <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>{renderAnsi(line)}</div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#4ec9b0", fontWeight: "bold", whiteSpace: "nowrap" }}>{cwdState}</span>
                  <span style={{ color: "#4ec9b0" }}>$</span>
                  <input
                    ref={termInputRef}
                    value={termInput}
                    onChange={e => setTermInput(e.target.value)}
                    onKeyDown={handleTermKey}
                    style={{ background: "none", border: "none", outline: "none", color: "#d4d4d4", fontFamily: "inherit", fontSize: "inherit", flex: 1, caretColor: "#aeafad", minWidth: 0 }}
                    autoComplete="off"
                    spellCheck={false}
                    autoCapitalize="off"
                  />
                </div>
                <div ref={termEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{ background: "#007acc", color: "#ffffff", display: "flex", alignItems: "center", height: "22px", flexShrink: 0, fontSize: "12px", userSelect: "none" }}>
        <SBtn icon="⎇" text="main" />
        <SBtn icon="✕" text="0" />
        <SBtn icon="⚠" text="0" />
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }}>
          <SBtn text={selectedLanguage} onClick={() => setShowLangPicker(l => !l)} />
          {showLangPicker && (
            <div style={{ position: "absolute", bottom: "22px", right: 0, background: "#252526", border: "1px solid #454545", borderRadius: "4px", width: "220px", maxHeight: "300px", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
              <input value={langFilter} onChange={e => setLangFilter(e.target.value)} placeholder="Filter languages…" style={{ background: "#3c3c3c", border: "none", borderBottom: "1px solid #454545", color: "#cccccc", padding: "6px 10px", fontSize: "12px", outline: "none" }} autoFocus />
              <div style={{ overflowY: "auto" }}>
                {filteredLangs.map(l => (
                  <div key={l} onClick={() => { setSelectedLanguage(l); setShowLangPicker(false); setLangFilter(""); }}
                    style={{ padding: "5px 12px", cursor: "pointer", color: l === selectedLanguage ? "#ffffff" : "#cccccc", background: l === selectedLanguage ? "#094771" : "transparent", fontSize: "12px" }}
                    onMouseEnter={e => { if (l !== selectedLanguage) e.currentTarget.style.background = "#2a2d2e"; }}
                    onMouseLeave={e => { if (l !== selectedLanguage) e.currentTarget.style.background = "transparent"; }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <SBtn text="UTF-8" />
        <SBtn text="LF" />
        <SBtn text="Spaces: 2" />
        {activeTab !== "Welcome" && <SBtn text="Ln 1, Col 1" />}
        <SBtn icon="🔔" text="" />
      </div>
    </div>
  );
}

function SBtn({ icon, text, onClick }: { icon?: string; text: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 8px", height: "22px", cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {icon && <span>{icon}</span>}
      {text && <span>{text}</span>}
    </div>
  );
}

function MenuBar({ onOpenSearch, onToggleSidebar, onToggleTerminal, onNewFile }: {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onNewFile: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus: Record<string, { label: string; action?: () => void; divider?: boolean }[]> = {
    File: [
      { label: "New File", action: onNewFile },
      { label: "New Window" },
      { divider: true, label: "" },
      { label: "Open File…" },
      { label: "Open Folder…" },
      { label: "Open Workspace from File…" },
      { divider: true, label: "" },
      { label: "Save", action: () => {} },
      { label: "Save As…" },
      { label: "Save All" },
      { divider: true, label: "" },
      { label: "Close Editor" },
      { label: "Close Window" },
    ],
    Edit: [
      { label: "Undo" }, { label: "Redo" }, { divider: true, label: "" },
      { label: "Cut" }, { label: "Copy" }, { label: "Paste" },
      { divider: true, label: "" },
      { label: "Find", action: onOpenSearch },
      { label: "Replace" },
      { divider: true, label: "" },
      { label: "Find in Files" },
    ],
    Selection: [
      { label: "Select All" },
      { label: "Expand Selection" },
      { label: "Shrink Selection" },
      { divider: true, label: "" },
      { label: "Copy Line Up" },
      { label: "Copy Line Down" },
      { label: "Move Line Up" },
      { label: "Move Line Down" },
      { divider: true, label: "" },
      { label: "Add Cursor Above" },
      { label: "Add Cursor Below" },
    ],
    View: [
      { label: "Command Palette…", action: onOpenSearch },
      { label: "Open View…" },
      { divider: true, label: "" },
      { label: "Explorer", action: onToggleSidebar },
      { label: "Search", action: onToggleSidebar },
      { label: "Source Control", action: onToggleSidebar },
      { label: "Run", action: onToggleSidebar },
      { label: "Extensions", action: onToggleSidebar },
      { divider: true, label: "" },
      { label: "Terminal", action: onToggleTerminal },
      { divider: true, label: "" },
      { label: "Toggle Sidebar Visibility", action: onToggleSidebar },
      { label: "Toggle Panel", action: onToggleTerminal },
    ],
    Go: [
      { label: "Back" }, { label: "Forward" }, { divider: true, label: "" },
      { label: "Go to File…", action: onOpenSearch },
      { label: "Go to Symbol in Workspace…" },
      { label: "Go to Symbol in Editor…" },
      { label: "Go to Definition" },
      { label: "Go to Line/Column…" },
    ],
    Run: [
      { label: "Start Debugging" },
      { label: "Run Without Debugging" },
      { label: "Stop Debugging" },
      { divider: true, label: "" },
      { label: "Add Configuration…" },
      { label: "Toggle Breakpoint" },
      { label: "New Breakpoint" },
    ],
    Terminal: [
      { label: "New Terminal", action: onToggleTerminal },
      { label: "Split Terminal" },
      { divider: true, label: "" },
      { label: "Run Active File" },
      { label: "Run Selected Text" },
      { divider: true, label: "" },
      { label: "Configure Terminal Settings…" },
    ],
    Help: [
      { label: "Welcome" },
      { label: "Show All Commands", action: onOpenSearch },
      { label: "Documentation" },
      { label: "Editor Playground" },
      { divider: true, label: "" },
      { label: "Keyboard Shortcuts Reference" },
      { label: "Video Tutorials" },
      { divider: true, label: "" },
      { label: "Toggle Developer Tools" },
      { label: "About" },
    ],
  };

  return (
    <div style={{ background: "#3c3c3c", display: "flex", alignItems: "center", height: "30px", flexShrink: 0, userSelect: "none", position: "relative", zIndex: 200 }}>
      <div style={{ width: "68px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexShrink: 0 }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57", cursor: "pointer" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e", cursor: "pointer" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840", cursor: "pointer" }} />
      </div>
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} style={{ position: "relative" }}>
          <div
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => { if (openMenu && openMenu !== name) setOpenMenu(name); }}
            style={{ padding: "0 8px", height: "30px", display: "flex", alignItems: "center", cursor: "pointer", color: "#cccccc", fontSize: "13px", background: openMenu === name ? "#094771" : "transparent" }}
          >
            {name}
          </div>
          {openMenu === name && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpenMenu(null)} />
              <div style={{ position: "absolute", top: "30px", left: 0, background: "#252526", border: "1px solid #454545", borderRadius: "4px", minWidth: "200px", zIndex: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.5)", paddingTop: "4px", paddingBottom: "4px" }}>
                {items.map((item, i) =>
                  item.divider
                    ? <div key={i} style={{ borderTop: "1px solid #454545", margin: "4px 0" }} />
                    : (
                      <div
                        key={i}
                        onClick={() => { setOpenMenu(null); item.action?.(); }}
                        style={{ padding: "5px 20px", cursor: "pointer", color: "#cccccc", fontSize: "12px", display: "flex", justifyContent: "space-between" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {item.label}
                      </div>
                    )
                )}
              </div>
            </>
          )}
        </div>
      ))}
      {/* Center search bar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          onClick={onOpenSearch}
          style={{ background: "#3c3c3c", border: "1px solid #555", borderRadius: "4px", padding: "3px 80px", color: "#858585", fontSize: "12px", cursor: "text", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#888")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#555")}
        >
          <span>🔍</span> Search
        </div>
      </div>
      <div style={{ width: "80px", display: "flex", justifyContent: "flex-end", paddingRight: "8px", gap: "4px" }}>
        {["⊞", "⊟", "⛶"].map((ic, i) => (
          <span key={i} style={{ color: "#858585", cursor: "pointer", fontSize: "16px" }} onMouseEnter={e=>(e.currentTarget.style.color="#cccccc")} onMouseLeave={e=>(e.currentTarget.style.color="#858585")}>{ic}</span>
        ))}
      </div>
    </div>
  );
}
