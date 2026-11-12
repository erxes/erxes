import { sql } from 'drizzle-orm';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';

/**
 * Steps that call other systems (webhooks, plugin actions) run outside the
 * step's transaction: a slow remote must not hold a connection and the run's
 * row lock, and a run cancelled meanwhile must stay cancelled.
 */
describeWithDb('automation calls', { timeout: 120_000 }, () => {
  useTestDatabase();

  let api: Server;
  let receiver: Server;
  let base = '';
  let hookUrl = '';
  let owner = '';
  let onCall: (runId: string) => Promise<void> = async () => {};

  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${owner}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const flush = async () => {
    const { processEvents } = await import('~/modules/events/processor');
    const { processJobs } = await import('~/modules/jobs/jobs');
    const { JOBS } = await import('~/modules/jobs/registry');

    for (let round = 0; round < 20; round += 1) {
      if (!((await processEvents()) + (await processJobs(JOBS)))) return;
    }
  };

  const portOf = (server: Server) => {
    const address = server.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    return address.port;
  };

  /** The run id from the `Idempotency-Key` (`<run>:<step>`) core sends. */
  const runIdOf = (req: IncomingMessage) => String(req.headers['idempotency-key']).split(':')[0];

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    owner = await currentToken(acme.owner.id, acme.organization.id);
    api = createApp().listen(0);
    base = `http://127.0.0.1:${portOf(api)}`;
    receiver = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        void onCall(runIdOf(req)).finally(() => {
          res.setHeader('content-type', 'application/json');
          res.end('{"ok":true}');
        });
      });
    }).listen(0);
    hookUrl = `http://127.0.0.1:${portOf(receiver)}/hook`;
  });

  afterAll(async () => {
    api.closeAllConnections();
    await new Promise<void>((resolve) => api.close(() => resolve()));
    await new Promise<void>((resolve) => receiver.close(() => resolve()));
  });

  const automationFor = async (firstName: string) => {
    const created = await call('POST', '/automations', {
      name: `Call for ${firstName}`,
      definition: {
        trigger: {
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.firstName', op: 'eq', value: firstName }],
          },
        },
        steps: [
          { id: 'post', type: 'action', action: 'core.webhook.post', input: { url: hookUrl } },
          {
            id: 'note',
            type: 'action',
            action: 'core.note.add',
            input: { body: 'after the call' },
          },
        ],
      },
    });

    await call('POST', `/automations/${created.body.id}/activate`);

    return String(created.body.id);
  };

  it('holds no lock on the run while the remote answers, then moves on', async () => {
    const automationId = await automationFor('Slow');
    let lockError: unknown = 'not called';

    onCall = async (runId) => {
      lockError = await adminDb()
        .execute(sql`select id from core_automation_runs where id = ${runId} for update nowait`)
        .then(
          () => null,
          (error: unknown) => error,
        );
    };

    await call('POST', '/customers', { firstName: 'Slow' });
    await flush();

    expect(lockError).toBeNull();

    const runs = await call('GET', `/automations/${automationId}/runs`);
    const run = await call('GET', `/automations/runs/${runs.body.data[0].id}`);

    expect(run.body.run).toMatchObject({ status: 'succeeded' });
    expect(run.body.steps.map((step: { stepId: string }) => step.stepId)).toEqual(['post', 'note']);
  });

  it('stays cancelled when cancelled while its call is in flight', async () => {
    const automationId = await automationFor('Cancelled');

    onCall = async (runId) => {
      expect((await call('POST', `/automations/runs/${runId}/cancel`)).status).toBe(200);
    };

    await call('POST', '/customers', { firstName: 'Cancelled' });
    await flush();

    const runs = await call('GET', `/automations/${automationId}/runs`);
    const run = await call('GET', `/automations/runs/${runs.body.data[0].id}`);

    expect(run.body.run).toMatchObject({ status: 'cancelled' });
    // The answer came after the cancel: no step is recorded and the note never runs.
    expect(run.body.steps).toEqual([]);
  });
});
