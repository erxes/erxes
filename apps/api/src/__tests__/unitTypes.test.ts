import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('unit types', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('gives units types, whose rules say where they may sit', async () => {
    const owner = t.owner();
    const { data: defaults } = await owner.unitTypes.list({});

    expect(defaults.map(({ name, code, plugin }) => ({ name, code, plugin }))).toEqual([
      { name: 'Branch', code: 'branch', plugin: null },
      { name: 'Department', code: 'department', plugin: null },
    ]);
    expect((await t.other().unitTypes.list({})).data).toHaveLength(2);

    const [branch, department] = defaults.map((type) => type.id);
    const store = await owner.units.create({ name: 'Store 1' });
    const finance = await owner.units.create({ name: 'Finance', typeId: department });

    expect(store.typeId).toBe(branch);

    expect(
      await owner.units.create({ name: 'Store 1 office', typeId: department, parentId: store.id }),
    ).toMatchObject({ parentId: store.id });

    const team = await owner.unitTypes.create({
      name: 'Team',
      code: 'team',
      canBeRoot: false,
      allowedParentTypeIds: [department ?? ''],
      sortOrder: 5,
    });

    await expect(owner.units.create({ name: 'Loose', typeId: team.id })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });
    await expect(
      owner.units.create({ name: 'Misplaced', typeId: team.id, parentId: store.id }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'typeId' } });

    const payroll = await owner.units.create({
      name: 'Payroll',
      typeId: team.id,
      parentId: finance.id,
    });

    await owner.unitTypes.update({
      id: branch ?? '',
      canBeRoot: true,
      allowedParentTypeIds: [branch ?? ''],
    });
    expect((await owner.units.create({ name: 'Audit', parentId: finance.id })).typeId).toBe(
      department,
    );

    await expect(owner.unitTypes.create({ name: 'Squad', code: 'TEAM' })).rejects.toMatchObject({
      status: 409,
      code: 'TAKEN',
      data: { field: 'code' },
    });

    await expect(owner.units.update({ id: finance.id, typeId: team.id })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });
    await expect(owner.units.move({ id: payroll.id, parentId: null })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });
    await expect(owner.units.move({ id: payroll.id, parentId: store.id })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });

    await expect(owner.unitTypes.remove({ id: team.id })).rejects.toMatchObject({
      status: 409,
      code: 'UNIT_TYPE_IN_USE',
      data: { count: 1 },
    });
    await owner.unitTypes.update({ id: team.id, isActive: false });
    await owner.unitTypes.update({ id: department ?? '', isActive: false });
    await expect(
      owner.unitTypes.update({ id: branch ?? '', isActive: false }),
    ).rejects.toMatchObject({ status: 409, code: 'LAST_UNIT_TYPE' });
    await owner.unitTypes.update({ id: department ?? '', isActive: true });

    await owner.units.update({ id: payroll.id, typeId: department });
    await owner.unitTypes.remove({ id: team.id });
  });

  it('lets plugins bring types in as the organisation’s own', async () => {
    const owner = t.owner();
    const { data: before } = await owner.unitTypes.list({});
    const department = before.find((type) => type.code === 'department')?.id;

    const imported = await t.hr().unitTypes.import({
      types: [
        { id: 'hr-dept', name: 'Dept', code: 'DEPARTMENT' },
        {
          id: 'hr-office',
          name: 'Office',
          canBeRoot: false,
          allowedParentTypeIds: ['hr-dept', 'unknown'],
        },
      ],
    });

    expect(imported.ids).toEqual({ 'hr-dept': department, 'hr-office': 'hr-office' });
    expect(
      (await owner.unitTypes.list({})).data.find((type) => type.id === 'hr-office'),
    ).toMatchObject({ canBeRoot: false, allowedParentTypeIds: [department], plugin: null });

    await t.hr().units.import({
      units: [
        { id: 'hr-a', name: 'A', typeId: 'hr-office', memberIds: [] },
        { id: 'hr-b', name: 'B', typeId: 'no-such-type', memberIds: [] },
      ],
    });
    expect((await owner.units.get({ id: 'hr-a' })).typeId).toBe('hr-office');
    expect((await owner.units.get({ id: 'hr-b' })).typeId).toBe(before[0]?.id);

    expect(await owner.unitTypes.update({ id: 'hr-office', name: 'Field office' })).toMatchObject({
      name: 'Field office',
    });
  });

  it("gives an organisation the types its plugins' manifests declare, which nobody else changes", async () => {
    const owner = t.owner();
    const service = t.client(await t.pluginToken());

    const manifest = (
      unitTypes: { code: string; name: string; canBeRoot?: boolean; parents?: string[] }[],
    ) =>
      service.plugins.registerManifest({
        title: 'Operations',
        version: '1',
        scopes: ['units:read', 'units:write'],
        unitTypes,
      });

    await manifest([
      { code: 'region', name: 'Region' },
      { code: 'crew', name: 'Crew', canBeRoot: false, parents: ['region'] },
    ]);
    await owner.plugins.install({ name: 'hr' });
    await t.other().plugins.uninstall({ name: 'hr' });

    const types = async () => (await owner.unitTypes.list({})).data;

    const byCode = async (code: string) =>
      (await types()).find((type) => type.plugin === 'hr' && type.code === code);

    const region = await byCode('region');
    const crew = await byCode('crew');

    expect(region).toMatchObject({ pluginTitle: 'Operations', hidden: false, isActive: true });
    expect(crew).toMatchObject({ canBeRoot: false, allowedParentTypeIds: [region?.id] });

    expect(
      (await t.other().unitTypes.list({})).data.filter((type) => type.plugin && !type.hidden),
    ).toEqual([]);

    const locked = { status: 403, code: 'PLUGIN_UNIT_TYPE', data: { plugin: 'hr' } };

    await expect(
      owner.unitTypes.update({ id: region?.id ?? '', name: 'Zone' }),
    ).rejects.toMatchObject(locked);
    await expect(owner.unitTypes.remove({ id: crew?.id ?? '' })).rejects.toMatchObject(locked);

    const west = await owner.units.create({ name: 'West', typeId: region?.id });

    await expect(
      owner.units.create({ name: 'Loose crew', typeId: crew?.id }),
    ).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });

    const night = await owner.units.create({
      name: 'Night crew',
      typeId: crew?.id,
      parentId: west.id,
    });

    const desk = await owner.unitTypes.create({
      name: 'Desk',
      canBeRoot: false,
      allowedParentTypeIds: [crew?.id ?? ''],
    });

    await owner.units.create({ name: 'Front desk', typeId: desk.id, parentId: night.id });

    await manifest([{ code: 'region', name: 'Region' }]);
    expect(await byCode('crew')).toMatchObject({ id: crew?.id, isActive: false });
    expect((await owner.units.get({ id: night.id })).typeId).toBe(crew?.id);
    await manifest([
      { code: 'region', name: 'Area' },
      { code: 'crew', name: 'Crew', canBeRoot: false, parents: ['region'] },
    ]);
    expect(await byCode('region')).toMatchObject({ id: region?.id, name: 'Area' });
    expect(await byCode('crew')).toMatchObject({ id: crew?.id, isActive: true });

    const root = await owner.units.root({});
    const shown = async () => (await owner.units.children({ id: root.id })).data.map((u) => u.name);

    expect(await shown()).toContain('West');
    await owner.plugins.uninstall({ name: 'hr' });
    expect(await byCode('region')).toMatchObject({ hidden: true });
    expect(await shown()).not.toContain('West');
    expect((await owner.units.search({ q: 'desk' })).data).toEqual([]);
    expect((await owner.units.get({ id: night.id })).path).toContain(west.id);
    expect((await owner.units.list({ typeId: region?.id })).data.map((u) => u.name)).toEqual([
      'West',
    ]);
    await expect(owner.units.create({ name: 'East', typeId: region?.id })).rejects.toMatchObject({
      status: 400,
      data: { field: 'typeId' },
    });

    await owner.plugins.install({ name: 'hr' });
    expect(await shown()).toContain('West');
    expect((await owner.units.search({ q: 'desk' })).data).toMatchObject([{ name: 'Front desk' }]);
  });
});
