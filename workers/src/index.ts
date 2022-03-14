import * as dotenv from 'dotenv';
import * as net from 'net';
import { debugWorkers } from './debugger';
import { initMemoryStorage } from './inmemoryStorage';

import { initBroker } from './messageBroker';

// load environment variables
dotenv.config();

const server = net.createServer();

const { PORT_WORKERS = 3700 } = process.env;

server.listen(PORT_WORKERS, () => {
  initMemoryStorage();

  initBroker().catch(e => {
    debugWorkers(`Error ocurred during message broker init ${e.message}`);
  });

  debugWorkers(`Workers server is now running on ${PORT_WORKERS}`);
});
