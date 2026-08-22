import app from "./app";
import { logger } from "./lib/logger";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { attachTerminalWebSocket } from "./terminal";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);
const webSocketServer = new WebSocketServer({ noServer: true });

webSocketServer.on("connection", (socket, request) => {
  void attachTerminalWebSocket(socket, request);
});

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`,
  ).pathname;

  if (pathname !== "/api/terminal") {
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (client) => {
    webSocketServer.emit("connection", client, request);
  });
});

server.listen(port, () => {
  const err = undefined;
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
