import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const router: IRouter = Router();

type RunBody = {
  language?: string;
  filename?: string;
  code?: string;
};

function runProcess(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs = 10000,
): Promise<{ output: string; code: number | null }> {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      env: process.env,
    });

    let output = "";

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({
        output: output + "\nProcess killed: timeout",
        code: -1,
      });
    }, timeoutMs);

    child.stdout.on("data", d => {
      output += d.toString();
    });

    child.stderr.on("data", d => {
      output += d.toString();
    });

    child.on("error", err => {
      clearTimeout(timer);
      resolve({
        output: `Failed to start ${command}: ${err.message}`,
        code: -1,
      });
    });

    child.on("close", code => {
      clearTimeout(timer);
      resolve({
        output: output.trimEnd() || `Process exited with code ${code ?? 0}`,
        code,
      });
    });
  });
}

async function commandExists(command: string): Promise<boolean> {
  const checker = process.platform === "win32" ? "where" : "which";
  const result = await runProcess(checker, [command], process.cwd(), 3000);
  return result.code === 0;
}

router.post("/compiler/run", async (req, res): Promise<void> => {
  const body = req.body as RunBody;

  const language = String(body.language || "").toLowerCase();
  const filename = String(body.filename || "main.txt");
  const code = String(body.code || "");

  if (!code.trim()) {
    res.json({ ok: true, output: `${filename} is empty.` });
    return;
  }

  const id = crypto.randomBytes(8).toString("hex");
  const dir = path.join(os.tmpdir(), `codeforge-${id}`);

  try {
    await fs.mkdir(dir, { recursive: true });

    const safeName = path.basename(filename);
    const filePath = path.join(dir, safeName);
    await fs.writeFile(filePath, code, "utf8");

    let result: { output: string; code: number | null };

    if (language === "python") {
      if (!(await commandExists("python3"))) {
        res.json({ ok: false, error: "python3 is not installed on the backend." });
        return;
      }
      result = await runProcess("python3", [safeName], dir);
      } else if (language === "javascript") {
        if (!(await commandExists("node"))) {
          res.json({
            ok: false,
            error: "node is not installed on the backend.",
          });
          return;
        }

        result = await runProcess("node", [safeName], dir);
      } else if (
        language === "typescript" ||
        language === "typescriptreact"
      ) {
        if (!(await commandExists("tsx"))) {
          res.json({
            ok: false,
            error: "tsx is not installed on the backend.",
          });
          return;
        }

        result = await runProcess("tsx", [safeName], dir);
    } else if (language === "c") {
      if (!(await commandExists("gcc"))) {
        res.json({ ok: false, error: "gcc is not installed on the backend." });
        return;
      }
      const compile = await runProcess("gcc", [safeName, "-o", "main"], dir);
      if (compile.code !== 0) {
        res.json({ ok: true, output: compile.output });
        return;
      }
      result = await runProcess(path.join(dir, "main"), [], dir);
    } else if (language === "cpp") {
      if (!(await commandExists("g++"))) {
        res.json({ ok: false, error: "g++ is not installed on the backend." });
        return;
      }
      const compile = await runProcess("g++", [safeName, "-std=c++17", "-O2", "-o", "main"], dir);
      if (compile.code !== 0) {
        res.json({ ok: true, output: compile.output });
        return;
      }
      result = await runProcess(path.join(dir, "main"), [], dir);
    } else if (language === "java") {
      if (!(await commandExists("javac")) || !(await commandExists("java"))) {
        res.json({ ok: false, error: "javac/java is not installed on the backend." });
        return;
      }
      const compile = await runProcess("javac", [safeName], dir);
      if (compile.code !== 0) {
        res.json({ ok: true, output: compile.output });
        return;
      }
      const className = safeName.replace(/\.java$/i, "");
      result = await runProcess("java", [className], dir);
    } else if (language === "go") {
      if (!(await commandExists("go"))) {
        res.json({ ok: false, error: "go is not installed on the backend." });
        return;
      }
      result = await runProcess("go", ["run", safeName], dir);
    } else if (language === "rust") {
      if (!(await commandExists("rustc"))) {
        res.json({ ok: false, error: "rustc is not installed on the backend." });
        return;
      }
      const compile = await runProcess("rustc", [safeName, "-o", "main"], dir);
      if (compile.code !== 0) {
        res.json({ ok: true, output: compile.output });
        return;
      }
      result = await runProcess(path.join(dir, "main"), [], dir);
    } else {
      res.json({ ok: false, error: `${language} is not supported yet.` });
      return;
    }

    res.json({
      ok: true,
      output: result.output,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

export default router;