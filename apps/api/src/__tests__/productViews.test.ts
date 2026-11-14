import type { ConditionRule } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const where = (...rules: ConditionRule[]) => JSON.stringify({ match: 'all', rules });

describe('product filters and views', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('filters products by every field, custom fields and categories with their subcategories', async () => {
    const drinks = await t.owner().productCategories.create({ name: 'Drinks' });
    const tea = await t.owner().productCategories.create({ name: 'Tea', parentId: drinks.id });

    const brand = await t
      .owner()
      .fields.create({ contentType: 'product', label: 'Brand', type: 'text' });

    const green = await t.owner().products.create({
      kind: 'goods',
      name: 'Green tea',
      categoryId: tea.id,
      price: 500,
      customFields: { [brand.id]: 'Acme' },
    });

    const cola = await t
      .owner()
      .products.create({ kind: 'goods', name: 'Cola', categoryId: drinks.id, price: 900 });

    const delivery = await t.hr().products.create({ kind: 'service', name: 'Delivery' });

    const names = async (filter: string) =>
      (await t.owner().products.list({ filter })).data.map((product) => product.name).toSorted();

    const fields = (await t.owner().views.fields({ recordType: 'product' })).data;

    expect(fields.find((entry) => entry.path === 'subject.categoryId')?.options).toEqual([
      'Drinks',
      'Drinks › Tea',
    ]);
    expect(fields.find((entry) => entry.path === 'subject.plugins')?.options).toEqual(['hr']);
    expect(fields.find((entry) => entry.path === `subject.customFields.${brand.id}`)).toMatchObject(
      { label: 'Brand', group: 'custom' },
    );
    // Contacts' fields are not the products list's.
    expect(fields.some((entry) => entry.path === 'subject.tagIds')).toBe(false);

    expect(await names(where({ path: 'subject.categoryId', op: 'eq', value: 'drinks' }))).toEqual([
      cola.name,
      green.name,
    ]);
    expect(
      await names(where({ path: 'subject.categoryId', op: 'neq', value: 'Drinks › Tea' })),
    ).toEqual([cola.name, delivery.name]);
    expect(await names(where({ path: 'subject.price', op: 'gt', value: 600 }))).toEqual([
      cola.name,
    ]);
    expect(await names(where({ path: 'subject.plugins', op: 'in', value: ['hr'] }))).toEqual([
      delivery.name,
    ]);
    expect(await names(where({ path: 'subject.plugins', op: 'not_exists' }))).toEqual([
      cola.name,
      green.name,
    ]);
    expect(
      await names(where({ path: `subject.customFields.${brand.id}`, op: 'eq', value: 'acme' })),
    ).toEqual([green.name]);
    expect(await names(where({ path: 'subject.kind', op: 'eq', value: 'service' }))).toEqual([
      delivery.name,
    ]);
    expect(await names(where({ path: 'subject.createdBy', op: 'eq', value: 'me' }))).toEqual([
      cola.name,
      green.name,
    ]);

    // Plugins filter too; "me" means a member.
    expect(
      (
        await t.hr().products.list({
          all: true,
          filter: where({ path: 'subject.price', op: 'lt', value: 600 }),
        })
      ).data.map((product) => product.id),
    ).toEqual([delivery.id, green.id]);
    await expect(
      t.hr().products.list({ filter: where({ path: 'subject.createdBy', op: 'eq', value: 'me' }) }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FILTER' });
    await expect(
      t.owner().products.list({ filter: where({ path: 'subject.tagIds', op: 'exists' }) }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FILTER' });
  });

  it('saves product views; sharing them needs products.manage', async () => {
    const filter = {
      match: 'all' as const,
      rules: [{ path: 'subject.kind', op: 'eq' as const, value: 'goods' }],
    };

    const mine = await t.member().views.create({ recordType: 'product', name: 'Goods', filter });

    expect(mine).toMatchObject({ recordType: 'product', shared: false, editable: true });
    await expect(
      t.member().views.create({ recordType: 'product', name: 'Team goods', filter, shared: true }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    const shared = await t
      .owner()
      .views.create({ recordType: 'product', name: 'Team goods', filter, shared: true });

    expect(
      (await t.member().views.list({ recordType: 'product' })).data.map((view) => view.name),
    ).toEqual([shared.name, mine.name]);
    expect((await t.member().views.list({ recordType: 'product' })).data[0]?.editable).toBe(false);
    await expect(t.member().views.remove({ id: shared.id })).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
    // Product views stay out of the contact lists.
    expect((await t.owner().views.list({ recordType: 'customer' })).data).toEqual([]);
    await expect(
      t.owner().views.create({
        recordType: 'product',
        name: 'Broken',
        filter: { match: 'all', rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }] },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FILTER' });
  });
});
