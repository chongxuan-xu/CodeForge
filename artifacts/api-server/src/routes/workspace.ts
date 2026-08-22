import { Router, type IRouter } from "express";
import {
  createWorkspaceItem,
  deleteWorkspaceItem,
  ensureWorkspace,
  listWorkspace,
  moveWorkspaceItem,
  readWorkspaceFile,
  safeWorkspaceRelativePath,
  writeWorkspaceFile,
} from "../workspace";

const router: IRouter = Router();

function workspaceId(req: Parameters<IRouter["get"]>[1] extends never
  ? never
  : any): string {
  const value = req.header("x-codeforge-workspace");
  if (!value || !/^[a-zA-Z0-9_-]{16,80}$/.test(value)) {
    throw new Error("X-CodeForge-Workspace header is required");
  }
  return value;
}

router.get("/workspace", async (req, res): Promise<void> => {
  try {
    const id = workspaceId(req);
    await ensureWorkspace(id);
    res.json({ id, entries: await listWorkspace(id) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get("/workspace/file", async (req, res): Promise<void> => {
  try {
    const id = workspaceId(req);
    const filePath = safeWorkspaceRelativePath(String(req.query.path ?? ""));
    res.type("text/plain").send(await readWorkspaceFile(id, filePath));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.put("/workspace/file", async (req, res): Promise<void> => {
  try {
    const id = workspaceId(req);
    const body = req.body as { path?: string; content?: string };
    const filePath = safeWorkspaceRelativePath(body.path);
    if (typeof body.content !== "string") throw new Error("content is required");
    await writeWorkspaceFile(id, filePath, body.content);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/workspace/item", async (req, res): Promise<void> => {
  try {
    const id = workspaceId(req);
    const body = req.body as { path?: string; type?: "file" | "directory" };
    const filePath = safeWorkspaceRelativePath(body.path);
    if (body.type !== "file" && body.type !== "directory") {
      throw new Error("type must be file or directory");
    }
    await createWorkspaceItem(id, filePath, body.type);
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.patch("/workspace/item", async (req, res): Promise<void> => {
  try {
    const id = workspaceId(req);
    const body = req.body as { from?: string; to?: string };
    await moveWorkspaceItem(
      id,
      safeWorkspaceRelativePath(body.from),
      safeWorkspaceRelativePath(body.to),
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.delete("/workspace/item", async (req, res): Promise<void> => {
  try {
    const id = workspaceId(req);
    await deleteWorkspaceItem(
      id,
      safeWorkspaceRelativePath(String(req.query.path ?? "")),
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;