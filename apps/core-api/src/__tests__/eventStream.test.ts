import { sql } from 'drizzle-orm';
import { expect, it } from 'vite-plus/test';
import { processEvents } from '~/modules/events/processor';
import { adminDb, dbError, describeWithDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Events plugins and core publish, and what the processor makes of them. */
describeWithDb('event stream', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('publishes in the caller’s transaction: rolled back means never published', async () => {
    const customer = await t.owner().customers.create({
      firstName: 'Streamed',
      primaryEmail: 'streamed@mail.mn',
      ownerId: t.ids.member,
    });

    const { org } = t.ids;

    await adminDb()
      .transaction(async (tx) => {
        await tx.execute(
          sql`select core_publish_event(${org}, 'hr', 'hr.contract.drafted', '{}'::jsonb, 'customer', ${customer.id}, 'Drafted a contract')`,
        );
        throw new Error('roll back');
      })
      .catch(() => undefined);
    await adminDb().execute(
      sql`select core_publish_event(${org}, 'hr', 'hr.contract.signed', '{"contractId":"c1"}'::jsonb, 'customer', ${customer.id}, 'Signed contract C-1', '/hr/contracts/c1', null, 'contract-c1')`,
    );
    await adminDb().execute(
      sql`select core_publish_event(${org}, 'hr', 'hr.contract.signed', '{}'::jsonb, 'customer', ${customer.id}, 'Signed contract C-1', null, null, 'contract-c1')`,
    );
    expect(
      await dbError(
        adminDb().execute(sql`select core_publish_event(${org}, 'hr', 'ecom.order.paid')`),
      ),
    ).toMatch(/must start with "hr\."/);

    await processEvents();

    const timeline = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: customer.id, kind: 'plugins' });

    expect(timeline.data.map((entry) => entry.summary)).toEqual(['Signed contract C-1']);
    expect(timeline.data[0]).toMatchObject({
      source: 'hr',
      link: '/hr/contracts/c1',
      data: { contractId: 'c1' },
    });

    // The owner hears about it in HR's inbox; running again changes nothing.
    await processEvents();

    const inbox = await t.member().notifications.list({ source: 'hr', kind: 'hr.contract.signed' });

    expect(inbox.totalCount).toBe(1);
  });

  it('lets plugins publish over HTTP, checks what they send, and notifies', async () => {
    await expect(
      t.hr().events.publish({ events: [{ type: 'hr.x.y', summary: 'no subject' }] }),
    ).rejects.toMatchObject({ code: 'SUBJECT_REQUIRED' });

    const sent = await t.hr().events.publish({
      events: [
        {
          type: 'hr.review.scheduled',
          payload: { reviewId: 'r1' },
          notify: { userIds: [t.ids.member], title: 'Review on Friday', priority: 'high' },
          dedupeKey: 'review-r1',
        },
      ],
    });

    const again = await t
      .hr()
      .events.publish({ events: [{ type: 'hr.review.scheduled', dedupeKey: 'review-r1' }] });

    expect(sent).toEqual({ published: 1, duplicates: 0 });
    expect(again).toEqual({ published: 0, duplicates: 1 });

    await processEvents();

    const inbox = await t.member().notifications.list({ kind: 'hr.review.scheduled' });

    expect(inbox.data[0]).toMatchObject({
      title: 'Review on Friday',
      priority: 'high',
      source: 'hr',
    });

    // Core's own changes are in the stream too (for automations).
    expect((await t.owner().events.list({ type: 'core.customer.' })).data.length).toBeGreaterThan(
      0,
    );
    await expect(t.member().events.list({})).rejects.toMatchObject({ status: 403 });
  });
});
