import { sql } from 'drizzle-orm';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';
import { type CoreClient, useTestServer } from './support';

/** The run id from the `Idempotency-Key` (`<run>:<step>`) core sends. */
const runIdOf = (req: IncomingMessage) =>
  String(req.headers['idempotency-key']).split(':')[0] ?? '';

/**
 * Steps that call other systems (webhooks, plugin actions) run outside the
 * step's transaction: a slow remote must not hold a connection and the run's
 * row lock, and a run cancelled meanwhile must stay cancelled.
 */
describeWithDb('automation calls', { timeout: 120_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  let owner: CoreClient;
  let receiver: Server;
  let hookUrl = '';
  /** What the remote does before it answers. */
  let onCall: ((runId: string) => Promise<void>) | undefined;

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    owner = server.client({ user: acme.owner.id, org: acme.organization.id });
    receiver = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        void Promise.resolve(onCall?.(runIdOf(req))).finally(() => {
          res.setHeader('content-type', 'application/json');
          res.end('{"ok":true}');
        });
      });
    }).listen(0);

    const address = receiver.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    hookUrl = `http://127.0.0.1:${address.port}/hook`;
  });

  afterAll(() => new Promise<void>((resolve) => receiver.close(() => resolve())));

  const automationFor = async (firstName: string) => {
    const automation = await owner.automations.create({
      name: `Call for ${firstName}`,
      definition: {
        trigger: {
          kind: 'event',
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

    await owner.automations.activate({ id: automation.id });

    return automation.id;
  };

  /** The automation's only run, with its steps. */
  const onlyRun = async (automationId: string) => {
    const [run] = (await owner.automations.runs({ id: automationId })).data;

    if (!run) throw new Error('no run started');

    return owner.automations.run({ runId: run.id });
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

    await owner.customers.create({ firstName: 'Slow' });
    await settle();

    expect(lockError).toBeNull();

    const { run, steps } = await onlyRun(automationId);

    expect(run.status).toBe('succeeded');
    expect(steps.map((step) => step.stepId)).toEqual(['post', 'note']);
  });

  it('stays cancelled when cancelled while its call is in flight', async () => {
    const automationId = await automationFor('Cancelled');

    onCall = async (runId) => {
      await owner.automations.cancelRun({ runId });
    };

    await owner.customers.create({ firstName: 'Cancelled' });
    await settle();

    const { run, steps } = await onlyRun(automationId);

    expect(run.status).toBe('cancelled');
    // The answer came after the cancel: no step is recorded and the note never runs.
    expect(steps).toEqual([]);
  });
});
