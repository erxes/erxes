import { bearerOf, type PluginMember, verifyPluginSession } from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer, type ServerResponse } from 'node:http';
import { z } from 'zod';

interface Call {
  procedure: string;
  userId: string;
  orgId: string;
  input: unknown;
}

const RpcBody = z.object({ json: z.unknown().optional() });

const ANSWERS: Record<string, unknown> = {
  'leave.balances': { balances: [{ employee: 'Bat-Erdene Ganbold', daysLeft: 12 }] },
  'leave.approve': { approved: true },
  'payroll.connect': { connected: true },
};

const send = (res: ServerResponse, status: number, json: unknown) =>
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify({ json }));

export const pluginRpc = async (coreUrl: string, plugin = 'hr') => {
  const calls: Call[] = [];

  const answer = (member: PluginMember, procedure: string, raw: string, res: ServerResponse) => {
    const { json: input } = RpcBody.parse(JSON.parse(raw || '{}'));

    calls.push({ procedure, userId: member.userId, orgId: member.orgId, input });

    if (!(procedure in ANSWERS)) return send(res, 404, { code: 'NOT_FOUND', status: 404 });

    if (!member.can('hr.leave.view')) {
      return send(res, 403, {
        defined: false,
        code: 'FORBIDDEN',
        status: 403,
        message: 'You need the hr.leave.view permission',
      });
    }

    return send(res, 200, ANSWERS[procedure]);
  };

  const server = createServer((req, res) => {
    let raw = '';

    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      const token = bearerOf(req.headers.authorization);

      const procedure = (req.url ?? '')
        .replace(/^\/api\/rpc\//, '')
        .split('/')
        .join('.');

      void (
        token ? verifyPluginSession(token, { coreUrl, plugin }) : Promise.reject(new Error())
      ).then(
        (member) => answer(member, procedure, raw, res),
        () => res.writeHead(401).end(),
      );
    });
  }).listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}/api`,
    calls,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
