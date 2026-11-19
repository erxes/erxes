import { describe, expect, it } from 'vite-plus/test';
import { inOrder, repeatWhile } from '~/lib/sequence';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const REGIONS = 20;
const STORES = 999;
const UNITS = REGIONS * (STORES + 1);

const pad = (value: number) => String(value).padStart(4, '0');

const regionOf = (region: number) => [
  { id: `region-${pad(region)}`, name: `Region ${pad(region)}`, memberIds: [] },
  ...Array.from({ length: STORES }, (_, store) => ({
    id: `store-${pad(region)}-${pad(store)}`,
    name: `Store ${pad(region)}-${pad(store)}`,
    code: `S${pad(region)}${pad(store)}`,
    parentId: `region-${pad(region)}`,
    memberIds: [],
  })),
];

describe('units at chain scale', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const seed = () =>
    inOrder(
      Array.from({ length: REGIONS }, (_, region) => region),
      (region) => t.hr().units.import({ units: regionOf(region) }),
    );

  const storesOf = async (regionId: string) => {
    const owner = t.owner();
    const names: string[] = [];
    let cursor: string | undefined;

    await repeatWhile(10, async () => {
      const page = await owner.units.children({ id: regionId, limit: 200, cursor });

      expect(page.totalCount).toBe(STORES);
      names.push(...page.data.map((unit) => unit.name));
      cursor = page.nextCursor ?? undefined;

      return cursor !== undefined;
    });

    return names;
  };

  it('reads 20,000 units a level and a page at a time', async () => {
    const owner = t.owner();
    const root = await owner.units.root({});

    await seed();

    expect(await owner.units.root({})).toMatchObject({
      childCount: REGIONS,
      descendantCount: UNITS,
    });
    expect((await owner.units.list({ limit: 100 })).totalCount).toBe(UNITS + 1);

    const regions = await owner.units.children({ id: root.id });

    expect(regions.data.map((unit) => unit.name)).toEqual(
      Array.from({ length: REGIONS }, (_, region) => `Region ${pad(region)}`),
    );
    expect(regions.data[0]).toMatchObject({ childCount: STORES, subtreeMemberCount: 0 });

    const stores = await storesOf('region-0003');

    expect(stores).toHaveLength(STORES);
    expect(stores).toEqual(stores.toSorted());
    expect(new Set(stores).size).toBe(STORES);
    expect((await t.other().units.list({})).totalCount).toBe(1);
  });

  it('searches on the server and says where each hit sits', async () => {
    const owner = t.owner();
    const root = await owner.units.root({});

    expect((await owner.units.search({ q: 'store 0007-0420' })).data).toMatchObject([
      { id: 'store-0007-0420', ancestorNames: ['Organization', 'Region 0007'] },
    ]);
    expect((await owner.units.search({ q: 'S00190001' })).data.map((unit) => unit.id)).toEqual([
      'store-0019-0001',
    ]);
    expect((await owner.units.search({ q: 'region', limit: 50 })).data).toHaveLength(REGIONS);
    expect(
      (await owner.units.ancestors({ id: 'store-0007-0420' })).data.map((unit) => unit.id),
    ).toEqual([root.id, 'region-0007']);
  });

  it('counts members here and with everything under, and moves a region as one change', async () => {
    const owner = t.owner();
    const root = await owner.units.root({});

    await owner.units.update({ id: 'store-0002-0001', memberIds: [t.ids.owner, t.ids.member] });
    await owner.units.update({ id: 'store-0002-0500', memberIds: [t.ids.member] });
    await owner.units.update({ id: 'region-0002', memberIds: [t.ids.disabled] });

    expect(await owner.units.get({ id: 'region-0002' })).toMatchObject({
      memberIds: [t.ids.disabled],
      subtreeMemberCount: 3,
      descendantCount: STORES,
    });
    expect((await owner.units.root({})).subtreeMemberCount).toBe(3);

    await owner.units.move({ id: 'region-0002', parentId: 'region-0005' });

    expect(await owner.units.get({ id: 'store-0002-0998' })).toMatchObject({
      parentId: 'region-0002',
      path: `/${root.id}/region-0005/region-0002/store-0002-0998/`,
    });
    expect(await owner.units.get({ id: 'region-0005' })).toMatchObject({
      childCount: STORES + 1,
      descendantCount: STORES * 2 + 1,
      subtreeMemberCount: 3,
    });
    expect((await owner.units.root({})).childCount).toBe(REGIONS - 1);

    const updates = await owner.events.list({ type: 'core.unit.updated', limit: 100 });

    expect(
      updates.data.filter((event) => event.payload.subtree).map((event) => event.entityId),
    ).toEqual(['region-0002']);
    expect(
      (await owner.audit.list({ action: 'unit.moved' })).data.map((entry) => entry.metadata),
    ).toEqual([{ units: STORES + 1, members: 3 }]);

    await expect(
      owner.units.move({ id: 'region-0005', parentId: 'store-0002-0001' }),
    ).rejects.toMatchObject({ status: 400, data: { field: 'parentId' } });
    expect((await owner.units.list({ limit: 1 })).totalCount).toBe(UNITS + 1);
  });
});
