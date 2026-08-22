import type { IncomingMessage } from "node:http";
import os from "node:os";
import path from "node:path";
import pty from "node-pty";
import type { WebSocket } from "ws";
import { ensureWorkspace, getWorkspaceDirectory } from "./workspace";

const MAX_TERMINALS = 8;
const terminals = new Map<string, pty.IPty>();

function getWorkspaceId(request: IncomingMessage): string | null {
  const url = new URL(request.url ?? "/", "http://localhost");
  const value =
    url.searchParams.get("workspace") ??
    (Array.isArray(request.headers["x-codeforge-workspace"])
      ? request.headers["x-codeforge-workspace"][0]
      : request.headers["x-codeforge-workspace"]);
  return value && /^[a-zA-Z0-9_-]{16,80}$/.test(value) ? value : null;
}

function safeEnvironment(workspace: string): Record<string, string> {
  const allowed = ["TERM", "COLORTERM", "LANG", "LC_ALL", "PATH"];
  const env: Record<string, string> = {};
  for (const key of allowed) {
    const value = process.env[key];
    if (value) env[key] = value;
  }
  env.TERM = "xterm-256color";
  env.COLORTERM = "truecolor";
  env.LANG = env.LANG ?? "C.UTF-8";
  env.HOME = workspace;
  env.PWD = workspace;
  env.CODEFORGE_WORKSPACE = workspace;
  return env;
}

export async function attachTerminalWebSocket(
  socket: WebSocket,
  request: IncomingMessage,
): Promise<void> {
  const workspaceId = getWorkspaceId(request);
  if (!workspaceId) {
    socket.close(1008, "A valid workspace is required");
    return;
  }

  const workspace = await ensureWorkspace(workspaceId);
  if (terminals.size >= MAX_TERMINALS) {
    socket.close(1013, "Too many active terminals");
    return;
  }

  const shell = process.platform === "win32" ? "powershell.exe" : "bash";
  const args =
    process.platform === "win32"
      ? []
      : ["--noprofile", "--norc", "-i"];
  const terminal = pty.spawn(shell, args, {
    name: "xterm-256color",
    cols: 120,
    rows: 30,
    cwd: workspace,
    env: safeEnvironment(workspace),
  });
  terminals.set(String(terminal.pid), terminal);

  const cleanup = () => {
    terminals.delete(String(terminal.pid));
    try {
      terminal.kill();
    } catch {
      // The process may already have exited.
    }
  };

  terminal.onData((data) => {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: "data", data }));
  });
  terminal.onExit(({ exitCode, signal }) => {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify({ type: "exit", exitCode, signal }));
      socket.close();
    }
    cleanup();
  });

  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as
        | { type: "input"; data?: string }
        | { type: "resize"; cols?: number; rows?: number }
        | { type: "signal"; signal?: "SIGINT" | "SIGTERM" };
      if (message.type === "input" && typeof message.data === "string") {
        terminal.write(message.data.slice(0, 16_384));
      } else if (message.type === "resize") {
        const cols = Math.max(20, Math.min(240, Number(message.cols) || 120));
        const rows = Math.max(5, Math.min(100, Number(message.rows) || 30));
        terminal.resize(cols, rows);
      } else if (message.type === "signal") {
        terminal.kill(message.signal ?? "SIGINT");
      }
    } catch {
      socket.close(1003, "Invalid terminal message");
    }
  });
  socket.on("close", cleanup);
}

export function workspaceShellPath(workspaceId: string): string {
  return path.resolve(getWorkspaceDirectory(workspaceId));
}

export const workspaceLimits = {
  maxTerminals: MAX_TERMINALS,
  maxProcesses: 32,
  maxMemoryMb: 512,
  maxDiskMb: 512,
  platform: os.platform(),
};