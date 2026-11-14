import { withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { pruneRunDetails } from '~/modules/automations/runs.service';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';
import { type CoreClient, useTestServer } from './support';

/** One cleanup pass with a 90-day period. */
const prune = () => withSystem('test', (tx) => pruneRunDetails(tx, 90));

/** Old finished runs lose their step log and context, and still count for re-entry. */
describe('automation run retention', { timeout: 120_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  let owner: CoreClient;

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    owner = server.client({ user: acme.owner.id, org: acme.organization.id });
  });

  it('prunes the details of runs finished before the retention period, keeping the runs', async () => {
    const automation = await owner.automations.create({
      name: 'Once',
      definition: {
        trigger: { kind: 'event', event: 'core.customer.updated' },
        reentry: 'once',
        steps: [{ id: 'note', type: 'action', action: 'core.note.add', input: { body: 'hi' } }],
      },
    });

    await owner.automations.activate({ id: automation.id });

    const customer = await owner.customers.create({ firstName: 'Kept' });

    await owner.customers.update({ id: customer.id, lastName: 'First' });
    await settle();

    const [run] = (await owner.automations.runs({ id: automation.id })).data;

    if (!run) throw new Error('the update started no run');

    expect((await owner.automations.run({ runId: run.id })).steps).toHaveLength(1);
    // Within the period nothing goes.
    expect(await prune()).toBe(0);

    await adminDb().execute(
      sql`update core_automation_runs set finished_at = now() - interval '100 days' where id = ${run.id}`,
    );

    expect(await prune()).toBe(1);
    expect(await prune()).toBe(0);

    const detail = await owner.automations.run({ runId: run.id });

    expect(detail.run).toMatchObject({ id: run.id, status: 'succeeded' });
    expect(detail.steps).toEqual([]);

    // The pruned run still keeps the customer from entering again.
    await owner.customers.update({ id: customer.id, lastName: 'Second' });
    await settle();
    expect((await owner.automations.runs({ id: automation.id })).data).toHaveLength(1);
  });
});
