import { users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('global search', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('finds core records of every type the member may see, in their organisation only', async () => {
    const owner = t.owner();

    const saraa = await owner.customers.create({
      firstName: 'Saraa',
      lastName: 'Orchid',
      primaryEmail: 'saraa@orchid.mn',
    });

    const company = await owner.companies.create({ primaryName: 'Orchid LLC', code: 'ORC' });

    const product = await owner.products.create({
      kind: 'goods',
      name: 'Orchid pot',
      code: 'OP-1',
    });

    const unit = await owner.units.create({ kind: 'branch', name: 'Orchid branch' });

    await t.other().companies.create({ primaryName: 'Orchid Globex' });

    const found = await owner.search.global({ q: 'orchid' });

    expect(found.data.map((hit) => [hit.type, hit.id])).toEqual([
      ['customer', saraa.id],
      ['company', company.id],
      ['product', product.id],
      ['unit', unit.id],
    ]);
    expect(found.data[0]).toMatchObject({ title: 'Saraa Orchid', subtitle: 'saraa@orchid.mn' });

    // Every word must match; a type alone answers a group's "show more".
    expect((await owner.search.global({ q: 'saraa orchid.mn' })).data).toHaveLength(1);
    expect(
      (await owner.search.global({ q: 'orchid', type: 'product' })).data.map((hit) => hit.id),
    ).toEqual([product.id]);
    expect((await owner.search.global({ q: 'owner@acme' })).data.map((hit) => hit.type)).toEqual([
      'member',
    ]);

    // A member without contacts.view or team.view sees products and units only.
    const role = await owner.roles.create({ name: 'Stock', permissions: ['products.manage'] });

    await adminDb().update(users).set({ role: role.key }).where(eq(users.id, t.ids.member));

    expect((await t.member().search.global({ q: 'orchid' })).data.map((hit) => hit.type)).toEqual([
      'product',
      'unit',
    ]);
    expect((await t.member().search.global({ q: 'owner@acme' })).data).toEqual([]);

    await expect(owner.search.global({ q: ' ' })).rejects.toMatchObject({ status: 400 });
  });
});
