import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const workspaceRoot = path.resolve(
  process.env.CODEFORGE_WORKSPACE_ROOT ??
    path.join(os.homedir(), ".codeforge-workspaces"),
);

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export type WorkspaceEntry = {
  path: string;
  name: string;
  type: "file" | "directory";
  size: number;
  modifiedAt: string;
};

function workspacePath(workspaceId: string): string {
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(workspaceId)) {
    throw new Error("Invalid workspace id");
  }
  return path.join(workspaceRoot, workspaceId);
}

export function safeWorkspaceRelativePath(input: string | undefined): string {
  const value = (input ?? "").replaceAll("\\", "/").replace(/^\/+/, "");
  const normalized = path.posix.normalize(value);
  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("\0") ||
    path.posix.isAbsolute(normalized)
  ) {
    throw new Error("Path escapes workspace");
  }
  return normalized === "." ? "" : normalized;
}

export function getWorkspaceDirectory(workspaceId: string): string {
  return workspacePath(workspaceId);
}

export async function ensureWorkspace(workspaceId: string): Promise<string> {
  const directory = workspacePath(workspaceId);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  return directory;
}

export async function resolveWorkspacePath(
  workspaceId: string,
  relativePath: string | undefined,
): Promise<string> {
  const root = await ensureWorkspace(workspaceId);
  const safePath = safeWorkspaceRelativePath(relativePath);
  const target = path.resolve(root, safePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error("Path escapes workspace");
  }
  return target;
}

export async function listWorkspace(
  workspaceId: string,
): Promise<WorkspaceEntry[]> {
  const root = await ensureWorkspace(workspaceId);
  const result: WorkspaceEntry[] = [];

  async function walk(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name === ".codeforge") continue;
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
      const stats = await fs.lstat(absolute);
      if (stats.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        result.push({
          path: relative,
          name: entry.name,
          type: "directory",
          size: 0,
          modifiedAt: stats.mtime.toISOString(),
        });
        await walk(absolute);
      } else if (entry.isFile()) {
        result.push({
          path: relative,
          name: entry.name,
          type: "file",
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        });
      }
    }
  }

  await walk(root);
  return result;
}

export async function readWorkspaceFile(
  workspaceId: string,
  relativePath: string,
): Promise<string> {
  const target = await resolveWorkspacePath(workspaceId, relativePath);
  const stats = await fs.lstat(target);
  if (!stats.isFile() || stats.size > MAX_FILE_BYTES) {
    throw new Error("File is missing, not regular, or too large");
  }
  return fs.readFile(target, "utf8");
}

export async function writeWorkspaceFile(
  workspaceId: string,
  relativePath: string,
  content: string,
): Promise<void> {
  if (Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) {
    throw new Error("File exceeds the 2 MiB limit");
  }
  const target = await resolveWorkspacePath(workspaceId, relativePath);
  const root = await ensureWorkspace(workspaceId);
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = path.join(
    root,
    `.codeforge-write-${crypto.randomBytes(8).toString("hex")}`,
  );
  await fs.writeFile(temporary, content, { encoding: "utf8", mode: 0o600 });
  await fs.rename(temporary, target);
}

export async function createWorkspaceItem(
  workspaceId: string,
  relativePath: string,
  type: "file" | "directory",
): Promise<void> {
  const target = await resolveWorkspacePath(workspaceId, relativePath);
  if (safeWorkspaceRelativePath(relativePath) === "") {
    throw new Error("Workspace root cannot be created");
  }
  if (type === "directory") {
    await fs.mkdir(target, { recursive: false, mode: 0o700 });
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
    await fs.writeFile(target, "", { flag: "wx", mode: 0o600 });
  }
}

export async function moveWorkspaceItem(
  workspaceId: string,
  from: string,
  to: string,
): Promise<void> {
  const source = await resolveWorkspacePath(workspaceId, from);
  const target = await resolveWorkspacePath(workspaceId, to);
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  await fs.rename(source, target);
}

export async function deleteWorkspaceItem(
  workspaceId: string,
  relativePath: string,
): Promise<void> {
  const target = await resolveWorkspacePath(workspaceId, relativePath);
  if (safeWorkspaceRelativePath(relativePath) === "") {
    throw new Error("Workspace root cannot be deleted");
  }
  await fs.rm(target, { recursive: true, force: false });
}