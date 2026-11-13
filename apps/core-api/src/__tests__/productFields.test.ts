import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('product properties', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lets an organisation add its own product properties that every plugin sees', async () => {
    const brand = await t
      .owner()
      .fields.create({ contentType: 'product', label: 'Brand', type: 'text' });

    const warranty = await t
      .owner()
      .fields.create({ contentType: 'product', label: 'Warranty months', type: 'number' });

    const vip = await t
      .owner()
      .fields.create({ contentType: 'customer', label: 'VIP', type: 'boolean' });

    const phone = await t.owner().products.create({
      kind: 'goods',
      name: 'Phone',
      customFields: { [brand.id]: 'Acme', [warranty.id]: 12 },
    });

    expect(phone.customFields).toEqual({ [brand.id]: 'Acme', [warranty.id]: 12 });

    // Values are checked against the product's own fields.
    await expect(
      t.owner().products.update({ id: phone.id, customFields: { [warranty.id]: 'long' } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD_VALUE' });
    await expect(
      t.owner().products.update({ id: phone.id, customFields: { [vip.id]: true } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD' });

    // A plugin sets values too; fields it doesn't name stay.
    const updated = await t
      .hr()
      .products.update({ id: phone.id, customFields: { [warranty.id]: 24 } });

    expect(updated.customFields).toEqual({ [brand.id]: 'Acme', [warranty.id]: 24 });
    expect((await t.hr().products.lookup({ ids: phone.id })).data[0]?.customFields).toEqual(
      updated.customFields,
    );

    const audit = await t.owner().audit.list({ action: 'product.updated' });

    expect(audit.data[0]?.changes).toEqual({ [`customFields.${warranty.id}`]: [12, 24] });

    // Clearing one.
    expect(
      (await t.owner().products.update({ id: phone.id, customFields: { [brand.id]: null } }))
        .customFields,
    ).toEqual({ [warranty.id]: 24 });

    // Plugins read the product fields (to label the values), never the contacts' ones.
    const forPlugin = await t.hr().fields.list({ contentType: 'product' });

    expect(forPlugin.data.map((field) => field.label)).toEqual(['Brand', 'Warranty months']);
    await expect(t.hr().fields.list({ contentType: 'customer' })).rejects.toMatchObject({
      status: 403,
    });

    // Contact filters don't offer product fields.
    const filterFields = await t.owner().views.fields({ recordType: 'customer' });

    expect(filterFields.data.map((field) => field.label)).not.toContain('Brand');
  });
});
