import { verifyCoreEvent } from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer } from 'node:http';

/** A plugin's API that verifies each delivery like a plugin would and records it. */
export const pluginApi = async (coreUrl: string, plugin = 'hr') => {
  const received: { type: string; payload: Record<string, unknown> }[] = [];
  const rejected: string[] = [];

  /** The status the plugin answers with. */
  const receive = async (authorization: string | undefined, raw: string) => {
    try {
      const event = await verifyCoreEvent(authorization, raw, { coreUrl, plugin });

      received.push({ type: event.type, payload: event.data.payload });

      return 204;
    } catch (error) {
      rejected.push(String(error));

      return 401;
    }
  };

  const server = createServer((req, res) => {
    let raw = '';

    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      void receive(req.headers.authorization, raw).then((status) => res.writeHead(status).end());
    });
  }).listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    received,
    rejected,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
