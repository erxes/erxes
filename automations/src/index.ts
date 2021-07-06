import * as net from "net";
import { initBroker } from "./messageBroker";

const server = new net.Server();

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Automations server is working on: ${port}.`);

  initBroker(server);
});
