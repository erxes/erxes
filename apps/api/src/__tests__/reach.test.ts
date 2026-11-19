import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { customerNames, OUTSIDE_REACH, useStores } from './reachStores';
import { settle } from './settle';

const sorted = (list: string[]) => list.toSorted((a, b) => a.localeCompare(b));

/**
 * A role's reach over records (docs/design.md, decision 48): two stores in one district, a
 * third in another. A store's manager sees their store's customers, a district's manager those
 * of the stores under it, an owner all of them; nobody sees the store or the district beside
 * theirs. The team and the structure are in reachTeam.test.ts.
 */
describe('reach over records', { timeout: 300_000 }, () => {
  useTestDatabase();

  const { t, ids, as } = useStores();

  it('shows a store its own customers, a district its stores’, an owner all', async () => {
    expect(await customerNames(as(ids.manager1))).toEqual(['Anna']);
    expect(await customerNames(as(ids.manager2))).toEqual(['Bold']);
    expect(await customerNames(as(ids.districtManager1))).toEqual(['Anna', 'Bold']);
    expect(await customerNames(as(ids.districtManager2))).toEqual(['Chimeg']);
    expect(await customerNames(t.owner())).toEqual(['Anna', 'Bold', 'Chimeg', 'Dorj']);

    const manager1 = as(ids.manager1);

    expect((await manager1.customers.get({ id: ids.anna })).unitIds).toEqual([ids.store1]);
    await expect(manager1.customers.get({ id: ids.bold })).rejects.toMatchObject({ status: 404 });
    await expect(
      manager1.customers.update({ id: ids.bold, firstName: 'Mine now' }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(manager1.customers.remove({ ids: [ids.bold] })).resolves.toEqual({ removed: 0 });
    await expect(
      manager1.activities.list({ targetType: 'customer', targetId: ids.bold }),
    ).rejects.toMatchObject({ status: 404 });
    expect((await manager1.search.global({ q: 'Bold' })).data).toEqual([]);

    // A list by unit: the unit and what is under it.
    const inDistrict = await t.owner().customers.list({ unitId: ids.district1 });

    expect(sorted(inDistrict.data.map((row) => row.firstName ?? ''))).toEqual(['Anna', 'Bold']);
    expect((await t.owner().customers.list({ unitId: ids.store3 })).data).toHaveLength(1);
  });

  it('keeps what a member writes inside their reach', async () => {
    const manager1 = as(ids.manager1);

    await expect(
      manager1.customers.create({ firstName: 'Elsewhere', unitIds: [ids.store2] }),
    ).rejects.toMatchObject(OUTSIDE_REACH);
    await expect(
      manager1.customers.update({ id: ids.anna, unitIds: [ids.store2] }),
    ).rejects.toMatchObject(OUTSIDE_REACH);
    // Nor to someone they don't see.
    await expect(
      manager1.customers.update({ id: ids.anna, ownerId: ids.manager2 }),
    ).rejects.toMatchObject({ code: 'INVALID_OWNER' });
    await expect(
      t.owner().customers.update({ id: ids.anna, unitIds: ['nope'] }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE', data: { field: 'unitIds' } });

    // The district shares Anna with the second store.
    await as(ids.districtManager1).customers.update({
      id: ids.anna,
      unitIds: [ids.store1, ids.store2],
    });
    expect(await customerNames(as(ids.manager2))).toEqual(['Anna', 'Bold']);

    // A store's manager changes only their own store's part: Store 3 keeps her.
    const shared = await t.owner().customers.update({
      id: ids.anna,
      unitIds: [ids.store1, ids.store3],
    });

    expect(sorted(shared.unitIds)).toEqual(sorted([ids.store1, ids.store3]));
    expect(await customerNames(as(ids.manager2))).toEqual(['Bold']);

    const kept = await manager1.customers.update({ id: ids.anna, unitIds: [ids.store1] });

    expect(sorted(kept.unitIds)).toEqual(sorted([ids.store1, ids.store3]));
    await t.owner().customers.update({ id: ids.anna, unitIds: [ids.store1] });
  });

  it('gives a member who reaches only their own what they make, and nothing else', async () => {
    const rep = as(ids.rep);

    expect(await customerNames(rep)).toEqual([]);

    const mine = await rep.customers.create({ firstName: 'Erdene' });

    expect(mine).toMatchObject({ ownerId: ids.rep, unitIds: [ids.store1] });
    expect(await customerNames(rep)).toEqual(['Erdene']);
    await expect(rep.customers.get({ id: ids.anna })).rejects.toMatchObject({ status: 404 });
    // Giving it away would put it out of their reach.
    await expect(
      rep.customers.update({ id: mine.id, ownerId: ids.manager1 }),
    ).rejects.toMatchObject(OUTSIDE_REACH);
    // Their store's manager sees it.
    expect(await customerNames(as(ids.manager1))).toEqual(['Anna', 'Erdene']);

    await t.owner().customers.remove({ ids: [mine.id] });
    await t.owner().trash.purge({ ids: (await t.owner().trash.list({})).data.map((r) => r.id) });
  });

  it('finds a customer another store has, and shares them with the store that asks', async () => {
    const found = await as(ids.manager2).customers.findOrCreate({ primaryEmail: 'anna@x.mn' });

    expect(found).toMatchObject({ created: false, customer: { id: ids.anna } });
    expect(sorted(found.customer.unitIds)).toEqual(sorted([ids.store1, ids.store2]));
    expect(await customerNames(as(ids.manager1))).toEqual(['Anna']);

    // A plugin names the store a sale happens at.
    const atStore3 = await t.hr().customers.findOrCreate({
      primaryEmail: 'anna@x.mn',
      unitId: ids.store3,
    });

    expect(atStore3.customer.unitIds).toHaveLength(3);
    await expect(
      as(ids.manager1).customers.findOrCreate({ primaryEmail: 'new@x.mn', unitId: ids.store2 }),
    ).rejects.toMatchObject(OUTSIDE_REACH);

    await t.owner().customers.update({ id: ids.anna, unitIds: [ids.store1] });
  });

  it('follows a unit when it moves to another district', async () => {
    await t.owner().units.move({ id: ids.store2, parentId: ids.district2 });

    expect(await customerNames(as(ids.districtManager1))).toEqual(['Anna']);
    expect(await customerNames(as(ids.districtManager2))).toEqual(['Bold', 'Chimeg']);
    expect(await customerNames(as(ids.manager2))).toEqual(['Bold']);

    await t.owner().units.move({ id: ids.store2, parentId: ids.district1 });
    expect(await customerNames(as(ids.districtManager1))).toEqual(['Anna', 'Bold']);
  });

  it('applies to the recycle bin', async () => {
    const manager1 = as(ids.manager1);
    const gone = await manager1.customers.create({ firstName: 'Gone' });

    await manager1.customers.remove({ ids: [gone.id] });

    expect((await manager1.trash.list({})).data.map((row) => row.label)).toEqual(['Gone']);
    expect((await as(ids.manager2).trash.list({})).data).toEqual([]);
    expect((await as(ids.districtManager1).trash.list({})).data).toHaveLength(1);

    const [binned] = (await manager1.trash.list({})).data;

    await expect(
      as(ids.manager2).trash.restore({ ids: [binned?.id ?? ''] }),
    ).resolves.toMatchObject({ restored: 0 });
    await manager1.trash.restore({ ids: [binned?.id ?? ''] });
    expect(await customerNames(manager1)).toEqual(['Anna', 'Gone']);
    await t.owner().customers.remove({ ids: [gone.id] });
  });

  it('applies to exports and to API keys', async () => {
    const manager1 = as(ids.manager1);

    // An export holds what its maker sees, and only they see it.
    const mine = await manager1.transfer.createExport({
      recordType: 'customer',
      columns: ['firstName'],
    });

    await t.owner().transfer.createExport({ recordType: 'customer', columns: ['firstName'] });
    await settle();

    expect((await manager1.transfer.exports({})).data).toMatchObject([
      { id: mine.id, status: 'done', rowCount: 1 },
    ]);
    expect((await t.owner().transfer.exports({})).data).toHaveLength(2);

    // A key reaches what its maker reaches, whatever it is told.
    const { key } = await manager1.apiKeys.create({
      name: 'Till',
      kind: 'regular',
      areas: { contacts: 'write' },
      lifetimeDays: 30,
    });

    expect(await customerNames(t.client(key))).toEqual(['Anna']);
    await expect(
      manager1.apiKeys.create({
        name: 'Other store',
        kind: 'regular',
        areas: { contacts: 'read' },
        unitIds: [ids.store2],
        lifetimeDays: 30,
      }),
    ).rejects.toMatchObject(OUTSIDE_REACH);
  });
});
