import { type PluginJobDelivery, type RecordAccessCheck } from '@erxes/core-contract';
import { verifyCoreAccessCheck, verifyCoreEvent, verifyCoreJob } from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer, type IncomingHttpHeaders } from 'node:http';

/**
 * A plugin's API that verifies each delivery like a plugin would and records
 * it: events at `/events`, jobs at `/jobs/<name>`, record access checks at
 * `/timelines/access`. A job answers with the next status in `jobAnswers`,
 * then 204; a check allows the records in `readable`.
 */
export const pluginApi = async (coreUrl: string, plugin = 'hr') => {
  const received: { type: string; payload: Record<string, unknown> }[] = [];
  const jobs: (PluginJobDelivery & { path: string; idempotencyKey: unknown })[] = [];
  const jobRequests: { authorization: string | undefined; raw: string }[] = [];
  const jobAnswers: number[] = [];
  const accessChecks: RecordAccessCheck[] = [];
  const readable = new Set<string>();
  const rejected: string[] = [];

  /** The status the plugin answers with, and its body. */
  const receive = async (path: string, headers: IncomingHttpHeaders, raw: string) => {
    try {
      if (path === '/timelines/access') {
        const check = await verifyCoreAccessCheck(headers.authorization, raw, { coreUrl, plugin });

        accessChecks.push(check);

        return { status: 200, body: JSON.stringify({ allowed: readable.has(check.id) }) };
      }

      if (path.startsWith('/jobs/')) {
        jobRequests.push({ authorization: headers.authorization, raw });

        const job = await verifyCoreJob(headers.authorization, raw, { coreUrl, plugin });

        jobs.push({ ...job, path, idempotencyKey: headers['idempotency-key'] });

        return { status: jobAnswers.shift() ?? 204 };
      }

      const event = await verifyCoreEvent(headers.authorization, raw, { coreUrl, plugin });

      received.push({ type: event.type, payload: event.data.payload });

      return { status: 204 };
    } catch (error) {
      rejected.push(String(error));

      return { status: 401 };
    }
  };

  const server = createServer((req, res) => {
    let raw = '';

    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      void receive(req.url ?? '', req.headers, raw).then(({ status, body }) =>
        res.writeHead(status).end(body),
      );
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
    accessChecks,
    readable,
    rejected,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
