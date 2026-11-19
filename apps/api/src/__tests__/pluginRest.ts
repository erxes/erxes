import { bearerOf, verifyAgentCall, verifyPluginSession } from '@erxes/plugin-sdk';
import { pluginOpenApi } from '@erxes/plugin-sdk/openapi';
import { oc } from '@orpc/contract';
import { once } from 'node:events';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { text } from 'node:stream/consumers';
import { z } from 'zod';

interface Call {
  procedure: string;
  userId: string;
  orgId: string;
  input: unknown;
}

const contract = {
  leave: {
    balances: oc
      .route({ method: 'GET', path: '/leave/balances', summary: 'Leave days left per employee' })
      .input(z.object({ employee: z.string().optional() }))
      .output(
        z.object({ balances: z.array(z.object({ employee: z.string(), daysLeft: z.number() })) }),
      ),
    approve: oc
      .route({
        method: 'POST',
        path: '/leave/requests/{requestId}/approve',
        summary: 'Approve a leave request',
      })
      .input(z.object({ requestId: z.string(), note: z.string().optional() }))
      .output(z.object({ approved: z.boolean() })),
  },
  payroll: {
    connect: oc
      .route({ method: 'POST', path: '/payroll/connect', summary: 'Connect the payroll provider' })
      .input(z.object({ apiKey: z.string() }))
      .output(z.object({ connected: z.boolean() })),
  },
};

const Body = z.record(z.string(), z.unknown());

const APPROVE = /^\/api\/v1\/leave\/requests\/([^/]+)\/approve$/;

const routeOf = (method: string, path: string, query: URLSearchParams, body: unknown) => {
  if (method === 'GET' && path === '/api/v1/leave/balances') {
    return {
      procedure: 'leave.balances',
      input: Object.fromEntries(query),
      answer: { balances: [{ employee: 'Bat-Erdene Ganbold', daysLeft: 12 }] },
    };
  }

  const [, requestId] = APPROVE.exec(path) ?? [];

  if (method === 'POST' && requestId) {
    return {
      procedure: 'leave.approve',
      input: { requestId: decodeURIComponent(requestId), ...Body.parse(body) },
      answer: { approved: true },
    };
  }

  if (method === 'POST' && path === '/api/v1/payroll/connect') {
    return { procedure: 'payroll.connect', input: body, answer: { connected: true } };
  }

  return null;
};

const send = (res: ServerResponse, status: number, json: unknown) =>
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(json));

/** Who calls: a member with their permissions, or one of the plugin's agents (`agent:hr.helper`). */
interface Caller {
  userId: string;
  orgId: string;
  mayView: boolean;
}

export const pluginRest = async (coreUrl: string, plugin = 'hr') => {
  const calls: Call[] = [];
  const server = createServer().listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  const url = `http://127.0.0.1:${address.port}/api`;

  const document = pluginOpenApi(contract, {
    plugin,
    audience: 'member',
    title: 'HR',
    version: '2.1.0',
    server: url,
    prefix: '/v1',
  });

  const options = { coreUrl, plugin };

  const callerOf = (token: string) =>
    verifyPluginSession(token, options).then(
      (member): Caller => ({ ...member, mayView: member.can('hr.leave.view') }),
      () =>
        verifyAgentCall(token, options).then((agent): Caller => ({
          userId: `agent:${agent.agent}`,
          orgId: agent.orgId,
          mayView: true,
        })),
    );

  const answerAs = (member: Caller, req: IncomingMessage, res: ServerResponse, raw: string) => {
    const { pathname, searchParams } = new URL(req.url ?? '/', url);
    const body: unknown = raw ? JSON.parse(raw) : {};
    const route = routeOf(req.method ?? 'GET', pathname, searchParams, body);

    if (!route) return send(res, 404, { code: 'NOT_FOUND', status: 404, message: 'Not found' });

    calls.push({
      procedure: route.procedure,
      userId: member.userId,
      orgId: member.orgId,
      input: route.input,
    });

    if (!member.mayView) {
      return send(res, 403, {
        defined: false,
        code: 'FORBIDDEN',
        status: 403,
        message: 'You need the hr.leave.view permission',
      });
    }

    return send(res, 200, route.answer);
  };

  const answer = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/api/openapi/member.json') return send(res, 200, await document);

    const raw = await text(req);
    const token = bearerOf(req.headers.authorization);

    const member = token ? await callerOf(token).catch(() => null) : null;

    return member ? answerAs(member, req, res, raw) : res.writeHead(401).end();
  };

  server.on('request', (req, res) => {
    void answer(req, res);
  });

  return {
    url,
    calls,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};
