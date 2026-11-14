import { describe, expect, it, onTestFinished } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const phone = { kind: 'goods' as const, name: 'Phone X', code: 'PX-1', price: 1_200_000_00 };

describe('products', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** A second plugin (`tms`) with its own token for the organisation, its API at `apiUrl`. */
  const tms = async (apiUrl?: string) => {
    const secret = await rotatePluginSecret('tms');

    const token = (org?: string) =>
      t.client().plugins.token({
        grant_type: 'client_credentials',
        client_id: 'tms',
        client_secret: secret,
        org,
      });

    if (apiUrl) {
      await t.client((await token()).access_token).plugins.registerManifest({
        title: 'TMS',
        version: '1',
        api: { url: apiUrl },
        scopes: ['payments:read', 'payments:write', 'products:read', 'products:write'],
        subscriptions: ['core.payment.*'],
      });
    }

    return t.client((await token(t.ids.org)).access_token);
  };

  it('keeps one catalog that members manage and only their organisation sees', async () => {
    const category = await t.owner().productCategories.create({ name: 'Phones' });
    const created = await t.owner().products.create({ ...phone, categoryId: category.id });

    expect(created).toMatchObject({
      status: 'active',
      unit: 'pcs',
      currency: 'USD',
      categoryId: category.id,
      plugins: [],
    });
    // A taken code names the product that has it, so a plugin can use that one instead.
    await expect(
      t.owner().products.create({ ...phone, name: 'Copy', code: 'px-1' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'TAKEN',
      data: { field: 'code', id: created.id },
    });
    await t.owner().products.update({ id: created.id, code: 'PX-1', barcode: '865' });
    await expect(
      t.owner().products.create({ ...phone, code: null, barcode: '865' }),
    ).rejects.toMatchObject({ code: 'TAKEN', data: { field: 'barcode', id: created.id } });
    await expect(
      t.owner().products.create({ ...phone, code: null, categoryId: 'nope' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_CATEGORY' });
    await expect(
      t.owner().products.create({ ...phone, code: null, plugins: ['ecom'] }),
    ).rejects.toMatchObject({ status: 400, code: 'PLUGIN_NOT_INSTALLED' });

    // Members read it; changing it needs products.manage.
    expect((await t.member().products.list({ search: 'px-1' })).data.map((p) => p.id)).toEqual([
      created.id,
    ]);
    expect((await t.member().products.list({ search: '865' })).data).toHaveLength(1);
    await expect(t.member().products.update({ id: created.id, price: 1 })).rejects.toMatchObject({
      status: 403,
    });

    const updated = await t.owner().products.update({ id: created.id, price: 1_100_000_00 });

    expect(updated.price).toBe(1_100_000_00);

    const audit = await t.owner().audit.list({ action: 'product.updated' });

    expect(audit.data[0]?.changes).toMatchObject({ price: [1_200_000_00, 1_100_000_00] });

    // Archived, not deleted: out of the list, still found by id.
    expect((await t.owner().products.archive({ id: created.id })).status).toBe('archived');
    expect((await t.owner().products.list({})).data).toEqual([]);
    expect((await t.owner().products.lookup({ ids: created.id })).data).toHaveLength(1);
    expect((await t.owner().products.restore({ id: created.id })).archivedAt).toBeNull();

    // A category with products can go; its products lose it. One with subcategories can't.
    const sub = await t.owner().productCategories.create({ name: 'Cases', parentId: category.id });

    const inSub = await t
      .owner()
      .products.create({ kind: 'goods', name: 'Phone case', categoryId: sub.id });

    // A category lists its subcategories' products too; the subcategory only its own.
    const listed = async (categoryId: string) =>
      (await t.owner().products.list({ categoryId })).data.map((p) => p.name).toSorted();

    expect(await listed(category.id)).toEqual(['Phone X', 'Phone case']);
    expect(await listed(sub.id)).toEqual(['Phone case']);
    await t.owner().products.archive({ id: inSub.id });

    await expect(
      t.owner().productCategories.update({ id: category.id, parentId: sub.id }),
    ).rejects.toMatchObject({ code: 'INVALID_CATEGORY' });
    await expect(t.owner().productCategories.remove({ id: category.id })).rejects.toMatchObject({
      code: 'CATEGORY_HAS_CHILDREN',
    });
    await t.owner().productCategories.remove({ id: sub.id });
    await t.owner().productCategories.remove({ id: category.id });
    expect((await t.owner().products.get({ id: created.id })).categoryId).toBeNull();

    // Another organisation sees none of it.
    expect((await t.other().products.list({})).data).toEqual([]);
    await expect(t.other().products.get({ id: created.id })).rejects.toMatchObject({
      status: 404,
    });

    const events = await t.owner().events.list({ type: 'core.product.*' });

    expect(events.data.map((event) => event.type)).toEqual(
      expect.arrayContaining([
        'core.product.created',
        'core.product.updated',
        'core.product.archived',
        'core.product.restored',
      ]),
    );

    // Events name the product; subscribers read it from core.
    for (const event of events.data) expect(Object.keys(event.payload)).toEqual(['changed']);
  });

  it('lets plugins share products: each lists its own and uses others by choice', async () => {
    const delivery = await t.hr().products.create({
      kind: 'service',
      name: 'Express delivery',
      price: 15_000_00,
    });

    expect(delivery.plugins).toEqual(['hr']);
    await expect(t.hr().products.update({ id: delivery.id, plugins: [] })).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });

    const other = await tms();

    const goods = await other.products.create({
      kind: 'goods',
      name: 'Charger',
      price: 50_000_00,
      weightGrams: 120,
    });

    // Each plugin lists what it uses; `all` searches the whole catalog.
    expect((await t.hr().products.list({})).data.map((p) => p.name)).toEqual(['Express delivery']);
    expect((await other.products.list({})).data.map((p) => p.name)).toEqual(['Charger']);
    expect((await other.products.list({ all: true })).data.map((p) => p.name)).toEqual(
      expect.arrayContaining(['Express delivery', 'Charger', 'Phone X']),
    );

    // hr starts using the charger: it appears in hr's list; tms keeps it.
    const [shared] = (await t.hr().products.use({ ids: [goods.id], used: true })).data;

    expect(shared?.plugins).toEqual(['tms', 'hr']);
    expect((await t.hr().products.list({})).data).toHaveLength(2);
    await t.hr().products.use({ ids: [goods.id], used: false });
    expect((await other.products.get({ id: goods.id })).plugins).toEqual(['tms']);

    // Members filter by plugin and choose plugins for a product.
    expect((await t.owner().products.list({ plugin: 'tms' })).data).toHaveLength(1);
    expect(
      (await t.owner().products.update({ id: delivery.id, plugins: ['hr', 'tms'] })).plugins,
    ).toEqual(['hr', 'tms']);
    await expect(t.owner().products.use({ ids: [goods.id], used: true })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('bills one invoice for several plugins’ lines and lets each read it', async () => {
    await t.owner().payments.addGateway({ name: 'Test', config: { kind: 'test' } });

    const api = await pluginApi(t.url(''), 'tms');

    onTestFinished(api.close);

    const other = await tms(api.url);
    const phoneRow = await t.hr().products.create({ ...phone, code: 'PX-9' });

    const delivery = await other.products.create({
      kind: 'service',
      name: 'Delivery',
      price: 10_000_00,
    });

    const lines = [
      { productId: phoneRow.id, quantity: 1, unitPrice: phone.price },
      { productId: delivery.id, quantity: 1, unitPrice: 10_000_00, plugin: 'tms' },
    ];

    const base = { description: 'Order #1', referenceType: 'order', referenceId: '1' };

    await expect(
      t.hr().payments.createInvoice({ ...base, amount: 1, lines }),
    ).rejects.toMatchObject({ status: 400, code: 'LINES_MISMATCH' });
    await expect(
      t.hr().payments.createInvoice({
        ...base,
        amount: 100,
        lines: [{ productId: 'nope', quantity: 1, unitPrice: 100 }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_PRODUCT' });

    const invoice = await t
      .hr()
      .payments.createInvoice({ ...base, amount: phone.price + 10_000_00, lines });

    expect(invoice.lines).toEqual([
      {
        productId: phoneRow.id,
        name: 'Phone X',
        quantity: 1,
        unitPrice: phone.price,
        amount: phone.price,
        plugin: null,
      },
      {
        productId: delivery.id,
        name: 'Delivery',
        quantity: 1,
        unitPrice: 10_000_00,
        amount: 10_000_00,
        plugin: 'tms',
      },
    ]);

    // tms has a line: it reads the invoice, but only hr may cancel it.
    expect((await other.payments.getInvoice({ id: invoice.id })).id).toBe(invoice.id);
    await expect(other.payments.cancelInvoice({ id: invoice.id })).rejects.toMatchObject({
      status: 404,
    });

    // When it's paid, tms hears about it too.
    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();
    expect(api.rejected).toEqual([]);
    expect(api.received.map((event) => event.type)).toEqual(['core.payment.paid']);
    expect(api.received[0]?.payload).toMatchObject({ invoiceId: invoice.id, source: 'hr' });
  });
});
