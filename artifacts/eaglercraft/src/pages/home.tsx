import { useState, useRef, useEffect, useCallback } from "react";
import type { GameVersion } from "../App";
import { executeCode } from "../executor";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/common";

interface Props {
  onLaunchGame: (v: GameVersion) => void;
}

// ─── VSCode Material Icon Theme via jsDelivr CDN ────────────────────────────
const CDN =
  "https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@latest/icons/";

const EXT_ICON: Record<string, string> = {
  ts: "typescript",
  tsx: "react_ts",
  js: "javascript",
  jsx: "react",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  pyc: "python",
  go: "go2",
  html: "html",
  htm: "html",
  css: "css",
  scss: "sass",
  sass: "sass",
  less: "less",
  json: "json",
  jsonc: "json",
  json5: "json5",
  md: "markdown",
  mdx: "markdown",
  rs: "rust",
  rb: "ruby",
  erb: "ruby",
  java: "java",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  "c++": "cpp",
  c: "c",
  h: "h",
  hpp: "h",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  fish: "fish",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  dockerfile: "docker",
  vue: "vue",
  svelte: "svelte",
  kt: "kotlin",
  kts: "kotlin",
  swift: "swift",
  lua: "lua",
  r: "r",
  scala: "scala",
  hs: "haskell",
  lhs: "haskell",
  dart: "dart",
  nim: "nim",
  zig: "zig",
  jl: "julia",
  groovy: "groovy",
  gradle: "gradle",
  php: "php",
  cs: "csharp",
  fs: "fsharp",
  fsx: "fsharp",
  ml: "ocaml",
  mli: "ocaml",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hrl: "erlang",
  sql: "database",
  db: "database",
  graphql: "graphql",
  gql: "graphql",
  prisma: "prisma",
  proto: "proto",
  gitignore: "git",
  gitattributes: "git",
  txt: "document",
  log: "log",
  xml: "xml",
  svg: "svg",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  ico: "image",
  pdf: "pdf",
  csv: "csv",
  lock: "lock",
  env: "tune",
  tf: "terraform",
  tfvars: "terraform",
  astro: "astro",
  elm: "elm",
  clj: "clojure",
  cljs: "clojure",
  ex2: "elixir",
  v: "v",
  zig2: "zig",
  nix: "nix",
  ps1: "powershell",
  psm1: "powershell",
  bat: "bat",
  sol: "solidity",
  tex: "tex",
  vue3: "vue",
};

const FALLBACK: Record<string, { bg: string; fg: string; label: string }> = {
  ts: { bg: "#3178c6", fg: "#fff", label: "TS" },
  tsx: { bg: "#61dafb", fg: "#0a2540", label: "TSX" },
  js: { bg: "#f7df1e", fg: "#1a1a1a", label: "JS" },
  jsx: { bg: "#61dafb", fg: "#0a2540", label: "JSX" },
  py: { bg: "#3572A5", fg: "#fff", label: "PY" },
  go: { bg: "#00add8", fg: "#fff", label: "GO" },
  html: { bg: "#e34c26", fg: "#fff", label: "HTML" },
  css: { bg: "#264de4", fg: "#fff", label: "CSS" },
  json: { bg: "#cbcb41", fg: "#1a1a1a", label: "JSON" },
  md: { bg: "#519aba", fg: "#fff", label: "MD" },
  rs: { bg: "#dea584", fg: "#1a1a1a", label: "RS" },
  rb: { bg: "#cc342d", fg: "#fff", label: "RB" },
  java: { bg: "#ed8b00", fg: "#fff", label: "JV" },
  cpp: { bg: "#9c4221", fg: "#fff", label: "CPP" },
  c: { bg: "#a8b9cc", fg: "#1a1a1a", label: "C" },
  sh: { bg: "#4eaa25", fg: "#fff", label: "SH" },
  yaml: { bg: "#cc1018", fg: "#fff", label: "YML" },
  git: { bg: "#f14e32", fg: "#fff", label: "GIT" },
};

const PlainFileIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke="#858585"
      strokeWidth="1.5"
      fill="none"
    />
    <polyline points="14 2 14 8 20 8" stroke="#858585" strokeWidth="1.5" />
    <line x1="8" y1="13" x2="16" y2="13" stroke="#858585" strokeWidth="1.5" />
    <line x1="8" y1="17" x2="13" y2="17" stroke="#858585" strokeWidth="1.5" />
  </svg>
);

function FileIcon({ name, ext }: { name: string; ext?: string }) {
  const [failed, setFailed] = useState(false);
  const key = name.startsWith(".git")
    ? "gitignore"
    : (ext ?? name.split(".").pop() ?? "").toLowerCase();

  if (!key || key === "txt" || key === "document") {
    return <PlainFileIcon />;
  }

  const iconName = EXT_ICON[key];
  if (iconName && !failed) {
    return (
      <img
        src={`${CDN}${iconName}.svg`}
        width="16"
        height="16"
        alt={key}
        onError={() => setFailed(true)}
        style={{ flexShrink: 0, display: "block", minWidth: "16px" }}
      />
    );
  }
  const ic = FALLBACK[key] ?? null;
  if (ic) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          background: ic.bg,
          color: ic.fg,
          fontSize: "5.5px",
          fontWeight: "bold",
          borderRadius: "2px",
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        {ic.label}
      </span>
    );
  }
  return <PlainFileIcon />;
}

function FolderIcon({ open }: { open: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src={`${CDN}${open ? "folder-open" : "folder"}.svg`}
        width="16"
        height="16"
        alt="folder"
        onError={() => setFailed(true)}
        style={{ flexShrink: 0, display: "block", minWidth: "16px" }}
      />
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
        fill={open ? "#e8bf6a" : "#dcb67a"}
      />
    </svg>
  );
}

// ─── Activity icons ──────────────────────────────────────────────────────────
const ACT = {
  explorer: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="1.5"
      />
    </svg>
  ),
  search: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
    </svg>
  ),
  git: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="18"
        cy="18"
        r="3"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <circle
        cx="6"
        cy="6"
        r="3"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <circle
        cx="6"
        cy="18"
        r="3"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <path
        d="M6 9v1a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v1"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <line
        x1="6"
        y1="9"
        x2="6"
        y2="15"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
    </svg>
  ),
  debug: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <polygon
        points="5 3 19 12 5 21 5 3"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
    </svg>
  ),
  extensions: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="2"
        width="9"
        height="9"
        rx="1"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <rect
        x="13"
        y="2"
        width="9"
        height="9"
        rx="1"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <rect
        x="2"
        y="13"
        width="9"
        height="9"
        rx="1"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
      <path
        d="M13 17.5h9M17.5 13v9"
        stroke={a ? "#cccccc" : "#858585"}
        strokeWidth="2"
      />
    </svg>
  ),
};

const SvgUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="#858585"
      strokeWidth="2"
    />
    <circle cx="12" cy="7" r="4" stroke="#858585" strokeWidth="2" />
  </svg>
);
const SvgSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="#858585" strokeWidth="2" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="#858585"
      strokeWidth="2"
    />
  </svg>
);
const SvgClose = (c = "#858585") => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" />
    <line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" />
  </svg>
);
const SvgChevR = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <polyline points="9 18 15 12 9 6" stroke="#858585" strokeWidth="2" />
  </svg>
);
const SvgChevD = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <polyline points="6 9 12 15 18 9" stroke="#858585" strokeWidth="2" />
  </svg>
);

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

const ROOT_FILES: FileEntry[] = [];

const LANGUAGES = [
  "ABAP",
  "ActionScript",
  "Ada",
  "Apex",
  "APL",
  "AppleScript",
  "Arduino",
  "Assembly",
  "Astro",
  "AutoHotkey",
  "Awk",
  "Bash",
  "Batch",
  "C",
  "C#",
  "C++",
  "Carbon",
  "Clojure",
  "CoffeeScript",
  "Crystal",
  "CSS",
  "D",
  "Dart",
  "Delphi",
  "Dockerfile",
  "Elixir",
  "Elm",
  "Erlang",
  "F#",
  "Fish",
  "Fortran",
  "Go",
  "Groovy",
  "Hack",
  "Haskell",
  "HTML",
  "Java",
  "JavaScript",
  "Julia",
  "Kotlin",
  "LaTeX",
  "Lisp",
  "Lua",
  "MATLAB",
  "Nim",
  "Nix",
  "Objective-C",
  "OCaml",
  "Pascal",
  "Perl",
  "PHP",
  "PowerShell",
  "Prolog",
  "Python",
  "R",
  "Ruby",
  "Rust",
  "Scala",
  "Shell",
  "Solidity",
  "SQL",
  "Svelte",
  "Swift",
  "Tcl",
  "TypeScript",
  "V",
  "Vala",
  "Verilog",
  "VHDL",
  "Vue",
  "Zig",
];

const STARTER: Record<string, string> = {
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
  resp := Response{Message: "Hello from Go!", Status: 200}
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

A modern web application.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## License

MIT
`,
  ".gitignore": `node_modules/
dist/
build/
.env
*.log
.DS_Store
`,
};

// ─── Syntax Highlighter ──────────────────────────────────────────────────────
const KEYWORDS: Record<string, string[]> = {
  typescript: [
    "interface",
    "type",
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "class",
    "extends",
    "implements",
    "import",
    "export",
    "from",
    "default",
    "new",
    "throw",
    "try",
    "catch",
    "finally",
    "in",
    "of",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "true",
    "false",
    "number",
    "string",
    "boolean",
    "any",
    "never",
    "never",
    "readonly",
    "enum",
    "namespace",
    "declare",
    "abstract",
    "switch",
    "case",
    "break",
    "continue",
    "delete",
    "this",
    "super",
    "static",
    "get",
    "set",
    "keyof",
    "infer",
    "satisfies",
  ],
  typescriptreact: [
    "interface",
    "type",
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "class",
    "extends",
    "implements",
    "import",
    "export",
    "from",
    "default",
    "new",
    "throw",
    "try",
    "catch",
    "finally",
    "in",
    "of",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "true",
    "false",
    "React",
    "useState",
    "useEffect",
    "useRef",
    "useCallback",
    "useMemo",
    "useContext",
    "useReducer",
    "useLayoutEffect",
    "JSX",
    "switch",
    "case",
    "break",
    "continue",
    "abstract",
    "readonly",
    "enum",
    "keyof",
  ],
  javascript: [
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "class",
    "extends",
    "import",
    "export",
    "from",
    "default",
    "new",
    "throw",
    "try",
    "catch",
    "finally",
    "in",
    "of",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "true",
    "false",
    "switch",
    "case",
    "break",
    "continue",
    "delete",
    "yield",
    "this",
    "super",
    "static",
    "get",
    "set",
    "with",
    "debugger",
    "prototype",
  ],
  javascriptreact: [
    "const",
    "let",
    "var",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "class",
    "extends",
    "import",
    "export",
    "from",
    "default",
    "new",
    "throw",
    "try",
    "catch",
    "finally",
    "in",
    "of",
    "typeof",
    "instanceof",
    "void",
    "null",
    "undefined",
    "true",
    "false",
    "switch",
    "case",
    "break",
    "continue",
    "delete",
    "yield",
    "this",
    "super",
    "static",
    "React",
    "useState",
    "useEffect",
    "useRef",
    "useCallback",
    "useMemo",
    "useContext",
  ],
  python: [
    "def",
    "class",
    "import",
    "from",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "with",
    "as",
    "try",
    "except",
    "finally",
    "raise",
    "and",
    "or",
    "not",
    "in",
    "is",
    "True",
    "False",
    "None",
    "lambda",
    "yield",
    "pass",
    "break",
    "continue",
    "global",
    "nonlocal",
    "async",
    "await",
    "print",
    "len",
    "range",
    "type",
    "str",
    "int",
    "float",
    "list",
    "dict",
    "tuple",
    "set",
    "bool",
    "self",
    "super",
    "object",
    "property",
    "classmethod",
    "staticmethod",
    "__init__",
    "__str__",
    "__repr__",
    "__len__",
    "__main__",
  ],
  go: [
    "func",
    "package",
    "import",
    "var",
    "const",
    "type",
    "struct",
    "interface",
    "return",
    "if",
    "else",
    "for",
    "range",
    "switch",
    "case",
    "default",
    "go",
    "chan",
    "select",
    "defer",
    "make",
    "new",
    "len",
    "cap",
    "append",
    "copy",
    "delete",
    "map",
    "true",
    "false",
    "nil",
    "string",
    "int",
    "int8",
    "int16",
    "int32",
    "int64",
    "uint",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "float32",
    "float64",
    "complex64",
    "complex128",
    "bool",
    "byte",
    "rune",
    "uintptr",
    "error",
    "fmt",
    "os",
    "io",
    "log",
    "sync",
    "context",
    "http",
    "json",
  ],
  rust: [
    "fn",
    "let",
    "mut",
    "const",
    "static",
    "struct",
    "enum",
    "impl",
    "trait",
    "use",
    "mod",
    "pub",
    "priv",
    "super",
    "self",
    "Self",
    "crate",
    "return",
    "if",
    "else",
    "for",
    "while",
    "loop",
    "match",
    "break",
    "continue",
    "where",
    "type",
    "as",
    "in",
    "ref",
    "extern",
    "unsafe",
    "async",
    "await",
    "move",
    "dyn",
    "Box",
    "Option",
    "Result",
    "Some",
    "None",
    "Ok",
    "Err",
    "Vec",
    "String",
    "str",
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "f32",
    "f64",
    "bool",
    "char",
    "usize",
    "isize",
    "println",
    "eprintln",
    "panic",
    "unwrap",
    "expect",
    "Clone",
    "Copy",
    "Debug",
    "Default",
    "Display",
    "Iterator",
    "Into",
    "From",
    "Send",
    "Sync",
  ],
  java: [
    "public",
    "private",
    "protected",
    "static",
    "final",
    "class",
    "interface",
    "enum",
    "extends",
    "implements",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "try",
    "catch",
    "finally",
    "throw",
    "throws",
    "new",
    "import",
    "package",
    "void",
    "int",
    "long",
    "short",
    "byte",
    "double",
    "float",
    "boolean",
    "char",
    "String",
    "Object",
    "null",
    "true",
    "false",
    "this",
    "super",
    "switch",
    "case",
    "break",
    "continue",
    "default",
    "abstract",
    "synchronized",
    "volatile",
    "transient",
    "native",
    "instanceof",
    "strictfp",
    "System",
    "out",
    "println",
    "ArrayList",
    "HashMap",
    "List",
    "Map",
    "Set",
    "Optional",
    "Stream",
    "override",
    "annotation",
  ],
  c: [
    "int",
    "long",
    "short",
    "char",
    "double",
    "float",
    "void",
    "unsigned",
    "signed",
    "const",
    "static",
    "extern",
    "register",
    "volatile",
    "auto",
    "restrict",
    "inline",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "goto",
    "struct",
    "union",
    "enum",
    "typedef",
    "sizeof",
    "NULL",
    "true",
    "false",
    "include",
    "define",
    "ifdef",
    "ifndef",
    "endif",
    "elif",
    "undef",
    "pragma",
    "error",
    "warning",
    "printf",
    "scanf",
    "malloc",
    "free",
    "calloc",
    "realloc",
    "memcpy",
    "memset",
    "strlen",
    "strcmp",
    "strcpy",
    "fprintf",
    "stderr",
    "stdin",
    "stdout",
    "FILE",
  ],
  cpp: [
    "int",
    "long",
    "short",
    "char",
    "double",
    "float",
    "void",
    "unsigned",
    "signed",
    "const",
    "static",
    "extern",
    "register",
    "volatile",
    "auto",
    "inline",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "return",
    "goto",
    "struct",
    "union",
    "enum",
    "typedef",
    "sizeof",
    "nullptr",
    "NULL",
    "true",
    "false",
    "class",
    "public",
    "private",
    "protected",
    "virtual",
    "override",
    "final",
    "new",
    "delete",
    "template",
    "typename",
    "namespace",
    "using",
    "friend",
    "operator",
    "mutable",
    "constexpr",
    "decltype",
    "explicit",
    "this",
    "static_cast",
    "dynamic_cast",
    "reinterpret_cast",
    "const_cast",
    "std",
    "cout",
    "cin",
    "cerr",
    "endl",
    "vector",
    "string",
    "map",
    "set",
    "pair",
    "unique_ptr",
    "shared_ptr",
    "make_unique",
    "make_shared",
    "include",
    "define",
  ],
  ruby: [
    "def",
    "end",
    "class",
    "module",
    "require",
    "require_relative",
    "include",
    "extend",
    "prepend",
    "attr_reader",
    "attr_writer",
    "attr_accessor",
    "return",
    "if",
    "elsif",
    "else",
    "unless",
    "case",
    "when",
    "while",
    "until",
    "for",
    "do",
    "begin",
    "rescue",
    "ensure",
    "raise",
    "retry",
    "yield",
    "self",
    "super",
    "true",
    "false",
    "nil",
    "and",
    "or",
    "not",
    "then",
    "in",
    "puts",
    "print",
    "p",
    "pp",
    "lambda",
    "proc",
    "block",
    "new",
    "initialize",
    "each",
    "map",
    "select",
    "reject",
    "reduce",
    "inject",
    "find",
    "any",
    "all",
    "none",
    "count",
    "first",
    "last",
    "flatten",
    "compact",
    "uniq",
    "sort",
    "reverse",
    "freeze",
    "frozen",
    "dup",
    "clone",
    "tap",
    "then",
    "itself",
  ],
  php: [
    "echo",
    "print",
    "var_dump",
    "var_export",
    "function",
    "class",
    "interface",
    "trait",
    "extends",
    "implements",
    "abstract",
    "final",
    "return",
    "if",
    "elseif",
    "else",
    "foreach",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "namespace",
    "use",
    "public",
    "private",
    "protected",
    "static",
    "null",
    "true",
    "false",
    "array",
    "string",
    "int",
    "float",
    "bool",
    "void",
    "mixed",
    "self",
    "parent",
    "this",
    "require",
    "include",
    "require_once",
    "include_once",
    "isset",
    "unset",
    "empty",
    "list",
    "match",
    "readonly",
    "enum",
    "fn",
    "arrow",
    "yield",
    "from",
    "instanceof",
    "and",
    "or",
    "xor",
    "print_r",
    "sprintf",
    "printf",
    "strlen",
    "strpos",
    "str_replace",
    "array_map",
    "array_filter",
    "array_push",
    "array_pop",
    "count",
    "implode",
    "explode",
  ],
  bash: [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "do",
    "done",
    "while",
    "until",
    "case",
    "esac",
    "in",
    "select",
    "function",
    "return",
    "exit",
    "break",
    "continue",
    "local",
    "readonly",
    "declare",
    "typeset",
    "export",
    "unset",
    "shift",
    "true",
    "false",
    "echo",
    "printf",
    "read",
    "source",
    "alias",
    "unalias",
    "set",
    "unset",
    "test",
    "let",
    "expr",
    "eval",
    "exec",
    "trap",
    "wait",
    "jobs",
    "bg",
    "fg",
    "kill",
    "sleep",
    "pwd",
    "cd",
    "ls",
    "mkdir",
    "rmdir",
    "rm",
    "cp",
    "mv",
    "cat",
    "grep",
    "sed",
    "awk",
    "cut",
    "sort",
    "uniq",
    "wc",
    "find",
    "xargs",
    "head",
    "tail",
    "diff",
    "chmod",
    "chown",
    "chgrp",
    "curl",
    "wget",
    "ssh",
    "scp",
    "tar",
    "gzip",
    "gunzip",
    "zip",
    "unzip",
  ],
  kotlin: [
    "fun",
    "val",
    "var",
    "class",
    "object",
    "data",
    "sealed",
    "abstract",
    "open",
    "override",
    "companion",
    "interface",
    "enum",
    "annotation",
    "inline",
    "infix",
    "operator",
    "tailrec",
    "external",
    "if",
    "else",
    "when",
    "for",
    "while",
    "do",
    "return",
    "null",
    "true",
    "false",
    "is",
    "!is",
    "in",
    "!in",
    "as",
    "as?",
    "by",
    "it",
    "this",
    "super",
    "constructor",
    "init",
    "package",
    "import",
    "public",
    "private",
    "protected",
    "internal",
    "suspend",
    "coroutine",
    "launch",
    "async",
    "withContext",
    "runBlocking",
    "flow",
    "collect",
    "emit",
    "delay",
    "let",
    "run",
    "also",
    "apply",
    "with",
    "takeIf",
    "takeUnless",
    "repeat",
    "listOf",
    "mutableListOf",
    "mapOf",
    "mutableMapOf",
    "setOf",
    "mutableSetOf",
    "arrayOf",
    "sequenceOf",
    "String",
    "Int",
    "Long",
    "Float",
    "Double",
    "Boolean",
    "Char",
    "Unit",
    "Any",
    "Nothing",
    "Number",
    "Pair",
    "Triple",
    "List",
    "Map",
    "Set",
    "Array",
  ],
  swift: [
    "func",
    "var",
    "let",
    "class",
    "struct",
    "enum",
    "protocol",
    "extension",
    "actor",
    "import",
    "return",
    "if",
    "else",
    "guard",
    "for",
    "while",
    "repeat",
    "switch",
    "case",
    "break",
    "continue",
    "default",
    "throw",
    "throws",
    "rethrows",
    "try",
    "catch",
    "init",
    "deinit",
    "self",
    "Self",
    "super",
    "true",
    "false",
    "nil",
    "in",
    "is",
    "as",
    "as?",
    "as!",
    "new",
    "weak",
    "unowned",
    "static",
    "final",
    "override",
    "public",
    "private",
    "internal",
    "fileprivate",
    "open",
    "lazy",
    "mutating",
    "nonmutating",
    "get",
    "set",
    "willSet",
    "didSet",
    "typealias",
    "associatedtype",
    "where",
    "some",
    "any",
    "@escaping",
    "@autoclosure",
    "@objc",
    "@available",
    "@discardableResult",
    "String",
    "Int",
    "Double",
    "Float",
    "Bool",
    "Character",
    "Array",
    "Dictionary",
    "Set",
    "Optional",
    "Result",
    "Error",
    "print",
    "fatalError",
    "precondition",
    "assert",
    "defer",
    "async",
    "await",
    "Task",
    "MainActor",
  ],
  dart: [
    "void",
    "var",
    "final",
    "const",
    "late",
    "required",
    "class",
    "extends",
    "implements",
    "mixin",
    "abstract",
    "sealed",
    "interface",
    "base",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "default",
    "try",
    "catch",
    "on",
    "finally",
    "throw",
    "rethrow",
    "new",
    "import",
    "export",
    "part",
    "of",
    "library",
    "as",
    "show",
    "hide",
    "async",
    "await",
    "yield",
    "sync",
    "true",
    "false",
    "null",
    "this",
    "super",
    "static",
    "factory",
    "get",
    "set",
    "typedef",
    "covariant",
    "dynamic",
    "external",
    "is",
    "as",
    "in",
    "String",
    "int",
    "double",
    "bool",
    "num",
    "List",
    "Map",
    "Set",
    "Future",
    "Stream",
    "Iterable",
    "Object",
    "Enum",
    "Symbol",
    "Never",
    "print",
    "debugPrint",
  ],
  lua: [
    "and",
    "break",
    "do",
    "else",
    "elseif",
    "end",
    "false",
    "for",
    "function",
    "goto",
    "if",
    "in",
    "local",
    "nil",
    "not",
    "or",
    "repeat",
    "return",
    "then",
    "true",
    "until",
    "while",
    "print",
    "require",
    "type",
    "pairs",
    "ipairs",
    "next",
    "select",
    "tostring",
    "tonumber",
    "rawget",
    "rawset",
    "rawequal",
    "rawlen",
    "pcall",
    "xpcall",
    "error",
    "assert",
    "load",
    "dofile",
    "loadfile",
    "loadstring",
    "collectgarbage",
    "coroutine",
    "table",
    "string",
    "math",
    "io",
    "os",
    "debug",
    "utf8",
    "package",
    "io.read",
    "io.write",
    "table.insert",
    "table.remove",
    "table.concat",
    "string.format",
    "string.find",
    "string.match",
    "math.floor",
    "math.ceil",
    "math.random",
  ],
  sql: [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "FULL",
    "CROSS",
    "OUTER",
    "ON",
    "AS",
    "AND",
    "OR",
    "NOT",
    "NULL",
    "IS",
    "IN",
    "LIKE",
    "ILIKE",
    "BETWEEN",
    "ORDER",
    "BY",
    "GROUP",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "UNION",
    "ALL",
    "DISTINCT",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "TABLE",
    "DROP",
    "ALTER",
    "ADD",
    "COLUMN",
    "INDEX",
    "PRIMARY",
    "KEY",
    "FOREIGN",
    "REFERENCES",
    "UNIQUE",
    "DEFAULT",
    "CONSTRAINT",
    "CHECK",
    "VIEW",
    "MATERIALIZED",
    "TRIGGER",
    "PROCEDURE",
    "FUNCTION",
    "RETURNS",
    "LANGUAGE",
    "BEGIN",
    "END",
    "COMMIT",
    "ROLLBACK",
    "TRANSACTION",
    "SAVEPOINT",
    "RELEASE",
    "IF",
    "EXISTS",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "COALESCE",
    "NULLIF",
    "CAST",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "ROUND",
    "FLOOR",
    "CEIL",
    "NOW",
    "CURRENT_DATE",
    "CURRENT_TIME",
    "EXTRACT",
    "DATE_TRUNC",
    "CONCAT",
    "UPPER",
    "LOWER",
    "TRIM",
    "LENGTH",
    "SUBSTRING",
    "REPLACE",
    "ROW_NUMBER",
    "RANK",
    "DENSE_RANK",
    "OVER",
    "PARTITION",
    "WITH",
    "RECURSIVE",
    "EXPLAIN",
    "ANALYZE",
    "VACUUM",
  ],
  scala: [
    "def",
    "val",
    "var",
    "class",
    "object",
    "trait",
    "case",
    "abstract",
    "sealed",
    "final",
    "override",
    "extends",
    "with",
    "import",
    "package",
    "type",
    "if",
    "else",
    "for",
    "while",
    "do",
    "return",
    "null",
    "true",
    "false",
    "new",
    "this",
    "super",
    "match",
    "yield",
    "lazy",
    "implicit",
    "given",
    "using",
    "inline",
    "opaque",
    "erased",
    "extension",
    "derives",
    "enum",
    "then",
    "try",
    "catch",
    "finally",
    "throw",
    "while",
    "until",
    "to",
    "by",
    "String",
    "Int",
    "Long",
    "Float",
    "Double",
    "Boolean",
    "Char",
    "Unit",
    "Any",
    "Nothing",
    "AnyRef",
    "AnyVal",
    "Byte",
    "Short",
    "BigInt",
    "BigDecimal",
    "List",
    "Vector",
    "Array",
    "Map",
    "Set",
    "Option",
    "Some",
    "None",
    "Either",
    "Left",
    "Right",
    "Try",
    "Success",
    "Failure",
    "Future",
    "Seq",
    "IndexedSeq",
    "Iterable",
    "Iterator",
    "Tuple",
  ],
  haskell: [
    "where",
    "let",
    "in",
    "do",
    "if",
    "then",
    "else",
    "case",
    "of",
    "data",
    "type",
    "newtype",
    "class",
    "instance",
    "module",
    "import",
    "qualified",
    "as",
    "hiding",
    "deriving",
    "forall",
    "exists",
    "infixl",
    "infixr",
    "infix",
    "foreign",
    "return",
    "show",
    "read",
    "map",
    "filter",
    "foldr",
    "foldl",
    "foldl1",
    "foldr1",
    "head",
    "tail",
    "last",
    "init",
    "null",
    "length",
    "take",
    "drop",
    "zip",
    "unzip",
    "zipWith",
    "lines",
    "words",
    "unlines",
    "unwords",
    "Just",
    "Nothing",
    "Left",
    "Right",
    "IO",
    "String",
    "Int",
    "Integer",
    "Double",
    "Float",
    "Bool",
    "Char",
    "Maybe",
    "Either",
    "Ordering",
    "EQ",
    "LT",
    "GT",
    "True",
    "False",
    "otherwise",
    "undefined",
    "error",
    "seq",
    "id",
    "const",
    "flip",
    "curry",
    "uncurry",
    "fst",
    "snd",
    "putStrLn",
    "putStr",
    "getLine",
    "print",
    "interact",
    "readFile",
    "writeFile",
  ],
  elixir: [
    "def",
    "defp",
    "defmodule",
    "defprotocol",
    "defimpl",
    "defmacro",
    "defmacrop",
    "defstruct",
    "defexception",
    "defguard",
    "defguardp",
    "defdelegate",
    "do",
    "end",
    "fn",
    "if",
    "unless",
    "cond",
    "case",
    "receive",
    "send",
    "try",
    "catch",
    "rescue",
    "after",
    "for",
    "with",
    "when",
    "and",
    "or",
    "not",
    "in",
    "true",
    "false",
    "nil",
    "is_nil",
    "is_atom",
    "is_binary",
    "is_boolean",
    "is_float",
    "is_integer",
    "is_list",
    "is_map",
    "is_number",
    "is_pid",
    "is_port",
    "is_reference",
    "is_tuple",
    "IO",
    "Enum",
    "List",
    "Map",
    "String",
    "Keyword",
    "Agent",
    "Task",
    "GenServer",
    "Supervisor",
    "Application",
    "Process",
    "Node",
    "System",
    "File",
    "Path",
    "Logger",
    "Jason",
    "Plug",
    "Phoenix",
  ],
  r: [
    "if",
    "else",
    "for",
    "while",
    "repeat",
    "function",
    "return",
    "next",
    "break",
    "in",
    "TRUE",
    "FALSE",
    "NULL",
    "NA",
    "NA_integer_",
    "NA_real_",
    "NA_complex_",
    "NA_character_",
    "Inf",
    "NaN",
    "LETTERS",
    "letters",
    "pi",
    "T",
    "F",
    "library",
    "require",
    "source",
    "print",
    "cat",
    "message",
    "warning",
    "stop",
    "paste",
    "paste0",
    "sprintf",
    "format",
    "c",
    "list",
    "vector",
    "matrix",
    "data.frame",
    "data.table",
    "tibble",
    "array",
    "factor",
    "table",
    "read.csv",
    "write.csv",
    "readLines",
    "writeLines",
    "apply",
    "lapply",
    "sapply",
    "vapply",
    "tapply",
    "mapply",
    "Map",
    "Reduce",
    "Filter",
    "which",
    "subset",
    "merge",
    "aggregate",
    "sum",
    "mean",
    "median",
    "sd",
    "var",
    "min",
    "max",
    "range",
    "length",
    "nrow",
    "ncol",
    "dim",
    "str",
    "summary",
    "head",
    "tail",
    "rbind",
    "cbind",
    "ggplot",
    "aes",
    "geom_point",
    "geom_line",
    "geom_bar",
    "dplyr",
    "tidyr",
    "ggplot2",
    "magrittr",
  ],
  css: [],
  scss: [],
  html: [],
  json: [],
  markdown: [],
  plaintext: [],
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function spanC(color: string, text: string) {
  return `<span style="color:${color}">${text}</span>`;
}

function highlightHTML(code: string): string {
  let result = "";
  let i = 0;
  while (i < code.length) {
    if (code.startsWith("<!--", i)) {
      const end = code.indexOf("-->", i + 4);
      const block = end === -1 ? code.slice(i) : code.slice(i, end + 3);
      result += spanC("#6a9955", esc(block));
      i = end === -1 ? code.length : end + 3;
      continue;
    }
    if (code.startsWith("<!", i)) {
      const end = code.indexOf(">", i);
      if (end === -1) {
        result += esc(code.slice(i));
        i = code.length;
        continue;
      }
      result += spanC("#569cd6", esc(code.slice(i, end + 1)));
      i = end + 1;
      continue;
    }
    if (code[i] === "<") {
      const isClose = code[i + 1] === "/";
      let j = i + 1;
      if (isClose) j++;
      while (j < code.length && /[\w:-]/.test(code[j])) j++;
      const tagName = code.slice(isClose ? i + 2 : i + 1, j).toLowerCase();
      result += spanC("#808080", esc(isClose ? "</" : "<"));
      result += spanC("#4ec9b0", esc(tagName));

      let currentAttrName = "";

      while (
        j < code.length &&
        code[j] !== ">" &&
        !(code[j] === "/" && code[j + 1] === ">")
      ) {
        if (/\s/.test(code[j])) {
          result += esc(code[j]);
          j++;
          continue;
        }
        let ak = j;
        while (ak < code.length && /[\w:.-]/.test(code[ak])) ak++;
        if (ak > j) {
          currentAttrName = code.slice(j, ak).toLowerCase();
          result += spanC("#9cdcfe", esc(code.slice(j, ak)));
          j = ak;
          if (code[j] === "=") {
            result += spanC("#808080", "=");
            j++;
            const q = code[j];
            if (q === '"' || q === "'") {
              let vk = j + 1;
              while (vk < code.length && code[vk] !== q) vk++;
              const rawVal = code.slice(j + 1, vk);
              if (/^on[a-z]/.test(currentAttrName) && rawVal.trim()) {
                result += spanC("#808080", esc(q));
                result += highlight(rawVal, "javascript");
                result += spanC("#808080", esc(q));
              } else {
                result += spanC("#ce9178", esc(code.slice(j, vk + 1)));
              }
              j = vk + 1;
            }
          }
          continue;
        }
        result += esc(code[j]);
        j++;
      }
      if (code[j] === "/" && code[j + 1] === ">") {
        result += spanC("#808080", "/&gt;");
        j += 2;
      } else if (code[j] === ">") {
        result += spanC("#808080", "&gt;");
        j++;
        if (tagName === "script" && !isClose) {
          const closeTag = "</script>";
          const endScript = code.toLowerCase().indexOf(closeTag, j);
          if (endScript === -1) {
            result += esc(code.slice(j));
            i = code.length;
            continue;
          }
          const scriptContent = code.slice(j, endScript);
          result += highlight(scriptContent, "javascript");
          result +=
            spanC("#808080", "&lt;/") +
            spanC("#4ec9b0", "script") +
            spanC("#808080", "&gt;");
          j = endScript + closeTag.length;
        }
        if (tagName === "style" && !isClose) {
          const closeTag = "</style>";
          const endStyle = code.toLowerCase().indexOf(closeTag, j);
          if (endStyle === -1) {
            result += esc(code.slice(j));
            i = code.length;
            continue;
          }
          const styleContent = code.slice(j, endStyle);
          result += highlightCSS(styleContent);
          result +=
            spanC("#808080", "&lt;/") +
            spanC("#4ec9b0", "style") +
            spanC("#808080", "&gt;");
          j = endStyle + closeTag.length;
        }
      }
      i = j;
      continue;
    }
    result += esc(code[i]);
    i++;
  }
  return result;
}

function highlightYAML(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      const e = esc(line);
      if (/^\s*#/.test(line)) return spanC("#6a9955", e);
      const kv = line.match(/^(\s*)([\w.-]+)(\s*:\s*)(.*)$/);
      if (kv) {
        const [, ws, key, sep, val] = kv;
        let coloredVal = val;
        if (/^"/.test(val) || /^'/.test(val))
          coloredVal = spanC("#ce9178", esc(val));
        else if (/^(true|false|yes|no|on|off)$/i.test(val.trim()))
          coloredVal = spanC("#569cd6", esc(val));
        else if (/^-?\d/.test(val.trim()))
          coloredVal = spanC("#b5cea8", esc(val));
        else if (/^\|/.test(val.trim()) || /^>/.test(val.trim()))
          coloredVal = spanC("#ce9178", esc(val));
        else coloredVal = esc(val);
        return (
          esc(ws) +
          spanC("#9cdcfe", esc(key)) +
          spanC("#808080", esc(sep)) +
          coloredVal
        );
      }
      if (/^\s*-\s/.test(line)) {
        return line.replace(
          /^(\s*)(-)(\s+)(.*)$/,
          (_, ws, dash, sp, rest) =>
            esc(ws) + spanC("#569cd6", "-") + esc(sp) + esc(rest),
        );
      }
      return e;
    })
    .join("\n");
}

function highlightCSS(code: string): string {
  let result = "";
  let i = 0;
  while (i < code.length) {
    if (code[i] === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const block = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      result += spanC("#6a9955", esc(block));
      i = end === -1 ? code.length : end + 2;
      continue;
    }
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== q) j++;
      result += spanC("#ce9178", esc(code.slice(i, j + 1)));
      i = j + 1;
      continue;
    }
    if (code[i] === "@") {
      let j = i + 1;
      while (j < code.length && /[\w-]/.test(code[j])) j++;
      result += spanC("#c586c0", esc(code.slice(i, j)));
      i = j;
      continue;
    }
    const propMatch = code.slice(i).match(/^([\w-]+)(\s*:)/);
    if (
      propMatch &&
      (i === 0 ||
        /[\n;{]/.test(code[i - 1]) ||
        /^\s*$/.test(code.slice(code.lastIndexOf("\n", i) + 1, i)))
    ) {
      result += spanC("#9cdcfe", esc(propMatch[1]));
      i += propMatch[1].length;
      continue;
    }
    if (code[i] === "." || code[i] === "#") {
      let j = i + 1;
      while (j < code.length && /[\w-]/.test(code[j])) j++;
      result += spanC("#d7ba7d", esc(code.slice(i, j)));
      i = j;
      continue;
    }
    if (/\d/.test(code[i]) && (i === 0 || /\W/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[\d.%]/.test(code[j])) j++;
      while (j < code.length && /[a-zA-Z]/.test(code[j])) j++;
      result += spanC("#b5cea8", esc(code.slice(i, j)));
      i = j;
      continue;
    }
    result += esc(code[i]);
    i++;
  }
  return result;
}

function highlight(code: string, lang: string): string {
  if (lang === "html" || lang === "xml") return highlightHTML(code);
  if (lang === "yaml") return highlightYAML(code);
  if (lang === "css" || lang === "scss" || lang === "less")
    return highlightCSS(code);

  if (lang === "json" || lang === "jsonc") {
    return esc(code)
      .replace(/("(?:[^"\\]|\\.)*")\s*:/g, `${spanC("#9cdcfe", "$1")}:`)
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, (_, s) => `: ${spanC("#ce9178", s)}`)
      .replace(/\b(true|false|null)\b/g, (_, w) => spanC("#569cd6", w))
      .replace(/\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, (_, n) =>
        spanC("#b5cea8", n),
      );
  }

  if (lang === "markdown") {
    return code
      .split("\n")
      .map((line) => {
        const e = esc(line);
        if (/^#{1,6} /.test(line)) return spanC("#569cd6", e);
        if (/^(---|\*\*\*|___)/.test(line.trim())) return spanC("#858585", e);
        if (/^\s*[-*+] /.test(line))
          return e.replace(/([-*+])/, spanC("#569cd6", "$1"));
        if (/^\s*\d+\. /.test(line))
          return e.replace(/(\d+\.)/, spanC("#b5cea8", "$1"));
        if (/^(>+) /.test(line))
          return e.replace(/^((?:&gt;)+)/, spanC("#6a9955", "$1"));
        if (/^```/.test(line)) return spanC("#d7ba7d", e);
        return e
          .replace(/(`[^`]+`)/g, spanC("#ce9178", "$1"))
          .replace(
            /(\*\*[^*]+\*\*)/g,
            `<strong style="color:#d4d4d4">$1</strong>`,
          )
          .replace(/(\*[^*]+\*)/g, `<em style="color:#d4d4d4">$1</em>`)
          .replace(/(\[([^\]]+)\]\([^)]+\))/g, spanC("#4ec9b0", "$1"));
      })
      .join("\n");
  }

  const kws = KEYWORDS[lang] ?? [];
  const hashComment = [
    "python",
    "ruby",
    "bash",
    "r",
    "elixir",
    "perl",
    "coffeescript",
    "sh",
    "toml",
    "nim",
    "crystal",
    "julia",
    "zig",
  ];
  const dashComment = ["lua", "sql", "haskell", "elm", "ada"];
  const pctComment = ["latex", "tex", "matlab", "erlang"];

  let result = "";
  let i = 0;
  while (i < code.length) {
    const ch = code[i];

    if (ch === "-" && code[i + 1] === "-" && dashComment.includes(lang)) {
      const end = code.indexOf("\n", i);
      const line = end === -1 ? code.slice(i) : code.slice(i, end);
      result += spanC("#6a9955", esc(line));
      i = end === -1 ? code.length : end;
      continue;
    }
    if (ch === "%" && pctComment.includes(lang)) {
      const end = code.indexOf("\n", i);
      result += spanC(
        "#6a9955",
        esc(end === -1 ? code.slice(i) : code.slice(i, end)),
      );
      i = end === -1 ? code.length : end;
      continue;
    }
    if (ch === "#" && hashComment.includes(lang)) {
      const end = code.indexOf("\n", i);
      result += spanC(
        "#6a9955",
        esc(end === -1 ? code.slice(i) : code.slice(i, end)),
      );
      i = end === -1 ? code.length : end;
      continue;
    }
    if (ch === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      result += spanC(
        "#6a9955",
        esc(end === -1 ? code.slice(i) : code.slice(i, end)),
      );
      i = end === -1 ? code.length : end;
      continue;
    }
    if (ch === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const block = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      result += spanC("#6a9955", esc(block));
      i = end === -1 ? code.length : end + 2;
      continue;
    }

    if (ch === "@" && /[a-zA-Z_]/.test(code[i + 1] ?? "")) {
      let j = i + 1;
      while (j < code.length && /[\w.]/.test(code[j])) j++;
      result += spanC("#d7ba7d", esc(code.slice(i, j)));
      i = j;
      continue;
    }

    if (ch === '"') {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      result += spanC("#ce9178", esc(code.slice(i, j)));
      i = j;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === "'") {
          j++;
          break;
        }
        j++;
      }
      result += spanC("#ce9178", esc(code.slice(i, j)));
      i = j;
      continue;
    }
    if (ch === "`") {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === "`") {
          j++;
          break;
        }
        j++;
      }
      result += spanC("#ce9178", esc(code.slice(i, j)));
      i = j;
      continue;
    }

    if (/\d/.test(ch) && (i === 0 || /\W/.test(code[i - 1]))) {
      let j = i;
      if (ch === "0" && (code[j + 1] === "x" || code[j + 1] === "X")) {
        j += 2;
        while (j < code.length && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[\d._]/.test(code[j])) j++;
        if (j < code.length && (code[j] === "e" || code[j] === "E")) {
          j++;
          if (code[j] === "+" || code[j] === "-") j++;
          while (j < code.length && /\d/.test(code[j])) j++;
        }
      }
      while (j < code.length && /[a-zA-Z]/.test(code[j])) j++;
      result += spanC("#b5cea8", esc(code.slice(i, j)));
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < code.length && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      const prevNonWS = code.slice(0, i).trimEnd();
      const afterDot = prevNonWS.endsWith(".");

      if (kws.includes(word)) {
        result += spanC("#569cd6", esc(word));
      } else if (afterDot) {
        if (j < code.length && code[j] === "(") {
          result += spanC("#dcdcaa", esc(word));
        } else {
          result += spanC("#9cdcfe", esc(word));
        }
      } else if (/^[A-Z]/.test(word) && word.length > 1) {
        result += spanC("#4ec9b0", esc(word));
      } else if (j < code.length && code[j] === "(") {
        result += spanC("#dcdcaa", esc(word));
      } else {
        result += esc(word);
      }
      i = j;
      continue;
    }

    if (
      ch === "=" ||
      ch === "!" ||
      ch === "<" ||
      ch === ">" ||
      ch === "&" ||
      ch === "|" ||
      ch === "?" ||
      ch === ":" ||
      ch === "+" ||
      ch === "-" ||
      ch === "*" ||
      ch === "/" ||
      ch === "%" ||
      ch === "^" ||
      ch === "~"
    ) {
      let j = i;
      while (
        j < code.length &&
        /[=!<>&|?:+\-*/%^~]/.test(code[j]) &&
        !/[{}\[\]();,\s]/.test(code[j])
      )
        j++;
      if (j === i) j++;
      result += spanC("#d4d4d4", esc(code.slice(i, j)));
      i = j;
      continue;
    }

    result += esc(ch);
    i++;
  }
  return result;
}

// ─── Terminal ────────────────────────────────────────────────────────────────
let CWD = "~";

async function runCmd(
  input: string,
  files: FileEntry[],
  fileContents: Record<string, string>,
  activeTab: string | null,
  stdinContent: string,
): Promise<string> {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  const cmd = parts[0] ?? "";
  const args = parts.slice(1);

  // Helper to find a file by name or id
  const findFile = (name?: string) => {
    if (!name) {
      return activeTab
        ? (files.find((f) => f.id === activeTab && !f.isFolder) ?? null)
        : null;
    }
    return (
      files.find((f) => !f.isFolder && (f.name === name || f.id === name)) ??
      null
    );
  };

  // Helper to run a code file (existing logic)
  const runFile = async (name?: string, forcedLang?: string) => {
    const f = findFile(name);
    if (!f) {
      return name ? `${name}: No such file` : "No active file to run.";
    }
    const code = fileContents[f.id] ?? fileContents[f.name] ?? "";
    if (!code.trim()) {
      return `${f.name} is empty. The editor did not save the code.`;
    }
    const language = forcedLang ?? languageFromFileName(f.name);
    if (["html", "css", "json", "markdown", "plaintext"].includes(language)) {
      return `${f.name} is not a runnable program file.`;
    }
    return await executeOnline({
      language,
      filename: f.name,
      code,
      stdin: stdinContent,
    });
  };

  // --- New helpers for mock responses ---
  const mockNpmInstall = (packages: string[]) => {
    if (packages.length === 0) {
      return `added 123 packages in 2s\n\n123 packages are looking for funding\n  run \`npm fund\` for details`;
    }
    return `added ${packages.length} packages in 1s`;
  };

  const mockPipInstall = (packages: string[]) => {
    if (packages.length === 0) return "Requirement already satisfied: pip in ./.venv/lib/python3.11/site-packages (22.3.1)";
    return packages.map(pkg =>
      `Collecting ${pkg}\n  Downloading ${pkg}-1.0.0-py3-none-any.whl (10 kB)\nInstalling collected packages: ${pkg}\nSuccessfully installed ${pkg}-1.0.0`
    ).join("\n");
  };

  const mockGitStatus = () => {
    return `On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`;
  };

  const mockGitAdd = (files: string[]) => {
    return files.length ? `added ${files.join(' ')}` : "Nothing specified, nothing added.";
  };

  const mockGitCommit = (msg?: string) => {
    return msg ? `[main abc1234] ${msg}\n 1 file changed, 1 insertion(+)` : "Aborting commit due to empty commit message.";
  };

  // --- Command handling ---
  switch (cmd) {
    case "":
      return "";
    case "clear":
      return "\x00CLEAR";
    case "help":
      return [
        "Available commands:",
        "  help                 Show this help",
        "  clear                Clear terminal",
        "  ls                   List files and folders",
        "  cd <dir>             Change directory (supports .., ~, /)",
        "  pwd                  Show current directory",
        "  echo <text>          Print text",
        "  cat <file>           Show file content",
        "  run [file]           Run the active file or specified file",
        "  python|python3 <file> Run a Python file",
        "  node <file>          Run a JavaScript file",
        "  tsx <file>           Run a TypeScript file",
        "  gcc <file.c>         Compile C file",
        "  g++ <file.cpp>       Compile C++ file",
        "  java <file.java>     Run Java file",
        "  go run <file.go>     Run Go file",
        "  rustc <file.rs>      Compile Rust file",
        "  ruby <file.rb>       Run Ruby file",
        "  php <file.php>       Run PHP file",
        "  npm install [pkgs]   Mock npm install",
        "  npm start            Mock npm start",
        "  npm run build        Mock npm run build",
        "  pip install [pkgs]   Mock pip install",
        "  pip freeze           Mock pip freeze",
        "  git status           Mock git status",
        "  git add <files>      Mock git add",
        "  git commit -m <msg>  Mock git commit",
        "  dotnet run           Mock dotnet run",
        "  dotnet build         Mock dotnet build",
        "  csc <file.cs>        Mock C# compiler",
        "  mkdir <name>         Create a new folder (mock)",
        "  touch <name>         Create a new file (mock)",
        "  rm <name>            Remove file/folder (mock)",
        "  exit                 Close terminal (mock)"
      ].join("\n");
    case "ls": {
      // For simplicity, list all files regardless of CWD (original behavior)
      return (
        [
          ...files.filter((f) => f.isFolder).map((f) => f.name + "/"),
          ...files.filter((f) => !f.isFolder).map((f) => f.name),
        ].join("  ") || "(empty)"
      );
    }
    case "cd": {
      const target = args[0] || "~";
      if (target === "~") {
        CWD = "~";
      } else if (target === "..") {
        // simple: go to parent if not at root
        if (CWD !== "~") {
          const parts = CWD.split("/");
          parts.pop();
          CWD = parts.join("/") || "~";
        }
      } else if (target.startsWith("/")) {
        // absolute path – just set to it for demo (no real FS)
        CWD = target;
      } else if (target === ".") {
        // stay
      } else {
        // relative: append to current
        if (CWD === "~") {
          CWD = `~/${target}`;
        } else {
          CWD = `${CWD}/${target}`;
        }
      }
      return "";
    }
    case "pwd":
      return CWD;
    case "echo":
      return args.join(" ");
    case "cat": {
      const f = findFile(args[0]);
      if (!f) return `cat: ${args[0] ?? ""}: No such file`;
      return fileContents[f.id] ?? fileContents[f.name] ?? "";
    }
    case "run":
      return await runFile(args[0]);
    case "python":
    case "python3":
      return await runFile(args[0], "python");
    case "node":
      return await runFile(args[0], "javascript");
    case "tsx":
    case "ts-node":
      return await runFile(args[0], "typescript");
    case "gcc":
      return await runFile(
        args.find((a) => a.endsWith(".c")),
        "c",
      );
    case "g++":
    case "clang++":
      return await runFile(
        args.find((a) => /\.(cpp|cc|cxx)$/.test(a)),
        "cpp",
      );
    case "java":
      return await runFile(args[0], "java");
    case "go":
      return args[0] === "run"
        ? await runFile(args[1], "go")
        : "Use: go run main.go";
    case "rustc":
      return await runFile(args[0], "rust");
    case "ruby":
      return await runFile(args[0], "ruby");
    case "php":
      return await runFile(args[0], "php");

    // --- New mock commands ---
    case "npm": {
      const sub = args[0] || "";
      const rest = args.slice(1);
      switch (sub) {
        case "install":
          return mockNpmInstall(rest);
        case "start":
          return "> project@1.0.0 start\n> node server.js\n\nServer running on http://localhost:3000";
        case "run":
          if (rest[0] === "build") {
            return "> project@1.0.0 build\n> tsc && vite build\n\n✓ built in 2.3s";
          }
          return `Unknown npm run script: ${rest[0] || ""}`;
        default:
          return `npm: '${sub}' is not a known command. Try 'npm install', 'npm start', 'npm run build'.`;
      }
    }
    case "pip": {
      const sub = args[0] || "";
      const rest = args.slice(1);
      switch (sub) {
        case "install":
          return mockPipInstall(rest);
        case "freeze":
          return "certifi==2022.12.07\ncharset-normalizer==3.0.1\nidna==3.4\nrequests==2.28.2\nurllib3==1.26.14";
        case "list":
          return "Package    Version\n---------- -------\npip        22.3.1\nrequests   2.28.2\nsetuptools 65.5.0";
        default:
          return `pip: '${sub}' is not a known command. Try 'pip install', 'pip freeze'.`;
      }
    }
    case "git": {
      const sub = args[0] || "";
      const rest = args.slice(1);
      switch (sub) {
        case "status":
          return mockGitStatus();
        case "add":
          return mockGitAdd(rest);
        case "commit":
          if (rest[0] === "-m") {
            const msg = rest.slice(1).join(" ");
            return mockGitCommit(msg);
          }
          return "git commit: missing -m message";
        case "push":
          return "Everything up-to-date";
        default:
          return `git: '${sub}' is not a known command. Try 'git status', 'git add', 'git commit -m "msg"'.`;
      }
    }
    case "dotnet": {
      const sub = args[0] || "";
      switch (sub) {
        case "run":
          return "Hello World!\n\nApplication finished.";
        case "build":
          return "MSBuild version 17.4.0 for .NET\n  Determining projects to restore...\n  All projects are up-to-date for restore.\n  YourApp -> /app/bin/Debug/net8.0/YourApp.dll\n\nBuild succeeded.";
        default:
          return `dotnet: '${sub}' is not a known command. Try 'dotnet run', 'dotnet build'.`;
      }
    }
    case "csc": {
      const file = args.find(a => a.endsWith(".cs"));
      if (!file) return "csc: no C# source file specified";
      return `Microsoft (R) Visual C# Compiler version 4.8.0\n\n${file} compiled successfully.`;
    }
    case "cs": {
      // treat as csharp script (like `cs script.csx`)
      const file = args.find(a => a.endsWith(".csx"));
      if (!file) return "cs: no C# script file specified";
      return `Hello from C# script!\n${file} executed.`;
    }
    case "mkdir": {
      if (!args[0]) return "mkdir: missing operand";
      // simple: add a new folder to the file list (mock)
      const name = args[0];
      const newEntry: FileEntry = {
        id: `folder-${Date.now()}`,
        name,
        isFolder: true,
        parentId: null,
        depth: 0,
      };
      // We need to update the files array? But we cannot mutate it directly here.
      // This is a mock – we'll just return a message.
      return `mkdir: created directory '${name}' (mock)`;
    }
    case "touch": {
      if (!args[0]) return "touch: missing file operand";
      const name = args[0];
      // similar mock
      return `touch: created file '${name}' (mock)`;
    }
    case "rm": {
      if (!args[0]) return "rm: missing operand";
      return `rm: removed '${args[0]}' (mock)`;
    }
    case "exit":
      return "exit: terminal will be closed (mock)";

    default:
      return `${cmd}: command not found`;
  }
}

// ─── Extensions list ─────────────────────────────────────────────────────────
const ALL_EXTENSIONS = [
  {
    id: "prettier",
    name: "Prettier",
    desc: "Code formatter",
    author: "Prettier",
  },
  {
    id: "eslint",
    name: "ESLint",
    desc: "Linting for JS/TS",
    author: "Microsoft",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    desc: "AI pair programmer",
    author: "GitHub",
  },
  {
    id: "python",
    name: "Python",
    desc: "Python language support",
    author: "Microsoft",
  },
  {
    id: "go",
    name: "Go",
    desc: "Go language support",
    author: "Go Team at Google",
  },
  {
    id: "rust",
    name: "Rust Analyzer",
    desc: "Rust language support",
    author: "rust-lang",
  },
  {
    id: "gitlens",
    name: "GitLens",
    desc: "Git supercharged",
    author: "GitKraken",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS IntelliSense",
    desc: "Autocomplete & linting",
    author: "Tailwind Labs",
  },
  {
    id: "theme-dark",
    name: "One Dark Pro",
    desc: "Dark theme",
    author: "binaryify",
  },
  {
    id: "indent",
    name: "indent-rainbow",
    desc: "Colorize indentation",
    author: "oderwat",
  },
];

type RunRequest = {
  language: string;
  code: string;
  filename: string;
  stdin?: string;
};

function languageFromFileName(name: string): string {
  const lower = name.toLowerCase();

  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs"))
    return "javascript";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".tsx")) return "typescriptreact";
  if (lower.endsWith(".jsx")) return "javascriptreact";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".cxx"))
    return "cpp";
  if (lower.endsWith(".c")) return "c";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".go")) return "go";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".rb")) return "ruby";
  if (lower.endsWith(".php")) return "php";
  if (lower.endsWith(".cs")) return "csharp";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";

  return "plaintext";
}

async function executeOnline(req: RunRequest): Promise<string> {
  try {
    const result = await executeCode({
      code: req.code,
      language: req.language,
      stdin: req.stdin,  // pass stdin if provided
    });
    const parts: string[] = [];
    if (result.compileError) parts.push(result.compileError.trim());
    if (result.stdout) parts.push(result.stdout.trim());
    if (result.stderr && result.stderr !== result.compileError)
      parts.push(result.stderr.trim());
    if (!parts.length) {
      return result.exitCode === 0
        ? "Process exited with code 0"
        : `Process exited with code ${result.exitCode}`;
    }
    return parts.join("\n");
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VSCode({ onLaunchGame }: Props) {
  const [files, setFiles] = useState<FileEntry[]>(ROOT_FILES);
  const [fileContents, setFileContents] =
    useState<Record<string, string>>(STARTER);

  const fileContentsRef = useRef<Record<string, string>>(STARTER);

  useEffect(() => {
    fileContentsRef.current = fileContents;
  }, [fileContents]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeActivity, setActiveActivity] = useState<
    "explorer" | "search" | "git" | "debug" | "extensions"
  >("explorer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [selectedLang, setSelectedLang] = useState("Plain Text");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langFilter, setLangFilter] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorWordWrap, setEditorWordWrap] = useState(false);
  const [editorTabSize, setEditorTabSize] = useState(2);
  const [autoSave, setAutoSave] = useState(false);

  const [installedExts, setInstalledExts] = useState<Set<string>>(new Set());
  const [installingExts, setInstallingExts] = useState<Set<string>>(new Set());
  const [extSearch, setExtSearch] = useState("");

  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");
  const newItemRef = useRef<HTMLInputElement>(null);

  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    entry: FileEntry;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  // ─── STDIN Content ──────────────────────────────────────────────────────────
  const [stdinContent, setStdinContent] = useState("");
  const [stdinVisible, setStdinVisible] = useState(false);

  // Check for input functions in the active file
  useEffect(() => {
    if (!activeTab) {
      setStdinVisible(false);
      return;
    }
    const f = files.find((x) => x.id === activeTab);
    if (!f) {
      setStdinVisible(false);
      return;
    }
    const code = fileContents[f.id] ?? fileContents[f.name] ?? "";
    const lang = f.lang ?? languageFromFileName(f.name);

    const inputPatterns = [
      /input\s*\(/i,
      /cin\s*>>/,
      /scanf\s*\(/,
      /java\.util\.Scanner/,
      /readline\s*\(/i,
      /await\s+readline/i,
      /process\.stdin\.on/i,
      /std::cin/i,
      /gets\s*\(/i,
      /fgets\s*\(/i,
      /console\.readLine/i,
      /read\s*Line\s*\(/i,
      /let\s+stdin\s*=/i,
      /Io\.stdin/i,
      /read\s*\(\)/i,
      /getchar\s*\(/i,
      /getline\s*\(/i,
    ];

    const hasInput = inputPatterns.some(pattern => pattern.test(code));
    const isRunnable = !["html", "css", "json", "markdown", "plaintext"].includes(lang);
    setStdinVisible(hasInput && isRunnable);
  }, [activeTab, files, fileContents]);

  // ─── Context menu etc. ────────────────────────────────────────────────────
  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
    };
  }, []);

  const openCtxMenu = (e: React.MouseEvent, entry: FileEntry) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, entry });
  };

  const commitRename = () => {
    const name = renameVal.trim();
    if (!name || !renamingId) {
      setRenamingId(null);
      return;
    }

    const oldFile = files.find(f => f.id === renamingId);
    const oldName = oldFile?.name;

    setFiles((fs) =>
      fs.map((f) => {
        if (f.id !== renamingId) return f;
        const ext = name.includes(".") ? name.split(".").pop() : undefined;
        return { ...f, name, ext };
      }),
    );

    if (oldName && oldName !== name) {
      setFileContents((c) => {
        const newC = { ...c };
        if (c[oldName] !== undefined) {
          newC[name] = c[oldName];
          delete newC[oldName];
        }
        if (c[renamingId] !== undefined) {
          newC[name] = c[renamingId];
          delete newC[renamingId];
        }
        return newC;
      });

      setOpenTabs((tabs) => 
        tabs.map(t => t === renamingId ? name : t)
      );

      if (activeTab === renamingId) {
        setActiveTab(name);
      }
    }

    setRenamingId(null);
  };

  const deleteEntry = (entry: FileEntry) => {
    const idsToDelete = new Set<string>();
    const collect = (id: string) => {
      idsToDelete.add(id);
      files
        .filter((f) => f.parentId === id)
        .forEach((child) => collect(child.id));
    };
    collect(entry.id);
    setFiles((fs) => fs.filter((f) => !idsToDelete.has(f.id)));
    setOpenTabs((tabs) => {
      const next = tabs.filter((t) => !idsToDelete.has(t));
      if (activeTab && idsToDelete.has(activeTab))
        setActiveTab(next[0] ?? null);
      return next;
    });
    if (selectedFile && idsToDelete.has(selectedFile)) setSelectedFile(null);
  };

  const copyPath = (entry: FileEntry) => {
    const parts: string[] = [entry.name];
    let cur = entry.parentId;
    while (cur) {
      const parent = files.find((f) => f.id === cur);
      if (!parent) break;
      parts.unshift(parent.name);
      cur = parent.parentId;
    }
    navigator.clipboard.writeText("~/" + parts.join("/")).catch(() => {});
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const [sidebarSearchQ, setSidebarSearchQ] = useState("");
  const [sidebarReplaceQ, setSidebarReplaceQ] = useState("");
  const [searchResults, setSearchResults] = useState<
    { fileId: string; fileName: string; line: number; text: string }[]
  >([]);

  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const highlightedCodeRef = useRef<HTMLPreElement>(null);

  const [termSessions, setTermSessions] = useState([
    {
      id: 1,
      lines: [
        "Welcome to CodeForge terminal.",
        "Type 'help' for available commands.",
        "",
      ],
    },
  ]);
  const [activeTermId, setActiveTermId] = useState(1);
  const [termInputs, setTermInputs] = useState<Record<number, string>>({
    1: "",
  });
  const [termHistories, setTermHistories] = useState<Record<number, string[]>>({
    1: [],
  });
  const [historyIdxes, setHistoryIdxes] = useState<Record<number, number>>({
    1: -1,
  });
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [terminalHeight, setTerminalHeight] = useState(220);

  const startSidebarResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX,
        startW = sidebarWidth;
      const onMove = (ev: MouseEvent) =>
        setSidebarWidth(
          Math.max(150, Math.min(600, startW + ev.clientX - startX)),
        );
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [sidebarWidth],
  );

  const startTermResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY,
        startH = terminalHeight;
      const onMove = (ev: MouseEvent) =>
        setTerminalHeight(
          Math.max(80, Math.min(600, startH + startY - ev.clientY)),
        );
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [terminalHeight],
  );

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [termSessions, activeTermId]);
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 30);
  }, [searchOpen]);
  useEffect(() => {
    if (newItemParent !== null)
      setTimeout(() => newItemRef.current?.focus(), 30);
  }, [newItemParent]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const getFileContent = useCallback(
    (name: string) => fileContents[name] ?? STARTER[name] ?? "",
    [fileContents],
  );

  const saveFile = useCallback(() => {
    if (!activeTab) return;
    const f = files.find((x) => x.id === activeTab);
    if (!f) return;
    const content = getFileContent(f.id);
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = f.name;
    a.click();
  }, [activeTab, files, getFileContent]);

  const saveFileAs = useCallback(() => {
    if (!activeTab) return;
    const f = files.find((x) => x.id === activeTab);
    if (!f) return;
    const name = prompt("Save as:", f.name);
    if (!name) return;
    const content = getFileContent(f.id);
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }, [activeTab, files, getFileContent]);

  const handleOpenFileFromDisk = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const ext = file.name.includes(".")
          ? file.name.split(".").pop()
          : undefined;
        const langMap: Record<string, string> = {
          ts: "typescript",
          tsx: "typescriptreact",
          js: "javascript",
          py: "python",
          css: "css",
          html: "html",
          json: "json",
          md: "markdown",
        };
        const id = `disk-${Date.now()}`;
        const newEntry: FileEntry = {
          id,
          name: file.name,
          ext,
          isFolder: false,
          parentId: null,
          lang: ext ? langMap[ext] : "plaintext",
        };
        setFiles((fs) => [...fs, newEntry]);
        setFileContents((c) => ({ ...c, [id]: text }));
        setOpenTabs((t) => [...t, id]);
        setActiveTab(id);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [],
  );

  const editorExecCommand = useCallback((cmd: string) => {
    const ta = editorTextareaRef.current;
    if (!ta) return;
    ta.focus();
    document.execCommand(cmd);
  }, []);

  const editorSelectAll = useCallback(() => {
    const ta = editorTextareaRef.current;
    if (!ta) return;
    ta.focus();
    ta.select();
  }, []);

  const editorToggleComment = useCallback(() => {
    if (!activeTab) return;
    const f = files.find((x) => x.id === activeTab);
    if (!f) return;
    const ta = editorTextareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const start = ta.selectionStart,
      end = ta.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = val.indexOf("\n", end);
    const lineEndReal = lineEnd === -1 ? val.length : lineEnd;
    const line = val.slice(lineStart, lineEndReal);
    const commentMap: Record<string, string> = {
      typescript: "//",
      typescriptreact: "//",
      javascript: "//",
      python: "#",
      css: "/*",
      html: "<!--",
      go: "//",
      rust: "//",
    };
    const prefix = commentMap[f.lang ?? ""] ?? "//";
    const trimmed = line.trimStart();
    let newLine: string;
    if (trimmed.startsWith(prefix)) {
      newLine = line.replace(prefix + " ", "").replace(prefix, "");
    } else {
      newLine = line.replace(/^(\s*)/, `$1${prefix} `);
    }
    const newVal = val.slice(0, lineStart) + newLine + val.slice(lineEndReal);
    setFileContents((c) => ({ ...c, [activeTab]: newVal }));
  }, [activeTab, files]);

  const editorGotoLine = useCallback(() => {
    const input = prompt("Go to line:");
    if (!input) return;
    const line = parseInt(input, 10);
    if (isNaN(line)) return;
    const ta = editorTextareaRef.current;
    if (!ta) return;
    const lines = ta.value.split("\n");
    const targetLine = Math.max(1, Math.min(line, lines.length));
    const pos =
      lines.slice(0, targetLine - 1).join("\n").length +
      (targetLine > 1 ? 1 : 0);
    ta.focus();
    ta.setSelectionRange(pos, pos);
    const lineH = 20.8;
    ta.scrollTop = (targetLine - 5) * lineH;
  }, []);

  const editorCopyLineDown = useCallback(() => {
    if (!activeTab) return;
    const ta = editorTextareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const start = ta.selectionStart;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = val.indexOf("\n", start);
    const lineEndReal = lineEnd === -1 ? val.length : lineEnd;
    const line = val.slice(lineStart, lineEndReal);
    const newVal =
      val.slice(0, lineEndReal) + "\n" + line + val.slice(lineEndReal);
    setFileContents((c) => ({ ...c, [activeTab]: newVal }));
  }, [activeTab]);

  const editorMoveLineUp = useCallback(() => {
    if (!activeTab) return;
    const ta = editorTextareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const start = ta.selectionStart;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    if (lineStart === 0) return;
    const lineEnd = val.indexOf("\n", start);
    const lineEndReal = lineEnd === -1 ? val.length : lineEnd;
    const prevLineStart = val.lastIndexOf("\n", lineStart - 2) + 1;
    const curLine = val.slice(lineStart, lineEndReal);
    const prevLine = val.slice(prevLineStart, lineStart - 1);
    const newVal =
      val.slice(0, prevLineStart) +
      curLine +
      "\n" +
      prevLine +
      val.slice(lineEndReal);
    setFileContents((c) => ({ ...c, [activeTab]: newVal }));
  }, [activeTab]);

  const editorMoveLineDown = useCallback(() => {
    if (!activeTab) return;
    const ta = editorTextareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const start = ta.selectionStart;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = val.indexOf("\n", start);
    if (lineEnd === -1) return;
    const nextLineEnd = val.indexOf("\n", lineEnd + 1);
    const nextLineEndReal = nextLineEnd === -1 ? val.length : nextLineEnd;
    const curLine = val.slice(lineStart, lineEnd);
    const nextLine = val.slice(lineEnd + 1, nextLineEndReal);
    const newVal =
      val.slice(0, lineStart) +
      nextLine +
      "\n" +
      curLine +
      val.slice(nextLineEndReal);
    setFileContents((c) => ({ ...c, [activeTab]: newVal }));
  }, [activeTab]);

  const openFile = useCallback(
    (id: string) => {
      const f = files.find((x) => x.id === id);
      if (!f || f.isFolder) return;
      if (!openTabs.includes(id)) setOpenTabs((t) => [...t, id]);
      setActiveTab(id);
      setSelectedFile(id);
      const lmap: Record<string, string> = {
        typescript: "TypeScript",
        typescriptreact: "TypeScript JSX",
        python: "Python",
        go: "Go",
        css: "CSS",
        html: "HTML",
        json: "JSON",
        markdown: "Markdown",
        plaintext: "Plain Text",
      };
      setSelectedLang(lmap[f.lang ?? ""] ?? "Plain Text");
    },
    [files, openTabs],
  );

  const closeTab = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const idx = openTabs.indexOf(id);
      const next = openTabs.filter((t) => t !== id);
      setOpenTabs(next);
      if (activeTab === id) setActiveTab(next[Math.max(0, idx - 1)] ?? null);
    },
    [openTabs, activeTab],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
      if (mod && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((s) => !s);
      }
      if (mod && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((t) => !t);
      }
      if (mod && e.key === "w") {
        e.preventDefault();
        if (activeTab) closeTab(activeTab);
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        editorToggleComment();
      }
      if (mod && e.key === "g" && !e.shiftKey) {
        e.preventDefault();
        editorGotoLine();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveFile, activeTab, closeTab, editorToggleComment, editorGotoLine]);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
      return;
    }
    if (e.key === "Enter") {
      const val = searchValue.trim().toLowerCase();
      setSearchOpen(false);
      setSearchValue("");
      if (val === "e1.5.2") {
        onLaunchGame("1.5.2");
        return;
      }
      if (val === "e1.8.8") {
        onLaunchGame("1.8.8");
        return;
      }
      if (val === "e1.12.2") {
        onLaunchGame("1.12.2");
        return;
      }
    }
  };

  const doSearch = () => {
    if (!sidebarSearchQ.trim()) {
      setSearchResults([]);
      return;
    }
    const q = sidebarSearchQ.toLowerCase();
    const results: {
      fileId: string;
      fileName: string;
      line: number;
      text: string;
    }[] = [];
    files
      .filter((f) => !f.isFolder)
      .forEach((f) => {
        const content = getFileContent(f.name);
        content.split("\n").forEach((lineText, idx) => {
          if (lineText.toLowerCase().includes(q)) {
            results.push({
              fileId: f.id,
              fileName: f.name,
              line: idx + 1,
              text: lineText.trim(),
            });
          }
        });
      });
    setSearchResults(results);
  };

  const doReplaceAll = () => {
    if (!sidebarSearchQ.trim()) return;
    const updated = { ...fileContents };
    files
      .filter((f) => !f.isFolder)
      .forEach((f) => {
        const content = getFileContent(f.name);
        const regex = new RegExp(
          sidebarSearchQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi",
        );
        if (regex.test(content)) {
          updated[f.name] = content.replace(regex, sidebarReplaceQ);
        }
      });
    setFileContents(updated);
    doSearch();
  };

  const startNewItem = (type: "file" | "folder") => {
    let parentId = "root";
    if (selectedFile) {
      const sel = files.find((f) => f.id === selectedFile);
      if (sel?.isFolder) {
        parentId = selectedFile;
        setExpanded((ex) => ({ ...ex, [selectedFile]: true }));
      } else if (sel) {
        parentId = sel.parentId ?? "root";
      }
    }
    setNewItemParent(parentId);
    setNewItemType(type);
    setNewItemName("");
  };

  const commitNewItem = () => {
    const name = newItemName.trim();

    if (!name) {
      setNewItemParent(null);
      setNewItemName("");
      return;
    }

    const parent = newItemParent ?? "root";
    const realParentId = parent === "root" ? null : parent;

    const parentEntry = files.find((f) => f.id === realParentId);
    const depth = realParentId === null ? 0 : (parentEntry?.depth ?? 0) + 1;

    const KNOWN_EXTS = new Set([
      "ts",
      "tsx",
      "js",
      "jsx",
      "mjs",
      "cjs",
      "py",
      "go",
      "rs",
      "rb",
      "java",
      "c",
      "cpp",
      "cc",
      "cxx",
      "cs",
      "php",
      "swift",
      "kt",
      "kts",
      "dart",
      "lua",
      "r",
      "scala",
      "hs",
      "lhs",
      "ex",
      "exs",
      "erl",
      "hrl",
      "sh",
      "bash",
      "zsh",
      "fish",
      "html",
      "htm",
      "css",
      "scss",
      "sass",
      "less",
      "json",
      "jsonc",
      "json5",
      "md",
      "mdx",
      "yaml",
      "yml",
      "toml",
      "xml",
      "svg",
      "txt",
      "sql",
      "graphql",
      "gql",
      "prisma",
      "proto",
      "gitignore",
      "gitattributes",
      "log",
      "env",
      "tf",
      "tfvars",
      "astro",
      "elm",
      "clj",
      "cljs",
      "v",
      "nix",
      "ps1",
      "psm1",
      "bat",
      "sol",
      "tex",
      "vue",
      "svelte",
      "gradle",
      "jl",
      "nim",
      "zig",
      "coffee",
      "ml",
      "mli",
      "fs",
      "fsx",
      "lock",
      "csv",
      "pdf",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "ico",
      "dockerfile",
    ]);

    let finalName = name;
    if (newItemType === "file" && !name.startsWith(".")) {
      const dotIdx = name.lastIndexOf(".");
      if (
        dotIdx === -1 ||
        !KNOWN_EXTS.has(name.slice(dotIdx + 1).toLowerCase())
      ) {
        finalName = dotIdx === -1 ? name + ".txt" : name;
      }
    }

    const rawExt = finalName.includes(".")
      ? (finalName.split(".").pop() ?? "")
      : "";
    const ext = finalName.startsWith(".git") ? "git" : rawExt;

    const newEntry: FileEntry = {
      id: `${finalName}-${Date.now()}`,
      name: finalName,
      isFolder: newItemType === "folder",
      parentId: realParentId,
      depth,
      lang:
        newItemType === "file" ? languageFromFileName(finalName) : undefined,
      ext: newItemType === "file" ? ext : undefined,
    };

    setFiles((f) => [...f, newEntry]);

    if (newItemType === "file") {
      setFileContents((c) => ({ ...c, [finalName]: "" }));
      setTimeout(() => openFile(newEntry.id), 50);
    }

    if (realParentId !== null) {
      setExpanded((ex) => ({ ...ex, [realParentId]: true }));
    }

    setNewItemParent(null);
    setNewItemName("");
  };

  const [terminalRunning, setTerminalRunning] = useState(false);

  const termInput = termInputs[activeTermId] ?? "";
  const setTermInput = (v: string) =>
    setTermInputs((p) => ({ ...p, [activeTermId]: v }));

  const handleTermKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = termHistories[activeTermId] ?? [];
    const hidx = historyIdxes[activeTermId] ?? -1;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(hidx + 1, history.length - 1);
      setHistoryIdxes((h) => ({
        ...h,
        [activeTermId]: idx,
      }));
      setTermInput(history[idx] ?? "");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(hidx - 1, -1);
      setHistoryIdxes((h) => ({
        ...h,
        [activeTermId]: idx,
      }));
      setTermInput(idx === -1 ? "" : history[idx]);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const cmds = [
        "ls", "pwd", "cd", "echo", "cat", "mkdir", "touch",
        "rm", "date", "whoami", "node", "python", "python3",
        "go", "npm", "git", "clear", "help"
      ];
      const m = cmds.find((c) => c.startsWith(termInput) && c !== termInput);
      if (m) {
        setTermInput(m + " ");
      }
      return;
    }

    if (e.key === "c" && e.ctrlKey) {
      setTermInput("");
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (terminalRunning) return;

      const input = termInput.trim();
      const sessionId = activeTermId;

      if (!input) return;

      setTerminalRunning(true);

      setTermSessions((ss) =>
        ss.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                lines: [
                  ...s.lines,
                  `\x02${CWD}\x03${input}`,
                  "Running...",
                ],
              }
            : s,
        ),
      );

      setTermHistories((h) => ({
        ...h,
        [sessionId]: [input, ...(h[sessionId] ?? [])].slice(0, 100),
      }));

      setHistoryIdxes((h) => ({
        ...h,
        [sessionId]: -1,
      }));

      setTermInput("");

      try {
        const result = await runCmd(
          input,
          files,
          fileContentsRef.current,
          activeTab,
          stdinContent,  // pass the current stdin content
        );

        setTermSessions((ss) =>
          ss.map((s) => {
            if (s.id !== sessionId) return s;

            const lines = s.lines.filter((line) => line !== "Running...");

            if (result === "\x00CLEAR") {
              return {
                ...s,
                lines: [],
              };
            }

            return {
              ...s,
              lines: [
                ...lines,
                ...(result ? result.split("\n") : []),
              ],
            };
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown execution error";
        setTermSessions((ss) =>
          ss.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              lines: [
                ...s.lines.filter((line) => line !== "Running..."),
                `Error: ${message}`,
              ],
            };
          }),
        );
      } finally {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTerminalRunning(false);
            setTimeout(() => {
              termInputRef.current?.focus();
            }, 0);
          });
        });
      }
    }
  };

  const newTerminal = () => {
    const id = Date.now();
    setTermSessions((ss) => [...ss, { id, lines: [""] }]);
    setTermInputs((p) => ({ ...p, [id]: "" }));
    setTermHistories((h) => ({ ...h, [id]: [] }));
    setHistoryIdxes((h) => ({ ...h, [id]: -1 }));
    setActiveTermId(id);
  };

  const closeTermSession = (id: number) => {
    if (termSessions.length === 1) {
      setTerminalOpen(false);
      return;
    }
    const next = termSessions.filter((s) => s.id !== id);
    setTermSessions(next);
    if (activeTermId === id) setActiveTermId(next[0]?.id ?? 1);
  };

  const renderTermLine = (line: string, i: number) => {
    if (line.startsWith("\x02")) {
      const rest = line.slice(1);
      const p = rest.indexOf("\x03");
      const dir = rest.slice(0, p);
      const cmd = rest.slice(p + 1);
      return (
        <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>
          <span style={{ color: "#4ec9b0", fontWeight: "bold" }}>
            codeforge@workspace
          </span>
          <span style={{ color: "#858585" }}> {dir} </span>
          <span style={{ color: "#cccccc" }}>%&nbsp;</span>
          <span style={{ color: "#d4d4d4" }}>{cmd}</span>
        </div>
      );
    }
    return (
      <div key={i} style={{ color: "#cccccc", whiteSpace: "pre-wrap" }}>
        {line}
      </div>
    );
  };

  const visibleFiles = (() => {
    const result: FileEntry[] = [];
    const add = (parentId: string | null) => {
      files
        .filter((f) => f.parentId === parentId)
        .forEach((f) => {
          result.push(f);
          if (f.isFolder && expanded[f.id]) add(f.id);
        });
    };
    add(null);
    return result;
  })();

  const filteredLangs = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(langFilter.toLowerCase()),
  );
  const activeFile = activeTab ? files.find((f) => f.id === activeTab) : null;
  const activeCode = activeFile ? getFileContent(activeFile.id) : "";

  const searchDropdownFiles = files
    .filter(
      (f) =>
        !f.isFolder && f.name.toLowerCase().includes(searchValue.toLowerCase()),
    )
    .slice(0, 8);

  const openSearch = () => {
    setSearchOpen((s) => !s);
    if (!searchOpen) setSearchValue("");
  };

  const extList = extSearch
    ? ALL_EXTENSIONS.filter(
        (e) =>
          e.name.toLowerCase().includes(extSearch.toLowerCase()) ||
          e.desc.toLowerCase().includes(extSearch.toLowerCase()),
      )
    : ALL_EXTENSIONS;
  const installedList = extList.filter((e) => installedExts.has(e.id));
  const availableList = extList.filter((e) => !installedExts.has(e.id));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#1e1e1e",
        color: "#cccccc",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: "13px",
        overflow: "hidden",
      }}
      onClick={() => {
        setShowLangPicker(false);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleOpenFileFromDisk}
      />

      <MenuBar
        searchBarRef={searchBarRef}
        searchOpen={searchOpen}
        searchValue={searchValue}
        searchInputRef={searchInputRef}
        onSearchClick={openSearch}
        onSearchChange={(v) => setSearchValue(v)}
        onSearchKey={handleSearchKey}
        searchResults={searchDropdownFiles}
        onOpenFile={(id) => {
          openFile(id);
          setSearchOpen(false);
          setSearchValue("");
        }}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onToggleTerminal={() => {
          setTerminalOpen((t) => !t);
        }}
        onNewFile={() => startNewItem("file")}
        onNewFolder={() => startNewItem("folder")}
        onSave={saveFile}
        onSaveAs={saveFileAs}
        onOpenFileDisk={() => fileInputRef.current?.click()}
        onCloseEditor={() => {
          if (activeTab) closeTab(activeTab);
        }}
        onUndo={() => editorExecCommand("undo")}
        onRedo={() => editorExecCommand("redo")}
        onCut={() => editorExecCommand("cut")}
        onCopy={() => editorExecCommand("copy")}
        onPaste={() => {
          editorTextareaRef.current?.focus();
        }}
        onSelectAll={editorSelectAll}
        onToggleComment={editorToggleComment}
        onCopyLineDown={editorCopyLineDown}
        onMoveLineUp={editorMoveLineUp}
        onMoveLineDown={editorMoveLineDown}
        onGotoLine={editorGotoLine}
        onZoomIn={() => setEditorFontSize((s) => Math.min(30, s + 1))}
        onZoomOut={() => setEditorFontSize((s) => Math.max(8, s - 1))}
        onZoomReset={() => setEditorFontSize(14)}
        onToggleWordWrap={() => setEditorWordWrap((w) => !w)}
        onSwitchActivity={(act) => {
          setActiveActivity(act);
          setSidebarOpen(true);
        }}
        onRunFile={() => {
          setTerminalOpen(true);
          document.getElementById("run-btn")?.click();
        }}
        onNewTerminal={() => {
          setTerminalOpen(true);
          newTerminal();
        }}
        onClearTerminal={() =>
          setTermSessions((ss) =>
            ss.map((s) => (s.id === activeTermId ? { ...s, lines: [] } : s)),
          )
        }
        onAbout={() =>
          alert(
            "CodeForge v1.0.0\nA VSCode-style editor built with React.\n\n© 2025 CodeForge",
          )
        }
        onToggleDevTools={() => {
          console.log("CodeForge DevTools — check the browser console.");
          (window as any).__CODEFORGE_DEBUG__ = true;
        }}
        editorWordWrap={editorWordWrap}
        sidebarOpen={sidebarOpen}
        terminalOpen={terminalOpen}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          style={{
            width: "48px",
            background: "#333333",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "4px",
            borderRight: "1px solid #252526",
            flexShrink: 0,
          }}
        >
          {(["explorer", "search", "git", "debug", "extensions"] as const).map(
            (act) => (
              <div
                key={act}
                title={act.charAt(0).toUpperCase() + act.slice(1)}
                onClick={() => {
                  if (activeActivity === act && sidebarOpen) {
                    setSidebarOpen(false);
                  } else {
                    setActiveActivity(act);
                    setSidebarOpen(true);
                  }
                }}
                style={{
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderLeft:
                    activeActivity === act && sidebarOpen
                      ? "2px solid #007acc"
                      : "2px solid transparent",
                }}
              >
                {ACT[act](activeActivity === act && sidebarOpen)}
              </div>
            ),
          )}
          <div style={{ flex: 1 }} />
          <div
            title="Accounts"
            style={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <SvgUser />
          </div>
          <div
            title="Settings"
            onClick={() => setShowSettings((s) => !s)}
            style={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderLeft: showSettings
                ? "2px solid #007acc"
                : "2px solid transparent",
              background: showSettings ? "rgba(0,122,204,0.1)" : "transparent",
            }}
          >
            <SvgSettings />
          </div>
        </div>

        {sidebarOpen && (
          <div
            style={{
              width: sidebarWidth + "px",
              background: "#252526",
              borderRight: "none",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {activeActivity === "explorer" && (
              <>
                <div
                  style={{
                    padding: "8px 12px 4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#bbbcbd",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    height: "32px",
                  }}
                >
                  <span>EXPLORER</span>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <IBtn title="New File" onClick={() => startNewItem("file")}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <polyline
                          points="14 2 14 8 20 8"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="12"
                          y1="13"
                          x2="12"
                          y2="19"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="9"
                          y1="16"
                          x2="15"
                          y2="16"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                      </svg>
                    </IBtn>
                    <IBtn
                      title="New Folder"
                      onClick={() => startNewItem("folder")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="12"
                          y1="11"
                          x2="12"
                          y2="17"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="9"
                          y1="14"
                          x2="15"
                          y2="14"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                      </svg>
                    </IBtn>
                    <IBtn
                      title="Collapse All"
                      onClick={() => setExpanded({ root: true })}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <path
                          d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                      </svg>
                    </IBtn>
                  </div>
                </div>
                <div
                  style={{ flex: 1, overflow: "auto" }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedFile(null);
                  }}
                >
                  {newItemParent !== null &&
                    (() => {
                      const parentEntry = files.find(
                        (f) => f.id === newItemParent,
                      );
                      const indentDepth = (parentEntry?.depth ?? 0) + 1;
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            paddingLeft: `${indentDepth * 12 + 4}px`,
                            height: "22px",
                          }}
                        >
                          <FileIcon
                            name={
                              newItemName ||
                              (newItemType === "folder"
                                ? "__folder__"
                                : "untitled")
                            }
                            ext={
                              newItemType === "folder"
                                ? undefined
                                : newItemName.split(".").pop()
                            }
                          />
                          <input
                            ref={newItemRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitNewItem();
                              if (e.key === "Escape") {
                                setNewItemParent(null);
                                setNewItemName("");
                              }
                            }}
                            onBlur={commitNewItem}
                            placeholder={
                              newItemType === "file"
                                ? "filename.ts"
                                : "folder-name"
                            }
                            style={{
                              background: "#3c3c3c",
                              border: "1px solid #007acc",
                              color: "#cccccc",
                              padding: "1px 5px",
                              fontSize: "13px",
                              outline: "none",
                              flex: 1,
                              borderRadius: "2px",
                            }}
                          />
                        </div>
                      );
                    })()}
                  {visibleFiles.map((f) => (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (renamingId === f.id) return;
                        if (f.isFolder) {
                          setExpanded((ex) => ({ ...ex, [f.id]: !ex[f.id] }));
                          setSelectedFile(f.id);
                        } else openFile(f.id);
                      }}
                      onContextMenu={(e) => {
                        setSelectedFile(f.id);
                        openCtxMenu(e, f);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        paddingLeft: `${f.depth * 12 + 4}px`,
                        paddingRight: "8px",
                        height: "22px",
                        cursor: "pointer",
                        background:
                          selectedFile === f.id ? "#094771" : "transparent",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFile !== f.id)
                          e.currentTarget.style.background = "#2a2d2e";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFile !== f.id)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {f.isFolder ? (
                        <>
                          <span style={{ width: "12px", flexShrink: 0 }}>
                            {expanded[f.id] ? <SvgChevD /> : <SvgChevR />}
                          </span>
                          <FolderIcon open={!!expanded[f.id]} />
                        </>
                      ) : (
                        <>
                          <span style={{ width: "12px", flexShrink: 0 }} />
                          <FileIcon name={f.name} ext={f.ext} />
                        </>
                      )}
                      {renamingId === f.id ? (
                        <input
                          ref={renameRef}
                          value={renameVal}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onBlur={commitRename}
                          style={{
                            flex: 1,
                            background: "#3c3c3c",
                            border: "1px solid #007acc",
                            color: "#cccccc",
                            padding: "0 4px",
                            fontSize: "13px",
                            outline: "none",
                            borderRadius: "2px",
                            height: "18px",
                            minWidth: 0,
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "13px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.name}
                        </span>
                      )}
                    </div>
                  ))}
                  <div
                    style={{ minHeight: "40px" }}
                    onClick={() => setSelectedFile(null)}
                  />
                </div>
              </>
            )}

            {activeActivity === "search" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#bbbcbd",
                    letterSpacing: "1px",
                    padding: "10px 12px 6px",
                    flexShrink: 0,
                  }}
                >
                  SEARCH
                </div>
                <div
                  style={{
                    padding: "0 8px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", gap: "4px" }}>
                    <input
                      value={sidebarSearchQ}
                      onChange={(e) => setSidebarSearchQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && doSearch()}
                      placeholder="Search"
                      autoFocus
                      style={{
                        flex: 1,
                        background: "#3c3c3c",
                        border: "1px solid #555",
                        color: "#cccccc",
                        padding: "2px 8px",
                        fontSize: "13px",
                        outline: "none",
                        borderRadius: "2px",
                      }}
                    />
                    <button
                      onClick={doSearch}
                      style={{
                        background: "#0e639c",
                        border: "none",
                        color: "#fff",
                        padding: "0 8px",
                        cursor: "pointer",
                        borderRadius: "2px",
                        fontSize: "11px",
                      }}
                    >
                      Find
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <input
                      value={sidebarReplaceQ}
                      onChange={(e) => setSidebarReplaceQ(e.target.value)}
                      placeholder="Replace All"
                      style={{
                        flex: 1,
                        background: "#3c3c3c",
                        border: "1px solid #555",
                        color: "#cccccc",
                        padding: "2px 8px",
                        fontSize: "13px",
                        outline: "none",
                        borderRadius: "2px",
                      }}
                    />
                    <button
                      onClick={doReplaceAll}
                      style={{
                        background: "#0e639c",
                        border: "none",
                        color: "#fff",
                        padding: "0 8px",
                        cursor: "pointer",
                        borderRadius: "2px",
                        fontSize: "11px",
                      }}
                    >
                      Replace
                    </button>
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#858585",
                      padding: "2px 12px 4px",
                      flexShrink: 0,
                    }}
                  >
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ flex: 1, overflow: "auto" }}>
                  {searchResults.length === 0 && sidebarSearchQ && (
                    <div
                      style={{
                        color: "#858585",
                        fontSize: "12px",
                        padding: "8px 12px",
                      }}
                    >
                      No results found.
                    </div>
                  )}
                  {(() => {
                    const grouped: Record<string, typeof searchResults> = {};
                    searchResults.forEach((r) => {
                      (grouped[r.fileName] = grouped[r.fileName] ?? []).push(r);
                    });
                    return Object.entries(grouped).map(([fname, results]) => (
                      <div key={fname}>
                        <div
                          style={{
                            padding: "4px 12px",
                            background: "#2a2d2e",
                            fontSize: "12px",
                            color: "#cccccc",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <FileIcon name={fname} ext={fname.split(".").pop()} />
                          {fname}
                          <span style={{ color: "#858585", fontWeight: 400 }}>
                            ({results.length})
                          </span>
                        </div>
                        {results.map((r, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              const f = files.find((x) => x.id === r.fileId);
                              if (f) openFile(f.id);
                            }}
                            style={{
                              padding: "2px 12px 2px 24px",
                              cursor: "pointer",
                              fontSize: "12px",
                              borderBottom: "1px solid #1e1e1e",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#094771")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <span style={{ color: "#858585" }}>{r.line}: </span>
                            <span style={{ color: "#cccccc" }}>
                              {r.text.slice(0, 60)}
                              {r.text.length > 60 ? "…" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {activeActivity === "git" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#bbbcbd",
                    letterSpacing: "1px",
                    padding: "4px 12px 8px",
                  }}
                >
                  SOURCE CONTROL
                </div>
                <div style={{ padding: "0 8px 8px" }}>
                  <input
                    placeholder="Message (Ctrl+Enter to commit)"
                    style={{
                      width: "100%",
                      background: "#3c3c3c",
                      border: "1px solid #555",
                      color: "#cccccc",
                      padding: "5px 8px",
                      fontSize: "12px",
                      outline: "none",
                      borderRadius: "2px",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    style={{
                      marginTop: "6px",
                      width: "100%",
                      background: "#0e639c",
                      color: "#fff",
                      border: "none",
                      padding: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      borderRadius: "2px",
                    }}
                  >
                    Commit
                  </button>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    color: "#858585",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="6"
                      cy="6"
                      r="3"
                      stroke="#858585"
                      strokeWidth="2"
                    />
                    <circle
                      cx="6"
                      cy="18"
                      r="3"
                      stroke="#858585"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="3"
                      stroke="#858585"
                      strokeWidth="2"
                    />
                    <path d="M6 9v6M9 18h6" stroke="#858585" strokeWidth="2" />
                  </svg>
                  main — no changes
                </div>
              </div>
            )}

            {activeActivity === "debug" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#bbbcbd",
                    letterSpacing: "1px",
                    padding: "4px 12px 8px",
                  }}
                >
                  RUN AND DEBUG
                </div>
                <div style={{ padding: "0 8px 8px" }}>
                  <button
                    style={{
                      width: "100%",
                      background: "#0e639c",
                      color: "#fff",
                      border: "none",
                      padding: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" fill="white" />
                    </svg>
                    Run and Debug
                  </button>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    color: "#858585",
                    fontSize: "12px",
                  }}
                >
                  No launch configurations found.
                </div>
                <div style={{ padding: "8px 12px 4px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#bbbcbd",
                      letterSpacing: "1px",
                      marginBottom: "6px",
                    }}
                  >
                    VARIABLES
                  </div>
                  <div style={{ color: "#858585", fontSize: "12px" }}>
                    Not paused
                  </div>
                </div>
                <div style={{ padding: "8px 12px 4px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#bbbcbd",
                      letterSpacing: "1px",
                      marginBottom: "6px",
                    }}
                  >
                    BREAKPOINTS
                  </div>
                  <div style={{ color: "#858585", fontSize: "12px" }}>
                    No breakpoints set
                  </div>
                </div>
              </div>
            )}

            {activeActivity === "extensions" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#bbbcbd",
                    letterSpacing: "1px",
                    padding: "10px 12px 6px",
                    flexShrink: 0,
                  }}
                >
                  EXTENSIONS
                </div>
                <input
                  value={extSearch}
                  onChange={(e) => setExtSearch(e.target.value)}
                  placeholder="Search Extensions..."
                  style={{
                    margin: "0 8px 8px",
                    background: "#3c3c3c",
                    border: "1px solid #555",
                    color: "#cccccc",
                    padding: "5px 8px",
                    fontSize: "12px",
                    outline: "none",
                    borderRadius: "2px",
                    flexShrink: 0,
                  }}
                />
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {installedList.length > 0 && (
                    <>
                      <div
                        style={{
                          padding: "4px 12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#bbbcbd",
                          letterSpacing: "1px",
                          background: "#1e1e1e",
                        }}
                      >
                        INSTALLED
                      </div>
                      {installedList.map((ext) => (
                        <ExtCard
                          key={ext.id}
                          ext={ext}
                          installed={true}
                          installing={false}
                          onInstall={() => {
                            setInstalledExts((s) => {
                              const n = new Set(s);
                              n.delete(ext.id);
                              return n;
                            });
                          }}
                        />
                      ))}
                    </>
                  )}
                  {availableList.length > 0 && (
                    <>
                      <div
                        style={{
                          padding: "4px 12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#bbbcbd",
                          letterSpacing: "1px",
                          background: "#1e1e1e",
                        }}
                      >
                        AVAILABLE
                      </div>
                      {availableList.map((ext) => (
                        <ExtCard
                          key={ext.id}
                          ext={ext}
                          installed={false}
                          installing={installingExts.has(ext.id)}
                          onInstall={() => {
                            if (installingExts.has(ext.id)) return;
                            setInstallingExts((s) => new Set([...s, ext.id]));
                            setTimeout(() => {
                              setInstallingExts((s) => {
                                const n = new Set(s);
                                n.delete(ext.id);
                                return n;
                              });
                              setInstalledExts((s) => new Set([...s, ext.id]));
                            }, 1500);
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {sidebarOpen && (
          <div
            onMouseDown={startSidebarResize}
            style={{
              width: "4px",
              cursor: "ew-resize",
              background: "transparent",
              flexShrink: 0,
              zIndex: 10,
              borderRight: "1px solid #1e1e1e",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#007acc")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          />
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#252526",
              borderBottom: "1px solid #1e1e1e",
              flexShrink: 0,
              height: "35px",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                flex: 1,
                alignItems: "stretch",
              }}
            >
              {openTabs.map((tabId) => {
                const f = files.find((x) => x.id === tabId);
                if (!f) return null;
                const isActive = activeTab === tabId;
                return (
                  <div
                    key={tabId}
                    onClick={() => openFile(tabId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0 6px 0 12px",
                      borderRight: "1px solid #1e1e1e",
                      cursor: "pointer",
                      background: isActive ? "#1e1e1e" : "#2d2d2d",
                      borderTop: isActive
                        ? "1px solid #007acc"
                        : "1px solid transparent",
                      color: isActive ? "#fff" : "#969696",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                      minWidth: "100px",
                    }}
                  >
                    <FileIcon name={f.name} ext={f.ext} />
                    <span style={{ fontSize: "13px" }}>{f.name}</span>
                    <span
                      onClick={(e) => closeTab(tabId, e)}
                      style={{
                        padding: "2px 3px",
                        borderRadius: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#404040")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {SvgClose()}
                    </span>
                  </div>
                );
              })}
            </div>
            {activeFile &&
              (() => {
                const lang =
                  activeFile.lang ?? languageFromFileName(activeFile.name);
                const ext = (
                  activeFile.ext ??
                  activeFile.name.split(".").pop() ??
                  ""
                ).toLowerCase();
                const PREVIEW_LANGS = [
                  "html",
                  "xml",
                  "markdown",
                  "svg",
                  "json",
                  "csv",
                ];
                const IMAGE_EXTS = [
                  "png",
                  "jpg",
                  "jpeg",
                  "gif",
                  "webp",
                  "bmp",
                  "svg",
                ];
                const hasPreview =
                  PREVIEW_LANGS.includes(lang) || IMAGE_EXTS.includes(ext);
                if (hasPreview) {
                  const previewLabel =
                    lang === "markdown"
                      ? "Rendered"
                      : lang === "json"
                        ? "Formatted"
                        : lang === "csv"
                          ? "Table"
                          : lang === "svg" || ext === "svg"
                            ? "Rendered"
                            : IMAGE_EXTS.includes(ext)
                              ? "Image"
                              : "Preview";
                  return (
                    <button
                      onClick={() => setHtmlPreviewOpen((p) => !p)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        margin: "auto 8px",
                        padding: "4px 12px",
                        background: htmlPreviewOpen ? "#007acc" : "#3c3c3c",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = htmlPreviewOpen
                          ? "#1a8ad4"
                          : "#505050")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = htmlPreviewOpen
                          ? "#007acc"
                          : "#3c3c3c")
                      }
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="20"
                          height="16"
                          rx="2"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 12l-3 3 3 3M16 12l3 3-3 3M12 6l-2 12"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {htmlPreviewOpen ? `Hide ${previewLabel}` : previewLabel}
                    </button>
                  );
                }
                const NON_RUN = ["css", "scss", "plaintext"];
                if (NON_RUN.includes(lang)) return null;
                const CMD: Record<string, string> = {
                  py: "python3",
                  js: "node",
                  mjs: "node",
                  ts: "tsx",
                  tsx: "tsx",
                  go: "go run",
                  rs: "rustc",
                  rb: "ruby",
                  php: "php",
                  java: "java",
                  c: "gcc",
                  cpp: "g++",
                  kt: "kotlinc",
                  swift: "swift",
                  lua: "lua",
                  sh: "bash",
                  r: "Rscript",
                  dart: "dart",
                  scala: "scala",
                  cs: "dotnet run",
                  hs: "runhaskell",
                  ex: "elixir",
                  exs: "elixir",
                  jl: "julia",
                  nim: "nim r",
                  zig: "zig run",
                };
                const base = CMD[ext];
                if (!base) return null;
                const fullCmd =
                  base === "go run"
                    ? `go run ${activeFile.name}`
                    : `${base} ${activeFile.name}`;
                return (
                  <button
                    id="run-btn"
                    title={`Run: ${fullCmd}`}
                    onClick={() => {
                      setTerminalOpen(true);
                      const sessionId = activeTermId;
                      setTermSessions((ss) =>
                        ss.map((s) =>
                          s.id === sessionId
                            ? {
                                ...s,
                                lines: [
                                  ...s.lines,
                                  `\x02${CWD}\x03${fullCmd}`,
                                  "Running...",
                                ],
                              }
                            : s,
                        ),
                      );
                      setTermHistories((h) => ({
                        ...h,
                        [sessionId]: [fullCmd, ...(h[sessionId] ?? [])].slice(
                          0,
                          100,
                        ),
                      }));
                      runCmd(
                        fullCmd,
                        files,
                        fileContentsRef.current,
                        activeTab,
                        stdinContent,  // pass stdin content
                      ).then((result) => {
                        setTermSessions((ss) =>
                          ss.map((s) => {
                            if (s.id !== sessionId) return s;
                            const lines = s.lines.filter(
                              (l) => l !== "Running...",
                            );
                            if (result === "\x00CLEAR")
                              return { ...s, lines: [] };
                            return {
                              ...s,
                              lines: [
                                ...lines,
                                ...(result ? result.split("\n") : []),
                              ],
                            };
                          }),
                        );
                      });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      margin: "auto 8px",
                      padding: "4px 12px",
                      background: "#388a34",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                      userSelect: "none",
                      letterSpacing: "0.3px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#4caf50")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#388a34")
                    }
                  >
                    <svg width="10" height="12" viewBox="0 0 10 12">
                      <polygon points="0,0 10,6 0,12" fill="#fff" />
                    </svg>
                    Run
                  </button>
                );
              })()}
          </div>

          <div
            style={{
              flex: 1,
              overflow: "hidden",
              position: "relative",
              minHeight: 0,
            }}
          >
            {showSettings && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  background: "#1e1e1e",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px 8px",
                    borderBottom: "1px solid #3c3c3c",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#cccccc",
                    }}
                  >
                    Settings
                  </span>
                  <button
                    onClick={() => setShowSettings(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#858585",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "2px 6px",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    maxWidth: "700px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#bbbcbd",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                      }}
                    >
                      EDITOR
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                      }}
                    >
                      <span>Font Size</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() =>
                            setEditorFontSize((s) => Math.max(8, s - 1))
                          }
                          style={{
                            background: "#3c3c3c",
                            border: "1px solid #555",
                            color: "#ccc",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                            borderRadius: "3px",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            color: "#9cdcfe",
                            minWidth: "28px",
                            textAlign: "center",
                          }}
                        >
                          {editorFontSize}px
                        </span>
                        <button
                          onClick={() =>
                            setEditorFontSize((s) => Math.min(30, s + 1))
                          }
                          style={{
                            background: "#3c3c3c",
                            border: "1px solid #555",
                            color: "#ccc",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                            borderRadius: "3px",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                        cursor: "pointer",
                      }}
                    >
                      <span>Word Wrap</span>
                      <div
                        onClick={() => setEditorWordWrap((w) => !w)}
                        style={{
                          width: "36px",
                          height: "18px",
                          borderRadius: "9px",
                          background: editorWordWrap ? "#007acc" : "#555",
                          position: "relative",
                          cursor: "pointer",
                          transition: "background .2s",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: editorWordWrap ? "20px" : "2px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "#fff",
                            transition: "left .2s",
                          }}
                        />
                      </div>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                      }}
                    >
                      <span>Tab Size</span>
                      <select
                        value={editorTabSize}
                        onChange={(e) =>
                          setEditorTabSize(Number(e.target.value))
                        }
                        style={{
                          background: "#3c3c3c",
                          border: "1px solid #555",
                          color: "#ccc",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      >
                        {[2, 4, 8].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                        cursor: "pointer",
                      }}
                    >
                      <span>Auto Save</span>
                      <div
                        onClick={() => setAutoSave((a) => !a)}
                        style={{
                          width: "36px",
                          height: "18px",
                          borderRadius: "9px",
                          background: autoSave ? "#007acc" : "#555",
                          position: "relative",
                          cursor: "pointer",
                          transition: "background .2s",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: autoSave ? "20px" : "2px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "#fff",
                            transition: "left .2s",
                          }}
                        />
                      </div>
                    </label>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#bbbcbd",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                      }}
                    >
                      APPEARANCE
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                      }}
                    >
                      <span>Color Theme</span>
                      <span style={{ color: "#9cdcfe" }}>
                        Dark+ (default dark)
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                      }}
                    >
                      <span>Font Family</span>
                      <span style={{ color: "#9cdcfe", fontSize: "12px" }}>
                        Cascadia Code, Fira Code, Consolas
                      </span>
                    </label>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#bbbcbd",
                        letterSpacing: "1px",
                        marginBottom: "8px",
                      }}
                    >
                      TERMINAL
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#cccccc",
                        fontSize: "13px",
                        padding: "6px 0",
                        borderBottom: "1px solid #2d2d2d",
                      }}
                    >
                      <span>Shell</span>
                      <span style={{ color: "#9cdcfe" }}>
                        codeforge@workspace
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {activeTab && activeFile ? (
              <div
                style={{ display: "flex", height: "100%", overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: htmlPreviewOpen ? "0 0 50%" : 1,
                    height: "100%",
                    overflow: "hidden",
                    background: "#1e1e1e",
                    borderRight: htmlPreviewOpen ? "1px solid #3c3c3c" : "none",
                    position: "relative",
                  }}
                >
                  <div
                    ref={lineNumRef}
                    style={{
                      background: "#1e1e1e",
                      color: "#858585",
                      padding: "8px 0",
                      textAlign: "right",
                      userSelect: "none",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      minWidth: "50px",
                      paddingRight: "16px",
                      paddingLeft: "8px",
                      fontFamily:
                        "'Cascadia Code','Fira Code','Consolas',monospace",
                      overflowY: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {activeCode.split("\n").map((_, i) => (
                      <div
                        key={i}
                        style={{
                          color: i + 1 === cursorLine ? "#cccccc" : "#858585",
                        }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <pre
                      ref={highlightedCodeRef}
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        margin: 0,
                        padding: "8px 8px 8px 0",
                        fontFamily:
                          "'Cascadia Code','Fira Code','Consolas',monospace",
                        fontSize: `${editorFontSize}px`,
                        lineHeight: "1.6",
                        overflow: "hidden",
                        pointerEvents: "none",
                        whiteSpace: editorWordWrap ? "pre-wrap" : "pre",
                        color: "#d4d4d4",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlight(
                          activeCode,
                          activeFile.lang ??
                            languageFromFileName(activeFile.name),
                        ),
                      }}
                    />

                    <textarea
                      ref={editorTextareaRef}
                      value={activeCode}
                      onChange={(e) => {
                        const next = e.target.value;
                        setFileContents((c) => ({
                          ...c,
                          [activeFile.name]: next,
                          [activeFile.id]: next,
                        }));
                      }}
                      onKeyDown={(e) => {
                        const ta = e.currentTarget;
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const value = ta.value;

                        const updateCode = (next: string, cursor: number) => {
                          setFileContents((c) => ({
                            ...c,
                            [activeFile.name]: next,
                            [activeFile.id]: next,
                          }));

                          setTimeout(() => {
                            ta.selectionStart = ta.selectionEnd = cursor;
                          }, 0);
                        };

                        const fileName = activeFile.name.toLowerCase();

                        const isPlainTextFile =
                          fileName.endsWith(".txt") ||
                          fileName.endsWith(".md") ||
                          fileName.endsWith(".mdx") ||
                          fileName.endsWith(".markdown");

                        const pairs: Record<string, string> = isPlainTextFile
                          ? {
                              "(": ")",
                              "[": "]",
                              "{": "}",
                            }
                          : {
                              "(": ")",
                              "[": "]",
                              "{": "}",
                              '"': '"',
                              "'": "'",
                              "`": "`",
                            };

                        if (e.key === "Tab") {
                          e.preventDefault();
                          updateCode(
                            value.slice(0, start) + "  " + value.slice(end),
                            start + 2,
                          );
                          return;
                        }

                        if (
                          e.key === "Backspace" &&
                          start === end &&
                          start >= 2
                        ) {
                          const before = value.slice(0, start);
                          const lineStart = before.lastIndexOf("\n") + 1;
                          const linePrefix = before.slice(lineStart);
                          if (
                            /^ +$/.test(linePrefix) &&
                            linePrefix.length >= 2
                          ) {
                            e.preventDefault();
                            const deleteCount =
                              linePrefix.length % 2 === 0 ? 2 : 1;
                            updateCode(
                              value.slice(0, start - deleteCount) +
                                value.slice(start),
                              start - deleteCount,
                            );
                            return;
                          }
                        }

                        if (e.key === "Enter") {
                          e.preventDefault();

                          const before = value.slice(0, start);
                          const after = value.slice(end);
                          const currentLine = before.split("\n").pop() ?? "";
                          const indent = currentLine.match(/^\s*/)?.[0] ?? "";
                          const lang =
                            activeFile.lang ??
                            languageFromFileName(activeFile.name);
                          const colonLangs = [
                            "python",
                            "ruby",
                            "elixir",
                            "coffeescript",
                            "dart",
                            "julia",
                            "nim",
                            "crystal",
                          ];

                          const charBefore = before[before.length - 1];
                          const charAfter = after[0];
                          const bracketClose: Record<string, string> = {
                            "{": "}",
                            "[": "]",
                            "(": ")",
                          };
                          if (
                            charBefore &&
                            bracketClose[charBefore] &&
                            charAfter === bracketClose[charBefore]
                          ) {
                            const inner = "\n" + indent + "  ";
                            const outer = "\n" + indent;
                            updateCode(
                              before + inner + outer + after,
                              start + 1 + indent.length + 2,
                            );
                            return;
                          }

                          if (charBefore === ">" && after.startsWith("</")) {
                            const inner = "\n" + indent + "  ";
                            const outer = "\n" + indent;
                            updateCode(
                              before + inner + outer + after,
                              start + 1 + indent.length + 2,
                            );
                            return;
                          }

                          const trimmedLine = currentLine.trimEnd();
                          const endsWithOpenBracket = /[\{\[\(]$/.test(
                            trimmedLine,
                          );
                          const endsWithColon =
                            colonLangs.includes(lang) &&
                            /:\s*$/.test(trimmedLine) &&
                            !/^\s*#/.test(currentLine);
                          const extraIndent =
                            endsWithOpenBracket || endsWithColon ? "  " : "";

                          updateCode(
                            before + "\n" + indent + extraIndent + after,
                            start + 1 + indent.length + extraIndent.length,
                          );
                          return;
                        }

                        const skippableClosingCharacters = isPlainTextFile
                          ? [")", "]", "}"]
                          : [")", "]", "}", '"', "'", "`"];

                        if (skippableClosingCharacters.includes(e.key)) {
                          if (value[start] === e.key) {
                            e.preventDefault();
                            ta.selectionStart = ta.selectionEnd = start + 1;
                            return;
                          }
                        }

                        if (pairs[e.key]) {
                          e.preventDefault();

                          const close = pairs[e.key];
                          const selected = value.slice(start, end);
                          const next =
                            value.slice(0, start) +
                            e.key +
                            selected +
                            close +
                            value.slice(end);

                          updateCode(next, start + 1 + selected.length);
                          return;
                        }

                        if (
                          e.key === ">" &&
                          (activeFile.lang === "html" ||
                            activeFile.name.endsWith(".html"))
                        ) {
                          const before = value.slice(0, start);
                          const tagMatch = before.match(
                            /<([a-zA-Z][\w-]*)(?:\s[^<>]*)?$/,
                          );

                          const voidTags = new Set([
                            "area",
                            "base",
                            "br",
                            "col",
                            "embed",
                            "hr",
                            "img",
                            "input",
                            "link",
                            "meta",
                            "param",
                            "source",
                            "track",
                            "wbr",
                          ]);

                          if (tagMatch) {
                            const tag = tagMatch[1].toLowerCase();

                            if (!voidTags.has(tag) && !before.endsWith("</")) {
                              e.preventDefault();
                              const insert = `></${tag}>`;
                              updateCode(
                                value.slice(0, start) +
                                  insert +
                                  value.slice(end),
                                start + 1,
                              );
                              return;
                            }
                          }
                        }
                      }}
                      onSelect={(e) => {
                        const ta = e.currentTarget;
                        const before = ta.value.substring(0, ta.selectionStart);
                        const lines = before.split("\n");
                        setCursorLine(lines.length);
                        setCursorCol(lines[lines.length - 1].length + 1);
                      }}
                      onScroll={(e) => {
                        const { scrollTop, scrollLeft } = e.currentTarget;

                        if (lineNumRef.current) {
                          lineNumRef.current.scrollTop = scrollTop;
                        }

                        if (highlightedCodeRef.current) {
                          highlightedCodeRef.current.scrollTop = scrollTop;
                          highlightedCodeRef.current.scrollLeft = scrollLeft;
                        }
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "transparent",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                        caretColor: "#ffffff",
                        border: "none",
                        outline: "none",
                        resize: "none",
                        fontFamily:
                          "'Cascadia Code','Fira Code','Consolas',monospace",
                        fontSize: `${editorFontSize}px`,
                        lineHeight: "1.6",
                        padding: "8px 8px 8px 0",
                        tabSize: editorTabSize,
                        overflowY: "auto",
                        whiteSpace: editorWordWrap ? "pre-wrap" : "pre",
                      }}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                    />

                    {/* ─── STDIN Widget ─────────────────────────────────────────── */}
                    {stdinVisible && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "16px",
                          right: "16px",
                          background: "rgba(30,30,30,0.92)",
                          border: "1px solid #4ec9b0",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          zIndex: 20,
                          backdropFilter: "blur(4px)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
                          display: "flex",
                          flexDirection: "column",
                          minWidth: "160px",
                          maxWidth: "260px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              color: "#4ec9b0",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                              userSelect: "none",
                              background: "rgba(78,201,176,0.15)",
                              padding: "0 6px",
                              borderRadius: "2px",
                            }}
                          >
                            stdin
                          </span>
                          <span style={{ flex: 1 }} />
                          <span style={{ fontSize: "9px", color: "#858585" }}>
                            {stdinContent.split("\n").length} lines
                          </span>
                        </div>
                        <textarea
                          value={stdinContent}
                          onChange={(e) => setStdinContent(e.target.value)}
                          onKeyDown={(e) => {
                            // Enter inserts newline (default behaviour)
                            // No submit action
                          }}
                          placeholder="Input for program"
                          style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "#d4d4d4",
                            fontSize: "12px",
                            fontFamily:
                              "'Cascadia Code','Fira Code',monospace",
                            resize: "vertical",
                            minHeight: "30px",
                            maxHeight: "100px",
                            width: "100%",
                            padding: "2px 0",
                            marginTop: "2px",
                            lineHeight: "1.4",
                          }}
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {htmlPreviewOpen &&
                  activeFile &&
                  (() => {
                    const lang =
                      activeFile.lang ?? languageFromFileName(activeFile.name);
                    const ext = (
                      activeFile.ext ??
                      activeFile.name.split(".").pop() ??
                      ""
                    ).toLowerCase();

                    let label = "Live Preview";
                    let srcDoc = activeCode;
                    if (lang === "markdown") {
                      label = "Markdown Preview";
                      srcDoc = markdownToHtml(activeCode);
                    } else if (lang === "json") {
                      label = "JSON Preview";
                      srcDoc = jsonToHtml(activeCode);
                    } else if (lang === "csv" || ext === "csv") {
                      label = "CSV Table";
                      srcDoc = csvToHtml(activeCode);
                    } else if (lang === "svg" || ext === "svg") {
                      label = "SVG Preview";
                      srcDoc = svgToHtml(activeCode);
                    }

                    const icoColor =
                      lang === "markdown"
                        ? "#4fc3f7"
                        : lang === "json"
                          ? "#f2cc60"
                          : lang === "csv"
                            ? "#4ec9b0"
                            : lang === "svg"
                              ? "#ce9178"
                              : "#858585";

                    return (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          background:
                            lang === "html" || lang === "xml"
                              ? "#fff"
                              : "#0d1117",
                        }}
                      >
                        <div
                          style={{
                            background: "#252526",
                            padding: "4px 12px",
                            fontSize: "11px",
                            color: "#858585",
                            borderBottom: "1px solid #3c3c3c",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill={icoColor}
                          >
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          {label}
                          <span style={{ marginLeft: "auto", opacity: 0.5 }}>
                            {activeFile.name}
                          </span>
                        </div>
                        <iframe
                          key={activeTab + lang}
                          srcDoc={srcDoc}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                          style={{
                            flex: 1,
                            border: "none",
                            background: "transparent",
                          }}
                          title={label}
                        />
                      </div>
                    );
                  })()}
              </div>
            ) : (
              <div
                style={{
                  background: "#1e1e1e",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M75 12.5L25 50l50 37.5V12.5z"
                    fill="#007acc"
                    opacity="0.5"
                  />
                  <path d="M25 12.5v75l25-37.5L25 12.5z" fill="#007acc" />
                </svg>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#cccccc",
                    fontWeight: 300,
                  }}
                >
                  CodeForge
                </div>
                <div style={{ fontSize: "13px", color: "#858585" }}>
                  Open a file from the Explorer or search for a file
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    color: "#858585",
                    fontSize: "12px",
                  }}
                >
                  <kbd
                    style={{
                      background: "#333",
                      border: "1px solid #555",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      color: "#cccccc",
                    }}
                  >
                    Ctrl+P
                  </kbd>{" "}
                  to search files
                </div>
              </div>
            )}
          </div>

          {terminalOpen && (
            <div
              style={{
                height: terminalHeight + "px",
                borderTop: "1px solid #454545",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                background: "#1e1e1e",
              }}
            >
              <div
                onMouseDown={startTermResize}
                style={{
                  height: "4px",
                  cursor: "ns-resize",
                  background: "transparent",
                  flexShrink: 0,
                  zIndex: 10,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#007acc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#252526",
                  height: "32px",
                  borderBottom: "1px solid #454545",
                  flexShrink: 0,
                }}
              >
                {(
                  ["TERMINAL", "PROBLEMS", "OUTPUT", "DEBUG CONSOLE"] as const
                ).map((tab) => (
                  <div
                    key={tab}
                    style={{
                      padding: "0 14px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "11px",
                      cursor: "pointer",
                      color: tab === "TERMINAL" ? "#cccccc" : "#858585",
                      borderBottom:
                        tab === "TERMINAL"
                          ? "1px solid #007acc"
                          : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (tab !== "TERMINAL")
                        e.currentTarget.style.color = "#cccccc";
                    }}
                    onMouseLeave={(e) => {
                      if (tab !== "TERMINAL")
                        e.currentTarget.style.color = "#858585";
                    }}
                  >
                    {tab}
                  </div>
                ))}
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    padding: "0 4px",
                    borderLeft: "1px solid #454545",
                  }}
                >
                  {termSessions.map((s, i) => (
                    <div
                      key={s.id}
                      onClick={() => setActiveTermId(s.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "0 8px",
                        height: "26px",
                        background:
                          activeTermId === s.id ? "#3c3c3c" : "transparent",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "11px",
                        color: "#cccccc",
                        border:
                          activeTermId === s.id
                            ? "1px solid #555"
                            : "1px solid transparent",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          stroke="#4ec9b0"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 12l4-4 4 4"
                          stroke="#4ec9b0"
                          strokeWidth="1.5"
                        />
                      </svg>
                      bash {i + 1}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTermSession(s.id);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "1px",
                          borderRadius: "2px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#555")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {SvgClose()}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    padding: "0 8px",
                    gap: "2px",
                    borderLeft: "1px solid #454545",
                  }}
                >
                  <IBtn title="New Terminal" onClick={newTerminal}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                      <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                    </svg>
                  </IBtn>
                  <IBtn title="Split Terminal" onClick={newTerminal}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="1"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                      <line
                        x1="12"
                        y1="3"
                        x2="12"
                        y2="21"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                    </svg>
                  </IBtn>
                  <IBtn
                    title="Clear Terminal"
                    onClick={() =>
                      setTermSessions((ss) =>
                        ss.map((s) =>
                          s.id === activeTermId ? { ...s, lines: [] } : s,
                        ),
                      )
                    }
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                    </svg>
                  </IBtn>
                  <IBtn
                    title="Kill Terminal"
                    onClick={() => closeTermSession(activeTermId)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                      <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                    </svg>
                  </IBtn>
                  <IBtn
                    title="Close Panel"
                    onClick={() => setTerminalOpen(false)}
                  >
                    {SvgClose()}
                  </IBtn>
                </div>
              </div>
              <div
                onClick={() => termInputRef.current?.focus()}
                style={{
                  flex: 1,
                  overflow: "auto",
                  padding: "8px 12px",
                  fontFamily:
                    "'Cascadia Code','Fira Code','Consolas',monospace",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  cursor: "text",
                }}
              >
                {termSessions
                  .find((s) => s.id === activeTermId)
                  ?.lines.map(renderTermLine)}
                {!terminalRunning && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "#4ec9b0",
                        fontWeight: "bold",
                      }}
                    >
                      codeforge@workspace
                    </span>

                    <span style={{ color: "#858585" }}>
                      {" "}
                      {CWD}{" "}
                    </span>

                    <span style={{ color: "#cccccc" }}>
                      %{" "}
                    </span>

                    <input
                      ref={termInputRef}
                      value={termInput}
                      onChange={(e) => setTermInput(e.target.value)}
                      onKeyDown={handleTermKey}
                      style={{
                        background: "none",
                        border: "none",
                        outline: "none",
                        color: "#d4d4d4",
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        flex: 1,
                        caretColor: "#aeafad",
                        minWidth: 0,
                        paddingLeft: "4px",  // <-- Add this line
                        padding: "0 0 0 4px", // Or use this to keep other padding at 0
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      autoCapitalize="off"
                    />
                  </div>
                )}
                <div ref={termEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#007acc",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          height: "22px",
          flexShrink: 0,
          fontSize: "12px",
          userSelect: "none",
        }}
      >
        <SBtn
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="6" r="3" stroke="white" strokeWidth="2" />
              <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2" />
              <circle cx="18" cy="18" r="3" stroke="white" strokeWidth="2" />
              <path d="M6 9v6M9 18h6" stroke="white" strokeWidth="2" />
            </svg>
          }
          text="main"
        />
        <SBtn
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <line
                x1="15"
                y1="9"
                x2="9"
                y2="15"
                stroke="white"
                strokeWidth="2"
              />
              <line
                x1="9"
                y1="9"
                x2="15"
                y2="15"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          }
          text="0"
        />
        <SBtn
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="white"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
                stroke="white"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
                stroke="white"
                strokeWidth="3"
              />
            </svg>
          }
          text="0"
        />
        <div style={{ flex: 1 }} />
        <div
          style={{ position: "relative" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowLangPicker((l) => !l);
          }}
        >
          <SBtn text={selectedLang} />
          {showLangPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "22px",
                right: 0,
                background: "#252526",
                border: "1px solid #454545",
                borderRadius: "4px",
                width: "220px",
                maxHeight: "280px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              <input
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                placeholder="Filter languages..."
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#3c3c3c",
                  border: "none",
                  borderBottom: "1px solid #454545",
                  color: "#cccccc",
                  padding: "6px 10px",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
              <div style={{ overflowY: "auto" }}>
                {filteredLangs.map((l) => (
                  <div
                    key={l}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLang(l);
                      setShowLangPicker(false);
                      setLangFilter("");
                    }}
                    style={{
                      padding: "5px 12px",
                      cursor: "pointer",
                      color: l === selectedLang ? "#fff" : "#cccccc",
                      background:
                        l === selectedLang ? "#094771" : "transparent",
                      fontSize: "12px",
                    }}
                    onMouseEnter={(e) => {
                      if (l !== selectedLang)
                        e.currentTarget.style.background = "#2a2d2e";
                    }}
                    onMouseLeave={(e) => {
                      if (l !== selectedLang)
                        e.currentTarget.style.background = "transparent";
                    }}
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

      {ctxMenu &&
        (() => {
          const entry = ctxMenu.entry;
          const isFolder = !!entry.isFolder;
          const menuW = 200;
          const menuH = isFolder ? 196 : 156;
          const x = Math.min(ctxMenu.x, window.innerWidth - menuW - 8);
          const y = Math.min(ctxMenu.y, window.innerHeight - menuH - 8);

          const Item = ({
            label,
            icon,
            onClick,
            danger,
          }: {
            label: string;
            icon: React.ReactNode;
            onClick: () => void;
            danger?: boolean;
          }) => (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onClick();
                setCtxMenu(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                cursor: "pointer",
                color: danger ? "#f48771" : "#cccccc",
                fontSize: "13px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = danger
                  ? "#5a1d1d"
                  : "#2a2d2e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {icon}
              {label}
            </div>
          );

          const Sep = () => (
            <div
              style={{ height: "1px", background: "#454545", margin: "2px 0" }}
            />
          );

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                position: "fixed",
                left: x,
                top: y,
                width: menuW,
                background: "#252526",
                border: "1px solid #454545",
                borderRadius: "4px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                zIndex: 9999,
                paddingTop: "4px",
                paddingBottom: "4px",
                userSelect: "none",
              }}
            >
              {!isFolder && (
                <Item
                  label="Open"
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="#cccccc"
                        strokeWidth="2"
                      />
                      <path d="M3 9h18" stroke="#cccccc" strokeWidth="2" />
                    </svg>
                  }
                  onClick={() => openFile(entry.id)}
                />
              )}
              {isFolder && (
                <>
                  <Item
                    label="New File"
                    icon={
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <polyline
                          points="14 2 14 8 20 8"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="12"
                          y1="13"
                          x2="12"
                          y2="19"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="9"
                          y1="16"
                          x2="15"
                          y2="16"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                      </svg>
                    }
                    onClick={() => {
                      setSelectedFile(entry.id);
                      setExpanded((ex) => ({ ...ex, [entry.id]: true }));
                      startNewItem("file");
                    }}
                  />
                  <Item
                    label="New Folder"
                    icon={
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="12"
                          y1="11"
                          x2="12"
                          y2="17"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                        <line
                          x1="9"
                          y1="14"
                          x2="15"
                          y2="14"
                          stroke="#cccccc"
                          strokeWidth="2"
                        />
                      </svg>
                    }
                    onClick={() => {
                      setSelectedFile(entry.id);
                      setExpanded((ex) => ({ ...ex, [entry.id]: true }));
                      startNewItem("folder");
                    }}
                  />
                  <Sep />
                </>
              )}
              <Item
                label="Rename"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />
                  </svg>
                }
                onClick={() => {
                  setRenamingId(entry.id);
                  setRenameVal(entry.name);
                  setTimeout(() => renameRef.current?.select(), 30);
                }}
              />
              <Item
                label="Copy Path"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />
                  </svg>
                }
                onClick={() => copyPath(entry)}
              />
              <Item
                label="Copy Relative Path"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                      stroke="#cccccc"
                      strokeWidth="2"
                    />
                  </svg>
                }
                onClick={() =>
                  navigator.clipboard.writeText(entry.name).catch(() => {})
                }
              />
              <Sep />
              <Item
                label="Delete"
                danger
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="3 6 5 6 21 6"
                      stroke="#f48771"
                      strokeWidth="2"
                    />
                    <path
                      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      stroke="#f48771"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="#f48771"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                      stroke="#f48771"
                      strokeWidth="2"
                    />
                  </svg>
                }
                onClick={() => deleteEntry(entry)}
              />
            </div>
          );
        })()}
    </div>
  );
}

// ─── Preview renderers ────────────────────────────────────────────────────────
const markdownCompiler = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",

    highlight(code: string, language: string): string {
      const aliases: Record<string, string> = {
        py: "python",
        python3: "python",
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        sh: "bash",
        shell: "bash",
        yml: "yaml",
        md: "markdown",
      };

      const requestedLanguage = language.trim().toLowerCase();
      const resolvedLanguage =
        aliases[requestedLanguage] ?? requestedLanguage;

      if (
        resolvedLanguage &&
        hljs.getLanguage(resolvedLanguage)
      ) {
        return hljs.highlight(code, {
          language: resolvedLanguage,
          ignoreIllegals: true,
        }).value;
      }

      return hljs.highlightAuto(code).value;
    },
  })
);

markdownCompiler.setOptions({
  gfm: true,
  breaks: true,
});

function markdownToHtml(md: string): string {
  let rendered = "";

  try {
    rendered = markdownCompiler.parse(md, {
      async: false,
    }) as string;
  } catch (error) {
    console.error("Markdown render error:", error);

    rendered = `<pre>${escapeMarkdownHtml(md)}</pre>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px 32px;
      background: #0d1117;
      color: #e6edf3;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Arial,
        sans-serif;
      font-size: 16px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #f0f6fc;
      line-height: 1.25;
      margin-top: 24px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #30363d;
    }

    h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #30363d;
    }

    h3 {
      font-size: 1.25em;
    }

    p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    a {
      color: #58a6ff;
    }

    blockquote {
      margin: 0 0 16px;
      padding-left: 16px;
      color: #8b949e;
      border-left: 4px solid #30363d;
    }

    ul,
    ol {
      padding-left: 32px;
      margin-top: 0;
      margin-bottom: 16px;
    }

    code {
      padding: 2px 6px;
      background: rgba(110, 118, 129, 0.4);
      border-radius: 6px;
      font-family:
        "Cascadia Code",
        "Fira Code",
        Consolas,
        monospace;
      font-size: 0.9em;
    }

    pre {
      margin: 0 0 16px;
      padding: 16px;
      overflow: auto;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      line-height: 1.45;
      tab-size: 4;
    }

    pre code {
      display: block;
      min-width: max-content;
      padding: 0;
      background: transparent;
      white-space: pre;
      overflow-wrap: normal;
    }

    table {
      display: block;
      max-width: 100%;
      overflow: auto;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    th,
    td {
      padding: 6px 13px;
      border: 1px solid #30363d;
    }

    th {
      background: #161b22;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    hr {
      height: 1px;
      margin: 24px 0;
      background: #30363d;
      border: 0;
    }

    .hljs {
      color: #c9d1d9;
      background: #161b22;
    }

    .hljs-keyword,
    .hljs-doctag,
    .hljs-type,
    .hljs-variable.language_ {
      color: #ff7b72;
    }

    .hljs-title,
    .hljs-title.function_,
    .hljs-title.class_ {
      color: #d2a8ff;
    }

    .hljs-string,
    .hljs-regexp {
      color: #a5d6ff;
    }

    .hljs-number,
    .hljs-literal,
    .hljs-attr,
    .hljs-variable {
      color: #79c0ff;
    }

    .hljs-comment,
    .hljs-code,
    .hljs-quote {
      color: #8b949e;
    }

    .hljs-built_in,
    .hljs-symbol {
      color: #ffa657;
    }

    .hljs-name,
    .hljs-selector-tag,
    .hljs-selector-class {
      color: #7ee787;
    }
  </style>
</head>

<body>
  ${rendered}
</body>
</html>`;
}

function escapeMarkdownHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function csvToHtml(csv: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const parseRow = (row: string): string[] => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of row) {
      if (ch === '"') {
        inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells.map((c) => c.trim());
  };
  const rows = csv
    .trim()
    .split("\n")
    .filter((r) => r.trim())
    .map(parseRow);
  if (!rows.length)
    return "<body style='background:#0d1117;color:#8b949e;padding:24px;font-family:sans-serif'>Empty file</body>";
  const [header, ...body] = rows;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{margin:0;font-family:-apple-system,'Segoe UI',sans-serif;background:#0d1117;color:#e6edf3;font-size:13px}
    .wrap{overflow:auto;height:100vh}
    table{border-collapse:collapse;min-width:100%}
    th{background:#161b22;color:#e6edf3;padding:8px 14px;border:1px solid #30363d;text-align:left;font-weight:600;position:sticky;top:0;white-space:nowrap;z-index:1}
    td{padding:6px 14px;border:1px solid #21262d;white-space:nowrap;max-width:260px;overflow:hidden;text-overflow:ellipsis}
    tr:nth-child(even) td{background:#0d1117} tr:nth-child(odd) td{background:#161b22}
    tr:hover td{background:#1c2128} .rn{color:#6e7681;font-size:11px;user-select:none;text-align:right}
    .summary{padding:8px 14px;color:#6e7681;font-size:11px;border-bottom:1px solid #21262d;background:#161b22}
  </style></head><body><div class="summary">${rows.length - 1} rows × ${header.length} columns</div>
  <div class="wrap"><table>
    <thead><tr><th class="rn">#</th>${header.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${body.map((row, i) => `<tr><td class="rn">${i + 1}</td>${row.map((c) => `<td title="${esc(c)}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div></body></html>`;
}

function jsonToHtml(json: string): string {
  let parsed: unknown;
  let parseErr = "";
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    parseErr = (e as Error).message;
  }
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const colorize = (str: string) =>
    esc(str).replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m) && /:$/.test(m))
          return `<span style="color:#79c0ff">${m}</span>`;
        if (/^"/.test(m)) return `<span style="color:#a5d6ff">${m}</span>`;
        if (/true|false/.test(m))
          return `<span style="color:#ff7b72">${m}</span>`;
        if (/null/.test(m)) return `<span style="color:#8b949e">${m}</span>`;
        return `<span style="color:#f2cc60">${m}</span>`;
      },
    );
  const pretty = parseErr ? json : JSON.stringify(parsed, null, 2);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{margin:0;padding:16px;background:#0d1117;font-family:'Cascadia Code','Fira Code',Consolas,monospace;font-size:13px;line-height:1.6;color:#e6edf3}
    .err{color:#ff7b72;background:#161b22;border:1px solid #f85149;border-radius:6px;padding:12px 16px;margin:8px 0}
    pre{margin:0;white-space:pre-wrap;word-break:break-all}
    .info{color:#6e7681;font-size:11px;margin-bottom:12px;font-family:sans-serif}
  </style></head><body>
  ${
    parseErr
      ? `<div class="err">JSON Parse Error: ${esc(parseErr)}</div><pre>${esc(json)}</pre>`
      : `<div class="info">${Array.isArray(parsed) ? `Array [${(parsed as unknown[]).length} items]` : typeof parsed === "object" && parsed ? `Object {${Object.keys(parsed as object).length} keys}` : typeof parsed}</div><pre>${colorize(pretty)}</pre>`
  }
  </body></html>`;
}

function svgToHtml(svg: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{margin:0;background:#1e1e1e;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px}
    .wrap{max-width:90vw;max-height:80vh;display:flex;align-items:center;justify-content:center;background:#252526;border-radius:8px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,.4)}
    .wrap svg,.wrap img{max-width:80vw;max-height:70vh}
    .lbl{color:#858585;font-size:11px;font-family:sans-serif}
  </style></head><body><div class="wrap">${svg}</div><span class="lbl">SVG Preview</span></body></html>`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SBtn({
  icon,
  text,
  onClick,
}: {
  icon?: React.ReactNode;
  text: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "0 8px",
        height: "22px",
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (onClick)
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {text && <span>{text}</span>}
    </div>
  );
}

function IBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <div
      title={title}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "22px",
        height: "22px",
        cursor: "pointer",
        borderRadius: "3px",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}

function ExtCard({
  ext,
  installed,
  installing,
  onInstall,
}: {
  ext: (typeof ALL_EXTENSIONS)[0];
  installed: boolean;
  installing: boolean;
  onInstall: () => void;
}) {
  return (
    <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e1e1e" }}>
      <div style={{ color: "#cccccc", fontSize: "13px", fontWeight: 500 }}>
        {ext.name}
      </div>
      <div style={{ color: "#858585", fontSize: "11px", margin: "2px 0" }}>
        {ext.desc}
      </div>
      <div style={{ color: "#6a9955", fontSize: "11px" }}>{ext.author}</div>
      <button
        onClick={onInstall}
        style={{
          marginTop: "5px",
          background: installed ? "#3c3c3c" : "#0e639c",
          color: installed ? "#cccccc" : "#fff",
          border: installed ? "1px solid #555" : "none",
          padding: "3px 10px",
          cursor: "pointer",
          fontSize: "11px",
          borderRadius: "2px",
          minWidth: "72px",
        }}
      >
        {installing ? "Installing..." : installed ? "Uninstall" : "Install"}
      </button>
    </div>
  );
}

// ─── Menu Bar ────────────────────────────────────────────────────────────────
function MenuBar({
  searchBarRef,
  searchOpen,
  searchValue,
  searchInputRef,
  onSearchClick,
  onSearchChange,
  onSearchKey,
  searchResults,
  onOpenFile,
  onToggleSidebar,
  onToggleTerminal,
  onNewFile,
  onNewFolder,
  onSave,
  onSaveAs,
  onOpenFileDisk,
  onCloseEditor,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onToggleComment,
  onCopyLineDown,
  onMoveLineUp,
  onMoveLineDown,
  onGotoLine,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleWordWrap,
  onSwitchActivity,
  onRunFile,
  onNewTerminal,
  onClearTerminal,
  onAbout,
  onToggleDevTools,
  editorWordWrap,
  sidebarOpen,
  terminalOpen,
}: {
  searchBarRef: React.RefObject<HTMLDivElement | null>;
  searchOpen: boolean;
  searchValue: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSearchClick: () => void;
  onSearchChange: (v: string) => void;
  onSearchKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchResults: FileEntry[];
  onOpenFile: (id: string) => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onOpenFileDisk: () => void;
  onCloseEditor: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onToggleComment: () => void;
  onCopyLineDown: () => void;
  onMoveLineUp: () => void;
  onMoveLineDown: () => void;
  onGotoLine: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleWordWrap: () => void;
  onSwitchActivity: (
    act: "explorer" | "search" | "git" | "debug" | "extensions",
  ) => void;
  onRunFile: () => void;
  onNewTerminal: () => void;
  onClearTerminal: () => void;
  onAbout: () => void;
  onToggleDevTools: () => void;
  editorWordWrap: boolean;
  sidebarOpen: boolean;
  terminalOpen: boolean;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus: Record<
    string,
    {
      label: string;
      action?: () => void;
      divider?: boolean;
      shortcut?: string;
      checked?: boolean;
    }[]
  > = {
    File: [
      { label: "New File", action: onNewFile, shortcut: "Ctrl+N" },
      { label: "New Folder", action: onNewFolder },
      { divider: true, label: "" },
      { label: "Open File...", action: onOpenFileDisk, shortcut: "Ctrl+O" },
      { divider: true, label: "" },
      { label: "Save", action: onSave, shortcut: "Ctrl+S" },
      { label: "Save As...", action: onSaveAs, shortcut: "Ctrl+Shift+S" },
      { divider: true, label: "" },
      { label: "Close Editor", action: onCloseEditor, shortcut: "Ctrl+W" },
    ],
    Edit: [
      { label: "Undo", action: onUndo, shortcut: "Ctrl+Z" },
      { label: "Redo", action: onRedo, shortcut: "Ctrl+Y" },
      { divider: true, label: "" },
      { label: "Cut", action: onCut, shortcut: "Ctrl+X" },
      { label: "Copy", action: onCopy, shortcut: "Ctrl+C" },
      { label: "Paste", action: onPaste, shortcut: "Ctrl+V" },
      { divider: true, label: "" },
      { label: "Find...", action: onSearchClick, shortcut: "Ctrl+P" },
      { divider: true, label: "" },
      {
        label: "Toggle Line Comment",
        action: onToggleComment,
        shortcut: "Ctrl+/",
      },
      {
        label: "Copy Line Down",
        action: onCopyLineDown,
        shortcut: "Shift+Alt+Down",
      },
    ],
    Selection: [
      { label: "Select All", action: onSelectAll, shortcut: "Ctrl+A" },
      { divider: true, label: "" },
      {
        label: "Copy Line Down",
        action: onCopyLineDown,
        shortcut: "Shift+Alt+Down",
      },
      { label: "Move Line Up", action: onMoveLineUp, shortcut: "Alt+Up" },
      { label: "Move Line Down", action: onMoveLineDown, shortcut: "Alt+Down" },
    ],
    View: [
      {
        label: "Command Palette...",
        action: onSearchClick,
        shortcut: "Ctrl+Shift+P",
      },
      { divider: true, label: "" },
      {
        label: "Explorer",
        action: () => onSwitchActivity("explorer"),
        shortcut: "Ctrl+Shift+E",
      },
      {
        label: "Search",
        action: () => onSwitchActivity("search"),
        shortcut: "Ctrl+Shift+F",
      },
      {
        label: "Source Control",
        action: () => onSwitchActivity("git"),
        shortcut: "Ctrl+Shift+G",
      },
      {
        label: "Extensions",
        action: () => onSwitchActivity("extensions"),
        shortcut: "Ctrl+Shift+X",
      },
      { divider: true, label: "" },
      {
        label: "Terminal",
        action: onToggleTerminal,
        shortcut: "Ctrl+`",
        checked: terminalOpen,
      },
      { divider: true, label: "" },
      {
        label: "Toggle Sidebar",
        action: onToggleSidebar,
        shortcut: "Ctrl+B",
        checked: sidebarOpen,
      },
      {
        label: "Word Wrap",
        action: onToggleWordWrap,
        shortcut: "Alt+Z",
        checked: editorWordWrap,
      },
      { divider: true, label: "" },
      { label: "Zoom In", action: onZoomIn, shortcut: "Ctrl+=" },
      { label: "Zoom Out", action: onZoomOut, shortcut: "Ctrl+-" },
      { label: "Reset Zoom", action: onZoomReset, shortcut: "Ctrl+0" },
    ],
    Go: [
      { label: "Go to File...", action: onSearchClick, shortcut: "Ctrl+P" },
      { label: "Go to Line/Column...", action: onGotoLine, shortcut: "Ctrl+G" },
      { divider: true, label: "" },
      {
        label: "Go to Symbol...",
        action: onSearchClick,
        shortcut: "Ctrl+Shift+O",
      },
    ],
    Run: [
      { label: "Run Active File", action: onRunFile, shortcut: "Ctrl+F5" },
      {
        label: "Run in Terminal",
        action: () => {
          onNewTerminal();
          setTimeout(onRunFile, 100);
        },
        shortcut: "F5",
      },
      { divider: true, label: "" },
      { label: "Clear Terminal Output", action: onClearTerminal },
    ],
    Terminal: [
      {
        label: "New Terminal",
        action: onNewTerminal,
        shortcut: "Ctrl+Shift+`",
      },
      { label: "Split Terminal", action: onNewTerminal },
      { divider: true, label: "" },
      { label: "Run Active File", action: onRunFile },
      { label: "Clear Terminal", action: onClearTerminal },
      { divider: true, label: "" },
      {
        label: "Toggle Terminal Panel",
        action: onToggleTerminal,
        shortcut: "Ctrl+`",
        checked: terminalOpen,
      },
    ],
    Help: [
      {
        label: "Show All Commands",
        action: onSearchClick,
        shortcut: "Ctrl+Shift+P",
      },
      { divider: true, label: "" },
      {
        label: "Toggle Developer Tools",
        action: onToggleDevTools,
        shortcut: "F12",
      },
      { divider: true, label: "" },
      { label: "About CodeForge", action: onAbout },
    ],
  };

  return (
    <div
      style={{
        background: "#3c3c3c",
        display: "flex",
        alignItems: "center",
        height: "30px",
        flexShrink: 0,
        userSelect: "none",
        zIndex: 200,
        position: "relative",
      }}
    >
      <div
        style={{
          width: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#ff5f57",
            cursor: "pointer",
          }}
        />
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#ffbd2e",
            cursor: "pointer",
          }}
        />
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#28c840",
            cursor: "pointer",
          }}
        />
      </div>
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} style={{ position: "relative" }}>
          <div
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => {
              if (openMenu && openMenu !== name) setOpenMenu(name);
            }}
            style={{
              padding: "0 8px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "#cccccc",
              fontSize: "13px",
              background: openMenu === name ? "#094771" : "transparent",
            }}
          >
            {name}
          </div>
          {openMenu === name && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 199 }}
                onClick={() => setOpenMenu(null)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "30px",
                  left: 0,
                  background: "#252526",
                  border: "1px solid #454545",
                  borderRadius: "4px",
                  minWidth: "240px",
                  zIndex: 300,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  padding: "4px 0",
                }}
              >
                {items.map((item, idx) =>
                  item.divider ? (
                    <div
                      key={idx}
                      style={{
                        borderTop: "1px solid #454545",
                        margin: "4px 0",
                      }}
                    />
                  ) : (
                    <div
                      key={idx}
                      onClick={() => {
                        setOpenMenu(null);
                        item.action?.();
                      }}
                      style={{
                        padding: "5px 20px",
                        cursor: "pointer",
                        color: "#cccccc",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#094771")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span
                          style={{
                            color: "#858585",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          ref={searchBarRef}
          style={{ position: "relative", width: "420px" }}
        >
          <div
            onClick={onSearchClick}
            style={{
              background: searchOpen ? "#3c3c3c" : "#3c3c3c",
              border: `1px solid ${searchOpen ? "#007acc" : "#555"}`,
              borderRadius: "4px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              paddingLeft: "8px",
              cursor: "text",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#858585" strokeWidth="2" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="#858585"
                strokeWidth="2"
              />
            </svg>
            {searchOpen ? (
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search Files"
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#cccccc",
                  fontSize: "12px",
                  padding: 0,
                }}
              />
            ) : (
              <span style={{ color: "#858585", fontSize: "12px" }}>
                Search Files
              </span>
            )}
          </div>
          {searchOpen && (
            <div
              style={{
                position: "absolute",
                top: "24px",
                left: 0,
                right: 0,
                background: "#252526",
                border: "1px solid #454545",
                borderRadius: "0 0 4px 4px",
                zIndex: 400,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                maxHeight: "280px",
                overflow: "auto",
              }}
            >
              {searchValue.trim() && (
                <div
                  style={{
                    padding: "4px 12px",
                    fontSize: "11px",
                    color: "#858585",
                    borderBottom: "1px solid #333",
                  }}
                ></div>
              )}
              {searchResults.length === 0 && searchValue.trim() ? (
                <div
                  style={{
                    padding: "8px 12px",
                    color: "#858585",
                    fontSize: "12px",
                  }}
                >
                  No files found
                </div>
              ) : (
                searchResults.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => onOpenFile(f.id)}
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#cccccc",
                      fontSize: "13px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#094771")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FileIcon name={f.name} ext={f.ext} />
                    <span>{f.name}</span>
                    <span
                      style={{
                        color: "#858585",
                        fontSize: "11px",
                        marginLeft: "auto",
                      }}
                    >
                      {f.ext}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ width: "70px" }} />
    </div>
  );
}