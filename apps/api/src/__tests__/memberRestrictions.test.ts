import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('team member restrictions', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it("keeps a member's lists to their own branches and departments while on", async () => {
    const owner = t.owner();
    const hq = await owner.units.create({ kind: 'branch', name: 'HQ' });
    const shop = await owner.units.create({ kind: 'branch', name: 'Shop', parentId: hq.id });
    const other = await owner.units.create({ kind: 'branch', name: 'Other' });
    const sales = await owner.units.create({ kind: 'department', name: 'Sales' });

    await owner.units.assign({ userId: t.ids.member, kind: 'branch', unitIds: [hq.id] });

    const of = (userId?: string) => t.member().units.restrictions({ userId });

    // Off by default: nobody is limited.
    expect(await of()).toEqual({ branchIds: null, departmentIds: null });
    expect((await owner.organizations.current({})).memberRestrictions).toEqual({
      enabled: false,
      allBranchesUserIds: [],
      allDepartmentsUserIds: [],
    });

    await owner.organizations.update({
      memberRestrictions: { enabled: true, allBranchesUserIds: [], allDepartmentsUserIds: [] },
    });

    // Their branch and the ones under it; no department, so no limit there.
    expect(await of()).toEqual({
      branchIds: [hq.id, shop.id].toSorted(),
      departmentIds: null,
    });
    expect((await of()).branchIds).not.toContain(other.id);

    await owner.units.assign({ userId: t.ids.member, kind: 'department', unitIds: [sales.id] });
    expect((await of()).departmentIds).toEqual([sales.id]);

    // Owners, and members listed for every branch, have no limit; plugins name the member.
    expect(await of(t.ids.owner)).toEqual({ branchIds: null, departmentIds: null });

    const updated = await owner.organizations.update({
      memberRestrictions: {
        enabled: true,
        allBranchesUserIds: [t.ids.member],
        allDepartmentsUserIds: [],
      },
    });

    expect(updated.memberRestrictions.allBranchesUserIds).toEqual([t.ids.member]);
    expect(await t.hr().units.restrictions({ userId: t.ids.member })).toEqual({
      branchIds: null,
      departmentIds: [sales.id],
    });
    await expect(t.hr().units.restrictions({})).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });

    // Only team members are listed, and only settings managers change it.
    await expect(
      owner.organizations.update({
        memberRestrictions: {
          enabled: true,
          allBranchesUserIds: [t.ids.otherOwner],
          allDepartmentsUserIds: [],
        },
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REFERENCE',
      data: { field: 'memberRestrictions' },
    });
    await expect(
      t.member().organizations.update({
        memberRestrictions: { enabled: false, allBranchesUserIds: [], allDepartmentsUserIds: [] },
      }),
    ).rejects.toMatchObject({ status: 403 });

    // The other organisation knows nothing of Acme's members.
    await expect(t.other().units.restrictions({ userId: t.ids.member })).rejects.toMatchObject({
      status: 404,
    });
  });
});
