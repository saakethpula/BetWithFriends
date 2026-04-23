import { createServer } from "http";
import { app } from "./app.js";
import { env } from "./config.js";
import { initializeRealtimeServer } from "./lib/realtime.js";

const server = createServer(app);

initializeRealtimeServer(server);

server.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});
