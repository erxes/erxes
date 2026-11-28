import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('product fields', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lets an organisation add its own product fields that every plugin sees', async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'core.product',
      key: 'brand',
      label: 'Brand',
      type: 'text',
    });
    await owner.dataFields.create({
      recordType: 'core.product',
      key: 'warrantyMonths',
      label: 'Warranty months',
      type: 'number',
    });
    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'vip',
      label: 'VIP',
      type: 'boolean',
    });

    const phone = await owner.products.create({
      kind: 'goods',
      name: 'Phone',
      values: { brand: 'Acme', warrantyMonths: 12 },
    });

    expect(phone.values).toEqual({ brand: 'Acme', warrantyMonths: 12 });

    // Values are checked against the product's own fields.
    await expect(
      owner.products.update({ id: phone.id, values: { warrantyMonths: 'long' } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      owner.products.update({ id: phone.id, values: { vip: true } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    // A plugin sets values too; fields it doesn't name stay.
    const updated = await t.hr().products.update({ id: phone.id, values: { warrantyMonths: 24 } });

    expect(updated.values).toEqual({ brand: 'Acme', warrantyMonths: 24 });
    expect((await t.hr().products.lookup({ ids: phone.id })).data[0]?.values).toEqual(
      updated.values,
    );

    // Clearing one.
    expect((await owner.products.update({ id: phone.id, values: { brand: null } })).values).toEqual(
      { brand: null, warrantyMonths: 24 },
    );

    // Plugins read the product fields (to label the values), never the contacts' ones.
    const forPlugin = await t.hr().dataFields.list({ recordType: 'core.product' });

    expect(forPlugin.data.map((field) => field.label)).toEqual(['Brand', 'Warranty months']);
    await expect(t.hr().dataFields.list({ recordType: 'core.customer' })).rejects.toMatchObject({
      status: 403,
    });

    // Contact filters don't offer product fields.
    const filterFields = await owner.views.fields({ recordType: 'customer' });

    expect(filterFields.data.map((field) => field.label)).not.toContain('Brand');
  });
});
