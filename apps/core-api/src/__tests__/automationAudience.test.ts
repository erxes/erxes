import { sql } from 'drizzle-orm';
import type { Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';

/** Which records automations start for: their custom fields count, and no audience is cut short. */
describeWithDb('automation subjects', { timeout: 300_000 }, () => {
  useTestDatabase();

  let api: Server;
  let base = '';
  let owner = '';
  let orgId = '';

  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${owner}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const runCount = async (automationId: string) => {
    const { rows } = await adminDb().execute<{ count: number }>(
      sql`select count(*)::int as count from core_automation_runs where automation_id = ${automationId}`,
    );

    return rows[0]?.count;
  };

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    orgId = acme.organization.id;
    owner = await currentToken(acme.owner.id, orgId);
    api = createApp().listen(0);

    const address = api.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    base = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    api.closeAllConnections();
    await new Promise<void>((resolve) => api.close(() => resolve()));
  });

  it("starts event automations on the record's custom fields", async () => {
    const { processEvents } = await import('~/modules/events/processor');

    const tier = await call('POST', '/fields', {
      contentType: 'customer',
      label: 'Tier',
      type: 'select',
      options: ['Bronze', 'Gold'],
    });

    const created = await call('POST', '/automations', {
      name: 'Gold welcome',
      definition: {
        trigger: {
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: `subject.customFields.${tier.body.id}`, op: 'eq', value: 'Gold' }],
          },
        },
        steps: [{ id: 'stop', type: 'stop' }],
      },
    });

    await call('POST', `/automations/${created.body.id}/activate`);

    const gold = await call('POST', '/customers', {
      firstName: 'Gold',
      customFields: { [tier.body.id]: 'Gold' },
    });

    await call('POST', '/customers', {
      firstName: 'Bronze',
      customFields: { [tier.body.id]: 'Bronze' },
    });
    await processEvents();

    const runs = await call('GET', `/automations/${created.body.id}/runs`);

    expect(runs.body.data.map((run: { subject: { id: string } }) => run.subject.id)).toEqual([
      gold.body.id,
    ]);
  });

  it('enrolls every record of an audience past 10,000, a page per job', async () => {
    const { processJobs } = await import('~/modules/jobs/jobs');
    const { fireJob } = await import('~/modules/automations/triggers');

    await adminDb().execute(sql`
      insert into core_customers (id, org_id, first_name)
      select 'bulk' || lpad(g::text, 6, '0'), ${orgId}, 'Bulk' from generate_series(1, 10050) g
    `);

    const created = await call('POST', '/automations', {
      name: 'Everyone',
      definition: {
        trigger: {
          kind: 'manual',
          audience: {
            type: 'customer',
            conditions: {
              match: 'all',
              rules: [{ path: 'subject.firstName', op: 'eq', value: 'Bulk' }],
            },
          },
        },
        steps: [{ id: 'stop', type: 'stop' }],
      },
    });

    await call('POST', `/automations/${created.body.id}/activate`);

    const started = await call('POST', `/automations/${created.body.id}/start`, {});

    expect(started.body).toMatchObject({ continuing: true });

    while (await processJobs([fireJob])) {
      // Each page queues the next.
    }

    expect(await runCount(created.body.id)).toBe(10_050);
  });
});
