import { describe, expect, it, onTestFinished } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describe('units', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('keeps branches and departments as two trees that only their organisation sees', async () => {
    const owner = t.owner();
    const ub = await owner.units.create({ kind: 'branch', name: 'Ulaanbaatar', code: 'UB' });

    const zaisan = await owner.units.create({
      kind: 'branch',
      name: 'Zaisan',
      parentId: ub.id,
      supervisorId: t.ids.member,
      memberIds: [t.ids.member, t.ids.owner],
      address: 'Zaisan street 1',
    });

    const finance = await owner.units.create({ kind: 'department', name: 'Finance' });

    expect(zaisan).toMatchObject({
      kind: 'branch',
      parentId: ub.id,
      path: `/${ub.id}/${zaisan.id}/`,
      supervisorId: t.ids.member,
      memberIds: [t.ids.member, t.ids.owner].toSorted(),
    });

    // A department never sits under a branch, and codes are unique per kind.
    await expect(
      owner.units.create({ kind: 'department', name: 'Sales', parentId: ub.id }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REFERENCE',
      data: { field: 'parentId' },
    });
    await expect(
      owner.units.create({ kind: 'branch', name: 'Again', code: 'ub' }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'code' } });
    expect((await owner.units.create({ kind: 'department', name: 'Ops', code: 'UB' })).code).toBe(
      'UB',
    );

    // Members come from the team only.
    await expect(
      owner.units.update({ id: finance.id, memberIds: [t.ids.otherOwner] }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REFERENCE',
      data: { field: 'memberIds' },
    });

    // Every member reads them, by kind or by who is in them; only managers change them.
    expect((await t.member().units.list({ kind: 'branch' })).data.map((u) => u.name)).toEqual([
      'Ulaanbaatar',
      'Zaisan',
    ]);
    expect((await t.member().units.list({ userId: t.ids.member })).data.map((u) => u.id)).toEqual([
      zaisan.id,
    ]);
    await expect(t.member().units.create({ kind: 'branch', name: 'X' })).rejects.toMatchObject({
      status: 403,
    });

    // The other organisation sees none of it.
    expect((await t.other().units.list({})).data).toEqual([]);
    await expect(t.other().units.get({ id: zaisan.id })).rejects.toMatchObject({ status: 404 });
  });

  it('moves subtrees, refuses cycles and lifts children when a unit goes', async () => {
    const owner = t.owner();
    const top = await owner.units.create({ kind: 'department', name: 'Top' });
    const mid = await owner.units.create({ kind: 'department', name: 'Mid', parentId: top.id });
    const leaf = await owner.units.create({ kind: 'department', name: 'Leaf', parentId: mid.id });
    const other = await owner.units.create({ kind: 'department', name: 'Other' });

    await expect(owner.units.update({ id: top.id, parentId: leaf.id })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REFERENCE',
    });

    await owner.units.update({ id: mid.id, parentId: other.id });
    expect((await owner.units.get({ id: leaf.id })).path).toBe(
      `/${other.id}/${mid.id}/${leaf.id}/`,
    );

    await owner.units.remove({ id: mid.id });
    expect(await owner.units.get({ id: leaf.id })).toMatchObject({
      parentId: other.id,
      path: `/${other.id}/${leaf.id}/`,
    });

    const events = await owner.events.list({ type: 'core.unit.*' });

    const about = (id: string) =>
      events.data.filter((event) => event.entityId === id).map((event) => event.type);

    expect(about(mid.id)).toEqual(
      expect.arrayContaining(['core.unit.created', 'core.unit.updated', 'core.unit.deleted']),
    );
    // Units whose path changed are announced too, so plugin copies stay right.
    expect(about(leaf.id).filter((type) => type === 'core.unit.updated')).toHaveLength(2);
  });

  it("sets a member's branches and lets plugins import theirs, merging what is already here", async () => {
    const owner = t.owner();
    const north = await owner.units.create({ kind: 'branch', name: 'North', code: 'N' });
    const south = await owner.units.create({ kind: 'branch', name: 'South' });

    expect(
      await owner.units.assign({ userId: t.ids.member, kind: 'branch', unitIds: [north.id] }),
    ).toEqual({ unitIds: [north.id] });
    await owner.units.assign({ userId: t.ids.member, kind: 'branch', unitIds: [south.id] });
    expect((await owner.units.get({ id: north.id })).memberIds).not.toContain(t.ids.member);
    await expect(
      owner.units.assign({ userId: t.ids.member, kind: 'department', unitIds: [north.id] }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'unitIds' } });

    // A plugin brings its own: by code, by name and parent, or new with its old id.
    const imported = await t.hr().units.import({
      units: [
        { id: 'old-north', kind: 'branch', name: 'Northern', code: 'n', memberIds: [t.ids.owner] },
        { id: 'old-south', kind: 'branch', name: 'south', memberIds: ['gone-user'] },
        {
          id: 'old-east',
          kind: 'branch',
          name: 'East',
          parentId: 'old-north',
          supervisorId: t.ids.member,
          memberIds: [t.ids.member],
        },
      ],
    });

    expect(imported).toEqual({
      ids: { 'old-north': north.id, 'old-south': south.id, 'old-east': 'old-east' },
      skippedMembers: 1,
    });
    expect(await owner.units.get({ id: 'old-east' })).toMatchObject({
      parentId: north.id,
      path: `/${north.id}/old-east/`,
      supervisorId: t.ids.member,
      memberIds: [t.ids.member],
    });
    expect((await owner.units.get({ id: north.id })).memberIds).toEqual([t.ids.owner]);

    // Importing again changes nothing.
    expect(
      (
        await t.hr().units.import({
          units: [{ id: 'old-east', kind: 'branch', name: 'East', memberIds: [] }],
        })
      ).ids,
    ).toEqual({ 'old-east': 'old-east' });
    // Only plugins import.
    await expect(
      owner.units.import({ units: [{ id: 'x', kind: 'branch', name: 'X', memberIds: [] }] }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('gives units types of their kind, whose rules say where they may sit', async () => {
    const owner = t.owner();
    const { data: defaults } = await owner.unitTypes.list({});

    // Every organisation starts with one type per kind, and a unit gets its kind's.
    expect(defaults.map(({ kind, name, code }) => ({ kind, name, code }))).toEqual([
      { kind: 'branch', name: 'Branch', code: 'branch' },
      { kind: 'department', name: 'Department', code: 'department' },
    ]);
    expect((await t.other().unitTypes.list({ kind: 'branch' })).data).toHaveLength(1);

    const department = defaults[1]?.id ?? '';
    const finance = await owner.units.create({ kind: 'department', name: 'Finance' });

    expect(finance.typeId).toBe(department);

    // A Team sits only under a Department, never at the top.
    const team = await owner.unitTypes.create({
      kind: 'department',
      name: 'Team',
      code: 'team',
      canBeRoot: false,
      allowedParentTypeIds: [department],
    });

    await expect(
      owner.units.create({ kind: 'department', name: 'Loose', typeId: team.id }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'typeId' } });

    const payroll = await owner.units.create({
      kind: 'department',
      name: 'Payroll',
      typeId: team.id,
      parentId: finance.id,
    });

    // A branch type is not a department's, and a type's code is unique for its kind.
    await expect(
      owner.units.create({ kind: 'branch', name: 'Depot', typeId: team.id }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'typeId' } });
    await expect(
      owner.unitTypes.create({ kind: 'department', name: 'Squad', code: 'TEAM' }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'code' } });

    // Finance can't become a Team (it is at the top), nor Payroll move to the top.
    await expect(owner.units.update({ id: finance.id, typeId: team.id })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });
    await expect(owner.units.update({ id: payroll.id, parentId: null })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });

    // A used type stays, and so does a kind's last active one.
    await expect(owner.unitTypes.remove({ id: team.id })).rejects.toMatchObject({
      status: 409,
      code: 'UNIT_TYPE_IN_USE',
      data: { count: 1 },
    });
    await expect(
      owner.unitTypes.update({ id: defaults[0]?.id ?? '', isActive: false }),
    ).rejects.toMatchObject({ status: 409, code: 'LAST_UNIT_TYPE' });

    await owner.units.update({ id: payroll.id, typeId: department });
    await owner.unitTypes.remove({ id: team.id });

    // A plugin brings its types: by id, by code, or new with its old id.
    const imported = await t.hr().unitTypes.import({
      types: [
        { id: 'hr-dept', kind: 'department', name: 'Dept', code: 'DEPARTMENT' },
        {
          id: 'hr-office',
          kind: 'department',
          name: 'Office',
          canBeRoot: false,
          allowedParentTypeIds: ['hr-dept', 'unknown'],
        },
      ],
    });

    expect(imported.ids).toEqual({ 'hr-dept': department, 'hr-office': 'hr-office' });
    expect(
      (await owner.unitTypes.list({ kind: 'department' })).data.find(
        (type) => type.id === 'hr-office',
      ),
    ).toMatchObject({ canBeRoot: false, allowedParentTypeIds: [department] });

    // Imported units keep a type of their kind, or get their kind's first.
    await t.hr().units.import({
      units: [
        { id: 'hr-a', kind: 'department', name: 'A', typeId: 'hr-office', memberIds: [] },
        { id: 'hr-b', kind: 'branch', name: 'B', typeId: 'hr-office', memberIds: [] },
      ],
    });
    expect((await owner.units.get({ id: 'hr-a' })).typeId).toBe('hr-office');
    expect((await owner.units.get({ id: 'hr-b' })).typeId).toBe(defaults[0]?.id);
  });

  it('sends core.unit.* to plugins that may read units', async () => {
    const api = await pluginApi(t.url(''), 'tms');

    onTestFinished(api.close);

    const secret = await rotatePluginSecret('tms');

    const token = async (org?: string) =>
      (
        await t.client().plugins.token({
          grant_type: 'client_credentials',
          client_id: 'tms',
          client_secret: secret,
          org,
        })
      ).access_token;

    await t.client(await token()).plugins.registerManifest({
      title: 'TMS',
      version: '1',
      api: { url: api.url },
      scopes: ['units:read'],
      subscriptions: ['core.unit.*'],
    });
    await token(t.ids.org);

    await t.owner().units.create({ kind: 'branch', name: 'Depot' });

    await settle();

    expect(api.received).toContainEqual({
      type: 'core.unit.created',
      payload: { kind: 'branch', changed: [] },
    });
  });
});
