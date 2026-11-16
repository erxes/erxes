import { type PluginJobDelivery, type RecordAccessCheck } from '@erxes/core-contract';
import {
  type PublicCall,
  verifyCoreAccessCheck,
  verifyCoreEvent,
  verifyCoreJob,
  verifyPublicCall,
} from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer, type IncomingHttpHeaders } from 'node:http';

/** What the plugin answers: a status, its headers and its body. */
interface Answer {
  status: number;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * A plugin's API that verifies each delivery like a plugin would and records
 * it: events at `/events`, jobs at `/jobs/<name>`, record access checks at
 * `/timelines/access`, public calls at `/public/*`. A job answers with the next status in `jobAnswers`,
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

  const publicCalls: (PublicCall & {
    method: string;
    path: string;
    headers: IncomingHttpHeaders;
    raw: string;
  })[] = [];

  /** A public call: the setup page redirects (and tries to set a cookie), others say what came. */
  const receivePublic = async (
    method: string,
    path: string,
    headers: IncomingHttpHeaders,
    bytes: Buffer,
  ): Promise<Answer> => {
    // Bytes, as `express.raw` gives them: a body that isn't text verifies too.
    const call = await verifyPublicCall(headers.authorization, new Uint8Array(bytes), {
      coreUrl,
      plugin,
    });

    publicCalls.push({ ...call, method, path, headers, raw: bytes.toString() });

    if (path.startsWith('/public/github/setup'))
      return {
        status: 302,
        headers: { location: '/hr/settings/github', 'set-cookie': 'plugin=1' },
      };

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orgId: call.orgId }),
    };
  };

  /** The status the plugin answers with, its headers and its body. */
  const receive = async (
    method: string,
    path: string,
    headers: IncomingHttpHeaders,
    bytes: Buffer,
  ): Promise<Answer> => {
    const raw = bytes.toString();

    try {
      if (path.startsWith('/public/')) return await receivePublic(method, path, headers, bytes);

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
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      void receive(req.method ?? 'GET', req.url ?? '', req.headers, Buffer.concat(chunks)).then(
        ({ status, headers, body }) => res.writeHead(status, headers).end(body),
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
    publicCalls,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
