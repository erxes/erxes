import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const shirt = { kind: 'goods' as const, name: 'T-shirt', price: 20_00 };

describe('product variants and tags', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('keeps variants one level under an item of the same kind', async () => {
    const item = await t.owner().products.create(shirt);

    const medium = await t.owner().products.create({
      ...shirt,
      code: 'TS-M',
      parentId: item.id,
      variantOptions: { Size: 'M', Color: 'Red' },
    });

    expect(medium).toMatchObject({
      parentId: item.id,
      variantOptions: { Size: 'M', Color: 'Red' },
    });
    expect(item.parentId).toBeNull();
    expect((await t.owner().products.list({ parentId: item.id })).data.map((p) => p.id)).toEqual([
      medium.id,
    ]);

    // A variant of a variant, of another kind, or of an unknown product is refused.
    for (const parentId of [medium.id, 'unknown-product-1']) {
      await expect(t.owner().products.create({ ...shirt, parentId })).rejects.toMatchObject({
        status: 400,
        code: 'INVALID_PRODUCT',
      });
    }

    await expect(
      t.owner().products.create({ ...shirt, kind: 'service', parentId: item.id }),
    ).rejects.toMatchObject({ code: 'INVALID_PRODUCT' });

    // An item with variants is not a variant itself, and keeps their kind.
    const other = await t.owner().products.create({ ...shirt, name: 'Hoodie' });

    await expect(
      t.owner().products.update({ id: item.id, parentId: other.id }),
    ).rejects.toMatchObject({ code: 'INVALID_PRODUCT' });
    await expect(t.owner().products.update({ id: item.id, kind: 'service' })).rejects.toMatchObject(
      { code: 'INVALID_PRODUCT' },
    );
    await expect(
      t.owner().products.update({ id: medium.id, parentId: medium.id }),
    ).rejects.toMatchObject({ status: 400 });

    // A variant moves to another item, or becomes a product of its own.
    expect((await t.owner().products.update({ id: medium.id, parentId: other.id })).parentId).toBe(
      other.id,
    );
    expect(
      await t.owner().products.update({ id: medium.id, parentId: null, variantOptions: {} }),
    ).toMatchObject({ parentId: null, variantOptions: {} });

    // Another organisation can't point at this item.
    await expect(t.other().products.create({ ...shirt, parentId: item.id })).rejects.toMatchObject({
      code: 'INVALID_PRODUCT',
    });
  });

  it('tags products, filters by tag and lets plugins read product tags', async () => {
    const sale = await t.owner().tags.create({ type: 'product', name: 'Sale' });
    const vip = await t.owner().tags.create({ type: 'customer', name: 'VIP' });

    const tagged = await t.owner().products.create({ ...shirt, tagIds: [sale.id] });
    const plain = await t.owner().products.create({ ...shirt, name: 'Plain' });

    expect(tagged.tagIds).toEqual([sale.id]);
    expect(plain.tagIds).toEqual([]);
    await expect(
      t.owner().products.update({ id: plain.id, tagIds: [vip.id] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_TAG' });

    const list = await t.owner().products.list({ tagIds: sale.id });

    expect(list.data.map((p) => p.id)).toEqual([tagged.id]);

    // A saved view's filter on tags works for products as for contacts.
    const filter = JSON.stringify({
      match: 'all',
      rules: [{ path: 'subject.tagIds', op: 'contains', value: sale.id }],
    });

    expect((await t.owner().products.list({ filter })).data.map((p) => p.id)).toEqual([tagged.id]);

    expect((await t.owner().products.update({ id: tagged.id, tagIds: [] })).tagIds).toEqual([]);

    // Deleting a tag takes it off its products.
    await t.owner().products.update({ id: plain.id, tagIds: [sale.id] });
    await t.owner().tags.remove({ id: sale.id });
    expect((await t.owner().products.get({ id: plain.id })).tagIds).toEqual([]);

    // A plugin with products:read reads product tags, not contact tags.
    const offer = await t.owner().tags.create({ type: 'product', name: 'Offer' });

    expect((await t.hr().tags.list({ type: 'product' })).data.map((tag) => tag.id)).toEqual([
      offer.id,
    ]);
    await expect(t.hr().tags.list({ type: 'customer' })).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
  });
});
