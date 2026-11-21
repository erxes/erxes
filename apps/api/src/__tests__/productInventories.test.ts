import { describe, expect, it } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('product stock', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const ids = { latte: '', tea: '', cups: '', ub: '', zaisan: '', sales: '' };

  /** Each product's stock rows as `place: remainder/cost/soonIn/soonOut`. */
  const rows = async (
    productIds: string[],
    place: { branchId?: string; departmentId?: string } = {},
  ) =>
    (
      await t.owner().productInventories.list({ productIds: productIds.join(','), ...place })
    ).data.map(
      (row) =>
        `${row.branchId ?? '_'}.${row.departmentId ?? '_'}: ${row.remainder}/${row.cost}/${row.soonIn}/${row.soonOut}`,
    );

  it('sets stock in a place as 3.x did: an amount left out or 0 is cleared, the row stays', async () => {
    const owner = t.owner();

    ids.latte = (await owner.products.create({ kind: 'goods', name: 'Latte', code: 'LT-01' })).id;
    ids.tea = (await owner.products.create({ kind: 'goods', name: 'Tea', code: 'TE-01' })).id;
    ids.cups = (await owner.products.create({ kind: 'goods', name: 'Cups', code: 'CU-01' })).id;
    ids.ub = (await owner.units.create({ kind: 'branch', name: 'Ulaanbaatar' })).id;
    ids.zaisan = (await owner.units.create({ kind: 'branch', name: 'Zaisan' })).id;
    ids.sales = (await owner.units.create({ kind: 'department', name: 'Sales' })).id;

    const hr = t.hr();

    const written = await hr.productInventories.set({
      branchId: ids.ub,
      departmentId: ids.sales,
      items: [
        { productId: ids.latte, remainder: 4, cost: 12_000.5, soonIn: 2 },
        { productId: ids.tea, remainder: 0, cost: 0 },
      ],
    });

    expect(written.data).toHaveLength(2);
    expect(await rows([ids.latte])).toEqual([`${ids.ub}.${ids.sales}: 4/12000.5/2/null`]);
    expect(await rows([ids.tea])).toEqual([`${ids.ub}.${ids.sales}: null/null/null/null`]);

    // Setting again replaces every amount; the last line of a product wins.
    await hr.productInventories.set({
      branchId: ids.ub,
      departmentId: ids.sales,
      items: [
        { productId: ids.latte, remainder: 1 },
        { productId: ids.latte, remainder: 6, soonOut: 1 },
      ],
    });

    expect(await rows([ids.latte])).toEqual([`${ids.ub}.${ids.sales}: 6/null/null/1`]);

    // A place without a department, and one with neither.
    await hr.productInventories.set({
      branchId: ids.zaisan,
      items: [{ productId: ids.latte, remainder: 3 }],
    });
    await hr.productInventories.set({ items: [{ productId: ids.latte, remainder: 1, cost: 500 }] });

    const latte = await rows([ids.latte]);

    // The place with no branch comes first.
    expect(latte[0]).toBe('_._: 1/500/null/null');
    expect(latte.toSorted()).toEqual(
      [
        '_._: 1/500/null/null',
        `${ids.ub}.${ids.sales}: 6/null/null/1`,
        `${ids.zaisan}._: 3/null/null/null`,
      ].toSorted(),
    );
    expect(await rows([ids.latte], { branchId: ids.zaisan })).toEqual([
      `${ids.zaisan}._: 3/null/null/null`,
    ]);
  });

  it('adds to stock, an unset amount counting as 0, and adds every line of a product', async () => {
    const hr = t.hr();

    await hr.productInventories.increase({
      branchId: ids.ub,
      departmentId: ids.sales,
      items: [
        { productId: ids.latte, diffCount: -2, diffCost: 100 },
        { productId: ids.latte, diffCount: -1 },
        { productId: ids.tea, diffCount: 5, diffSoonIn: 1.5 },
      ],
    });

    expect(await rows([ids.latte], { branchId: ids.ub, departmentId: ids.sales })).toEqual([
      `${ids.ub}.${ids.sales}: 3/100/0/1`,
    ]);
    expect(await rows([ids.tea], { branchId: ids.ub, departmentId: ids.sales })).toEqual([
      `${ids.ub}.${ids.sales}: 5/0/1.5/0`,
    ]);

    // A new place starts from the diffs.
    await hr.productInventories.increase({
      branchId: ids.zaisan,
      departmentId: ids.sales,
      items: [{ productId: ids.cups, diffCount: 10 }],
    });

    expect(await rows([ids.cups])).toEqual([`${ids.zaisan}.${ids.sales}: 10/0/0/0`]);

    // Concurrent bookings each add theirs.
    await Promise.all(
      Array.from({ length: 5 }, () =>
        hr.productInventories.increase({
          branchId: ids.zaisan,
          departmentId: ids.sales,
          items: [{ productId: ids.cups, diffCount: 1 }],
        }),
      ),
    );

    expect(await rows([ids.cups])).toEqual([`${ids.zaisan}.${ids.sales}: 15/0/0/0`]);
  });

  it("answers 3.x's product.remainder: one place, or sums over the places asked", async () => {
    const owner = t.owner();

    const remainders = async (query: Record<string, string>) =>
      (
        await owner.productInventories.remainders({
          ids: [ids.latte, ids.tea, 'nope'].join(','),
          ...query,
        })
      ).data;

    // One place: its amounts, null where it has none.
    expect(await remainders({ branchId: ids.ub, departmentId: ids.sales })).toEqual([
      { productId: ids.latte, remainder: 3, cost: 100, soonIn: 0, soonOut: 1 },
      { productId: ids.tea, remainder: 5, cost: 0, soonIn: 1.5, soonOut: 0 },
    ]);
    expect(await remainders({ branchId: ids.zaisan })).toEqual([
      { productId: ids.latte, remainder: 3, cost: null, soonIn: null, soonOut: null },
      { productId: ids.tea, remainder: null, cost: null, soonIn: null, soonOut: null },
    ]);

    // Every place: latte has 1 with no branch, 3 at UB/Sales and 3 at Zaisan.
    expect(await remainders({})).toEqual([
      { productId: ids.latte, remainder: 7, cost: 600, soonIn: 0, soonOut: 1 },
      { productId: ids.tea, remainder: 5, cost: 0, soonIn: 1.5, soonOut: 0 },
    ]);
    expect((await remainders({ branchIds: ids.ub }))[0]).toMatchObject({ remainder: 3 });
    // `_` is the stock with no branch.
    expect((await remainders({ branchIds: `_,${ids.zaisan}` }))[0]).toMatchObject({
      remainder: 4,
      cost: 500,
    });
    expect((await remainders({ departmentIds: '_' }))[0]).toMatchObject({ remainder: 4 });
  });

  it('shows stock as a customer may hear it: total and by branch name, never cost', async () => {
    const { data } = await t
      .owner()
      .productInventories.stock({ ids: [ids.latte, ids.cups, ids.tea].join(',') });

    const fresh = await t.owner().products.create({ kind: 'goods', name: 'New' });

    expect(data).toEqual([
      {
        productId: ids.latte,
        stockTracked: true,
        remainder: 7,
        branches: [
          { branchId: ids.ub, name: 'Ulaanbaatar', remainder: 3 },
          { branchId: ids.zaisan, name: 'Zaisan', remainder: 3 },
        ],
      },
      {
        productId: ids.cups,
        stockTracked: true,
        remainder: 15,
        branches: [{ branchId: ids.zaisan, name: 'Zaisan', remainder: 15 }],
      },
      {
        productId: ids.tea,
        stockTracked: true,
        remainder: 5,
        branches: [{ branchId: ids.ub, name: 'Ulaanbaatar', remainder: 5 }],
      },
    ]);
    expect(JSON.stringify(data)).not.toContain('cost');
    // Untracked stock is not sold out.
    expect((await t.owner().productInventories.stock({ ids: fresh.id })).data).toEqual([
      { productId: fresh.id, stockTracked: false, remainder: 0, branches: [] },
    ]);
  });

  /** The names of the products the list answers, sorted. */
  const names = async (query: {
    branchId?: string;
    departmentId?: string;
    minRemainder?: number;
    maxRemainder?: number;
  }) =>
    (await t.owner().products.list({ ...query, limit: 100 })).data
      .map((product) => product.name)
      .toSorted((a, b) => a.localeCompare(b));

  it('filters the product list by stock in a place, or in total', async () => {
    // In total: latte 7, tea 5, cups 15, New 0 (no stock counts as 0).
    expect(await names({ minRemainder: 6 })).toEqual(['Cups', 'Latte']);
    expect(await names({ maxRemainder: 5 })).toEqual(['New', 'Tea']);
    expect(await names({ minRemainder: 0, maxRemainder: 0 })).toEqual(['New']);
    // In a place, only products whose stock there is set: tea's at Zaisan was never set.
    expect(await names({ branchId: ids.zaisan, minRemainder: 0 })).toEqual(['Latte']);
    expect(await names({ branchId: ids.ub, departmentId: ids.sales, maxRemainder: 4 })).toEqual([
      'Latte',
    ]);
    expect(await names({ branchId: ids.ub })).toHaveLength(4);
  });

  it('lets only the plugin with inventories:write change stock, and keeps it to its organisation', async () => {
    await expect(
      t.hr().productInventories.set({ items: [{ productId: 'nope', remainder: 1 }] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_PRODUCT' });
    await expect(
      t.hr().productInventories.increase({
        items: [
          { productId: ids.latte, diffCount: 1 },
          { productId: 'nope', diffCount: 1 },
        ],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_PRODUCT' });
    expect(await rows([ids.latte], {})).toHaveLength(3);
    expect((await rows([ids.latte], {})).find((row) => row.startsWith('_._'))).toBe(
      '_._: 1/500/null/null',
    );

    // Members read it but never write it.
    expect((await t.member().productInventories.list({ productIds: ids.latte })).data).toHaveLength(
      3,
    );
    await expect(
      t.owner().productInventories.increase({ items: [{ productId: ids.latte, diffCount: 1 }] }),
    ).rejects.toMatchObject({ status: 403 });

    // A plugin with products:read only reads.
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
      scopes: ['products:read'],
    });

    const tms = t.client(await token(t.ids.org));

    expect((await tms.productInventories.stock({ ids: ids.latte })).data[0]?.remainder).toBe(7);
    await expect(
      tms.productInventories.set({ items: [{ productId: ids.latte, remainder: 1 }] }),
    ).rejects.toMatchObject({ status: 403 });

    // The other organisation sees none of it and can't write to these products.
    expect((await t.other().productInventories.list({ productIds: ids.latte })).data).toEqual([]);
    expect((await t.other().productInventories.stock({ ids: ids.latte })).data).toEqual([]);
    await expect(
      t.hr(t.ids.otherOrg).productInventories.increase({
        items: [{ productId: ids.latte, diffCount: 1 }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_PRODUCT' });
  });
});
