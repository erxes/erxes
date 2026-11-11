// First, as in main.ts: tracing patches http, express and pg before they load.
import { stopTracing } from '~/instrumentation';
import pino from 'pino';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { signAccessToken } from '~/http/auth';
import { loggerOptions } from '~/logger';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase, useTestServer } from './support';

const Line = z.object({
  msg: z.string(),
  requestId: z.string().optional(),
  orgId: z.string().optional(),
  actorId: z.string().optional(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  req: z.object({ method: z.string(), url: z.string(), headers: z.record(z.unknown()) }).optional(),
  res: z.object({ statusCode: z.number() }).optional(),
});

const lines: string[] = [];

/** The line pino-http writes when the request ends. */
const completed = (requestId: string | null) =>
  lines
    .map((line) => Line.parse(JSON.parse(line)))
    .filter((entry) => entry.requestId === requestId && entry.msg === 'request completed');

describe('request logs', () => {
  useTestDatabase();

  const server = useTestServer(
    pino({ ...loggerOptions, level: 'info' }, { write: (line: string) => lines.push(line) }),
  );

  let token = '';
  let orgId = '';
  let ownerId = '';

  beforeAll(async () => {
    const { organization, owner } = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', fullName: 'Owner' },
    });

    token = signAccessToken(owner.id, organization.id);
    orgId = organization.id;
    ownerId = owner.id;
  });

  afterAll(() => stopTracing());

  it('logs one line per request with its request id, trace and caller, without credentials', async () => {
    const response = await fetch(server.url('/core/v1/users'), {
      headers: {
        ...server.headers(token),
        cookie: 'erxes_session=cookie-secret-value',
        'x-request-id': 'req-logging-test-1',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('x-request-id')).toBe('req-logging-test-1');
    await vi.waitFor(() => expect(completed('req-logging-test-1')).toHaveLength(1));

    const [line] = completed('req-logging-test-1');

    expect(line).toMatchObject({
      orgId,
      actorId: ownerId,
      req: {
        method: 'GET',
        url: '/core/v1/users',
        headers: { authorization: '[Redacted]', cookie: '[Redacted]' },
      },
      res: { statusCode: 200 },
    });
    expect(line?.trace_id).toMatch(/^[0-9a-f]{32}$/);
    expect(line?.span_id).toMatch(/^[0-9a-f]{16}$/);

    const output = lines.join('');

    expect(output).not.toContain(token);
    expect(output).not.toContain('cookie-secret-value');
  });

  it('gives a request without an id a new one', async () => {
    const response = await fetch(server.url('/core/v1/users'), { headers: server.headers(token) });
    const id = response.headers.get('x-request-id');

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    await vi.waitFor(() => expect(completed(id)).toHaveLength(1));
  });
});
