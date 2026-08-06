import { Router, type IRouter } from "express";

const router: IRouter = Router();

const EAGLERCRAFT_ORIGIN = "https://eaglercraft.com";
const CLIENT_PATH = "/mc/1.8.8";

const BLOCKED_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "strict-transport-security",
  "content-encoding",
  "transfer-encoding",
  "content-length",
]);

router.get("/proxy/client", async (req, res): Promise<void> => {
  const targetUrl = `${EAGLERCRAFT_ORIGIN}${CLIENT_PATH}`;

  const upstream = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    redirect: "follow",
  });

  const contentType = upstream.headers.get("content-type") ?? "text/html";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=300");

  for (const [key, value] of upstream.headers.entries()) {
    if (!BLOCKED_HEADERS.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  }

  let body = await upstream.text();

  body = body.replace(/<base\s[^>]*>/gi, "");

  body = body.replace(
    /(<head[^>]*>)/i,
    `$1<base href="${EAGLERCRAFT_ORIGIN}${CLIENT_PATH}/">`,
  );

  res.status(upstream.status).send(body);
});

router.get("/proxy/asset{/*path}", async (req, res): Promise<void> => {
  const rawPath = Array.isArray(req.params.path)
    ? req.params.path[0]
    : (req.params.path ?? "");
  const targetUrl = `${EAGLERCRAFT_ORIGIN}${CLIENT_PATH}/${rawPath}`;

  const upstream = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    redirect: "follow",
  });

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=3600");

  res.status(upstream.status);

  const buffer = await upstream.arrayBuffer();
  res.send(Buffer.from(buffer));
});

export default router;
