import { newId, notifications, runAs, users, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { notify } from '~/modules/notifications/notifications.service';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { useTestServer } from './support';

const Changes = z.object({ changes: z.record(z.string(), z.unknown()) });

/** How many of the calls succeeded. */
const succeeded = async (calls: Promise<unknown>[]) =>
  (await Promise.allSettled(calls)).filter((result) => result.status === 'fulfilled').length;

/**
 * Races from the Phase 1 brief, each run with both sides at once against
 * real Postgres, asserting the final state.
 */
describe('concurrent writes', () => {
  useTestDatabase();

  const server = useTestServer();
  let orgId = '';
  let ownerA = '';
  let ownerB = '';

  const as = (user: string) => server.client({ user, org: orgId });

  const owners = (status?: 'active') =>
    adminDb()
      .select()
      .from(users)
      .where(
        and(
          eq(users.orgId, orgId),
          eq(users.role, 'owner'),
          status ? eq(users.status, status) : undefined,
        ),
      );

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'a@acme.mn' },
    });

    orgId = acme.organization.id;
    ownerA = acme.owner.id;
    ownerB = newId();
    await adminDb()
      .insert(users)
      .values({ id: ownerB, orgId, email: 'b@acme.mn', role: 'owner', status: 'active' });
  });

  it('two owners demoting each other at once: one wins, the organisation keeps an owner', async () => {
    expect(
      await succeeded([
        as(ownerA).users.update({ id: ownerB, role: 'member' }),
        as(ownerB).users.update({ id: ownerA, role: 'member' }),
      ]),
    ).toBe(1);

    const [remaining, ...more] = await owners();

    expect(more).toEqual([]);

    // Back to two owners for the next tests.
    const demoted = remaining?.id === ownerA ? ownerB : ownerA;

    await as(remaining?.id ?? '').users.update({ id: demoted, role: 'owner' });
  });

  it('two owners disabling each other at once: never zero active owners', async () => {
    expect(
      await succeeded([
        as(ownerA).users.disable({ id: ownerB }),
        as(ownerB).users.disable({ id: ownerA }),
      ]),
    ).toBeLessThanOrEqual(1);

    const active = await owners('active');
    const [still] = active;

    expect(still).toBeDefined();

    for (const id of [ownerA, ownerB])
      if (!active.some((user) => user.id === id)) await as(still?.id ?? '').users.enable({ id });
  });

  it('two edits of different custom fields at once: both are kept', async () => {
    const owner = as(ownerA);

    const shoe = await owner.fields.create({
      contentType: 'customer',
      label: 'Shoe size',
      type: 'number',
    });

    const nickname = await owner.fields.create({
      contentType: 'customer',
      label: 'Nickname',
      type: 'text',
    });

    const { id } = await owner.customers.create({ firstName: 'Bat' });

    for (let round = 0; round < 3; round += 1) {
      await Promise.all([
        owner.customers.update({ id, customFields: { [shoe.id]: 40 + round } }),
        owner.customers.update({ id, customFields: { [nickname.id]: `bat-${round}` } }),
      ]);
      expect((await owner.customers.get({ id })).customFields).toEqual({
        [shoe.id]: 40 + round,
        [nickname.id]: `bat-${round}`,
      });
    }
  });

  it('collapses concurrent edit notifications without losing a change', async () => {
    const owner = { type: 'user' as const, userId: ownerA, role: 'owner', permissions: ['*'] };

    const send = (field: string) =>
      runAs(owner, () =>
        withOrg(orgId, (tx) =>
          notify(tx, {
            userIds: [ownerB],
            kind: 'core.customer.updated',
            title: 'Updated',
            entity: { type: 'customer', id: 'c-collapse' },
            collapseMinutes: 30,
            data: { changes: { [field]: ['old', 'new'] } },
          }),
        ),
      );

    await send('firstName');
    await Promise.all(['lastName', 'primaryEmail', 'primaryPhone', 'description'].map(send));

    const rows = await adminDb()
      .select()
      .from(notifications)
      .where(eq(notifications.entityId, 'c-collapse'));

    expect(rows).toHaveLength(1);
    expect(
      Object.keys(Changes.parse(rows[0]?.data).changes).toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['description', 'firstName', 'lastName', 'primaryEmail', 'primaryPhone']);
  });
});
