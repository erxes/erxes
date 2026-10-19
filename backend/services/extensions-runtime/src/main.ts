import { serve } from '@hono/node-server';
import { closeMongooose, redis } from 'erxes-api-shared/utils';
import { app, hostApp, SERVICE_NAME } from './app';
import { HOST_PORT, stopAll } from './sandbox';
import { startTriggerWorkers } from './triggers';

const PORT = Number(process.env.EXT_RUNTIME_PORT || 3320);
// Where the gateway reaches this service. The default fits a gateway on the
// same host; in a container network set it to this container's address.
const ADDRESS = process.env.EXT_RUNTIME_ADDRESS || `http://127.0.0.1:${PORT}`;
const HOSTNAME = process.env.EXT_RUNTIME_HOSTNAME || '127.0.0.1';

const main = async () => {
  const server = serve(
    { fetch: app.fetch, port: PORT, hostname: HOSTNAME },
    () => console.log(`extensions-runtime listening on ${HOSTNAME}:${PORT}`),
  );
  // workerd's callbacks. Loopback only, whatever HOSTNAME is.
  const hostServer = serve({
    fetch: hostApp.fetch,
    port: HOST_PORT,
    hostname: '127.0.0.1',
  });

  // The gateway proxies /pl:extensions/* to whatever address is registered here.
  await redis.set(`erxes-service-${SERVICE_NAME}`, ADDRESS);

  const stopTriggers = startTriggerWorkers();

  const shutdown = async () => {
    await stopTriggers();
    stopAll();
    server.close();
    hostServer.close();
    await closeMongooose();
    process.exit(0);
  };

  (['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => {
    process.on(sig, () => void shutdown());
  });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
