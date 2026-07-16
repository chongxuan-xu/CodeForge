// Code execution via Judge0 CE (https://ce.judge0.com)
// No API key required for basic use.

const JUDGE0_API = 'https://ce.judge0.com';

// Judge0 CE language IDs
// https://ce.judge0.com/languages
const LANGUAGE_IDS: Record<string, number> = {
  c:               50,  // C (GCC 9.2.0)
  cpp:             54,  // C++ (GCC 9.2.0)
  python:          71,  // Python 3.8.1
  javascript:      63,  // Node.js 12.14.0
  javascriptreact: 63,
  typescript:      74,  // TypeScript 3.7.4
  typescriptreact: 74,
  java:            62,  // Java (OpenJDK 13.0.1)
  kotlin:          78,  // Kotlin 1.3.70
  ruby:            72,  // Ruby 2.7.0
  php:             68,  // PHP 7.4.1
  swift:           83,  // Swift 5.2.3
  rust:            73,  // Rust 1.40.0
  go:              60,  // Go 1.13.5
  haskell:         61,  // Haskell GHC 8.8.1
  bash:            46,  // Bash 5.0.0
  r:               80,  // R 4.0.0
  lua:             64,  // Lua 5.3.5
  perl:            85,  // Perl 5.28.1
  scala:           81,  // Scala (Scalac 2.13.2)
  csharp:          51,  // C# (Mono 6.6.0.161)
  elixir:          57,  // Elixir 1.9.4
  clojure:         86,  // Clojure 1.10.1
  erlang:          58,  // Erlang (OTP 22.2)
  coffeescript:    100, // CoffeeScript (node-based)
};

function b64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromB64(str: string | null | undefined): string {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  compileOutput: string;
  compileError: string;
  isCompileError: boolean;
}

export function wrapPythonForProbe(code: string): string {
  const wrapper = `import sys as __sys__
import builtins as __builtins_mod__
__original_input__ = __builtins_mod__.input

def input(prompt=""):
    __sys__.stderr.write("__PROMPT__:" + str(prompt) + "\\n")
    __sys__.stderr.flush()
    line = __sys__.stdin.readline()
    return line.rstrip("\\n")

__builtins_mod__.input = input
`;
  return wrapper + code;
}

export function parseProbePrompts(stderr: string): string[] {
  const prompts: string[] = [];
  for (const line of stderr.split('\n')) {
    if (line.startsWith('__PROMPT__:')) {
      prompts.push(line.slice('__PROMPT__:'.length));
    }
  }
  return prompts;
}

export function countInputCalls(code: string): number {
  const matches = code.match(/\binput\s*\(/g);
  return matches ? matches.length : 0;
}

export async function executeCode({
  code,
  language,
  stdin = '',
  signal,
}: {
  code: string;
  language: string;
  stdin?: string;
  signal?: AbortSignal;
}): Promise<ExecuteResult> {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) {
    throw new Error(
      `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}`
    );
  }

  const startTime = Date.now();

  const submitRes = await fetch(
    `${JUDGE0_API}/submissions?base64_encoded=true&wait=false`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        language_id: languageId,
        source_code: b64(code),
        stdin: b64(stdin || ''),
        cpu_time_limit: 10,
        wall_time_limit: 15,
        memory_limit: 128000,
      }),
    }
  );

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Submission failed: ${submitRes.status} ${err}`);
  }

  const { token } = (await submitRes.json()) as { token: string };
  if (!token) throw new Error('No submission token received');

  let data: any;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 700));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const pollRes = await fetch(
      `${JUDGE0_API}/submissions/${token}?base64_encoded=true`,
      { signal }
    );
    if (!pollRes.ok) continue;

    data = await pollRes.json();
    if (data.status?.id > 2) break;
  }

  if (!data) throw new Error('Execution timed out waiting for result');

  const executionTime = Date.now() - startTime;
  const stdout = fromB64(data.stdout) || '';
  const stderr = fromB64(data.stderr) || '';
  const compileError = fromB64(data.compile_output) || '';
  const exitCode = data.exit_code ?? (compileError ? 1 : 0);

  return {
    stdout,
    stderr: stderr || compileError,
    exitCode,
    executionTime,
    compileOutput: '',
    compileError,
    isCompileError: !!compileError && !stdout,
  };
}
