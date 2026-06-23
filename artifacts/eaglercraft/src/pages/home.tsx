import { useState, useRef, useEffect, useCallback } from "react";
import type { GameVersion } from "../App";

interface Props { onLaunchGame: (v: GameVersion) => void; }

// ─── VSCode Material Icon Theme via jsDelivr CDN ────────────────────────────
const CDN = "https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@latest/icons/";

const EXT_ICON: Record<string, string> = {
  ts: "typescript", tsx: "react_ts", js: "javascript", jsx: "react",
  mjs: "javascript", cjs: "javascript",
  py: "python", pyc: "python",
  go: "go2",
  html: "html", htm: "html",
  css: "css", scss: "sass", sass: "sass", less: "less",
  json: "json", jsonc: "json", json5: "json5",
  md: "markdown", mdx: "markdown",
  rs: "rust",
  rb: "ruby", erb: "ruby",
  java: "java",
  cpp: "cpp", cc: "cpp", cxx: "cpp", "c++": "cpp",
  c: "c", h: "h", hpp: "h",
  sh: "shell", bash: "shell", zsh: "shell", fish: "fish",
  yaml: "yaml", yml: "yaml",
  toml: "toml",
  dockerfile: "docker",
  vue: "vue", svelte: "svelte",
  kt: "kotlin", kts: "kotlin",
  swift: "swift",
  lua: "lua",
  r: "r",
  scala: "scala",
  hs: "haskell", lhs: "haskell",
  dart: "dart",
  nim: "nim",
  zig: "zig",
  jl: "julia",
  groovy: "groovy", gradle: "gradle",
  php: "php",
  cs: "csharp",
  fs: "fsharp", fsx: "fsharp",
  ml: "ocaml", mli: "ocaml",
  ex: "elixir", exs: "elixir",
  erl: "erlang", hrl: "erlang",
  sql: "database", db: "database",
  graphql: "graphql", gql: "graphql",
  prisma: "prisma",
  proto: "proto",
  gitignore: "git", gitattributes: "git",
  txt: "document",
  log: "log",
  xml: "xml",
  svg: "svg",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", ico: "image",
  pdf: "pdf",
  csv: "csv",
  lock: "lock",
  env: "tune",
  tf: "terraform", tfvars: "terraform",
  astro: "astro",
  elm: "elm",
  clj: "clojure", cljs: "clojure",
  ex2: "elixir",
  v: "v",
  zig2: "zig",
  nix: "nix",
  ps1: "powershell", psm1: "powershell",
  bat: "bat",
  sol: "solidity",
  tex: "tex",
  vue3: "vue",
};

const FALLBACK: Record<string, { bg: string; fg: string; label: string }> = {
  ts:   { bg: "#3178c6", fg: "#fff",    label: "TS"   },
  tsx:  { bg: "#61dafb", fg: "#0a2540", label: "TSX"  },
  js:   { bg: "#f7df1e", fg: "#1a1a1a", label: "JS"   },
  jsx:  { bg: "#61dafb", fg: "#0a2540", label: "JSX"  },
  py:   { bg: "#3572A5", fg: "#fff",    label: "PY"   },
  go:   { bg: "#00add8", fg: "#fff",    label: "GO"   },
  html: { bg: "#e34c26", fg: "#fff",    label: "HTML" },
  css:  { bg: "#264de4", fg: "#fff",    label: "CSS"  },
  json: { bg: "#cbcb41", fg: "#1a1a1a", label: "JSON" },
  md:   { bg: "#519aba", fg: "#fff",    label: "MD"   },
  rs:   { bg: "#dea584", fg: "#1a1a1a", label: "RS"   },
  rb:   { bg: "#cc342d", fg: "#fff",    label: "RB"   },
  java: { bg: "#ed8b00", fg: "#fff",    label: "JV"   },
  cpp:  { bg: "#9c4221", fg: "#fff",    label: "CPP"  },
  c:    { bg: "#a8b9cc", fg: "#1a1a1a", label: "C"    },
  sh:   { bg: "#4eaa25", fg: "#fff",    label: "SH"   },
  yaml: { bg: "#cc1018", fg: "#fff",    label: "YML"  },
  git:  { bg: "#f14e32", fg: "#fff",    label: "GIT"  },
};

function FileIcon({ name, ext }: { name: string; ext?: string }) {
  const [failed, setFailed] = useState(false);
  const key = (name.startsWith(".git")) ? "gitignore"
    : (ext ?? name.split(".").pop() ?? "").toLowerCase();
  const iconName = EXT_ICON[key];
  if (iconName && !failed) {
    return (
      <img src={`${CDN}${iconName}.svg`} width="16" height="16" alt={key}
        onError={() => setFailed(true)}
        style={{ flexShrink: 0, display: "block", minWidth: "16px" }} />
    );
  }
  const ic = FALLBACK[key] ?? { bg: "#6d8086", fg: "#fff", label: key.slice(0,4).toUpperCase() || "FILE" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", background: ic.bg, color: ic.fg, fontSize: "5.5px", fontWeight: "bold", borderRadius: "2px", flexShrink: 0, fontFamily: "monospace" }}>
      {ic.label}
    </span>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img src={`${CDN}${open ? "folder-open" : "folder"}.svg`} width="16" height="16" alt="folder"
        onError={() => setFailed(true)}
        style={{ flexShrink: 0, display: "block", minWidth: "16px" }} />
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill={open ? "#e8bf6a" : "#dcb67a"}/>
    </svg>
  );
}

// ─── Activity icons ──────────────────────────────────────────────────────────
const ACT = {
  explorer: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" stroke={a?"#cccccc":"#858585"} strokeWidth="1.5"/>
    </svg>
  ),
  search: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
    </svg>
  ),
  git: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="18" cy="18" r="3" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <circle cx="6" cy="6" r="3" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <circle cx="6" cy="18" r="3" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <path d="M6 9v1a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v1" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <line x1="6" y1="9" x2="6" y2="15" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
    </svg>
  ),
  debug: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <polygon points="5 3 19 12 5 21 5 3" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
    </svg>
  ),
  extensions: (a: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="9" height="9" rx="1" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <rect x="13" y="2" width="9" height="9" rx="1" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <rect x="2" y="13" width="9" height="9" rx="1" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
      <path d="M13 17.5h9M17.5 13v9" stroke={a?"#cccccc":"#858585"} strokeWidth="2"/>
    </svg>
  ),
};

const SvgUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#858585" strokeWidth="2"/>
    <circle cx="12" cy="7" r="4" stroke="#858585" strokeWidth="2"/>
  </svg>
);
const SvgSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="#858585" strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#858585" strokeWidth="2"/>
  </svg>
);
const SvgClose = (c = "#858585") => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2"/>
  </svg>
);
const SvgChevR = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <polyline points="9 18 15 12 9 6" stroke="#858585" strokeWidth="2"/>
  </svg>
);
const SvgChevD = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <polyline points="6 9 12 15 18 9" stroke="#858585" strokeWidth="2"/>
  </svg>
);

// ─── File tree types ─────────────────────────────────────────────────────────
interface FileEntry {
  id: string; name: string; isFolder?: boolean;
  parentId: string | null; depth: number; lang?: string; ext?: string;
}

const ROOT_FILES: FileEntry[] = [];

const LANGUAGES = [
  "ABAP","ActionScript","Ada","Apex","APL","AppleScript","Arduino","Assembly","Astro",
  "AutoHotkey","Awk","Bash","Batch","C","C#","C++","Carbon","Clojure","CoffeeScript",
  "Crystal","CSS","D","Dart","Delphi","Dockerfile","Elixir","Elm","Erlang","F#",
  "Fish","Fortran","Go","Groovy","Hack","Haskell","HTML","Java","JavaScript","Julia",
  "Kotlin","LaTeX","Lisp","Lua","MATLAB","Nim","Nix","Objective-C","OCaml","Pascal",
  "Perl","PHP","PowerShell","Prolog","Python","R","Ruby","Rust","Scala","Shell",
  "Solidity","SQL","Svelte","Swift","Tcl","TypeScript","V","Vala","Verilog","VHDL",
  "Vue","Zig",
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
  typescript: ["interface","type","const","let","var","function","async","await","return","if","else","for","while","do","class","extends","implements","import","export","from","default","new","throw","try","catch","finally","in","of","typeof","instanceof","void","null","undefined","true","false","number","string","boolean","any","never","never","readonly","enum","namespace","declare","abstract","switch","case","break","continue","delete","this","super","static","get","set","keyof","infer","satisfies"],
  typescriptreact: ["interface","type","const","let","var","function","async","await","return","if","else","for","while","do","class","extends","implements","import","export","from","default","new","throw","try","catch","finally","in","of","typeof","instanceof","void","null","undefined","true","false","React","useState","useEffect","useRef","useCallback","useMemo","useContext","useReducer","useLayoutEffect","JSX","switch","case","break","continue","abstract","readonly","enum","keyof"],
  javascript: ["const","let","var","function","async","await","return","if","else","for","while","do","class","extends","import","export","from","default","new","throw","try","catch","finally","in","of","typeof","instanceof","void","null","undefined","true","false","switch","case","break","continue","delete","yield","this","super","static","get","set","with","debugger","prototype"],
  javascriptreact: ["const","let","var","function","async","await","return","if","else","for","while","do","class","extends","import","export","from","default","new","throw","try","catch","finally","in","of","typeof","instanceof","void","null","undefined","true","false","switch","case","break","continue","delete","yield","this","super","static","React","useState","useEffect","useRef","useCallback","useMemo","useContext"],
  python: ["def","class","import","from","return","if","elif","else","for","while","with","as","try","except","finally","raise","and","or","not","in","is","True","False","None","lambda","yield","pass","break","continue","global","nonlocal","async","await","print","len","range","type","str","int","float","list","dict","tuple","set","bool","self","super","object","property","classmethod","staticmethod","__init__","__str__","__repr__","__len__","__main__"],
  go: ["func","package","import","var","const","type","struct","interface","return","if","else","for","range","switch","case","default","go","chan","select","defer","make","new","len","cap","append","copy","delete","map","true","false","nil","string","int","int8","int16","int32","int64","uint","uint8","uint16","uint32","uint64","float32","float64","complex64","complex128","bool","byte","rune","uintptr","error","fmt","os","io","log","sync","context","http","json"],
  rust: ["fn","let","mut","const","static","struct","enum","impl","trait","use","mod","pub","priv","super","self","Self","crate","return","if","else","for","while","loop","match","break","continue","where","type","as","in","ref","extern","unsafe","async","await","move","dyn","Box","Option","Result","Some","None","Ok","Err","Vec","String","str","i8","i16","i32","i64","i128","u8","u16","u32","u64","u128","f32","f64","bool","char","usize","isize","println","eprintln","panic","unwrap","expect","Clone","Copy","Debug","Default","Display","Iterator","Into","From","Send","Sync"],
  java: ["public","private","protected","static","final","class","interface","enum","extends","implements","return","if","else","for","while","do","try","catch","finally","throw","throws","new","import","package","void","int","long","short","byte","double","float","boolean","char","String","Object","null","true","false","this","super","switch","case","break","continue","default","abstract","synchronized","volatile","transient","native","instanceof","strictfp","System","out","println","ArrayList","HashMap","List","Map","Set","Optional","Stream","override","annotation"],
  c: ["int","long","short","char","double","float","void","unsigned","signed","const","static","extern","register","volatile","auto","restrict","inline","if","else","for","while","do","switch","case","break","continue","return","goto","struct","union","enum","typedef","sizeof","NULL","true","false","include","define","ifdef","ifndef","endif","elif","undef","pragma","error","warning","printf","scanf","malloc","free","calloc","realloc","memcpy","memset","strlen","strcmp","strcpy","fprintf","stderr","stdin","stdout","FILE"],
  cpp: ["int","long","short","char","double","float","void","unsigned","signed","const","static","extern","register","volatile","auto","inline","if","else","for","while","do","switch","case","break","continue","return","goto","struct","union","enum","typedef","sizeof","nullptr","NULL","true","false","class","public","private","protected","virtual","override","final","new","delete","template","typename","namespace","using","friend","operator","mutable","constexpr","decltype","explicit","this","static_cast","dynamic_cast","reinterpret_cast","const_cast","std","cout","cin","cerr","endl","vector","string","map","set","pair","unique_ptr","shared_ptr","make_unique","make_shared","include","define"],
  ruby: ["def","end","class","module","require","require_relative","include","extend","prepend","attr_reader","attr_writer","attr_accessor","return","if","elsif","else","unless","case","when","while","until","for","do","begin","rescue","ensure","raise","retry","yield","self","super","true","false","nil","and","or","not","then","in","puts","print","p","pp","lambda","proc","block","new","initialize","each","map","select","reject","reduce","inject","find","any","all","none","count","first","last","flatten","compact","uniq","sort","reverse","freeze","frozen","dup","clone","tap","then","itself"],
  php: ["echo","print","var_dump","var_export","function","class","interface","trait","extends","implements","abstract","final","return","if","elseif","else","foreach","for","while","do","switch","case","break","continue","try","catch","finally","throw","new","namespace","use","public","private","protected","static","null","true","false","array","string","int","float","bool","void","mixed","self","parent","this","require","include","require_once","include_once","isset","unset","empty","list","match","readonly","enum","fn","arrow","yield","from","instanceof","and","or","xor","print_r","sprintf","printf","strlen","strpos","str_replace","array_map","array_filter","array_push","array_pop","count","implode","explode"],
  bash: ["if","then","else","elif","fi","for","do","done","while","until","case","esac","in","select","function","return","exit","break","continue","local","readonly","declare","typeset","export","unset","shift","true","false","echo","printf","read","source","alias","unalias","set","unset","test","let","expr","eval","exec","trap","wait","jobs","bg","fg","kill","sleep","pwd","cd","ls","mkdir","rmdir","rm","cp","mv","cat","grep","sed","awk","cut","sort","uniq","wc","find","xargs","head","tail","diff","chmod","chown","chgrp","curl","wget","ssh","scp","tar","gzip","gunzip","zip","unzip"],
  kotlin: ["fun","val","var","class","object","data","sealed","abstract","open","override","companion","interface","enum","annotation","inline","infix","operator","tailrec","external","if","else","when","for","while","do","return","null","true","false","is","!is","in","!in","as","as?","by","it","this","super","constructor","init","package","import","public","private","protected","internal","suspend","coroutine","launch","async","withContext","runBlocking","flow","collect","emit","delay","let","run","also","apply","with","takeIf","takeUnless","repeat","listOf","mutableListOf","mapOf","mutableMapOf","setOf","mutableSetOf","arrayOf","sequenceOf","String","Int","Long","Float","Double","Boolean","Char","Unit","Any","Nothing","Number","Pair","Triple","List","Map","Set","Array"],
  swift: ["func","var","let","class","struct","enum","protocol","extension","actor","import","return","if","else","guard","for","while","repeat","switch","case","break","continue","default","throw","throws","rethrows","try","catch","init","deinit","self","Self","super","true","false","nil","in","is","as","as?","as!","new","weak","unowned","static","final","override","public","private","internal","fileprivate","open","lazy","mutating","nonmutating","get","set","willSet","didSet","typealias","associatedtype","where","some","any","@escaping","@autoclosure","@objc","@available","@discardableResult","String","Int","Double","Float","Bool","Character","Array","Dictionary","Set","Optional","Result","Error","print","fatalError","precondition","assert","defer","async","await","Task","MainActor"],
  dart: ["void","var","final","const","late","required","class","extends","implements","mixin","abstract","sealed","interface","base","return","if","else","for","while","do","switch","case","break","continue","default","try","catch","on","finally","throw","rethrow","new","import","export","part","of","library","as","show","hide","async","await","yield","sync","true","false","null","this","super","static","factory","get","set","typedef","covariant","dynamic","external","is","as","in","String","int","double","bool","num","List","Map","Set","Future","Stream","Iterable","Object","Enum","Symbol","Never","print","debugPrint"],
  lua: ["and","break","do","else","elseif","end","false","for","function","goto","if","in","local","nil","not","or","repeat","return","then","true","until","while","print","require","type","pairs","ipairs","next","select","tostring","tonumber","rawget","rawset","rawequal","rawlen","pcall","xpcall","error","assert","load","dofile","loadfile","loadstring","collectgarbage","coroutine","table","string","math","io","os","debug","utf8","package","io.read","io.write","table.insert","table.remove","table.concat","string.format","string.find","string.match","math.floor","math.ceil","math.random"],
  sql: ["SELECT","FROM","WHERE","JOIN","INNER","LEFT","RIGHT","FULL","CROSS","OUTER","ON","AS","AND","OR","NOT","NULL","IS","IN","LIKE","ILIKE","BETWEEN","ORDER","BY","GROUP","HAVING","LIMIT","OFFSET","UNION","ALL","DISTINCT","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","DROP","ALTER","ADD","COLUMN","INDEX","PRIMARY","KEY","FOREIGN","REFERENCES","UNIQUE","DEFAULT","CONSTRAINT","CHECK","VIEW","MATERIALIZED","TRIGGER","PROCEDURE","FUNCTION","RETURNS","LANGUAGE","BEGIN","END","COMMIT","ROLLBACK","TRANSACTION","SAVEPOINT","RELEASE","IF","EXISTS","CASE","WHEN","THEN","ELSE","COALESCE","NULLIF","CAST","COUNT","SUM","AVG","MIN","MAX","ROUND","FLOOR","CEIL","NOW","CURRENT_DATE","CURRENT_TIME","EXTRACT","DATE_TRUNC","CONCAT","UPPER","LOWER","TRIM","LENGTH","SUBSTRING","REPLACE","ROW_NUMBER","RANK","DENSE_RANK","OVER","PARTITION","WITH","RECURSIVE","EXPLAIN","ANALYZE","VACUUM"],
  scala: ["def","val","var","class","object","trait","case","abstract","sealed","final","override","extends","with","import","package","type","if","else","for","while","do","return","null","true","false","new","this","super","match","yield","lazy","implicit","given","using","inline","opaque","erased","extension","derives","enum","then","try","catch","finally","throw","while","until","to","by","String","Int","Long","Float","Double","Boolean","Char","Unit","Any","Nothing","AnyRef","AnyVal","Byte","Short","BigInt","BigDecimal","List","Vector","Array","Map","Set","Option","Some","None","Either","Left","Right","Try","Success","Failure","Future","Seq","IndexedSeq","Iterable","Iterator","Tuple"],
  haskell: ["where","let","in","do","if","then","else","case","of","data","type","newtype","class","instance","module","import","qualified","as","hiding","deriving","forall","exists","infixl","infixr","infix","foreign","return","show","read","map","filter","foldr","foldl","foldl1","foldr1","head","tail","last","init","null","length","take","drop","zip","unzip","zipWith","lines","words","unlines","unwords","Just","Nothing","Left","Right","IO","String","Int","Integer","Double","Float","Bool","Char","Maybe","Either","Ordering","EQ","LT","GT","True","False","otherwise","undefined","error","seq","id","const","flip","curry","uncurry","fst","snd","putStrLn","putStr","getLine","print","interact","readFile","writeFile"],
  elixir: ["def","defp","defmodule","defprotocol","defimpl","defmacro","defmacrop","defstruct","defexception","defguard","defguardp","defdelegate","do","end","fn","if","unless","cond","case","receive","send","try","catch","rescue","after","for","with","when","and","or","not","in","true","false","nil","is_nil","is_atom","is_binary","is_boolean","is_float","is_integer","is_list","is_map","is_number","is_pid","is_port","is_reference","is_tuple","IO","Enum","List","Map","String","Keyword","Agent","Task","GenServer","Supervisor","Application","Process","Node","System","File","Path","Logger","Jason","Plug","Phoenix"],
  r: ["if","else","for","while","repeat","function","return","next","break","in","TRUE","FALSE","NULL","NA","NA_integer_","NA_real_","NA_complex_","NA_character_","Inf","NaN","LETTERS","letters","pi","T","F","library","require","source","print","cat","message","warning","stop","paste","paste0","sprintf","format","c","list","vector","matrix","data.frame","data.table","tibble","array","factor","table","read.csv","write.csv","readLines","writeLines","apply","lapply","sapply","vapply","tapply","mapply","Map","Reduce","Filter","which","subset","merge","aggregate","sum","mean","median","sd","var","min","max","range","length","nrow","ncol","dim","str","summary","head","tail","rbind","cbind","ggplot","aes","geom_point","geom_line","geom_bar","dplyr","tidyr","ggplot2","magrittr"],
  css: [],
  scss: [],
  html: [],
  json: [],
  markdown: [],
  plaintext: [],
};

function esc(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function highlight(code: string, lang: string): string {
  if (lang === "json") {
    return esc(code)
      .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color:#9cdcfe">$1</span>:')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#ce9178">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span style="color:#569cd6">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#b5cea8">$1</span>');
  }
  if (lang === "markdown") {
    return esc(code)
      .replace(/^(#{1,6} .+)$/gm, '<span style="color:#569cd6;font-weight:bold">$1</span>')
      .replace(/(`[^`]+`)/g, '<span style="color:#ce9178">$1</span>')
      .replace(/(\*\*[^*]+\*\*)/g, '<span style="font-weight:bold;color:#d4d4d4">$1</span>')
      .replace(/^(\|.+\|)$/gm, '<span style="color:#4ec9b0">$1</span>');
  }
  if (lang === "css") {
    return esc(code)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955">$1</span>')
      .replace(/([.#:\w-]+)\s*\{/g, '<span style="color:#d7ba7d">$1</span> {')
      .replace(/([\w-]+)\s*:/g, '<span style="color:#9cdcfe">$1</span>:')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#ce9178">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg|s|ms)?)\b/g, '<span style="color:#b5cea8">$1</span>');
  }
  if (lang === "html") {
    let out = "";
    let i = 0;

    while (i < code.length) {
      if (code.startsWith("<!--", i)) {
        const end = code.indexOf("-->", i + 4);
        const part = end === -1 ? code.slice(i) : code.slice(i, end + 3);
        out += `<span style="color:#6a9955">${esc(part)}</span>`;
        i += part.length;
        continue;
      }

      if (code[i] === "<") {
        const end = code.indexOf(">", i + 1);

        if (end === -1) {
          out += esc(code.slice(i));
          break;
        }

        const tagText = code.slice(i, end + 1);
        const match = tagText.match(/^<\/?([a-zA-Z][\w-]*)/);

        if (!match) {
          out += esc(tagText);
          i = end + 1;
          continue;
        }

        let colored = esc(tagText);

        colored = colored.replace(
          /^(&lt;\/?)([a-zA-Z][\w-]*)/,
          `$1<span style="color:#569cd6">$2</span>`,
        );

        colored = colored.replace(
          /\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)(=)/g,
          ` <span style="color:#9cdcfe">$1</span>$2`,
        );

        colored = colored.replace(
          /=(&quot;[^&]*&quot;|'[^']*')/g,
          `=<span style="color:#ce9178">$1</span>`,
        );

        out += colored;
        i = end + 1;
        continue;
      }

      out += esc(code[i]);
      i++;
    }

    return out;
  }

  const kws = KEYWORDS[lang] ?? [];
  let result = "";
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    // Lua / SQL / Haskell double-dash comment
    if (ch === "-" && code[i+1] === "-" && ["lua","sql","haskell"].includes(lang)) {
      const end = code.indexOf("\n", i);
      const line = end === -1 ? code.slice(i) : code.slice(i, end);
      result += `<span style="color:#6a9955">${esc(line)}</span>`;
      i = end === -1 ? code.length : end;
      continue;
    }
    // Hash-style line comment
    if (ch === "#" && ["python","ruby","bash","r","elixir","perl","coffeescript"].includes(lang)) {
      const end = code.indexOf("\n", i);
      const line = end === -1 ? code.slice(i) : code.slice(i, end);
      result += `<span style="color:#6a9955">${esc(line)}</span>`;
      i = end === -1 ? code.length : end;
      continue;
    }
    // Line comment
    if (ch === "/" && code[i+1] === "/") {
      const end = code.indexOf("\n", i);
      const line = end === -1 ? code.slice(i) : code.slice(i, end);
      result += `<span style="color:#6a9955">${esc(line)}</span>`;
      i = end === -1 ? code.length : end;
      continue;
    }
    // Block comment
    if (ch === "/" && code[i+1] === "*") {
      const end = code.indexOf("*/", i+2);
      const block = end === -1 ? code.slice(i) : code.slice(i, end+2);
      result += `<span style="color:#6a9955">${esc(block)}</span>`;
      i = end === -1 ? code.length : end+2;
      continue;
    }
    // Double string
    if (ch === '"') {
      let j = i+1;
      while (j < code.length && (code[j] !== '"' || code[j-1] === "\\")) j++;
      result += `<span style="color:#ce9178">${esc(code.slice(i, j+1))}</span>`;
      i = j+1; continue;
    }
    // Single string
    if (ch === "'") {
      let j = i+1;
      while (j < code.length && (code[j] !== "'" || code[j-1] === "\\")) j++;
      result += `<span style="color:#ce9178">${esc(code.slice(i, j+1))}</span>`;
      i = j+1; continue;
    }
    // Template literal
    if (ch === "`") {
      let j = i+1;
      while (j < code.length && (code[j] !== "`" || code[j-1] === "\\")) j++;
      result += `<span style="color:#ce9178">${esc(code.slice(i, j+1))}</span>`;
      i = j+1; continue;
    }
    // Number
    if (/\d/.test(ch) && (i === 0 || /\W/.test(code[i-1]))) {
      let j = i;
      while (j < code.length && /[\d.xXa-fA-F_]/.test(code[j])) j++;
      result += `<span style="color:#b5cea8">${esc(code.slice(i,j))}</span>`;
      i = j; continue;
    }
    // Identifier
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < code.length && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (kws.includes(word)) {
        result += `<span style="color:#569cd6">${esc(word)}</span>`;
      } else if (/^[A-Z]/.test(word)) {
        result += `<span style="color:#4ec9b0">${esc(word)}</span>`;
      } else if (j < code.length && code[j] === "(") {
        result += `<span style="color:#dcdcaa">${esc(word)}</span>`;
      } else {
        result += esc(word);
      }
      i = j; continue;
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
): Promise<string> {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  const cmd = parts[0] ?? "";
  const args = parts.slice(1);

  const findFile = (name?: string) => {
    if (!name) {
      return activeTab
        ? files.find(f => f.id === activeTab && !f.isFolder) ?? null
        : null;
    }

    return files.find(f => !f.isFolder && (f.name === name || f.id === name)) ?? null;
  };

  const runFile = async (name?: string, forcedLang?: string) => {
    const f = findFile(name);

    if (!f) {
      return name ? `${name}: No such file` : "No active file to run.";
    }

    const code =
      fileContents[f.id] ??
      fileContents[f.name] ??
      "";

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
    });
  };

  switch (cmd) {
    case "":
      return "";

    case "clear":
      return "\x00CLEAR";

    case "help":
      return [
        "Run examples:",
        "python main.py",
        "python3 main.py",
        "node main.js",
        "tsx main.ts",
        "gcc main.c",
        "g++ main.cpp",
        "java Main.java",
        "go run main.go",
        "rustc main.rs",
        "run",
      ].join("\n");

    case "ls":
      return [
        ...files.filter(f => f.isFolder).map(f => f.name + "/"),
        ...files.filter(f => !f.isFolder).map(f => f.name),
      ].join("  ") || "(empty)";

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
      return await runFile(args.find(a => a.endsWith(".c")), "c");

    case "g++":
    case "clang++":
      return await runFile(args.find(a => /\.(cpp|cc|cxx)$/.test(a)), "cpp");

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

    default:
      return `${cmd}: command not found`;
  }
}

// ─── Extensions list ─────────────────────────────────────────────────────────
const ALL_EXTENSIONS = [
  { id: "prettier",  name: "Prettier",                    desc: "Code formatter",           author: "Prettier" },
  { id: "eslint",    name: "ESLint",                      desc: "Linting for JS/TS",        author: "Microsoft" },
  { id: "copilot",   name: "GitHub Copilot",              desc: "AI pair programmer",        author: "GitHub" },
  { id: "python",    name: "Python",                      desc: "Python language support",  author: "Microsoft" },
  { id: "go",        name: "Go",                          desc: "Go language support",       author: "Go Team at Google" },
  { id: "rust",      name: "Rust Analyzer",               desc: "Rust language support",    author: "rust-lang" },
  { id: "gitlens",   name: "GitLens",                     desc: "Git supercharged",          author: "GitKraken" },
  { id: "tailwind",  name: "Tailwind CSS IntelliSense",   desc: "Autocomplete & linting",   author: "Tailwind Labs" },
  { id: "theme-dark",name: "One Dark Pro",                desc: "Dark theme",               author: "binaryify" },
  { id: "indent",    name: "indent-rainbow",              desc: "Colorize indentation",     author: "oderwat" },
];

type RunRequest = {
  language: string;
  code: string;
  filename: string;
};

function languageFromFileName(name: string): string {
  const lower = name.toLowerCase();

  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return "javascript";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".tsx")) return "typescriptreact";
  if (lower.endsWith(".jsx")) return "javascriptreact";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".cxx")) return "cpp";
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

const PISTON_LANG: Record<string, { language: string; version: string }> = {
  python:          { language: "python",     version: "3.*"  },
  javascript:      { language: "javascript", version: "18.*" },
  javascriptreact: { language: "javascript", version: "18.*" },
  typescript:      { language: "typescript", version: "5.*"  },
  typescriptreact: { language: "typescript", version: "5.*"  },
  go:              { language: "go",         version: "1.*"  },
  rust:            { language: "rust",       version: "1.*"  },
  java:            { language: "java",       version: "15.*" },
  c:               { language: "c",          version: "10.*" },
  cpp:             { language: "c++",        version: "10.*" },
  ruby:            { language: "ruby",       version: "3.*"  },
  php:             { language: "php",        version: "8.*"  },
  kotlin:          { language: "kotlin",     version: "1.*"  },
  swift:           { language: "swift",      version: "5.*"  },
  lua:             { language: "lua",        version: "5.*"  },
  bash:            { language: "bash",       version: "5.*"  },
  r:               { language: "r",          version: "4.*"  },
  dart:            { language: "dart",       version: "2.*"  },
  scala:           { language: "scala",      version: "3.*"  },
  csharp:          { language: "csharp",     version: "6.*"  },
  fsharp:          { language: "fsharp",     version: "5.*"  },
  haskell:         { language: "haskell",    version: "9.*"  },
  elixir:          { language: "elixir",     version: "1.*"  },
  perl:            { language: "perl",       version: "5.*"  },
  julia:           { language: "julia",      version: "1.*"  },
  nim:             { language: "nim",        version: "1.*"  },
  zig:             { language: "zig",        version: "0.*"  },
};

async function executeOnline(req: RunRequest): Promise<string> {
  const spec = PISTON_LANG[req.language.toLowerCase()];
  if (!spec) {
    return `'${req.language}' is not a supported execution language.\nSupported: python, javascript, typescript, go, rust, java, c, c++, ruby, php, kotlin, swift, lua, bash, r, dart, scala, and more.`;
  }
  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: spec.language,
        version: spec.version,
        files: [{ name: req.filename, content: req.code }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return `Piston API error ${res.status}: ${text.slice(0, 300)}`;
    }
    const data = await res.json() as {
      compile?: { code: number; output: string; stderr: string };
      run?: { code: number; output: string; stderr: string; signal: string | null };
      message?: string;
    };
    if (data.message) return `Error: ${data.message}`;
    if (data.compile && data.compile.code !== 0) {
      const out = (data.compile.stderr || data.compile.output || "Compilation failed").trim();
      return out;
    }
    const run = data.run;
    if (!run) return "No output.";
    const output = run.output?.trim() || run.stderr?.trim() || "";
    if (!output) {
      return run.signal
        ? `Process killed by signal: ${run.signal}`
        : run.code === 0
          ? "Process exited with code 0"
          : `Process exited with code ${run.code}`;
    }
    return output;
  } catch (err) {
    return `Network error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VSCode({ onLaunchGame }: Props) {
  const [files, setFiles] = useState<FileEntry[]>(ROOT_FILES);
  const [fileContents, setFileContents] = useState<Record<string, string>>(STARTER);

  const fileContentsRef = useRef<Record<string, string>>(STARTER);

  useEffect(() => {
    fileContentsRef.current = fileContents;
  }, [fileContents]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeActivity, setActiveActivity] = useState<"explorer"|"search"|"git"|"debug"|"extensions">("explorer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [selectedLang, setSelectedLang] = useState("Plain Text");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langFilter, setLangFilter] = useState("");

  // Extensions
  const [installedExts, setInstalledExts] = useState<Set<string>>(new Set());
  const [installingExts, setInstallingExts] = useState<Set<string>>(new Set());
  const [extSearch, setExtSearch] = useState("");

  // New item input
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<"file"|"folder">("file");
  const [newItemName, setNewItemName] = useState("");
  const newItemRef = useRef<HTMLInputElement>(null);

  // Search bar dropdown (in menu bar)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Sidebar search
  const [sidebarSearchQ, setSidebarSearchQ] = useState("");
  const [sidebarReplaceQ, setSidebarReplaceQ] = useState("");
  const [searchResults, setSearchResults] = useState<{ fileId: string; fileName: string; line: number; text: string }[]>([]);

  // Editor
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const lineNumRef = useRef<HTMLDivElement>(null);

  // Terminal
  const [termSessions, setTermSessions] = useState([{ id: 1, lines: ["Welcome to CodeForge terminal.", "Type 'help' for available commands.", ""] }]);
  const [activeTermId, setActiveTermId] = useState(1);
  const [termInputs, setTermInputs] = useState<Record<number, string>>({ 1: "" });
  const [termHistories, setTermHistories] = useState<Record<number, string[]>>({ 1: [] });
  const [historyIdxes, setHistoryIdxes] = useState<Record<number, number>>({ 1: -1 });
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { termEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [termSessions, activeTermId]);
  useEffect(() => { if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 30); }, [searchOpen]);
  useEffect(() => { if (newItemParent !== null) setTimeout(() => newItemRef.current?.focus(), 30); }, [newItemParent]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const getFileContent = useCallback((name: string) => fileContents[name] ?? STARTER[name] ?? "", [fileContents]);

  const openFile = useCallback((id: string) => {
    const f = files.find(x => x.id === id);
    if (!f || f.isFolder) return;
    if (!openTabs.includes(id)) setOpenTabs(t => [...t, id]);
    setActiveTab(id);
    setSelectedFile(id);
    const lmap: Record<string, string> = {
      typescript: "TypeScript", typescriptreact: "TypeScript JSX",
      python: "Python", go: "Go", css: "CSS", html: "HTML",
      json: "JSON", markdown: "Markdown", plaintext: "Plain Text",
    };
    setSelectedLang(lmap[f.lang ?? ""] ?? "Plain Text");
  }, [files, openTabs]);

  const closeTab = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idx = openTabs.indexOf(id);
    const next = openTabs.filter(t => t !== id);
    setOpenTabs(next);
    if (activeTab === id) setActiveTab(next[Math.max(0, idx - 1)] ?? null);
  }, [openTabs, activeTab]);

  // Search dropdown handler
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

  // Sidebar search
  const doSearch = () => {
    if (!sidebarSearchQ.trim()) { setSearchResults([]); return; }
    const q = sidebarSearchQ.toLowerCase();
    const results: { fileId: string; fileName: string; line: number; text: string }[] = [];
    files.filter(f => !f.isFolder).forEach(f => {
      const content = getFileContent(f.name);
      content.split("\n").forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(q)) {
          results.push({ fileId: f.id, fileName: f.name, line: idx + 1, text: lineText.trim() });
        }
      });
    });
    setSearchResults(results);
  };

  const doReplaceAll = () => {
    if (!sidebarSearchQ.trim()) return;
    const updated = { ...fileContents };
    files.filter(f => !f.isFolder).forEach(f => {
      const content = getFileContent(f.name);
      const regex = new RegExp(sidebarSearchQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      if (regex.test(content)) {
        updated[f.name] = content.replace(regex, sidebarReplaceQ);
      }
    });
    setFileContents(updated);
    doSearch();
  };

  // New item creation
  const startNewItem = (type: "file"|"folder") => {
    let parentId = "root";
    if (selectedFile) {
      const sel = files.find(f => f.id === selectedFile);
      if (sel?.isFolder) {
        parentId = selectedFile;
        setExpanded(ex => ({ ...ex, [selectedFile]: true }));
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

    const parentEntry = files.find(f => f.id === realParentId);
    const depth = realParentId === null ? 0 : (parentEntry?.depth ?? 0) + 1;

    const rawExt = name.includes(".") ? name.split(".").pop() ?? "" : "";
    const ext = name.startsWith(".git") ? "git" : rawExt;

    const newEntry: FileEntry = {
      id: `${name}-${Date.now()}`,
      name,
      isFolder: newItemType === "folder",
      parentId: realParentId,
      depth,
      lang:
        newItemType === "file"
          ? rawExt === "ts"
            ? "typescript"
            : rawExt === "tsx"
            ? "typescriptreact"
            : rawExt === "py"
            ? "python"
            : rawExt === "go"
            ? "go"
            : rawExt === "css"
            ? "css"
            : rawExt === "html"
            ? "html"
            : rawExt === "json"
            ? "json"
            : rawExt === "md"
            ? "markdown"
            : "plaintext"
          : undefined,
      ext: newItemType === "file" ? ext : undefined,
    };

    setFiles(f => [...f, newEntry]);

    if (newItemType === "file") {
      setFileContents(c => ({ ...c, [name]: "" }));
      setTimeout(() => openFile(newEntry.id), 50);
    }

    if (realParentId !== null) {
      setExpanded(ex => ({ ...ex, [realParentId]: true }));
    }

    setNewItemParent(null);
    setNewItemName("");
  };

  // Terminal
  const termInput = termInputs[activeTermId] ?? "";
  const setTermInput = (v: string) => setTermInputs(p => ({ ...p, [activeTermId]: v }));

  const handleTermKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = termHistories[activeTermId] ?? [];
    const hidx = historyIdxes[activeTermId] ?? -1;
    if (e.key === "Enter") {
      const input = termInput.trim();
      const sessionId = activeTermId;

      setTermSessions(ss =>
        ss.map(s =>
          s.id === sessionId
            ? { ...s, lines: [...s.lines, `\x02${CWD}\x03${input}`, ...(input ? ["Running..."] : [])] }
            : s
        )
      );

      if (input) {
        setTermHistories(h => ({
          ...h,
          [sessionId]: [input, ...(h[sessionId] ?? [])].slice(0, 100),
        }));
      }

      setHistoryIdxes(h => ({ ...h, [sessionId]: -1 }));
      setTermInput("");

          runCmd(input, files, fileContentsRef.current, activeTab).then(result => {
        setTermSessions(ss =>
          ss.map(s => {
            if (s.id !== sessionId) return s;
            const lines = s.lines.filter(line => line !== "Running...");
            if (result === "\x00CLEAR") return { ...s, lines: [] };
            return { ...s, lines: [...lines, ...(result ? result.split("\n") : [])] };
          })
        );
      });

      return;
    }
    if (e.key === "ArrowUp") { e.preventDefault(); const idx=Math.min(hidx+1,history.length-1); setHistoryIdxes(h=>({...h,[activeTermId]:idx})); setTermInput(history[idx]??""); }
    if (e.key === "ArrowDown") { e.preventDefault(); const idx=Math.max(hidx-1,-1); setHistoryIdxes(h=>({...h,[activeTermId]:idx})); setTermInput(idx===-1?"":history[idx]); }
    if (e.key === "Tab") { e.preventDefault(); const cmds=["ls","pwd","cd","echo","cat","mkdir","touch","rm","date","whoami","node","python","go","npm","git","clear","help"]; const m=cmds.find(c=>c.startsWith(termInput)&&c!==termInput); if(m)setTermInput(m+" "); }
    if (e.key==="c"&&e.ctrlKey) setTermInput("");
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

  const renderTermLine = (line: string, i: number) => {
    if (line.startsWith("\x02")) {
      const rest = line.slice(1);
      const p = rest.indexOf("\x03");
      const dir = rest.slice(0, p);
      const cmd = rest.slice(p + 1);
      return (
        <div key={i} style={{ display: "flex", flexWrap: "wrap" }}>
          <span style={{ color: "#4ec9b0", fontWeight: "bold" }}>codeforge@workspace</span>
          <span style={{ color: "#858585" }}> {dir} </span>
          <span style={{ color: "#cccccc" }}>% </span>
          <span style={{ color: "#d4d4d4" }}>{cmd}</span>
        </div>
      );
    }
    return <div key={i} style={{ color: "#cccccc", whiteSpace: "pre-wrap" }}>{line}</div>;
  };

  // Visible tree entries
  const visibleFiles = (() => {
    const result: FileEntry[] = [];
    const add = (parentId: string | null) => {
      files.filter(f => f.parentId === parentId).forEach(f => {
        result.push(f);
        if (f.isFolder && expanded[f.id]) add(f.id);
      });
    };
    add(null);
    return result;
  })();

  const filteredLangs = LANGUAGES.filter(l => l.toLowerCase().includes(langFilter.toLowerCase()));
  const activeFile = activeTab ? files.find(f => f.id === activeTab) : null;
  const activeCode = activeFile ? getFileContent(activeFile.id) : "";

  // Search dropdown results
  const searchDropdownFiles = files.filter(f => !f.isFolder && f.name.toLowerCase().includes(searchValue.toLowerCase())).slice(0, 8);

  const openSearch = () => {
    setSearchOpen(s => !s);
    if (!searchOpen) setSearchValue("");
  };

  const extList = extSearch ? ALL_EXTENSIONS.filter(e => e.name.toLowerCase().includes(extSearch.toLowerCase()) || e.desc.toLowerCase().includes(extSearch.toLowerCase())) : ALL_EXTENSIONS;
  const installedList = extList.filter(e => installedExts.has(e.id));
  const availableList = extList.filter(e => !installedExts.has(e.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", background: "#1e1e1e", color: "#cccccc", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: "13px", overflow: "hidden" }}
      onClick={() => { setShowLangPicker(false); }}>

      {/* ── Menu Bar ── */}
      <MenuBar
        searchBarRef={searchBarRef}
        searchOpen={searchOpen}
        searchValue={searchValue}
        searchInputRef={searchInputRef}
        onSearchClick={openSearch}
        onSearchChange={v => setSearchValue(v)}
        onSearchKey={handleSearchKey}
        searchResults={searchDropdownFiles}
        onOpenFile={id => { openFile(id); setSearchOpen(false); setSearchValue(""); }}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
        onToggleTerminal={() => setTerminalOpen(t => !t)}
        onNewFile={() => startNewItem("file")}
        onNewFolder={() => startNewItem("folder")}
        onSave={() => {}}
      />

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Activity Bar */}
        <div style={{ width: "48px", background: "#333333", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px", borderRight: "1px solid #252526", flexShrink: 0 }}>
          {(["explorer","search","git","debug","extensions"] as const).map(act => (
            <div key={act} title={act.charAt(0).toUpperCase() + act.slice(1)}
              onClick={() => { setActiveActivity(act); setSidebarOpen(true); }}
              style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderLeft: activeActivity === act ? "2px solid #007acc" : "2px solid transparent" }}>
              {ACT[act](activeActivity === act)}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div title="Accounts" style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SvgUser /></div>
          <div title="Settings" style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SvgSettings /></div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width: "260px", background: "#252526", borderRight: "1px solid #1e1e1e", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

            {/* EXPLORER */}
            {activeActivity === "explorer" && (
              <>
                <div style={{ padding: "8px 12px 4px", fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, height: "32px" }}>
                  <span>EXPLORER</span>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <IBtn title="New File" onClick={() => startNewItem("file")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#cccccc" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="#cccccc" strokeWidth="2"/><line x1="12" y1="13" x2="12" y2="19" stroke="#cccccc" strokeWidth="2"/><line x1="9" y1="16" x2="15" y2="16" stroke="#cccccc" strokeWidth="2"/></svg></IBtn>
                    <IBtn title="New Folder" onClick={() => startNewItem("folder")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="#cccccc" strokeWidth="2"/><line x1="12" y1="11" x2="12" y2="17" stroke="#cccccc" strokeWidth="2"/><line x1="9" y1="14" x2="15" y2="14" stroke="#cccccc" strokeWidth="2"/></svg></IBtn>
                    <IBtn title="Collapse All" onClick={() => setExpanded({ root: true })}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" stroke="#cccccc" strokeWidth="2"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" stroke="#cccccc" strokeWidth="2"/></svg></IBtn>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: "auto" }} onClick={e => { if (e.target === e.currentTarget) setSelectedFile(null); }}>
                  {/* Inline new-item input */}
                  {newItemParent !== null && (() => {
                    const parentEntry = files.find(f => f.id === newItemParent);
                    const indentDepth = (parentEntry?.depth ?? 0) + 1;
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", paddingLeft: `${indentDepth * 12 + 4}px`, height: "22px" }}>
                        <FileIcon name={newItemName || (newItemType === "folder" ? "__folder__" : "untitled")} ext={newItemType === "folder" ? undefined : newItemName.split(".").pop()} />
                        <input
                          ref={newItemRef}
                          value={newItemName}
                          onChange={e => setNewItemName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") commitNewItem(); if (e.key === "Escape") { setNewItemParent(null); setNewItemName(""); } }}
                          onBlur={commitNewItem}
                          placeholder={newItemType === "file" ? "filename.ts" : "folder-name"}
                          style={{ background: "#3c3c3c", border: "1px solid #007acc", color: "#cccccc", padding: "1px 5px", fontSize: "13px", outline: "none", flex: 1, borderRadius: "2px" }}
                        />
                      </div>
                    );
                  })()}
                  {visibleFiles.map(f => (
                    <div
                      key={f.id}
                      onClick={e => {
                        e.stopPropagation();
                        if (f.isFolder) { setExpanded(ex => ({ ...ex, [f.id]: !ex[f.id] })); setSelectedFile(f.id); }
                        else openFile(f.id);
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "4px", paddingLeft: `${f.depth * 12 + 4}px`, paddingRight: "8px", height: "22px", cursor: "pointer", background: selectedFile === f.id ? "#094771" : "transparent", userSelect: "none" }}
                      onMouseEnter={e => { if (selectedFile !== f.id) e.currentTarget.style.background = "#2a2d2e"; }}
                      onMouseLeave={e => { if (selectedFile !== f.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      {f.isFolder
                        ? <><span style={{ width: "12px", flexShrink: 0 }}>{expanded[f.id] ? <SvgChevD /> : <SvgChevR />}</span>
                            <FolderIcon open={!!expanded[f.id]} /></>
                        : <><span style={{ width: "12px", flexShrink: 0 }} /><FileIcon name={f.name} ext={f.ext} /></>}
                      <span style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    </div>
                  ))}
                  <div style={{ minHeight: "40px" }} onClick={() => setSelectedFile(null)} />
                </div>
              </>
            )}

            {/* SEARCH */}
            {activeActivity === "search" && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "10px 12px 6px", flexShrink: 0 }}>SEARCH</div>
                <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <input
                      value={sidebarSearchQ}
                      onChange={e => setSidebarSearchQ(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && doSearch()}
                      placeholder="Search"
                      autoFocus
                      style={{ flex: 1, background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "13px", outline: "none", borderRadius: "2px" }}
                    />
                    <button onClick={doSearch} style={{ background: "#0e639c", border: "none", color: "#fff", padding: "0 8px", cursor: "pointer", borderRadius: "2px", fontSize: "12px" }}>Find</button>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <input
                      value={sidebarReplaceQ}
                      onChange={e => setSidebarReplaceQ(e.target.value)}
                      placeholder="Replace"
                      style={{ flex: 1, background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "13px", outline: "none", borderRadius: "2px" }}
                    />
                    <button onClick={doReplaceAll} style={{ background: "#0e639c", border: "none", color: "#fff", padding: "0 8px", cursor: "pointer", borderRadius: "2px", fontSize: "12px" }}>Replace All</button>
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div style={{ fontSize: "11px", color: "#858585", padding: "2px 12px 4px", flexShrink: 0 }}>{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</div>
                )}
                <div style={{ flex: 1, overflow: "auto" }}>
                  {searchResults.length === 0 && sidebarSearchQ && (
                    <div style={{ color: "#858585", fontSize: "12px", padding: "8px 12px" }}>No results found.</div>
                  )}
                  {(() => {
                    const grouped: Record<string, typeof searchResults> = {};
                    searchResults.forEach(r => { (grouped[r.fileName] = grouped[r.fileName] ?? []).push(r); });
                    return Object.entries(grouped).map(([fname, results]) => (
                      <div key={fname}>
                        <div style={{ padding: "4px 12px", background: "#2a2d2e", fontSize: "12px", color: "#cccccc", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          <FileIcon name={fname} ext={fname.split(".").pop()} />
                          {fname}
                          <span style={{ color: "#858585", fontWeight: 400 }}>({results.length})</span>
                        </div>
                        {results.map((r, i) => (
                          <div key={i}
                            onClick={() => { const f = files.find(x => x.id === r.fileId); if (f) openFile(f.id); }}
                            style={{ padding: "2px 12px 2px 24px", cursor: "pointer", fontSize: "12px", borderBottom: "1px solid #1e1e1e" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <span style={{ color: "#858585" }}>{r.line}: </span>
                            <span style={{ color: "#cccccc" }}>{r.text.slice(0, 60)}{r.text.length > 60 ? "…" : ""}</span>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* GIT */}
            {activeActivity === "git" && (
              <div style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 12px 8px" }}>SOURCE CONTROL</div>
                <div style={{ padding: "0 8px 8px" }}>
                  <input placeholder="Message (Ctrl+Enter to commit)" style={{ width: "100%", background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "12px", outline: "none", borderRadius: "2px", boxSizing: "border-box" }} />
                  <button style={{ marginTop: "6px", width: "100%", background: "#0e639c", color: "#fff", border: "none", padding: "6px", cursor: "pointer", fontSize: "12px", borderRadius: "2px" }}>Commit</button>
                </div>
                <div style={{ padding: "4px 12px", color: "#858585", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="3" stroke="#858585" strokeWidth="2"/><circle cx="6" cy="18" r="3" stroke="#858585" strokeWidth="2"/><circle cx="18" cy="18" r="3" stroke="#858585" strokeWidth="2"/><path d="M6 9v6M9 18h6" stroke="#858585" strokeWidth="2"/></svg>
                  main — no changes
                </div>
              </div>
            )}

            {/* DEBUG */}
            {activeActivity === "debug" && (
              <div style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "4px 12px 8px" }}>RUN AND DEBUG</div>
                <div style={{ padding: "0 8px 8px" }}>
                  <button style={{ width: "100%", background: "#0e639c", color: "#fff", border: "none", padding: "6px", cursor: "pointer", fontSize: "12px", borderRadius: "2px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg>
                    Run and Debug
                  </button>
                </div>
                <div style={{ padding: "4px 12px", color: "#858585", fontSize: "12px" }}>No launch configurations found.</div>
                <div style={{ padding: "8px 12px 4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", marginBottom: "6px" }}>VARIABLES</div>
                  <div style={{ color: "#858585", fontSize: "12px" }}>Not paused</div>
                </div>
                <div style={{ padding: "8px 12px 4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", marginBottom: "6px" }}>BREAKPOINTS</div>
                  <div style={{ color: "#858585", fontSize: "12px" }}>No breakpoints set</div>
                </div>
              </div>
            )}

            {/* EXTENSIONS */}
            {activeActivity === "extensions" && (
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", padding: "10px 12px 6px", flexShrink: 0 }}>EXTENSIONS</div>
                <input
                  value={extSearch}
                  onChange={e => setExtSearch(e.target.value)}
                  placeholder="Search Extensions..."
                  style={{ margin: "0 8px 8px", background: "#3c3c3c", border: "1px solid #555", color: "#cccccc", padding: "5px 8px", fontSize: "12px", outline: "none", borderRadius: "2px", flexShrink: 0 }}
                />
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {installedList.length > 0 && (
                    <>
                      <div style={{ padding: "4px 12px", fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", background: "#1e1e1e" }}>INSTALLED</div>
                      {installedList.map(ext => (
                        <ExtCard key={ext.id} ext={ext} installed={true} installing={false}
                          onInstall={() => { setInstalledExts(s => { const n = new Set(s); n.delete(ext.id); return n; }); }} />
                      ))}
                    </>
                  )}
                  {availableList.length > 0 && (
                    <>
                      <div style={{ padding: "4px 12px", fontSize: "11px", fontWeight: 600, color: "#bbbcbd", letterSpacing: "1px", background: "#1e1e1e" }}>AVAILABLE</div>
                      {availableList.map(ext => (
                        <ExtCard key={ext.id} ext={ext} installed={false} installing={installingExts.has(ext.id)}
                          onInstall={() => {
                            if (installingExts.has(ext.id)) return;
                            setInstallingExts(s => new Set([...s, ext.id]));
                            setTimeout(() => {
                              setInstallingExts(s => { const n = new Set(s); n.delete(ext.id); return n; });
                              setInstalledExts(s => new Set([...s, ext.id]));
                            }, 1500);
                          }} />
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor + Terminal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Tab Bar */}
          <div style={{ display: "flex", background: "#252526", borderBottom: "1px solid #1e1e1e", overflowX: "auto", flexShrink: 0, height: "35px", alignItems: "stretch" }}>
            {openTabs.map(tabId => {
              const f = files.find(x => x.id === tabId);
              if (!f) return null;
              const isActive = activeTab === tabId;
              return (
                <div key={tabId} onClick={() => openFile(tabId)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 6px 0 12px", borderRight: "1px solid #1e1e1e", cursor: "pointer", background: isActive ? "#1e1e1e" : "#2d2d2d", borderTop: isActive ? "1px solid #007acc" : "1px solid transparent", color: isActive ? "#fff" : "#969696", whiteSpace: "nowrap", userSelect: "none", minWidth: "100px" }}>
                  <FileIcon name={f.name} ext={f.ext} />
                  <span style={{ fontSize: "13px" }}>{f.name}</span>
                  <span onClick={e => closeTab(tabId, e)}
                    style={{ padding: "2px 3px", borderRadius: "3px", cursor: "pointer", display: "flex", alignItems: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#404040")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {SvgClose()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Editor */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
            {activeTab && activeFile ? (
              <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#1e1e1e" }}>
                <div ref={lineNumRef} style={{ background: "#1e1e1e", color: "#858585", padding: "8px 0", textAlign: "right", userSelect: "none", fontSize: "13px", lineHeight: "1.6", minWidth: "50px", paddingRight: "16px", paddingLeft: "8px", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", overflowY: "hidden", flexShrink: 0 }}>
                  {activeCode.split("\n").map((_, i) => (
                    <div key={i} style={{ color: i + 1 === cursorLine ? "#cccccc" : "#858585" }}>{i + 1}</div>
                  ))}
                </div>
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  <pre
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      margin: 0,
                      padding: "8px 8px 8px 0",
                      fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      overflow: "hidden",
                      pointerEvents: "none",
                      whiteSpace: "pre",
                      color: "#d4d4d4",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlight(activeCode, activeFile.lang ?? languageFromFileName(activeFile.name)),
                    }}
                  />

                  <textarea
                    value={activeCode}
                    onChange={e => {
                      const next = e.target.value;
                      setFileContents(c => ({
                        ...c,
                        [activeFile.name]: next,
                        [activeFile.id]: next,
                      }));
                    }}
                    onKeyDown={e => {
                      const ta = e.currentTarget;
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const value = ta.value;

                      const updateCode = (next: string, cursor: number) => {
                        setFileContents(c => ({
                          ...c,
                          [activeFile.name]: next,
                          [activeFile.id]: next,
                        }));

                        setTimeout(() => {
                          ta.selectionStart = ta.selectionEnd = cursor;
                        }, 0);
                      };

                      const pairs: Record<string, string> = {
                        "(": ")",
                        "[": "]",
                        "{": "}",
                        '"': '"',
                        "'": "'",
                        "`": "`",
                      };

                      if (e.key === "Tab") {
                        e.preventDefault();
                        updateCode(value.slice(0, start) + "  " + value.slice(end), start + 2);
                        return;
                      }

                      if (e.key === "Enter") {
                        e.preventDefault();

                        const before = value.slice(0, start);
                        const after = value.slice(end);
                        const currentLine = before.split("\n").pop() ?? "";
                        const indent = currentLine.match(/^\s*/)?.[0] ?? "";
                        const extraIndent = /[\{\[\(]\s*$/.test(currentLine) ? "  " : "";

                        updateCode(before + "\n" + indent + extraIndent + after, start + 1 + indent.length + extraIndent.length);
                        return;
                      }

                      if ([")", "]", "}", '"', "'", "`"].includes(e.key)) {
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
                        const next = value.slice(0, start) + e.key + selected + close + value.slice(end);

                        updateCode(next, start + 1 + selected.length);
                        return;
                      }

                      if (e.key === ">" && (activeFile.lang === "html" || activeFile.name.endsWith(".html"))) {
                        const before = value.slice(0, start);
                        const tagMatch = before.match(/<([a-zA-Z][\w-]*)(?:\s[^<>]*)?$/);

                        const voidTags = new Set([
                          "area", "base", "br", "col", "embed", "hr", "img", "input",
                          "link", "meta", "param", "source", "track", "wbr",
                        ]);

                        if (tagMatch) {
                          const tag = tagMatch[1].toLowerCase();

                          if (!voidTags.has(tag) && !before.endsWith("</")) {
                            e.preventDefault();
                            const insert = `></${tag}>`;
                            updateCode(value.slice(0, start) + insert + value.slice(end), start + 1);
                            return;
                          }
                        }
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
                      if (lineNumRef.current) lineNumRef.current.scrollTop = e.currentTarget.scrollTop;
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
                      fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      padding: "8px 8px 8px 0",
                      tabSize: 2,
                      overflowY: "auto",
                      whiteSpace: "pre",
                    }}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>
            ) : (
              <div style={{ background: "#1e1e1e", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                  <path d="M75 12.5L25 50l50 37.5V12.5z" fill="#007acc" opacity="0.5"/>
                  <path d="M25 12.5v75l25-37.5L25 12.5z" fill="#007acc"/>
                </svg>
                <div style={{ fontSize: "20px", color: "#cccccc", fontWeight: 300 }}>CodeForge</div>
                <div style={{ fontSize: "13px", color: "#858585" }}>Open a file from the Explorer or search for a file</div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#858585", fontSize: "12px" }}>
                  <kbd style={{ background: "#333", border: "1px solid #555", padding: "2px 8px", borderRadius: "3px", color: "#cccccc" }}>Ctrl+P</kbd> to search files
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          {terminalOpen && (
            <div style={{ height: "220px", borderTop: "1px solid #454545", display: "flex", flexDirection: "column", flexShrink: 0, background: "#1e1e1e" }}>
              <div style={{ display: "flex", alignItems: "center", background: "#252526", height: "32px", borderBottom: "1px solid #454545", flexShrink: 0 }}>
                {(["TERMINAL","PROBLEMS","OUTPUT","DEBUG CONSOLE"] as const).map(tab => (
                  <div key={tab} style={{ padding: "0 14px", height: "32px", display: "flex", alignItems: "center", fontSize: "11px", cursor: "pointer", color: tab === "TERMINAL" ? "#cccccc" : "#858585", borderBottom: tab === "TERMINAL" ? "1px solid #007acc" : "1px solid transparent" }}
                    onMouseEnter={e => { if (tab !== "TERMINAL") e.currentTarget.style.color = "#cccccc"; }}
                    onMouseLeave={e => { if (tab !== "TERMINAL") e.currentTarget.style.color = "#858585"; }}>
                    {tab}
                  </div>
                ))}
                <div style={{ display: "flex", marginLeft: "4px", gap: "2px" }}>
                  {termSessions.map(s => (
                    <div key={s.id} onClick={() => setActiveTermId(s.id)}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 8px", height: "24px", background: activeTermId === s.id ? "#3c3c3c" : "transparent", borderRadius: "3px", cursor: "pointer", fontSize: "11px", color: "#cccccc" }}>
                      bash
                      <span onClick={e => { e.stopPropagation(); closeTermSession(s.id); }}
                        style={{ display: "flex", alignItems: "center", padding: "1px" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#555")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        {SvgClose()}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", padding: "0 8px", gap: "2px" }}>
                  <IBtn title="New Terminal" onClick={newTerminal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="#cccccc" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="#cccccc" strokeWidth="2"/></svg></IBtn>
                  <IBtn title="Split Terminal" onClick={newTerminal}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="1" stroke="#cccccc" strokeWidth="2"/><line x1="12" y1="3" x2="12" y2="21" stroke="#cccccc" strokeWidth="2"/></svg></IBtn>
                  <IBtn title="Clear" onClick={() => setTermSessions(ss => ss.map(s => s.id === activeTermId ? { ...s, lines: [] } : s))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" stroke="#cccccc" strokeWidth="2"/></svg></IBtn>
                  <IBtn title="Close" onClick={() => setTerminalOpen(false)}>{SvgClose()}</IBtn>
                </div>
              </div>
              <div onClick={() => termInputRef.current?.focus()}
                style={{ flex: 1, overflow: "auto", padding: "8px 12px", fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace", fontSize: "13px", lineHeight: "1.7", cursor: "text" }}>
                {termSessions.find(s => s.id === activeTermId)?.lines.map(renderTermLine)}
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ color: "#4ec9b0", fontWeight: "bold" }}>codeforge@workspace</span>
                  <span style={{ color: "#858585" }}> {CWD} </span>
                  <span style={{ color: "#cccccc" }}>% </span>
                  <input ref={termInputRef} value={termInput} onChange={e => setTermInput(e.target.value)} onKeyDown={handleTermKey}
                    style={{ background: "none", border: "none", outline: "none", color: "#d4d4d4", fontFamily: "inherit", fontSize: "inherit", flex: 1, caretColor: "#aeafad", minWidth: 0, padding: 0 }}
                    autoComplete="off" spellCheck={false} autoCapitalize="off" />
                </div>
                <div ref={termEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div onClick={e => e.stopPropagation()} style={{ background: "#007acc", color: "#fff", display: "flex", alignItems: "center", height: "22px", flexShrink: 0, fontSize: "12px", userSelect: "none" }}>
        <SBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="3" stroke="white" strokeWidth="2"/><circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/><circle cx="18" cy="18" r="3" stroke="white" strokeWidth="2"/><path d="M6 9v6M9 18h6" stroke="white" strokeWidth="2"/></svg>} text="main" />
        <SBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2"/></svg>} text="0" />
        <SBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="white" strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="3"/></svg>} text="0" />
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setShowLangPicker(l => !l); }}>
          <SBtn text={selectedLang} />
          {showLangPicker && (
            <div style={{ position: "absolute", bottom: "22px", right: 0, background: "#252526", border: "1px solid #454545", borderRadius: "4px", width: "220px", maxHeight: "280px", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
              <input value={langFilter} onChange={e => setLangFilter(e.target.value)} placeholder="Filter languages..." autoFocus onClick={e => e.stopPropagation()} style={{ background: "#3c3c3c", border: "none", borderBottom: "1px solid #454545", color: "#cccccc", padding: "6px 10px", fontSize: "12px", outline: "none" }} />
              <div style={{ overflowY: "auto" }}>
                {filteredLangs.map(l => (
                  <div key={l} onClick={e => { e.stopPropagation(); setSelectedLang(l); setShowLangPicker(false); setLangFilter(""); }}
                    style={{ padding: "5px 12px", cursor: "pointer", color: l === selectedLang ? "#fff" : "#cccccc", background: l === selectedLang ? "#094771" : "transparent", fontSize: "12px" }}
                    onMouseEnter={e => { if (l !== selectedLang) e.currentTarget.style.background = "#2a2d2e"; }}
                    onMouseLeave={e => { if (l !== selectedLang) e.currentTarget.style.background = "transparent"; }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <SBtn text="UTF-8" /><SBtn text="LF" /><SBtn text="Spaces: 2" />
        {activeTab && <SBtn text={`Ln ${cursorLine}, Col ${cursorCol}`} />}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SBtn({ icon, text, onClick }: { icon?: React.ReactNode; text: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 8px", height: "22px", cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      {icon}{text && <span>{text}</span>}
    </div>
  );
}

function IBtn({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
  return (
    <div title={title} onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", cursor: "pointer", borderRadius: "3px" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      {children}
    </div>
  );
}

function ExtCard({ ext, installed, installing, onInstall }: { ext: typeof ALL_EXTENSIONS[0]; installed: boolean; installing: boolean; onInstall: () => void }) {
  return (
    <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e1e1e" }}>
      <div style={{ color: "#cccccc", fontSize: "13px", fontWeight: 500 }}>{ext.name}</div>
      <div style={{ color: "#858585", fontSize: "11px", margin: "2px 0" }}>{ext.desc}</div>
      <div style={{ color: "#6a9955", fontSize: "11px" }}>{ext.author}</div>
      <button onClick={onInstall}
        style={{ marginTop: "5px", background: installed ? "#3c3c3c" : "#0e639c", color: installed ? "#cccccc" : "#fff", border: installed ? "1px solid #555" : "none", padding: "3px 10px", cursor: "pointer", fontSize: "11px", borderRadius: "2px", minWidth: "72px" }}>
        {installing ? "Installing..." : installed ? "Uninstall" : "Install"}
      </button>
    </div>
  );
}

// ─── Menu Bar ────────────────────────────────────────────────────────────────
function MenuBar({ searchBarRef, searchOpen, searchValue, searchInputRef, onSearchClick, onSearchChange, onSearchKey, searchResults, onOpenFile, onToggleSidebar, onToggleTerminal, onNewFile, onNewFolder, onSave }: {
  searchBarRef: React.RefObject<HTMLDivElement | null>;
  searchOpen: boolean; searchValue: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSearchClick: () => void; onSearchChange: (v: string) => void;
  onSearchKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchResults: FileEntry[];
  onOpenFile: (id: string) => void;
  onToggleSidebar: () => void; onToggleTerminal: () => void;
  onNewFile: () => void; onNewFolder: () => void; onSave: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus: Record<string, { label: string; action?: () => void; divider?: boolean; shortcut?: string }[]> = {
    File: [
      { label: "New File", action: onNewFile, shortcut: "Ctrl+N" },
      { label: "New Folder", action: onNewFolder },
      { divider: true, label: "" },
      { label: "Open File...", shortcut: "Ctrl+O" },
      { label: "Open Folder...", shortcut: "Ctrl+K Ctrl+O" },
      { divider: true, label: "" },
      { label: "Save", action: onSave, shortcut: "Ctrl+S" },
      { label: "Save As...", shortcut: "Ctrl+Shift+S" },
      { divider: true, label: "" },
      { label: "Close Editor", shortcut: "Ctrl+W" },
    ],
    Edit: [
      { label: "Undo", shortcut: "Ctrl+Z" }, { label: "Redo", shortcut: "Ctrl+Y" },
      { divider: true, label: "" },
      { label: "Cut", shortcut: "Ctrl+X" }, { label: "Copy", shortcut: "Ctrl+C" }, { label: "Paste", shortcut: "Ctrl+V" },
      { divider: true, label: "" },
      { label: "Find...", action: onSearchClick, shortcut: "Ctrl+P" },
      { label: "Replace...", shortcut: "Ctrl+H" },
      { divider: true, label: "" },
      { label: "Toggle Line Comment", shortcut: "Ctrl+/" },
      { label: "Format Document", shortcut: "Shift+Alt+F" },
    ],
    Selection: [
      { label: "Select All", shortcut: "Ctrl+A" }, { label: "Expand Selection" }, { label: "Shrink Selection" },
      { divider: true, label: "" },
      { label: "Copy Line Up", shortcut: "Shift+Alt+Up" }, { label: "Copy Line Down", shortcut: "Shift+Alt+Down" },
      { label: "Move Line Up", shortcut: "Alt+Up" }, { label: "Move Line Down", shortcut: "Alt+Down" },
    ],
    View: [
      { label: "Command Palette...", action: onSearchClick, shortcut: "Ctrl+Shift+P" },
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
      { label: "Back", shortcut: "Alt+Left" }, { label: "Forward", shortcut: "Alt+Right" },
      { divider: true, label: "" },
      { label: "Go to File...", action: onSearchClick, shortcut: "Ctrl+P" },
      { label: "Go to Line/Column...", shortcut: "Ctrl+G" },
      { label: "Go to Definition", shortcut: "F12" },
    ],
    Run: [
      { label: "Start Debugging", shortcut: "F5" },
      { label: "Run Without Debugging", shortcut: "Ctrl+F5" },
      { label: "Stop Debugging", shortcut: "Shift+F5" },
      { divider: true, label: "" },
      { label: "Toggle Breakpoint", shortcut: "F9" },
    ],
    Terminal: [
      { label: "New Terminal", action: onToggleTerminal, shortcut: "Ctrl+Shift+`" },
      { label: "Split Terminal" },
      { divider: true, label: "" },
      { label: "Run Active File" }, { label: "Run Selected Text" },
    ],
    Help: [
      { label: "Show All Commands", action: onSearchClick, shortcut: "Ctrl+Shift+P" },
      { label: "Documentation" }, { label: "Release Notes" },
      { divider: true, label: "" },
      { label: "Toggle Developer Tools" }, { label: "About" },
    ],
  };

  return (
    <div style={{ background: "#3c3c3c", display: "flex", alignItems: "center", height: "30px", flexShrink: 0, userSelect: "none", zIndex: 200, position: "relative" }}>
      {/* Traffic lights */}
      <div style={{ width: "70px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexShrink: 0 }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57", cursor: "pointer" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e", cursor: "pointer" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840", cursor: "pointer" }} />
      </div>
      {/* Menus */}
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} style={{ position: "relative" }}>
          <div onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => { if (openMenu && openMenu !== name) setOpenMenu(name); }}
            style={{ padding: "0 8px", height: "30px", display: "flex", alignItems: "center", cursor: "pointer", color: "#cccccc", fontSize: "13px", background: openMenu === name ? "#094771" : "transparent" }}>
            {name}
          </div>
          {openMenu === name && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpenMenu(null)} />
              <div style={{ position: "absolute", top: "30px", left: 0, background: "#252526", border: "1px solid #454545", borderRadius: "4px", minWidth: "240px", zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", padding: "4px 0" }}>
                {items.map((item, idx) => item.divider
                  ? <div key={idx} style={{ borderTop: "1px solid #454545", margin: "4px 0" }} />
                  : (
                    <div key={idx} onClick={() => { setOpenMenu(null); item.action?.(); }}
                      style={{ padding: "5px 20px", cursor: "pointer", color: "#cccccc", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
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

      {/* Center search bar with dropdown */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div ref={searchBarRef} style={{ position: "relative", width: "420px" }}>
          <div
            onClick={onSearchClick}
            style={{ background: searchOpen ? "#3c3c3c" : "#3c3c3c", border: `1px solid ${searchOpen ? "#007acc" : "#555"}`, borderRadius: "4px", height: "22px", display: "flex", alignItems: "center", gap: "6px", paddingLeft: "8px", cursor: "text" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#858585" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#858585" strokeWidth="2"/></svg>
            {searchOpen
              ? <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={e => onSearchChange(e.target.value)}
                  onKeyDown={onSearchKey}
                  placeholder="Search Files"
                  onClick={e => e.stopPropagation()}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#cccccc", fontSize: "12px", padding: 0 }}
                />
              : <span style={{ color: "#858585", fontSize: "12px" }}>Search Files</span>}
          </div>
          {searchOpen && (
            <div style={{ position: "absolute", top: "24px", left: 0, right: 0, background: "#252526", border: "1px solid #454545", borderRadius: "0 0 4px 4px", zIndex: 400, boxShadow: "0 4px 16px rgba(0,0,0,0.5)", maxHeight: "280px", overflow: "auto" }}>
              {searchValue.trim() && (
                <div style={{ padding: "4px 12px", fontSize: "11px", color: "#858585", borderBottom: "1px solid #333" }}>
                  
                </div>
              )}
              {searchResults.length === 0 && searchValue.trim() ? (
                <div style={{ padding: "8px 12px", color: "#858585", fontSize: "12px" }}>No files found</div>
              ) : (
                searchResults.map(f => (
                  <div key={f.id} onClick={() => onOpenFile(f.id)}
                    style={{ padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#cccccc", fontSize: "13px" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#094771")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <FileIcon name={f.name} ext={f.ext} />
                    <span>{f.name}</span>
                    <span style={{ color: "#858585", fontSize: "11px", marginLeft: "auto" }}>{f.ext}</span>
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
