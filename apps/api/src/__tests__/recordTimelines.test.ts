import { pluginInstallations, plugins } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { consumerJob } from '~/modules/events/consumers';
import { timelineConsumer } from '~/modules/events/coreConsumers';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** Plugin events that name the plugin's own record land on that record's Activity tab. */
describe('record timelines from plugin events', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const emp1 = { targetType: 'hr.employee', targetId: 'emp-1' };

  const summaries = async (targetType: string, targetId: string) =>
    (await t.owner().activities.list({ targetType, targetId, kind: 'plugins' })).data.map(
      (entry) => entry.summary,
    );

  /** `core_publish_event()` in the plugin's transaction; returns the event id. */
  const publish = async (
    source: string,
    type: string,
    entity: { type: string; id: string },
    extra: { summary?: string; subjectId?: string } = {},
  ) => {
    const { rows } = await adminDb().execute<{ id: string }>(
      sql`select core_publish_event(
        p_org_id => ${t.ids.org}, p_source => ${source}, p_type => ${type},
        p_payload => '{"days":3}'::jsonb,
        p_subject_type => ${extra.subjectId ? 'customer' : null}, p_subject_id => ${extra.subjectId ?? null},
        p_summary => ${extra.summary ?? null}, p_link => ${`/hr/employees/${entity.id}`},
        p_entity_type => ${entity.type}, p_entity_id => ${entity.id}
      ) as id`,
    );

    return rows[0]?.id ?? '';
  };

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: ['events:write'],
      timelines: [{ type: 'hr.employee', label: 'Employee' }],
      activityTypes: [
        { type: 'hr.leave.approved', label: 'Leave approved', icon: 'IconBeach', color: '#16a34a' },
      ],
    });
    await adminDb().insert(plugins).values({ name: 'ecom' }).onConflictDoNothing();
    await adminDb()
      .insert(pluginInstallations)
      .values({ orgId: t.ids.org, plugin: 'ecom', grantedScopes: [] })
      .onConflictDoNothing();
  });

  it('puts the event on the record and on its customer, once, for its organisation only', async () => {
    const customer = await t.owner().customers.create({ firstName: 'Bold' });

    const eventId = await publish(
      'hr',
      'hr.leave.approved',
      { type: 'hr.employee', id: 'emp-1' },
      { summary: 'Leave approved: 3 days', subjectId: customer.id },
    );

    await settle();

    const record = await t.owner().activities.list(emp1);

    expect(record.data).toHaveLength(1);
    expect(record.data[0]).toMatchObject({
      source: 'hr',
      type: 'hr.leave.approved',
      summary: 'Leave approved: 3 days',
      data: { days: 3 },
      link: '/hr/employees/emp-1',
      actorType: 'plugin',
      actorId: 'hr',
    });
    expect(await summaries('customer', customer.id)).toEqual(['Leave approved: 3 days']);

    // The consumer runs the event again (a retry): nothing new.
    await consumerJob(timelineConsumer).enqueue(adminDb(), {
      orgId: t.ids.org,
      payload: { eventId },
    });
    await settle();

    expect(await summaries('hr.employee', 'emp-1')).toEqual(['Leave approved: 3 days']);
    expect(await summaries('customer', customer.id)).toEqual(['Leave approved: 3 days']);

    // Another organisation sees nothing.
    expect((await t.other().activities.list(emp1)).data).toEqual([]);
  });

  it('ignores record types the publisher did not declare, and other plugins’ types', async () => {
    await publish(
      'hr',
      'hr.contract.signed',
      { type: 'hr.contract', id: 'c-1' },
      { summary: 'Signed' },
    );
    await publish(
      'ecom',
      'ecom.order.paid',
      { type: 'hr.employee', id: 'emp-2' },
      { summary: 'Paid order #1' },
    );
    // No summary: no timeline line.
    await publish('hr', 'hr.leave.approved', { type: 'hr.employee', id: 'emp-2' });
    await settle();

    expect(await summaries('hr.employee', 'emp-2')).toEqual([]);

    // Declared later, the type still has nothing from before.
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      scopes: ['events:write'],
      timelines: [
        { type: 'hr.employee', label: 'Employee' },
        { type: 'hr.contract', label: 'Contract' },
      ],
    });

    expect(await summaries('hr.contract', 'c-1')).toEqual([]);
  });

  it('takes a record instead of a subject over HTTP', async () => {
    await t.hr().events.publish({
      events: [
        {
          type: 'hr.leave.approved',
          summary: 'Leave approved: 1 day',
          entityType: 'hr.employee',
          entityId: 'emp-3',
        },
      ],
    });
    await settle();

    expect(await summaries('hr.employee', 'emp-3')).toEqual(['Leave approved: 1 day']);
  });
});
