import { type PluginJobDelivery } from '@erxes/core-contract';
import { verifyCoreEvent, verifyCoreJob } from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer, type IncomingHttpHeaders } from 'node:http';

/**
 * A plugin's API that verifies each delivery like a plugin would and records
 * it: events at `/events`, jobs at `/jobs/<name>`. A job answers with the
 * next status in `jobAnswers`, then 204.
 */
export const pluginApi = async (coreUrl: string, plugin = 'hr') => {
  const received: { type: string; payload: Record<string, unknown> }[] = [];
  const jobs: (PluginJobDelivery & { path: string; idempotencyKey: unknown })[] = [];
  const jobRequests: { authorization: string | undefined; raw: string }[] = [];
  const jobAnswers: number[] = [];
  const rejected: string[] = [];

  /** The status the plugin answers with. */
  const receive = async (path: string, headers: IncomingHttpHeaders, raw: string) => {
    try {
      if (path.startsWith('/jobs/')) {
        jobRequests.push({ authorization: headers.authorization, raw });

        const job = await verifyCoreJob(headers.authorization, raw, { coreUrl, plugin });

        jobs.push({ ...job, path, idempotencyKey: headers['idempotency-key'] });

        return jobAnswers.shift() ?? 204;
      }

      const event = await verifyCoreEvent(headers.authorization, raw, { coreUrl, plugin });

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
      void receive(req.url ?? '', req.headers, raw).then((status) => res.writeHead(status).end());
    });
  }).listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    received,
    jobs,
    jobRequests,
    jobAnswers,
    rejected,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
