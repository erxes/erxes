import { describe, expect, it, onTestFinished } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describe('units', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it("keeps one tree under the organisation's own unit, which only its organisation sees", async () => {
    const owner = t.owner();
    const root = await owner.units.root({});

    expect(root).toMatchObject({
      name: 'Acme',
      parentId: null,
      typeId: null,
      path: `/${root.id}/`,
      isActive: true,
    });

    const ub = await owner.units.create({ name: 'Ulaanbaatar', code: 'UB' });

    const zaisan = await owner.units.create({
      name: 'Zaisan',
      parentId: ub.id,
      supervisorId: t.ids.member,
      memberIds: [t.ids.member, t.ids.owner],
      address: 'Zaisan street 1',
    });

    const finance = await owner.units.create({ name: 'Finance' });

    expect(ub).toMatchObject({ parentId: root.id, path: `/${root.id}/${ub.id}/` });
    expect(zaisan).toMatchObject({
      parentId: ub.id,
      path: `/${root.id}/${ub.id}/${zaisan.id}/`,
      supervisorId: t.ids.member,
      memberIds: [t.ids.member, t.ids.owner].toSorted(),
    });

    await expect(owner.units.create({ name: 'Again', code: 'ub' })).rejects.toMatchObject({
      status: 409,
      code: 'TAKEN',
      data: { field: 'code' },
    });

    await expect(
      owner.units.update({ id: finance.id, memberIds: [t.ids.otherOwner] }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REFERENCE',
      data: { field: 'memberIds' },
    });

    const top = await t.member().units.children({ id: root.id });

    expect(top.data.map((unit) => unit.name)).toEqual(['Finance', 'Ulaanbaatar']);
    expect(top.data[1]).toMatchObject({ childCount: 1, memberCount: 0, subtreeMemberCount: 2 });
    expect(top).toMatchObject({ totalCount: 2, nextCursor: null });
    expect((await t.member().units.ancestors({ id: zaisan.id })).data.map((u) => u.id)).toEqual([
      root.id,
      ub.id,
    ]);
    expect((await t.member().units.list({ userId: t.ids.member })).data.map((u) => u.id)).toEqual([
      zaisan.id,
    ]);
    expect(await t.member().units.get({ id: ub.id })).toMatchObject({
      childCount: 1,
      descendantCount: 1,
      subtreeMemberCount: 2,
    });

    await expect(t.member().units.create({ name: 'X' })).rejects.toMatchObject({ status: 403 });

    expect((await t.other().units.list({})).data.map((unit) => unit.name)).toEqual(['Globex']);
    await expect(t.other().units.get({ id: zaisan.id })).rejects.toMatchObject({ status: 404 });
    await expect(t.other().units.children({ id: root.id })).rejects.toMatchObject({ status: 404 });
  });

  it("keeps the organisation's own unit where it is", async () => {
    const owner = t.owner();
    const root = await owner.units.root({});
    const hq = await owner.units.create({ name: 'Head office' });
    const refused = { status: 409, code: 'ROOT_UNIT' };

    await expect(owner.units.move({ id: root.id, parentId: hq.id })).rejects.toMatchObject(refused);
    await expect(owner.units.remove({ id: root.id })).rejects.toMatchObject(refused);
    await expect(owner.units.update({ id: root.id, isActive: false })).rejects.toMatchObject(
      refused,
    );
    await expect(
      owner.units.update({ id: root.id, typeId: hq.typeId ?? '' }),
    ).rejects.toMatchObject(refused);

    expect(
      await owner.units.update({ id: root.id, name: 'Acme', supervisorId: t.ids.owner }),
    ).toMatchObject({ name: 'Acme', supervisorId: t.ids.owner, parentId: null });
  });

  it('moves a subtree as one audited change, refuses loops and deletes only empty units', async () => {
    const owner = t.owner();
    const root = await owner.units.root({});
    const top = await owner.units.create({ name: 'Top' });
    const mid = await owner.units.create({ name: 'Mid', parentId: top.id });

    const leaf = await owner.units.create({
      name: 'Leaf',
      parentId: mid.id,
      memberIds: [t.ids.member],
    });

    const other = await owner.units.create({ name: 'Other' });

    await expect(owner.units.move({ id: top.id, parentId: leaf.id })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REFERENCE',
      data: { field: 'parentId' },
    });

    await owner.units.move({ id: mid.id, parentId: other.id });
    expect((await owner.units.get({ id: leaf.id })).path).toBe(
      `/${root.id}/${other.id}/${mid.id}/${leaf.id}/`,
    );

    const { data: moves } = await owner.audit.list({ action: 'unit.moved', targetId: mid.id });

    expect(moves).toHaveLength(1);
    expect(moves[0]).toMatchObject({
      changes: { parentId: [top.id, other.id] },
      metadata: { units: 2, members: 1 },
    });

    const events = await owner.events.list({ type: 'core.unit.updated' });
    const about = (id: string) => events.data.filter((event) => event.entityId === id);

    expect(about(mid.id).map((event) => event.payload)).toEqual([
      { changed: ['parentId', 'path', 'sortOrder'], subtree: true },
    ]);
    expect(about(leaf.id)).toEqual([]);

    await expect(
      t.hr().units.import({ units: [{ id: `${top.id}/inside`, name: 'Forged', memberIds: [] }] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    expect(await owner.units.move({ id: mid.id, parentId: null })).toMatchObject({
      parentId: root.id,
      path: `/${root.id}/${mid.id}/`,
    });

    await expect(owner.units.remove({ id: mid.id })).rejects.toMatchObject({
      status: 409,
      code: 'UNIT_NOT_EMPTY',
      data: { children: 1, members: 0, keys: 0 },
    });
    await expect(owner.units.remove({ id: leaf.id })).rejects.toMatchObject({
      code: 'UNIT_NOT_EMPTY',
      data: { children: 0, members: 1, keys: 0 },
    });

    await owner.units.update({ id: leaf.id, memberIds: [] });
    await owner.units.remove({ id: leaf.id });
    await expect(owner.units.get({ id: leaf.id })).rejects.toMatchObject({ status: 404 });
    expect((await owner.units.get({ id: mid.id })).childCount).toBe(0);

    await expect(
      t.hr().units.import({ units: [{ id: leaf.id, name: 'Back again', memberIds: [] }] }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'id' } });
  });

  it('leaves inactive units and what is under them out unless asked, and orders by hand', async () => {
    const owner = t.owner();
    const region = await owner.units.create({ name: 'Region West' });
    const names = ['Cedar', 'Aspen', 'Birch'];

    const [cedar, aspen, birch] = await Promise.all(
      names.map((name) => owner.units.create({ name: `${name} store`, parentId: region.id })),
    );

    const under = async (includeInactive?: boolean) =>
      (await owner.units.children({ id: region.id, includeInactive })).data.map((u) => u.name);

    expect(await under()).toEqual(['Aspen store', 'Birch store', 'Cedar store']);

    await owner.units.reorder({ id: region.id, unitIds: [cedar?.id ?? '', aspen?.id ?? ''] });
    await owner.units.create({ name: 'Alder store', parentId: region.id });
    expect(await under()).toEqual(['Cedar store', 'Aspen store', 'Birch store', 'Alder store']);
    await expect(
      owner.units.reorder({ id: region.id, unitIds: [region.id] }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'unitIds' } });

    const first = await owner.units.children({ id: region.id, limit: 3 });

    expect(first).toMatchObject({ totalCount: 4, nextCursor: birch?.id });
    expect(
      (await owner.units.children({ id: region.id, limit: 3, cursor: first.nextCursor ?? '' }))
        .data,
    ).toMatchObject([{ name: 'Alder store' }]);

    await owner.units.update({ id: birch?.id ?? '', isActive: false });
    expect(await under()).toEqual(['Cedar store', 'Aspen store', 'Alder store']);
    expect(await under(true)).toContain('Birch store');

    await owner.units.update({ id: region.id, isActive: false });
    expect((await owner.units.search({ q: 'store' })).data).toEqual([]);
    expect((await owner.units.search({ q: 'cedar', includeInactive: true })).data).toMatchObject([
      { name: 'Cedar store', ancestorNames: [expect.any(String), 'Region West'] },
    ]);
    expect(await owner.units.get({ id: cedar?.id ?? '' })).toMatchObject({ isActive: true });
  });

  it("sets a member's units and lets plugins import theirs, merging what is already here", async () => {
    const owner = t.owner();
    const root = await owner.units.root({});
    const north = await owner.units.create({ name: 'North', code: 'N' });
    const south = await owner.units.create({ name: 'South' });

    expect(await owner.units.assign({ userId: t.ids.disabled, unitIds: [north.id] })).toEqual({
      unitIds: [north.id],
    });
    await owner.units.assign({ userId: t.ids.disabled, unitIds: [south.id] });
    expect((await owner.units.get({ id: north.id })).memberIds).not.toContain(t.ids.disabled);
    await expect(
      owner.units.assign({ userId: t.ids.disabled, unitIds: ['nowhere'] }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'unitIds' } });

    const imported = await t.hr().units.import({
      units: [
        { id: 'old-north', name: 'Northern', code: 'n', memberIds: [t.ids.owner] },
        { id: 'old-south', name: 'south', memberIds: ['gone-user'] },
        {
          id: 'old-east',
          name: 'East',
          parentId: 'old-north',
          supervisorId: t.ids.member,
          memberIds: [t.ids.member],
        },
        { id: 'old-lost', name: 'Lost', parentId: 'no-such-unit', memberIds: [] },
      ],
    });

    expect(imported).toEqual({
      ids: {
        'old-north': north.id,
        'old-south': south.id,
        'old-east': 'old-east',
        'old-lost': 'old-lost',
      },
      skippedMembers: 1,
    });
    expect(await owner.units.get({ id: 'old-east' })).toMatchObject({
      parentId: north.id,
      path: `/${root.id}/${north.id}/old-east/`,
      supervisorId: t.ids.member,
      memberIds: [t.ids.member],
    });

    expect((await owner.units.get({ id: 'old-lost' })).parentId).toBe(root.id);
    expect((await owner.units.get({ id: north.id })).memberIds).toEqual([t.ids.owner]);

    expect(
      (await t.hr().units.import({ units: [{ id: 'old-east', name: 'East', memberIds: [] }] })).ids,
    ).toEqual({ 'old-east': 'old-east' });

    await expect(
      owner.units.import({ units: [{ id: 'x', name: 'X', memberIds: [] }] }),
    ).rejects.toMatchObject({ status: 403 });
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

    await t.owner().units.create({ name: 'Depot' });

    await settle();

    expect(api.received).toContainEqual({ type: 'core.unit.created', payload: { changed: [] } });
  });
});
