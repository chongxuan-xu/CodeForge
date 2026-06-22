import { useState, useRef, useEffect, useCallback } from "react";
import type { GameVersion } from "../App";

interface Props { onLaunchGame: (v: GameVersion) => void; }

// ─── SVG Icons (no emojis) ─────────────────────────────────────────────────
const I = {
  file: (color = "#cccccc") => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  folderOpen: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8bf6a">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="#e8bf6a"/>
    </svg>
  ),
  folderClosed: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#dcb67a">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="#dcb67a"/>
    </svg>
  ),
  explorer: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" stroke={active ? "#cccccc" : "#858585"} strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  search: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
    </svg>
  ),
  git: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="18" cy="18" r="3" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <circle cx="6" cy="6" r="3" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <path d="M6 9v1a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v1" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <circle cx="6" cy="18" r="3" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <line x1="6" y1="9" x2="6" y2="15" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
    </svg>
  ),
  debug: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <polygon points="5 3 19 12 5 21 5 3" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2" fill="none"/>
    </svg>
  ),
  extensions: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="8" height="8" rx="1" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <rect x="14" y="2" width="8" height="8" rx="1" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <rect x="2" y="14" width="8" height="8" rx="1" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
      <path d="M14 18h8M18 14v8" stroke={active ? "#cccccc" : "#858585"} strokeWidth="2"/>
    </svg>
  ),
  user: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#858585" strokeWidth="2"/>
      <circle cx="12" cy="7" r="4" stroke="#858585" strokeWidth="2"/>
    </svg>
  ),
  settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#858585" strokeWidth="2"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#858585" strokeWidth="2"/>
    </svg>
  ),
  newFile: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#cccccc" strokeWidth="2"/>
      <polyline points="14 2 14 8 20 8" stroke="#cccccc" strokeWidth="2"/>
      <line x1="12" y1="13" x2="12" y2="19" stroke="#cccccc" strokeWidth="2"/>
      <line x1="9" y1="16" x2="15" y2="16" stroke="#cccccc" strokeWidth="2"/>
    </svg>
  ),
  newFolder: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="#cccccc" strokeWidth="2"/>
      <line x1="12" y1="11" x2="12" y2="17" stroke="#cccccc" strokeWidth="2"/>
      <line x1="9" y1="14" x2="15" y2="14" stroke="#cccccc" strokeWidth="2"/>
    </svg>
  ),
  close: (color = "#858585") => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  chevronRight: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <polyline points="9 18 15 12 9 6" stroke="#858585" strokeWidth="2"/>
    </svg>
  ),
  chevronDown: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <polyline points="6 9 12 15 18 9" stroke="#858585" strokeWidth="2"/>
    </svg>
  ),
};

// ─── Language icon colors ────────────────────────────────────────────────────
const LANG_COLOR: Record<string, string> = {
  ts: "#3178c6", tsx: "#61dafb", js: "#f7df1e", jsx: "#61dafb",
  css: "#264de4", scss: "#c69", py: "#3572A5", go: "#00add8",
  html: "#e34c26", json: "#cbcb41", md: "#519aba", git: "#f14e32",
  rs: "#dea584", rb: "#cc342d", java: "#ed8b00", cpp: "#9c4221",
  c: "#a8b9cc", txt: "#cccccc",
};

function LangIcon({ ext }: { ext: string }) {
  const color = LANG_COLOR[ext] ?? "#858585";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

// ─── File tree types ─────────────────────────────────────────────────────────
interface FileEntry {
  id: string;
  name: string;
  isFolder?: boolean;
  parentId: string | null;
  depth: number;
  lang?: string;
  ext?: string;
}

const ROOT_FILES: FileEntry[] = [
  { id: "root", name: "my-project", isFolder: true, parentId: null, depth: 0 },
  { id: "src", name: "src", isFolder: true, parentId: "root", depth: 1 },
  { id: "index.ts", name: "index.ts", parentId: "src", depth: 2, lang: "typescript", ext: "ts" },
  { id: "App.tsx", name: "App.tsx", parentId: "src", depth: 2, lang: "typescriptreact", ext: "tsx" },
  { id: "styles.css", name: "styles.css", parentId: "src", depth: 2, lang: "css", ext: "css" },
  { id: "utils.py", name: "utils.py", parentId: "src", depth: 2, lang: "python", ext: "py" },
  { id: "server.go", name: "server.go", parentId: "src", depth: 2, lang: "go", ext: "go" },
  { id: "public", name: "public", isFolder: true, parentId: "root", depth: 1 },
  { id: "index.html", name: "index.html", parentId: "public", depth: 2, lang: "html", ext: "html" },
  { id: "package.json", name: "package.json", parentId: "root", depth: 1, lang: "json", ext: "json" },
  { id: "README.md", name: "README.md", parentId: "root", depth: 1, lang: "markdown", ext: "md" },
  { id: ".gitignore", name: ".gitignore", parentId: "root", depth: 1, lang: "plaintext", ext: "git" },
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
  "styles.css": `:root {
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
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
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
| \`npm test\` | Run tests |

## License

MIT
`,
  ".gitignore": `node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
`,
};

// ─── Syntax Highlighter ──────────────────────────────────────────────────────
function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const KEYWORDS: Record<string, string[]> = {
  typescript: ["interface","type","const","let","var","function","async","await","return","if","else","for","while","class","extends","implements","import","export","from","default","new","throw","try","catch","finally","in","of","typeof","instanceof","void","null","undefined","true","false","number","string","boolean","any","never"],
  typescriptreact: ["interface","type","const","let","var","function","async","await","return","if","else","for","while","class","extends","import","export","from","default","new","throw","try","catch","in","of","typeof","void","null","undefined","true","false","React","useState","useEffect","useRef","useCallback"],
  python: ["def","class","import","from","return","if","elif","else","for","while","with","as","try","except","finally","raise","and","or","not","in","is","True","False","None","lambda","yield","pass","break","continue","global","nonlocal","print","len","range","type","str","int","float","list","dict","tuple","set"],
  go: ["func","package","import","var","const","type","struct","interface","return","if","else","for","range","switch","case","default","go","chan","select","defer","make","new","len","cap","append","copy","map","true","false","nil","string","int","int64","float64","bool","error","fmt"],
  css: ["color","background","background-color","margin","margin-top","margin-bottom","padding","padding-top","padding-bottom","font","font-size","font-weight","font-family","display","flex","grid","width","height","border","position","top","left","right","bottom","overflow","cursor","transition","transform","opacity","z-index","gap","align-items","justify-content","flex-direction"],
  json: [],
  markdown: [],
  html: ["DOCTYPE","html","head","body","div","span","p","h1","h2","h3","h4","h5","h6","a","img","ul","ol","li","script","link","meta","title","button","input","form","label","section","article","header","footer","main","nav","aside","table","tr","td","th","thead","tbody"],
  plaintext: [],
};

function highlight(code: string, lang: string): string {
  if (lang === "json") {
    return escHtml(code)
      .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color:#9cdcfe">$1</span>:')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#ce9178">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span style="color:#569cd6">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#b5cea8">$1</span>');
  }
  if (lang === "markdown") {
    return escHtml(code)
      .replace(/^(#{1,6} .+)$/gm, '<span style="color:#569cd6;font-weight:bold">$1</span>')
      .replace(/(`[^`]+`)/g, '<span style="color:#ce9178">$1</span>')
      .replace(/(\*\*[^*]+\*\*)/g, '<span style="font-weight:bold">$1</span>')
      .replace(/^(\|.+\|)$/gm, '<span style="color:#4ec9b0">$1</span>');
  }
  if (lang === "css") {
    return escHtml(code)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955">$1</span>')
      .replace(/([.#][\w-]+)/g, '<span style="color:#d7ba7d">$1</span>')
      .replace(/(:[\w-]+)/g, '<span style="color:#9cdcfe">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#ce9178">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg|s|ms)?)\b/g, '<span style="color:#b5cea8">$1</span>');
  }
  if (lang === "html") {
    return escHtml(code)
      .replace(/(<!--[\s\S]*?-->)/g, '<span style="color:#6a9955">$1</span>')
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#569cd6">$2</span>')
      .replace(/([\w-]+=)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#9cdcfe">$1</span><span style="color:#ce9178">$2</span>');
  }

  const kws = KEYWORDS[lang] ?? [];
  let result = "";
  let i = 0;
  const src = code;

  while (i < src.length) {
    // Line comment
    if ((src[i] === "/" && src[i + 1] === "/") || (lang === "python" && src[i] === "#")) {
      const end = src.indexOf("\n", i);
      const line = end === -1 ? src.slice(i) : src.slice(i, end);
      result += `<span style="color:#6a9955">${escHtml(line)}</span>`;
      i = end === -1 ? src.length : end;
      continue;
    }
    // Block comment
    if (src[i] === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const block = end === -1 ? src.slice(i) : src.slice(i, end + 2);
      result += `<span style="color:#6a9955">${escHtml(block)}</span>`;
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    // String (double quote)
    if (src[i] === '"') {
      let j = i + 1;
      while (j < src.length && (src[j] !== '"' || src[j - 1] === "\\")) j++;
      const str = src.slice(i, j + 1);
      result += `<span style="color:#ce9178">${escHtml(str)}</span>`;
      i = j + 1;
      continue;
    }
    // String (single quote)
    if (src[i] === "'") {
      let j = i + 1;
      while (j < src.length && (src[j] !== "'" || src[j - 1] === "\\")) j++;
      const str = src.slice(i, j + 1);
      result += `<span style="color:#ce9178">${escHtml(str)}</span>`;
      i = j + 1;
      continue;
    }
    // Template literal
    if (src[i] === "`") {
      let j = i + 1;
      while (j < src.length && (src[j] !== "`" || src[j - 1] === "\\")) j++;
      const str = src.slice(i, j + 1);
      result += `<span style="color:#ce9178">${escHtml(str)}</span>`;
      i = j + 1;
      continue;
    }
    // Number
    if (/\d/.test(src[i]) && (i === 0 || /\W/.test(src[i - 1]))) {
      let j = i;
      while (j < src.length && /[\d.x_a-fA-F]/.test(src[j])) j++;
      result += `<span style="color:#b5cea8">${escHtml(src.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(src[i])) {
      let j = i;
      while (j < src.length && /[\w$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (kws.includes(word)) {
        result += `<span style="color:#569cd6">${escHtml(word)}</span>`;
      } else if (/^[A-Z]/.test(word)) {
        result += `<span style="color:#4ec9b0">${escHtml(word)}</span>`;
      } else if (j < src.length && src[j] === "(") {
        result += `<span style="color:#dcdcaa">${escHtml(word)}</span>`;
      } else {
        result += escHtml(word);
      }
      i = j;
      continue;
    }
    result += escHtml(src[i]);
    i++;
  }
  return result;
}

// ─── Terminal ────────────────────────────────────────────────────────────────
let cwdState = "~";

function runCommand(input: string, files: FileEntry[]): string {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  switch (cmd) {
    case "": return "";
    case "clear": return "\x00CLEAR";
    case "help": return [
      "Available commands:",
      "  ls [-a]      List directory contents",
      "  pwd          Print working directory",
      "  cd <dir>     Change directory",
      "  echo <text>  Print text",
      "  cat <file>   Show file contents",
      "  mkdir <dir>  Create directory",
      "  touch <file> Create empty file",
      "  rm <file>    Remove file",
      "  date         Show current date/time",
      "  whoami       Print current user",
      "  hostname     Print hostname",
      "  uname        System info",
      "  node <file>  Run Node.js script",
      "  python <f>   Run Python script",
      "  go run <f>   Run Go program",
      "  npm/pnpm     Package manager",
      "  git <cmd>    Git operations",
      "  clear        Clear terminal",
      "  history      Show command history",
    ].join("\n");
    case "ls": {
      const names = files.filter(f => !f.isFolder).map(f => f.name);
      const folders = files.filter(f => f.isFolder && f.name !== "my-project").map(f => f.name + "/");
      return [...folders, ...names].join("  ");
    }
    case "pwd": return cwdState === "~" ? "/home/codeforge" : `/home/codeforge/${cwdState.replace("~/","").replace("~","")}`;
    case "cd":
      if (!args[0] || args[0] === "~") { cwdState = "~"; return ""; }
      if (args[0] === "..") { const p = cwdState.split("/"); p.pop(); cwdState = p.join("/") || "~"; return ""; }
      cwdState = cwdState === "~" ? `~/${args[0]}` : `${cwdState}/${args[0]}`; return "";
    case "echo": return args.join(" ");
    case "cat": {
      if (!args[0]) return "cat: missing file operand";
      const content = STARTER_CODE[args[0]];
      if (content) return content;
      const f = files.find(x => x.name === args[0]);
      if (f && !f.isFolder) return "(empty file)";
      return `cat: ${args[0]}: No such file or directory`;
    }
    case "mkdir": return args[0] ? "" : "mkdir: missing operand";
    case "touch": return args[0] ? "" : "touch: missing file operand";
    case "rm": return args[0] ? `removed '${args[0]}'` : "rm: missing operand";
    case "date": return new Date().toString();
    case "whoami": return "codeforge";
    case "hostname": return "workspace";
    case "uname": return args[0] === "-a" ? "Linux workspace 5.15.0 #1 SMP x86_64 GNU/Linux" : "Linux";
    case "history": return ["1  ls", "2  cd src", "3  node index.ts", "4  git status"].join("\n");
    case "node": case "ts-node": case "tsx":
      if (!args[0]) return `${cmd}: missing script`;
      return `[Running ${args[0]}...]\nHello, World!\nProcess exited with code 0`;
    case "python": case "python3":
      if (!args[0]) return `${cmd}: missing script`;
      return `[Running ${args[0]}...]\nUtils module loaded successfully.\nProcess exited with code 0`;
    case "go":
      if (args[0] === "run" && args[1]) return `[Running ${args[1]}...]\nServer running on :8080\n^C`;
      if (args[0] === "build") return `[Building...]\nBuild complete: ./main`;
      if (args[0] === "test") return `ok  \tmy-project\t0.423s`;
      return `go: unknown subcommand '${args[0] ?? ""}'`;
    case "npm": case "pnpm": case "yarn": case "bun":
      if (args[0] === "install" || args[0] === "i")
        return `\nResolving dependencies...\nadded 248 packages in 3.2s\n3 packages are looking for funding`;
      if (args[0] === "run")
        return `\n> ${args[1]}\n\n  VITE v5.0.0  ready in 412ms\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose`;
      if (args[0] === "test")
        return `\n✓ utils.test.ts (12)\n✓ api.test.ts (8)\n\nTest Files  2 passed (2)\nTests       20 passed (20)\nDuration    2.15s`;
      if (args[0] === "build")
        return `\nvite v5.0.0 building for production...\n✓ 42 modules transformed.\ndist/index.html    0.46 kB\ndist/assets/index.js  142.3 kB`;
      return `${cmd}: Unknown command '${args[0] ?? ""}'`;
    case "git":
      if (args[0] === "status") return "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
      if (args[0] === "log") return `commit a1b2c3d4 (HEAD -> main, origin/main)\nAuthor: codeforge <codeforge@workspace.dev>\nDate:   ${new Date().toDateString()}\n\n    feat: initial project setup`;
      if (args[0] === "init") return `Initialized empty Git repository in ${cwdState}/.git/`;
      if (args[0] === "add") return "";
      if (args[0] === "commit") return `[main a1b2c3d] ${args.slice(2).join(" ") || "update"}\n 5 files changed, 142 insertions(+)`;
      if (args[0] === "push") return `Enumerating objects: 10, done.\nCounting objects: 100% (10/10), done.\nTo github.com:codeforge/my-project.git\n   a1b2c3d..f4e5d6c  main -> main`;
      if (args[0] === "pull") return `Already up to date.`;
      if (args[0] === "branch") return `* main\n  develop\n  feature/auth`;
      if (args[0] === "diff") return `(no changes)`;
      return `git: '${args[0]}' is not a git command. See 'git help'.`;
    default:
      return `${cmd}: command not found\nType 'help' for available commands`;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VSCode({ onLaunchGame }: Props) {
  const [files, setFiles] = useState<FileEntry[]>(ROOT_FILES);
  const [fileContents, setFileContents] = useState<Record<string, string>>(STARTER_CODE);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ root: true, src: true, public: false });
  const [activeActivity, setActiveActivity] = useState<"explorer" | "search" | "git" | "debug" | "extensions">("explorer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("Plain Text");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langFilter, setLangFilter] = useState("");
  const [installedExts, setInstalledExts] = useState<Set<string>>(new Set());
  const [installingExts, setInstallingExts] = useState<Set<string>>(new Set());

  // New file/folder input
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");
  const newItemRef = useRef<HTMLInputElement>(null);

  // Search palette
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Terminal
  const [termSessions, setTermSessions] = useState<{ id: number; lines: string[] }[]>([
    { id: 1, lines: ["Welcome to the integrated terminal.", "Type \u2018help\u2019 for available commands.", ""] }
  ]);
  const [activeTermId, setActiveTermId] = useState(1);
  const [termInputs, setTermInputs] = useState<Record<number, string>>({ 1: "" });
  const [termHistories, setTermHistories] = useState<Record<number, string[]>>({ 1: [] });
  const [historyIdxes, setHistoryIdxes] = useState<Record<number, number>>({ 1: -1 });
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  // Editor highlight
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  useEffect(() => { termEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [termSessions, activeTermId]);
  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 30); }, [searchOpen]);
  useEffect(() => { if (newItemRef.current) newItemRef.current.focus(); }, [newItemParent]);

  const openFile = useCallback((id: string) => {
    const f = files.find(x => x.id === id);
    if (!f || f.isFolder) return;
    if (!openTabs.includes(id)) setOpenTabs(t => [...t, id]);
    setActiveTab(id);
    setSelectedFile(id);
    const langMap: Record<string, string> = {
      typescript: "TypeScript", typescriptreact: "TypeScript JSX",
      python: "Python", go: "Go", css: "CSS", html: "HTML",
      json: "JSON", markdown: "Markdown", plaintext: "Plain Text",
    };
    setSelectedLanguage(langMap[f.lang ?? ""] ?? "Plain Text");
  }, [files, openTabs]);

  const closeTab = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idx = openTabs.indexOf(id);
    const next = openTabs.filter(t => t !== id);
    setOpenTabs(next);
    if (activeTab === id) setActiveTab(next[Math.max(0, idx - 1)] ?? null);
  }, [openTabs, activeTab]);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { setSearchOpen(false); setSearchValue(""); return; }
    if (e.key === "Enter") {
      const val = searchValue.trim().toLowerCase();
      setSearchOpen(false);
      setSearchValue("");
      if (val === "e1.5.2") { onLaunchGame("1.5.2"); return; }
      if (val === "e1.8.8") { onLaunchGame("1.8.8"); return; }
      if (val === "e1.12.2") { onLaunchGame("1.12.2"); return; }
    }
  };

  const activeSession = termSessions.find(s => s.id === activeTermId);
  const termInput = termInputs[activeTermId] ?? "";
  const setTermInput = (v: string) => setTermInputs(p => ({ ...p, [activeTermId]: v }));

  const handleTermKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = termHistories[activeTermId] ?? [];
    const hidx = historyIdxes[activeTermId] ?? -1;
    if (e.key === "Enter") {
      const input = termInput.trim();
      const result = runCommand(input, files);
      setTermSessions(ss => ss.map(s => {
        if (s.id !== activeTermId) return s;
        if (result === "\x00CLEAR") return { ...s, lines: [] };
        return {
          ...s,
          lines: [
            ...s.lines,
            `\x02${cwdState}\x03 % ${input}`,
            ...(result ? result.split("\n") : []),
          ],
        };
      }));
      if (input) setTermHistories(h => ({ ...h, [activeTermId]: [input, ...(h[activeTermId] ?? [])].slice(0, 100) }));
      setHistoryIdxes(h => ({ ...h, [activeTermId]: -1 }));
      setTermInput("");
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(hidx + 1, history.length - 1);
      setHistoryIdxes(h => ({ ...h, [activeTermId]: idx }));
      setTermInput(history[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(hidx - 1, -1);
      setHistoryIdxes(h => ({ ...h, [activeTermId]: idx }));
      setTermInput(idx === -1 ? "" : history[idx]);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const cmds = ["ls","pwd","cd","echo","cat","mkdir","touch","rm","date","whoami","node","python","go","npm","git","clear","help","history"];
      const match = cmds.find(c => c.startsWith(termInput) && c !== termInput);
      if (match) setTermInput(match + " ");
    }
    if (e.key === "c" && e.ctrlKey) { setTermInput(""); }
  };

  const newTerminal = () => {
    const id = Date.now();
    setTermSessions(ss => [...ss, { id, lines: [""] }]);
    setTermInputs(p => ({ ...p, [id]: "" }));
    setTermHistories(h => ({ ...h, [id]: [] }));
    setHistoryIdxes(h => ({ ...h, [id]: -1 }));
    setActiveTermId(id);
  };

  const closeTermSession = (id: number) => {
    if (termSessions.length === 1) { setTerminalOpen(false); return; }
    const next = termSessions.filter(s => s.id !== id);
    setTermSessions(next);
    if (activeTermId === id) setActiveTermId(next[0]?.id ?? 1);
  };

  const commitNewItem = () => {
    const name = newItemName.trim();
    if (!name) { setNewItemParent(null); setNewItemName(""); return; }
    const parent = newItemParent;
    const parentEntry = files.find(f => f.id === parent);
    const depth = parentEntry ? parentEntry.depth + 1 : 1;
    const ext = newItemType === "file" ? name.split(".").pop() ?? "" : "";
    const newEntry: FileEntry = {
      id: name + "-" + Date.now(),
      name,
      isFolder: newItemType === "folder",
      parentId: parent,
      depth,
      lang: newItemType === "file" ? "plaintext" : undefined,
      ext: newItemType === "file" ? ext : undefined,
    };
    setFiles(f => [...f, newEntry]);
    if (newItemType === "file") setFileContents(c => ({ ...c, [name]: "" }));
    setNewItemParent(null);
    setNewItemName("");
    if (newItemType === "file") openFile(newEntry.id);
  };

  const renderTermLine = (line: string, i: number) => {
    if (line.startsWith("\x02")) {
      const rest = line.slice(1);
      const pct = rest.indexOf("\x03");
      const dir = rest.slice(0, pct);
      const cmd = rest.slice(pct + 3);
      return (
        <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>
          <span style={{ color: "#4ec9b0", fontWeight: "bold" }}>codeforge@workspace</span>
          <span style={{ color: "#858585" }}> {dir}</span>
          <span style={{ color: "#cccccc" }}> %</span>
          <span style={{ color: "#d4d4d4" }}> {cmd}</span>
        </div>
      );
    }
    return <div key={i} style={{ color: "#cccccc" }}>{line}</div>;
  };

  const filteredLangs = LANGUAGES.filter(l => l.toLowerCase().includes(langFilter.toLowerCase()));
  const activeFile = activeTab ? files.find(f => f.id === activeTab) : null;
  const activeCode = activeTab ? (fileContents[activeFile?.name ?? ""] ?? fileContents[activeTab] ?? "") : "";

  // Visible tree entries
  const visibleFiles = (() => {
    const visible: FileEntry[] = [];
    const addChildren = (parentId: string | null) => {
      files.filter(f => f.parentId === parentId).forEach(f => {
        visible.push(f);
        if (f.isFolder && expanded[f.id]) addChildren(f.id);
      });
    };
    addChildren(null);
    return visible;
  })();

  const openSearch = () => { setSearchOpen(true); setSearchValue(""); };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", background: "#1e1e1e", color: "#cccccc", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: "13px", overflow: "hidden" }}
      onClick={() => { setShowLangPicker(false); }}
    >
      {/* Menu Bar */}
      <MenuBar
        onOpenSearch={openSearch}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
        onToggleTerminal={() => setTerminalOpen(t => !t)}
        onNewFile={() => { setNewItemParent("root"); setNewItemType("file"); setNewItemName(""); }}
        onNewFolder={() => { setNewItemParent("root"); setNewItemType("folder"); setNewItemName(""); }}
        onSave={() => {}}
        onUndo={() => document.execCommand("undo")}
        onRedo={() => document.execCommand("redo")}
      />

      {/* Search Palette */}
      {searchOpen && (
        <div
          onClick={() => { setSearchOpen(false); setSearchValue(""); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: "520px", background: "#252526", border: "1px solid #454545", borderRadius: "6px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
            <input
              ref={searchRef}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search files or type e1.5.2 / e1.8.8 / e1.12.2 then press Enter..."
              style={{ width: "100%", background: "#3c3c3c", border: "none", borderBottom: "1px solid #454545", color: "#cccccc", padding: "10px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              {files.filter(f => !f.isFolder && f.name.toLowerCase().includes(searchValue.toLowerCase())).map(f => (
                <div
                  key={f.id}
                  onClick={() => { openFile(f.id); setSearchOpen(false); setSearchValue(""); }}
                  style={{ padding: "7px 16px", cursor: "pointer", color: "#cccccc", display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <LangIcon ext={f.ext ?? ""} />
                  <span>{f.name}</span>
                </div>
              ))}
              {searchValue && (
                <div style={{ padding: "6px 16px", color: "#858585", fontSize: "12px", borderTop: "1px solid #333" }}>
                  Press Enter to search — or type e1.5.2, e1.8.8, e1.12.2 to launch Eaglercraft
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Activity Bar */}
        <div style={{ width: "48px", background: "#333333", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px", borderRight: "1px solid #252526", flexShrink: 0 }}>
          {(["explorer","search","git","debug","extensions"] as const).map(act => {
            const ic = act === "explorer" ? I.explorer(activeActivity === act)
              : act === "search" ? I.search(activeActivity === act)
              : act === "git" ? I.git(activeActivity === act)
              : act === "debug" ? I.debug(activeActivity === act)
              : I.extensions(activeActivity === act);
            return (
              <div
                key={act}
                title={act.charAt(0).toUpperCase() + act.slice(1)}
                onClick={() => { setActiveActivity(act); setSidebarOpen(true); }}
                style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderLeft: activeActivity === act ? "2px solid #007acc" : "2px solid transparent" }}
              >
                {ic}
              </div>
            );
          })}
          <div style={{ flex: 1 }} />
          <div title="Accounts" style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{I.user()}</div>
          <div title="Settings" style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{I.settings()}</div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width: "240px", background: "#252526", borderRight: "1px solid #1e1e1e", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

            {activeActivity === "explorer" && (
              <>
                <div style={{ padding: "8px 12px 4px", fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <span>EXPLORER</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <IconBtn title="New File" onClick={() => { setNewItemParent("root"); setNewItemType("file"); setNewItemName(""); }}>{I.newFile()}</IconBtn>
                    <IconBtn title="New Folder" onClick={() => { setNewItemParent("root"); setNewItemType("folder"); setNewItemName(""); }}>{I.newFolder()}</IconBtn>
                    <IconBtn title="Refresh" onClick={() => {}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="23 4 23 10 17 10" stroke="#cccccc" strokeWidth="2"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="#cccccc" strokeWidth="2"/></svg></IconBtn>
                    <IconBtn title="Collapse All" onClick={() => setExpanded({})}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="4 6 2 12 4 18" stroke="#cccccc" strokeWidth="2"/><polyline points="20 6 22 12 20 18" stroke="#cccccc" strokeWidth="2"/></svg></IconBtn>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: "auto" }} onClick={e => { if (e.target === e.currentTarget) setSelectedFile(null); }}>
                  {/* New item input */}
                  {newItemParent !== null && (
                    <div style={{ padding: "2px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <LangIcon ext={newItemType === "folder" ? "folder" : newItemName.split(".").pop() ?? ""} />
                      <input
                        ref={newItemRef}
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") commitNewItem();
                          if (e.key === "Escape") { setNewItemParent(null); setNewItemName(""); }
                        }}
                        onBlur={commitNewItem}
                        placeholder={newItemType === "file" ? "filename.ts" : "folder-name"}
                        style={{ background: "#3c3c3c", border: "1px solid #007acc", color: "#cccccc", padding: "2px 6px", fontSize: "13px", outline: "none", width: "100%", borderRadius: "2px" }}
                      />
                    </div>
                  )}
                  {visibleFiles.map(f => (
                    <div
                      key={f.id}
                      onClick={e => {
                        e.stopPropagation();
                        if (f.isFolder) {
                          setExpanded(ex => ({ ...ex, [f.id]: !ex[f.id] }));
                          setSelectedFile(f.id);
                        } else {
                          openFile(f.id);
                        }
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        paddingLeft: `${f.depth * 12 + 4}px`, paddingRight: "8px",
                        height: "22px", cursor: "pointer",
                        background: selectedFile === f.id ? "#094771" : "transparent",
                        userSelect: "none",
                      }}
                      onMouseEnter={e => { if (selectedFile !== f.id) e.currentTarget.style.background = "#2a2d2e"; }}
                      onMouseLeave={e => { if (selectedFile !== f.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      {f.isFolder
                        ? <><span style={{ width: "12px", flexShrink: 0 }}>{expanded[f.id] ? I.chevronDown() : I.chevronRight()}</span>{expanded[f.id] ? I.folderOpen() : I.folderClosed()}</>
                        : <><span style={{ width: "12px", flexShrink: 0 }} /><LangIcon ext={f.ext ?? ""} /></>}
                      <span style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    </div>
                  ))}
                  <div style={{ flex: 1, minHeight: "40px" }} onClick={() => setSelectedFile(null)} />
                </div>
              </>
            )}

            {activeActivity === "search" && (
              <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 4px 0" }}>SEARCH</div>
                <input autoFocus placeholder="Search" style={{ background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "13px", outline: "none", borderRadius: "2px" }} />
                <input placeholder="Replace" style={{ background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "13px", outline: "none", borderRadius: "2px" }} />
                <div style={{ color: "#858585", fontSize: "12px", padding: "4px" }}>No results found</div>
              </div>
            )}

            {activeActivity === "git" && (
              <div style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 12px 8px" }}>SOURCE CONTROL</div>
                <button style={{ margin: "0 8px 8px", background: "#0e639c", color: "#fff", border: "none", padding: "6px", cursor: "pointer", fontSize: "12px", borderRadius: "2px" }}>Commit</button>
                <div style={{ padding: "4px 12px", color: "#858585", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="18" r="3" stroke="#858585" strokeWidth="2"/><circle cx="6" cy="6" r="3" stroke="#858585" strokeWidth="2"/><path d="M6 9v6" stroke="#858585" strokeWidth="2"/></svg>
                  main — no pending changes
                </div>
              </div>
            )}

            {activeActivity === "debug" && (
              <div style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 12px 8px" }}>RUN AND DEBUG</div>
                <button style={{ margin: "0 8px 8px", background: "#0e639c", color: "#fff", border: "none", padding: "6px", cursor: "pointer", fontSize: "12px", borderRadius: "2px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg>
                  Run and Debug
                </button>
                <div style={{ padding: "4px 12px", color: "#858585", fontSize: "12px" }}>No launch configuration.</div>
                <div style={{ padding: "4px 12px 2px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", marginBottom: "6px" }}>VARIABLES</div>
                  <div style={{ color: "#858585", fontSize: "12px" }}>Not paused</div>
                </div>
              </div>
            )}

            {activeActivity === "extensions" && (
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "10px 12px 6px", flexShrink: 0 }}>EXTENSIONS</div>
                <input autoFocus placeholder="Search Extensions..." style={{ margin: "0 8px 8px", background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "12px", outline: "none", borderRadius: "2px", flexShrink: 0 }} />
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {[
                    { id: "prettier", name: "Prettier", desc: "Code formatter", author: "Prettier" },
                    { id: "eslint", name: "ESLint", desc: "Linting for JS/TS", author: "Microsoft" },
                    { id: "copilot", name: "GitHub Copilot", desc: "AI pair programmer", author: "GitHub" },
                    { id: "python", name: "Python", desc: "Python language support", author: "Microsoft" },
                    { id: "go", name: "Go", desc: "Go language support", author: "Go Team at Google" },
                    { id: "rust", name: "Rust Analyzer", desc: "Rust language support", author: "rust-lang" },
                    { id: "gitlens", name: "GitLens", desc: "Git supercharged", author: "GitKraken" },
                    { id: "tailwind", name: "Tailwind CSS IntelliSense", desc: "Autocomplete, linting", author: "Tailwind Labs" },
                    { id: "theme", name: "One Dark Pro", desc: "Dark theme", author: "binaryify" },
                    { id: "indent", name: "indent-rainbow", desc: "Colorize indentation", author: "oderwat" },
                  ].map(ext => {
                    const isInstalled = installedExts.has(ext.id);
                    const isInstalling = installingExts.has(ext.id);
                    return (
                      <div key={ext.id} style={{ padding: "8px 12px", borderBottom: "1px solid #1e1e1e" }}>
                        <div style={{ color: "#cccccc", fontSize: "13px", fontWeight: 500 }}>{ext.name}</div>
                        <div style={{ color: "#858585", fontSize: "11px", margin: "2px 0" }}>{ext.desc}</div>
                        <div style={{ color: "#858585", fontSize: "11px" }}>{ext.author}</div>
                        <button
                          onClick={() => {
                            if (isInstalled) {
                              setInstalledExts(s => { const n = new Set(s); n.delete(ext.id); return n; });
                            } else if (!isInstalling) {
                              setInstallingExts(s => new Set([...s, ext.id]));
                              setTimeout(() => {
                                setInstallingExts(s => { const n = new Set(s); n.delete(ext.id); return n; });
                                setInstalledExts(s => new Set([...s, ext.id]));
                              }, 1500);
                            }
                          }}
                          style={{ marginTop: "4px", background: isInstalled ? "#333" : "#0e639c", color: isInstalled ? "#cccccc" : "#fff", border: isInstalled ? "1px solid #555" : "none", padding: "3px 10px", cursor: "pointer", fontSize: "11px", borderRadius: "2px", minWidth: "70px" }}
                        >
                          {isInstalling ? "Installing..." : isInstalled ? "Uninstall" : "Install"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor + Terminal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Tab Bar */}
          {openTabs.length > 0 ? (
            <div style={{ display: "flex", background: "#252526", borderBottom: "1px solid #1e1e1e", overflowX: "auto", flexShrink: 0, height: "35px", alignItems: "stretch" }}>
              {openTabs.map(tabId => {
                const f = files.find(x => x.id === tabId);
                if (!f) return null;
                const isActive = activeTab === tabId;
                return (
                  <div
                    key={tabId}
                    onClick={() => openFile(tabId)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 6px 0 12px", borderRight: "1px solid #1e1e1e", cursor: "pointer", background: isActive ? "#1e1e1e" : "#2d2d2d", borderTop: isActive ? "1px solid #007acc" : "1px solid transparent", color: isActive ? "#fff" : "#969696", whiteSpace: "nowrap", userSelect: "none", minWidth: "100px" }}
                  >
                    <LangIcon ext={f.ext ?? ""} />
                    <span style={{ fontSize: "13px" }}>{f.name}</span>
                    <span
                      onClick={e => closeTab(tabId, e)}
                      style={{ padding: "2px 3px", borderRadius: "3px", cursor: "pointer", display: "flex", alignItems: "center" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#404040")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {I.close()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: "35px", background: "#252526", borderBottom: "1px solid #1e1e1e", flexShrink: 0 }} />
          )}

          {/* Editor area */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
            {activeTab && activeFile ? (
              <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
                {/* Line numbers */}
                <div
                  id="line-nums"
                  style={{ background: "#1e1e1e", color: "#858585", padding: "8px 0", textAlign: "right", userSelect: "none", fontSize: "13px", lineHeight: "1.6", minWidth: "50px", paddingRight: "16px", paddingLeft: "8px", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", overflowY: "hidden", flexShrink: 0 }}
                >
                  {activeCode.split("\n").map((_, i) => (
                    <div key={i} style={{ color: i + 1 === cursorLine ? "#cccccc" : "#858585" }}>{i + 1}</div>
                  ))}
                </div>
                {/* Highlighted editor */}
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  <pre
                    aria-hidden
                    style={{
                      position: "absolute", inset: 0, margin: 0, padding: "8px 8px 8px 0",
                      fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
                      fontSize: "14px", lineHeight: "1.6", overflow: "hidden",
                      pointerEvents: "none", whiteSpace: "pre-wrap", wordBreak: "break-all",
                      color: "#d4d4d4",
                    }}
                    dangerouslySetInnerHTML={{ __html: highlight(activeCode, activeFile.lang ?? "plaintext") }}
                  />
                  <textarea
                    value={activeCode}
                    onChange={e => {
                      const name = activeFile.name;
                      setFileContents(c => ({ ...c, [name]: e.target.value, [activeTab]: e.target.value }));
                    }}
                    onKeyDown={e => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const ta = e.currentTarget;
                        const s = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const nv = ta.value.substring(0, s) + "  " + ta.value.substring(end);
                        const name = activeFile.name;
                        setFileContents(c => ({ ...c, [name]: nv, [activeTab]: nv }));
                        setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
                      }
                    }}
                    onSelect={e => {
                      const ta = e.currentTarget;
                      const before = ta.value.substring(0, ta.selectionStart);
                      const lines = before.split("\n");
                      setCursorLine(lines.length);
                      setCursorCol(lines[lines.length - 1].length + 1);
                    }}
                    onScroll={e => {
                      const ln = document.getElementById("line-nums");
                      if (ln) ln.scrollTop = e.currentTarget.scrollTop;
                    }}
                    style={{
                      position: "absolute", inset: 0,
                      background: "transparent", color: "transparent",
                      caretColor: "#aeafad", border: "none", outline: "none", resize: "none",
                      fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
                      fontSize: "14px", lineHeight: "1.6", padding: "8px 8px 8px 0",
                      tabSize: 2, overflowY: "auto", overflowX: "auto",
                      whiteSpace: "pre", wordBreak: "normal",
                    }}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>
            ) : (
              <div style={{ background: "#1e1e1e", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "#858585" }}>
                <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
                  <path d="M75 12.5L25 50l50 37.5V12.5z" fill="#007acc" opacity="0.6"/>
                  <path d="M25 12.5v75l25-37.5L25 12.5z" fill="#007acc"/>
                </svg>
                <div style={{ fontSize: "18px", color: "#cccccc" }}>Visual Studio Code</div>
                <div style={{ fontSize: "13px" }}>Open a file from the Explorer or use the search bar</div>
                <div style={{ fontSize: "12px", color: "#858585", marginTop: "8px" }}>
                  <kbd style={{ background: "#333", border: "1px solid #555", padding: "2px 6px", borderRadius: "3px" }}>Ctrl+P</kbd> to search files
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          {terminalOpen && (
            <div style={{ height: "220px", borderTop: "1px solid #454545", display: "flex", flexDirection: "column", flexShrink: 0, background: "#1e1e1e" }}>
              {/* Terminal tab bar */}
              <div style={{ display: "flex", alignItems: "center", background: "#252526", height: "32px", borderBottom: "1px solid #454545", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
                  {(["TERMINAL","PROBLEMS","OUTPUT","DEBUG CONSOLE"] as const).map(tab => (
                    <div
                      key={tab}
                      style={{ padding: "0 14px", height: "32px", display: "flex", alignItems: "center", fontSize: "11px", cursor: "pointer", color: tab === "TERMINAL" ? "#cccccc" : "#858585", borderBottom: tab === "TERMINAL" ? "1px solid #007acc" : "none" }}
                      onMouseEnter={e => { if (tab !== "TERMINAL") e.currentTarget.style.color = "#cccccc"; }}
                      onMouseLeave={e => { if (tab !== "TERMINAL") e.currentTarget.style.color = "#858585"; }}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", marginLeft: "8px", gap: "2px", overflowX: "auto" }}>
                  {termSessions.map(s => (
                    <div
                      key={s.id}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 8px", height: "24px", background: activeTermId === s.id ? "#3c3c3c" : "transparent", borderRadius: "3px", cursor: "pointer", fontSize: "11px", color: "#cccccc" }}
                      onClick={() => setActiveTermId(s.id)}
                    >
                      bash
                      <span
                        onClick={e => { e.stopPropagation(); closeTermSession(s.id); }}
                        style={{ display: "flex", alignItems: "center", padding: "1px" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#555")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {I.close()}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", padding: "0 8px", gap: "4px" }}>
                  <IconBtn title="New Terminal" onClick={newTerminal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="#cccccc" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="#cccccc" strokeWidth="2"/></svg></IconBtn>
                  <IconBtn title="Split Terminal" onClick={newTerminal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="1" stroke="#cccccc" strokeWidth="2"/><line x1="12" y1="3" x2="12" y2="21" stroke="#cccccc" strokeWidth="2"/></svg></IconBtn>
                  <IconBtn title="Clear Terminal" onClick={() => setTermSessions(ss => ss.map(s => s.id === activeTermId ? { ...s, lines: [] } : s))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6" stroke="#cccccc" strokeWidth="2"/><path d="M8 6V4h8v2" stroke="#cccccc" strokeWidth="2"/></svg></IconBtn>
                  <IconBtn title="Close Panel" onClick={() => setTerminalOpen(false)}>{I.close()}</IconBtn>
                </div>
              </div>
              {/* Terminal output */}
              <div
                onClick={() => termInputRef.current?.focus()}
                style={{ flex: 1, overflow: "auto", padding: "8px 12px", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", fontSize: "13px", lineHeight: "1.7", cursor: "text" }}
              >
                {activeSession?.lines.map((line, i) => renderTermLine(line, i))}
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  <span style={{ color: "#4ec9b0", fontWeight: "bold" }}>codeforge@workspace</span>
                  <span style={{ color: "#858585" }}> {cwdState}</span>
                  <span style={{ color: "#cccccc" }}> %&nbsp;</span>
                  <input
                    ref={termInputRef}
                    value={termInput}
                    onChange={e => setTermInput(e.target.value)}
                    onKeyDown={handleTermKey}
                    style={{ background: "none", border: "none", outline: "none", color: "#d4d4d4", fontFamily: "inherit", fontSize: "inherit", flex: 1, caretColor: "#aeafad", minWidth: 0, padding: 0 }}
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

      {/* Status Bar */}
      <div onClick={e => e.stopPropagation()} style={{ background: "#007acc", color: "#fff", display: "flex", alignItems: "center", height: "22px", flexShrink: 0, fontSize: "12px", userSelect: "none" }}>
        <SBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="18" r="3" stroke="white" strokeWidth="2"/><circle cx="6" cy="6" r="3" stroke="white" strokeWidth="2"/><line x1="6" y1="9" x2="6" y2="15" stroke="white" strokeWidth="2"/></svg>} text="main" />
        <SBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2"/></svg>} text="0" />
        <SBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="white" strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="3"/></svg>} text="0" />
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowLangPicker(l => !l); }}>
          <SBtn text={selectedLanguage} />
          {showLangPicker && (
            <div style={{ position: "absolute", bottom: "22px", right: 0, background: "#252526", border: "1px solid #454545", borderRadius: "4px", width: "220px", maxHeight: "280px", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
              <input
                value={langFilter}
                onChange={e => setLangFilter(e.target.value)}
                placeholder="Filter languages..."
                style={{ background: "#3c3c3c", border: "none", borderBottom: "1px solid #454545", color: "#cccccc", padding: "6px 10px", fontSize: "12px", outline: "none" }}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
              <div style={{ overflowY: "auto" }}>
                {filteredLangs.map(l => (
                  <div
                    key={l}
                    onClick={e => { e.stopPropagation(); setSelectedLanguage(l); setShowLangPicker(false); setLangFilter(""); }}
                    style={{ padding: "5px 12px", cursor: "pointer", color: l === selectedLanguage ? "#fff" : "#cccccc", background: l === selectedLanguage ? "#094771" : "transparent", fontSize: "12px" }}
                    onMouseEnter={e => { if (l !== selectedLanguage) e.currentTarget.style.background = "#2a2d2e"; }}
                    onMouseLeave={e => { if (l !== selectedLanguage) e.currentTarget.style.background = "transparent"; }}
                  >
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
        {activeTab && <SBtn text={`Ln ${cursorLine}, Col ${cursorCol}`} />}
      </div>
    </div>
  );
}

// ─── Utility sub-components ───────────────────────────────────────────────────
function SBtn({ icon, text, onClick }: { icon?: React.ReactNode; text: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 8px", height: "22px", cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
      {text && <span>{text}</span>}
    </div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
  return (
    <div
      title={title}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", cursor: "pointer", borderRadius: "3px" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}

// ─── Menu Bar ────────────────────────────────────────────────────────────────
function MenuBar({ onOpenSearch, onToggleSidebar, onToggleTerminal, onNewFile, onNewFolder, onSave, onUndo, onRedo }: {
  onOpenSearch: () => void; onToggleSidebar: () => void; onToggleTerminal: () => void;
  onNewFile: () => void; onNewFolder: () => void; onSave: () => void; onUndo: () => void; onRedo: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus: Record<string, { label: string; action?: () => void; divider?: boolean; shortcut?: string }[]> = {
    File: [
      { label: "New File", action: onNewFile, shortcut: "Ctrl+N" },
      { label: "New Folder", action: onNewFolder },
      { label: "New Window", shortcut: "Ctrl+Shift+N" },
      { divider: true, label: "" },
      { label: "Open File...", shortcut: "Ctrl+O" },
      { label: "Open Folder...", shortcut: "Ctrl+K Ctrl+O" },
      { divider: true, label: "" },
      { label: "Save", action: onSave, shortcut: "Ctrl+S" },
      { label: "Save As...", shortcut: "Ctrl+Shift+S" },
      { label: "Save All", shortcut: "Ctrl+K S" },
      { divider: true, label: "" },
      { label: "Close Editor", shortcut: "Ctrl+W" },
    ],
    Edit: [
      { label: "Undo", action: onUndo, shortcut: "Ctrl+Z" },
      { label: "Redo", action: onRedo, shortcut: "Ctrl+Y" },
      { divider: true, label: "" },
      { label: "Cut", shortcut: "Ctrl+X" },
      { label: "Copy", shortcut: "Ctrl+C" },
      { label: "Paste", shortcut: "Ctrl+V" },
      { divider: true, label: "" },
      { label: "Find...", action: onOpenSearch, shortcut: "Ctrl+P" },
      { label: "Replace...", shortcut: "Ctrl+H" },
      { divider: true, label: "" },
      { label: "Toggle Line Comment", shortcut: "Ctrl+/" },
      { label: "Format Document", shortcut: "Shift+Alt+F" },
    ],
    Selection: [
      { label: "Select All", shortcut: "Ctrl+A" },
      { label: "Expand Selection", shortcut: "Shift+Alt+Right" },
      { label: "Shrink Selection", shortcut: "Shift+Alt+Left" },
      { divider: true, label: "" },
      { label: "Copy Line Up", shortcut: "Shift+Alt+Up" },
      { label: "Copy Line Down", shortcut: "Shift+Alt+Down" },
      { label: "Move Line Up", shortcut: "Alt+Up" },
      { label: "Move Line Down", shortcut: "Alt+Down" },
      { divider: true, label: "" },
      { label: "Add Cursor Above", shortcut: "Ctrl+Alt+Up" },
      { label: "Add Cursor Below", shortcut: "Ctrl+Alt+Down" },
    ],
    View: [
      { label: "Command Palette...", action: onOpenSearch, shortcut: "Ctrl+Shift+P" },
      { divider: true, label: "" },
      { label: "Explorer", action: onToggleSidebar, shortcut: "Ctrl+Shift+E" },
      { label: "Search", action: onToggleSidebar, shortcut: "Ctrl+Shift+F" },
      { label: "Source Control", action: onToggleSidebar, shortcut: "Ctrl+Shift+G" },
      { label: "Extensions", action: onToggleSidebar, shortcut: "Ctrl+Shift+X" },
      { divider: true, label: "" },
      { label: "Terminal", action: onToggleTerminal, shortcut: "Ctrl+`" },
      { divider: true, label: "" },
      { label: "Toggle Sidebar", action: onToggleSidebar, shortcut: "Ctrl+B" },
    ],
    Go: [
      { label: "Back", shortcut: "Alt+Left" },
      { label: "Forward", shortcut: "Alt+Right" },
      { divider: true, label: "" },
      { label: "Go to File...", action: onOpenSearch, shortcut: "Ctrl+P" },
      { label: "Go to Symbol in Editor...", shortcut: "Ctrl+Shift+O" },
      { label: "Go to Line/Column...", shortcut: "Ctrl+G" },
      { label: "Go to Definition", shortcut: "F12" },
      { label: "Go to References", shortcut: "Shift+F12" },
    ],
    Run: [
      { label: "Start Debugging", shortcut: "F5" },
      { label: "Run Without Debugging", shortcut: "Ctrl+F5" },
      { label: "Stop Debugging", shortcut: "Shift+F5" },
      { divider: true, label: "" },
      { label: "Toggle Breakpoint", shortcut: "F9" },
      { label: "Step Over", shortcut: "F10" },
      { label: "Step Into", shortcut: "F11" },
    ],
    Terminal: [
      { label: "New Terminal", action: onToggleTerminal, shortcut: "Ctrl+Shift+`" },
      { label: "Split Terminal", shortcut: "Ctrl+Shift+5" },
      { divider: true, label: "" },
      { label: "Run Active File" },
      { label: "Run Selected Text" },
      { divider: true, label: "" },
      { label: "Configure Terminal Settings..." },
    ],
    Help: [
      { label: "Show All Commands", action: onOpenSearch, shortcut: "Ctrl+Shift+P" },
      { label: "Documentation" },
      { label: "Release Notes" },
      { label: "Keyboard Shortcuts Reference" },
      { divider: true, label: "" },
      { label: "Toggle Developer Tools" },
      { label: "About" },
    ],
  };

  return (
    <div style={{ background: "#3c3c3c", display: "flex", alignItems: "center", height: "30px", flexShrink: 0, userSelect: "none", zIndex: 200, position: "relative" }}>
      <div style={{ width: "70px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexShrink: 0 }}>
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
            onMouseLeave={e => { if (openMenu !== name) e.currentTarget.style.background = "transparent"; }}
          >
            {name}
          </div>
          {openMenu === name && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpenMenu(null)} />
              <div style={{ position: "absolute", top: "30px", left: 0, background: "#252526", border: "1px solid #454545", borderRadius: "4px", minWidth: "240px", zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", padding: "4px 0" }}>
                {items.map((item, idx) =>
                  item.divider
                    ? <div key={idx} style={{ borderTop: "1px solid #454545", margin: "4px 0" }} />
                    : (
                      <div
                        key={idx}
                        onClick={() => { setOpenMenu(null); item.action?.(); }}
                        style={{ padding: "5px 20px 5px 20px", cursor: "pointer", color: "#cccccc", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && <span style={{ color: "#858585", fontSize: "11px", whiteSpace: "nowrap" }}>{item.shortcut}</span>}
                      </div>
                    )
                )}
              </div>
            </>
          )}
        </div>
      ))}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          onClick={onOpenSearch}
          style={{ background: "#3c3c3c", border: "1px solid #555", borderRadius: "4px", padding: "3px 60px", color: "#858585", fontSize: "12px", cursor: "text", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#888")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#555")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#858585" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#858585" strokeWidth="2"/></svg>
          Search
        </div>
      </div>
      <div style={{ width: "70px" }} />
    </div>
  );
}
