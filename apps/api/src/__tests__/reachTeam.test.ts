import { orgUnits, users } from '@erxes/core-db';
import { verifyPluginSession } from '@erxes/plugin-sdk';
import { type MemberReach, withinReach } from '@erxes/plugin-sdk/filter';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { customerNames, OUTSIDE_REACH, teamEmails, useStores } from './reachStores';

const sorted = (list: string[]) => list.toSorted((a, b) => a.localeCompare(b));

/**
 * A role's reach over the team, the structure and what a role may hold (docs/design.md,
 * decision 48), with the stores of reachStores.ts. Records are in reach.test.ts.
 */
describe('reach over the team and the structure', { timeout: 300_000 }, () => {
  useTestDatabase();

  const { t, ids, as } = useStores();

  /**
   * What `withinReach` keeps for the member. A plugin's rows name a unit, its path and an owner;
   * the units themselves stand in for them here.
   */
  const namesFor = async (member: MemberReach) => {
    const rows = await adminDb()
      .select({ name: orgUnits.name })
      .from(orgUnits)
      .where(
        and(
          eq(orgUnits.orgId, t.ids.org),
          withinReach(member, {
            unitId: orgUnits.id,
            unitPath: orgUnits.path,
            ownerId: orgUnits.supervisorId,
          }),
        ),
      );

    return sorted(rows.map((row) => row.name));
  };

  it('shows the team of the units a member reaches', async () => {
    expect(await teamEmails(as(ids.manager1))).toEqual(['rep@acme.mn', 'store1@acme.mn']);
    expect(await teamEmails(as(ids.manager2))).toEqual(['store2@acme.mn']);
    expect(await teamEmails(as(ids.districtManager1))).toEqual([
      'district1@acme.mn',
      'rep@acme.mn',
      'store1@acme.mn',
      'store2@acme.mn',
    ]);
    expect(await teamEmails(as(ids.districtManager2))).toEqual(['district2@acme.mn']);
    expect((await teamEmails(t.owner())).length).toBeGreaterThan(5);

    await expect(as(ids.manager1).users.get({ id: ids.manager2 })).rejects.toMatchObject({
      status: 404,
    });
    expect((await as(ids.manager1).search.global({ q: 'store2' })).data).toEqual([]);
  });

  it('lets a district manage the people under it, never the district beside it', async () => {
    const district1 = as(ids.districtManager1);

    expect(await district1.users.update({ id: ids.manager2, shortName: 'Lead' })).toMatchObject({
      shortName: 'Lead',
    });
    await expect(
      district1.users.update({ id: ids.districtManager2, shortName: 'Mine' }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(district1.users.disable({ id: ids.districtManager2 })).rejects.toMatchObject({
      status: 404,
    });

    // Whoever they invite starts in their units, with a role that reaches no further.
    await expect(
      district1.users.invite({ email: 'wide@acme.mn', role: 'member' }),
    ).rejects.toMatchObject({ code: 'BEYOND_OWN_PERMISSIONS' });

    const invited = await district1.users.invite({ email: 'new@acme.mn', role: ids.storeRole });

    expect((await t.owner().units.get({ id: ids.district1 })).memberIds).toContain(invited.id);
    expect(await teamEmails(district1)).toContain('new@acme.mn');
    await adminDb().delete(users).where(eq(users.id, invited.id));
  });

  it('shows the structure a member reaches, and the way up to it by name', async () => {
    const manager1 = as(ids.manager1);
    const root = await manager1.units.root({});
    const top = await manager1.units.children({ id: root.id });

    // The district above their store, without its people or the store beside theirs.
    expect(top.data.map((unit) => unit.name)).toEqual(['District 1']);
    expect(top.data[0]).toMatchObject({ childCount: 1, memberCount: 0, subtreeMemberCount: 2 });
    expect(
      (await manager1.units.children({ id: ids.district1 })).data.map((unit) => unit.name),
    ).toEqual(['Store 1']);
    expect((await manager1.units.get({ id: ids.district1 })).memberIds).toEqual([]);
    expect(sorted((await manager1.units.get({ id: ids.store1 })).memberIds)).toEqual(
      sorted([ids.manager1, ids.rep]),
    );
    await expect(manager1.units.get({ id: ids.store2 })).rejects.toMatchObject({ status: 404 });
    await expect(manager1.units.get({ id: ids.district2 })).rejects.toMatchObject({ status: 404 });
    expect((await manager1.units.search({ q: 'Store' })).data.map((unit) => unit.name)).toEqual([
      'Store 1',
    ]);
    expect(sorted((await manager1.units.list({})).data.map((unit) => unit.name))).toEqual([
      'Acme',
      'District 1',
      'Store 1',
    ]);

    const district1 = as(ids.districtManager1);

    expect((await district1.units.children({ id: root.id })).data.map((unit) => unit.name)).toEqual(
      ['District 1'],
    );
    expect(
      (await district1.units.children({ id: ids.district1 })).data.map((unit) => unit.name),
    ).toEqual(['Store 1', 'Store 2']);
  });

  it('lets a district change the units under it, and nothing beside or above', async () => {
    const district1 = as(ids.districtManager1);
    const kiosk = await district1.units.create({ name: 'Kiosk', parentId: ids.store1 });

    expect(kiosk.path).toContain(`/${ids.store1}/${kiosk.id}/`);
    await district1.units.move({ id: kiosk.id, parentId: ids.store2 });
    await district1.units.assign({ userId: ids.manager2, unitIds: [ids.store2, kiosk.id] });
    await district1.units.assign({ userId: ids.manager2, unitIds: [ids.store2] });

    await expect(district1.units.create({ name: 'Beside' })).rejects.toMatchObject(OUTSIDE_REACH);
    await expect(
      district1.units.create({ name: 'Beside', parentId: ids.district2 }),
    ).rejects.toMatchObject(OUTSIDE_REACH);
    await expect(
      district1.units.move({ id: kiosk.id, parentId: ids.store3 }),
    ).rejects.toMatchObject(OUTSIDE_REACH);
    await expect(district1.units.update({ id: ids.store3, name: 'Taken' })).rejects.toMatchObject({
      status: 404,
    });
    await expect(district1.unitTypes.create({ name: 'Kiosk type' })).rejects.toMatchObject(
      OUTSIDE_REACH,
    );
    // Putting someone in a unit they don't reach is not theirs to do either.
    await expect(
      district1.units.assign({ userId: ids.manager2, unitIds: [ids.store3] }),
    ).rejects.toMatchObject(OUTSIDE_REACH);

    await district1.units.remove({ id: kiosk.id });

    // A unit with records in it stays.
    await expect(t.owner().units.remove({ id: ids.store3 })).rejects.toMatchObject({
      status: 409,
      code: 'UNIT_NOT_EMPTY',
      data: { records: 1 },
    });
  });

  it('follows a unit when it moves to another district', async () => {
    await t.owner().units.move({ id: ids.store2, parentId: ids.district2 });

    expect(await teamEmails(as(ids.districtManager2))).toContain('store2@acme.mn');
    expect(await teamEmails(as(ids.districtManager1))).not.toContain('store2@acme.mn');

    await t.owner().units.move({ id: ids.store2, parentId: ids.district1 });
  });

  it('keeps actions that work across the organisation with roles that reach all of it', async () => {
    const owner = t.owner();

    await expect(
      owner.roles.create({ name: 'Wide', reach: 'unit', permissions: ['settings.manage'] }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'WHOLE_ORGANIZATION_ONLY',
      data: { permissions: ['settings.manage'] },
    });
    await expect(
      owner.roles.create({ name: 'Everything', reach: 'subtree', permissions: ['*'] }),
    ).rejects.toMatchObject({ code: 'WHOLE_ORGANIZATION_ONLY' });
    await expect(owner.roles.update({ key: 'member', reach: 'unit' })).rejects.toMatchObject({
      code: 'WHOLE_ORGANIZATION_ONLY',
      data: { permissions: ['tags.manage'] },
    });
    await expect(owner.roles.update({ key: 'admin', reach: 'unit' })).rejects.toMatchObject({
      code: 'FIXED_ROLE',
    });

    const catalog = (await owner.roles.permissions({})).data;

    expect(catalog.find((item) => item.action === 'contacts.view')?.followsReach).toBe(true);
    expect(catalog.find((item) => item.action === 'audit.view')?.followsReach).toBe(false);

    // The session says where a member's permissions hold.
    expect(await as(ids.manager1).auth.me({})).toMatchObject({
      reach: 'unit',
      unitIds: [ids.store1],
    });
    expect((await as(ids.manager1).auth.me({})).permissions).not.toContain('tags.manage');
    expect(await owner.auth.me({})).toMatchObject({ reach: 'organization' });

    // A reach changes at once for everyone with the role.
    await owner.roles.update({ key: ids.storeRole, reach: 'subtree' });
    await owner.units.assign({ userId: ids.manager1, unitIds: [ids.district1] });
    expect(await customerNames(as(ids.manager1))).toEqual(['Anna', 'Bold']);
    await owner.units.assign({ userId: ids.manager1, unitIds: [ids.store1] });
    await owner.roles.update({ key: ids.storeRole, reach: 'unit' });
    expect(await customerNames(as(ids.manager1))).toEqual(['Anna']);
  });

  it('tells a plugin how far a member reaches, with the actions that follow it', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1.0.0',
      scopes: ['customers:write'],
      permissions: [
        { action: 'hr.leave.approve', label: 'Approve leave', followsReach: true },
        { action: 'hr.salary.view', label: 'See salaries' },
      ],
    });

    await expect(
      t.owner().roles.update({
        key: ids.storeRole,
        permissions: ['contacts.view', 'hr.salary.view'],
      }),
    ).rejects.toMatchObject({
      code: 'WHOLE_ORGANIZATION_ONLY',
      data: { permissions: ['hr.salary.view'] },
    });

    await t.owner().roles.update({
      key: ids.storeRole,
      permissions: ['contacts.view', 'hr.leave.approve'],
    });

    const verify = async (token: string) =>
      verifyPluginSession(token, { coreUrl: t.url(''), plugin: 'hr' });

    const member = await verify((await as(ids.manager1).plugins.session({ name: 'hr' })).token);

    expect(member).toMatchObject({
      reach: 'unit',
      unitIds: [ids.store1],
      permissions: ['hr.leave.approve'],
    });

    const whole = await verify((await t.owner().plugins.session({ name: 'hr' })).token);

    expect(whole).toMatchObject({ reach: 'organization' });
    expect(whole.can('hr.salary.view')).toBe(true);
  });

  it('gives plugins the condition that keeps their rows inside a reach', async () => {
    const district = { userId: ids.districtManager1, unitIds: [ids.district1] };

    expect(await namesFor({ ...district, reach: 'subtree' })).toEqual([
      'District 1',
      'Store 1',
      'Store 2',
    ]);
    expect(await namesFor({ ...district, reach: 'unit' })).toEqual(['District 1']);
    expect(await namesFor({ ...district, reach: 'own' })).toEqual([]);
    expect(await namesFor({ ...district, reach: 'organization' })).toHaveLength(6);
    expect(await namesFor({ ...district, reach: 'subtree', unitIds: [] })).toEqual([]);
  });
});
