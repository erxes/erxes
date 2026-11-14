import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';
import { type CoreClient, useTestServer } from './support';

const runCount = async (automationId: string) => {
  const { rows } = await adminDb().execute<{ count: number }>(
    sql`select count(*)::int as count from core_automation_runs where automation_id = ${automationId}`,
  );

  return rows[0]?.count;
};

/** Which records automations start for: their custom fields count, and no audience is cut short. */
describe('automation subjects', { timeout: 300_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  let owner: CoreClient;
  let orgId = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    orgId = acme.organization.id;
    owner = server.client({ user: acme.owner.id, org: orgId });
  });

  it("starts event automations on the record's custom fields", async () => {
    const tier = await owner.fields.create({
      contentType: 'customer',
      label: 'Tier',
      type: 'select',
      options: ['Bronze', 'Gold'],
    });

    const automation = await owner.automations.create({
      name: 'Gold welcome',
      definition: {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: `subject.customFields.${tier.id}`, op: 'eq', value: 'Gold' }],
          },
        },
        steps: [{ id: 'stop', type: 'stop' }],
      },
    });

    await owner.automations.activate({ id: automation.id });

    const gold = await owner.customers.create({
      firstName: 'Gold',
      customFields: { [tier.id]: 'Gold' },
    });

    await owner.customers.create({ firstName: 'Bronze', customFields: { [tier.id]: 'Bronze' } });
    await settle();

    const runs = await owner.automations.runs({ id: automation.id });

    expect(runs.data.map((run) => run.subject?.id)).toEqual([gold.id]);
  });

  it('enrolls every record of an audience past 10,000, a page per job', async () => {
    await adminDb().execute(sql`
      insert into core_customers (id, org_id, first_name)
      select 'bulk' || lpad(g::text, 6, '0'), ${orgId}, 'Bulk' from generate_series(1, 10050) g
    `);

    const automation = await owner.automations.create({
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

    await owner.automations.activate({ id: automation.id });

    expect(await owner.automations.start({ id: automation.id })).toMatchObject({
      continuing: true,
    });

    // Each page queues the next.
    await settle(300_000);

    expect(await runCount(automation.id)).toBe(10_050);
  });
});
