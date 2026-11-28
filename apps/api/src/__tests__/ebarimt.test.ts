import { describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { saveEbarimt, usePosApi } from './posApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describe('ebarimt', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const { fake, base, settings } = usePosApi();

  const receiptsOf = async (invoiceId: string) =>
    (await t.owner().ebarimt.receipts({ invoiceId })).data;

  /** eBarimt's state on the Integrations page. */
  const statusOf = async () =>
    (await t.owner().integrations.list()).data.find((integration) => integration.key === 'ebarimt')
      ?.status;

  it('is set up by the owner and checked against PosAPI', async () => {
    expect((await t.owner().ebarimt.configs()).data).toEqual([]);
    await expect(t.member().ebarimt.createConfig(settings())).rejects.toMatchObject({
      status: 403,
    });
    expect(await t.owner().ebarimt.testConnection({ posApiUrl: `${base()}/posapi` })).toMatchObject(
      {
        ok: true,
        info: { version: '3.0' },
      },
    );

    config.outbound.allowPrivate = false;

    try {
      await expect(saveEbarimt(t.owner(), settings())).rejects.toMatchObject({
        code: 'INVALID_URL',
      });
    } finally {
      config.outbound.allowPrivate = true;
    }

    expect(await saveEbarimt(t.owner(), settings())).toMatchObject({
      name: 'Main shop',
      isDefault: true,
      status: 'active',
      vatPercent: 10,
    });
    // The other organisation sees none of it.
    expect((await t.other().ebarimt.configs()).data).toEqual([]);
  });

  it('issues a receipt when an invoice is paid, and replaces or returns it on refunds', async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });

    const books = await t.owner().productCategories.create({ name: 'Books' });
    const phone = await t.owner().products.create({ kind: 'goods', name: 'Phone', code: 'P1' });

    const book = await t
      .owner()
      .products.create({ kind: 'goods', name: 'Book', categoryId: books.id });

    await saveEbarimt(t.owner(), {
      ...settings(),
      rules: [{ productIds: [], categoryIds: [books.id], taxType: 'VAT_FREE', taxCode: '305' }],
    });

    const invoice = await t.hr().payments.createInvoice({
      amount: 130_000,
      currency: 'MNT',
      description: 'Order #7',
      referenceType: 'order',
      referenceId: 'o7',
      lines: [
        { productId: phone.id, quantity: 2, unitPrice: 55_000 },
        { productId: book.id, quantity: 1, unitPrice: 20_000 },
      ],
      taxBuyer: { companyNo: '1234567' },
    });

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();

    const [issued] = await receiptsOf(invoice.id);

    expect(issued).toMatchObject({
      kind: 'put',
      status: 'success',
      buyerType: 'B2B_RECEIPT',
      customerTin: '12345678901',
      customerName: 'Acme LLC',
      totalAmount: 130_000,
      totalVat: 10_000,
      billId: 'BILL1',
      lottery: 'LT1',
      source: 'hr',
      referenceId: 'o7',
    });
    expect(fake.puts[0]).toMatchObject({
      type: 'B2B_RECEIPT',
      customerTin: '12345678901',
      merchantTin: '37900846788',
      totalAmount: 1300,
      totalVAT: 100,
      receipts: [
        { taxType: 'VAT_ABLE', totalAmount: 1100, items: [{ name: 'P1 - Phone', qty: 2 }] },
        { taxType: 'VAT_FREE', totalAmount: 200, items: [{ taxProductCode: '305' }] },
      ],
      payments: [{ code: 'PAYMENT_CARD', paidAmount: 1300 }],
    });

    // A partial refund replaces it with a receipt for what is left.
    await t.hr().payments.refund({ id: invoice.id, amount: 30_000, reason: 'One book back' });
    await settle();

    const afterPartial = await receiptsOf(invoice.id);

    expect(afterPartial[0]).toMatchObject({
      kind: 'put',
      status: 'success',
      previousId: issued?.id,
      totalAmount: 100_000,
      billId: 'BILL2',
    });
    expect(afterPartial[1]?.inactiveAt).not.toBeNull();
    expect(fake.puts[1]).toMatchObject({ inactiveId: 'BILL1', totalAmount: 1000 });

    // A new buyer: a person by their consumer number; an unknown company is refused.
    await expect(
      t.hr().ebarimt.setBuyer({ invoiceId: invoice.id, taxBuyer: { companyNo: '7654321' } }),
    ).rejects.toMatchObject({ code: 'COMPANY_NOT_FOUND' });
    await t.hr().ebarimt.setBuyer({ invoiceId: invoice.id, taxBuyer: { consumerNo: '12345678' } });
    await settle();
    expect((await receiptsOf(invoice.id))[0]).toMatchObject({
      buyerType: 'B2C_RECEIPT',
      consumerNo: '12345678',
      billId: 'BILL3',
    });

    // Refunded in full: the receipt is returned.
    await t.hr().payments.refund({ id: invoice.id, reason: 'Order cancelled' });
    await settle();

    const [returned, last] = await receiptsOf(invoice.id);

    expect(returned).toMatchObject({ kind: 'return', status: 'success', previousId: last?.id });
    expect(last?.inactiveAt).not.toBeNull();
    expect(fake.deletes).toEqual([{ id: 'BILL3', date: '2026-11-17 10:00:00' }]);

    // Plugins see their own invoices' receipts; the other organisation none.
    expect((await t.hr().ebarimt.receipts({ referenceId: 'o7' })).data).toHaveLength(4);
    expect((await t.other().ebarimt.receipts({})).data).toEqual([]);
  });

  it('issues none for an order that needs none, and returns one when it is turned off', async () => {
    const order = (referenceId: string, taxReceipt?: boolean) =>
      t.hr().payments.createInvoice({
        amount: 8_000,
        currency: 'MNT',
        description: 'Order',
        referenceType: 'order',
        referenceId,
        taxReceipt,
      });

    const none = await order('no-receipt', false);
    const later = await order('turned-off');

    expect(none.taxReceipt).toBe(false);
    expect(later.taxReceipt).toBe(true);
    await t.owner().payments.payTestInvoice({ id: none.id });
    await t.owner().payments.payTestInvoice({ id: later.id });
    await settle();
    expect(await receiptsOf(none.id)).toEqual([]);

    const [issued] = await receiptsOf(later.id);

    expect(issued).toMatchObject({ kind: 'put', status: 'success' });

    const deletes = fake.deletes.length;

    await t.hr().ebarimt.setBuyer({ invoiceId: later.id, taxReceipt: false });
    await settle();
    expect(await receiptsOf(later.id)).toMatchObject([
      { kind: 'return', status: 'success', previousId: issued?.id },
      { id: issued?.id },
    ]);
    expect(fake.deletes).toHaveLength(deletes + 1);
    expect((await t.hr().payments.getInvoice({ id: later.id })).taxReceipt).toBe(false);

    // Turned back on: a new receipt.
    await t.hr().ebarimt.setBuyer({ invoiceId: none.id, taxReceipt: true });
    await settle();
    expect(await receiptsOf(none.id)).toMatchObject([{ kind: 'put', status: 'success' }]);
  });

  it('keeps a refused receipt with its error and sends it again on request', async () => {
    const paid = async (referenceId: string, currency = 'MNT') => {
      const invoice = await t.hr().payments.createInvoice({
        amount: 5_000,
        currency,
        description: 'Ticket',
        referenceType: 'order',
        referenceId,
      });

      await t.owner().payments.payTestInvoice({ id: invoice.id });

      return invoice;
    };

    // Another currency, or eBarimt turned off: no receipt.
    const dollars = await paid('usd', 'USD');

    await saveEbarimt(t.owner(), { ...settings(), status: 'disabled' });

    const other = await paid('off');

    await settle();
    expect(await receiptsOf(dollars.id)).toEqual([]);
    expect(await receiptsOf(other.id)).toEqual([]);
    expect(await statusOf()).toEqual({ state: 'off', count: null });

    await saveEbarimt(t.owner(), { ...settings(), status: 'active' });
    fake.refuse = 'Invalid merchant';

    const invoice = await paid('o8');

    await settle();
    expect(await receiptsOf(invoice.id)).toMatchObject([
      { status: 'failed', error: 'Invalid merchant', totalAmount: 5_000 },
    ]);
    expect(await statusOf()).toEqual({ state: 'attention', count: 1 });

    fake.refuse = null;
    await t.owner().ebarimt.sync({ invoiceId: invoice.id });
    await settle();
    // The failed try gives way to the one that went through.
    expect(await receiptsOf(invoice.id)).toMatchObject([{ status: 'success' }]);
    expect(await statusOf()).toEqual({ state: 'connected', count: null });

    // Its receipts may still need returning: it can be turned off, not removed.
    const [main] = (await t.owner().ebarimt.configs()).data;

    await expect(t.owner().ebarimt.removeConfig({ id: main?.id ?? '' })).rejects.toMatchObject({
      code: 'EBARIMT_CONFIG_IN_USE',
    });
    await saveEbarimt(t.owner(), { ...settings(), status: 'disabled' });
    await expect(t.owner().ebarimt.sync({ invoiceId: invoice.id })).rejects.toMatchObject({
      code: 'EBARIMT_NOT_SET_UP',
    });
  });

  it('issues a receipt only for a paid tögrög invoice while eBarimt is on when the sync runs', async () => {
    await saveEbarimt(t.owner(), { ...settings(), status: 'active' });

    const invoice = (referenceId: string, currency = 'MNT') =>
      t.hr().payments.createInvoice({
        amount: 4_000,
        currency,
        description: 'Ticket',
        referenceType: 'order',
        referenceId,
      });

    const dollars = await invoice('usd-on', 'USD');

    await t.owner().payments.payTestInvoice({ id: dollars.id });
    await settle();
    expect(await receiptsOf(dollars.id)).toEqual([]);

    const unpaid = await invoice('unpaid');

    await t.owner().ebarimt.sync({ invoiceId: unpaid.id });
    await settle();
    expect(await receiptsOf(unpaid.id)).toEqual([]);

    const late = await invoice('turned-off-later');

    await t.owner().payments.payTestInvoice({ id: late.id });
    await saveEbarimt(t.owner(), { ...settings(), status: 'disabled' });
    await settle();
    expect(await receiptsOf(late.id)).toEqual([]);
  });

  it('applies a category’s tax rule to products in its subcategories', async () => {
    await saveEbarimt(t.owner(), { ...settings(), status: 'active' });

    const books = await t.owner().productCategories.create({ name: 'Printed' });
    const novels = await t.owner().productCategories.create({ name: 'Novels', parentId: books.id });

    const novel = await t
      .owner()
      .products.create({ kind: 'goods', name: 'Novel', categoryId: novels.id });

    await saveEbarimt(t.owner(), {
      ...settings(),
      rules: [{ productIds: [], categoryIds: [books.id], taxType: 'VAT_FREE', taxCode: '305' }],
    });

    const invoice = await t.hr().payments.createInvoice({
      amount: 20_000,
      currency: 'MNT',
      description: 'Order #9',
      referenceType: 'order',
      referenceId: 'o9',
      lines: [{ productId: novel.id, quantity: 1, unitPrice: 20_000 }],
    });

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();
    expect(fake.puts.at(-1)).toMatchObject({
      totalVAT: 0,
      receipts: [{ taxType: 'VAT_FREE', items: [{ taxProductCode: '305' }] }],
    });
  });

  it('keeps several configs: an invoice picks one, else the default issues', async () => {
    await saveEbarimt(t.owner(), { ...settings(), status: 'active', rules: [] });

    const airport = await t.owner().ebarimt.createConfig({
      ...settings(),
      name: 'Airport branch',
      merchantTin: '12345678901',
    });

    expect(airport.isDefault).toBe(false);
    // A plugin lists them, so its settings can pick one.
    expect((await t.hr().ebarimt.configs()).data.map((row) => row.name)).toEqual([
      'Main shop',
      'Airport branch',
    ]);

    const pay = async (referenceId: string, ebarimtId?: string) => {
      const invoice = await t.hr().payments.createInvoice({
        amount: 9_000,
        currency: 'MNT',
        description: 'Ticket',
        referenceType: 'order',
        referenceId,
        ebarimtId,
      });

      await t.owner().payments.payTestInvoice({ id: invoice.id });
      await settle();

      return { invoice, sent: fake.puts.at(-1), receipts: await receiptsOf(invoice.id) };
    };

    const atAirport = await pay('airport', airport.id);

    expect(atAirport.invoice.ebarimtId).toBe(airport.id);
    expect(atAirport.sent).toMatchObject({ merchantTin: '12345678901' });
    expect(atAirport.receipts).toMatchObject([{ status: 'success', settingsId: airport.id }]);
    expect((await pay('main')).sent).toMatchObject({ merchantTin: '37900846788' });

    await expect(
      t.hr().payments.createInvoice({
        amount: 1_000,
        currency: 'MNT',
        description: 'Ticket',
        referenceType: 'order',
        referenceId: 'nowhere',
        ebarimtId: 'no-such-config000',
      }),
    ).rejects.toMatchObject({ status: 404 });

    // Moving the default leaves one; an unused config can go, the default moving with it.
    await t.owner().ebarimt.updateConfig({ ...settings(), ...airport, isDefault: true });
    expect(
      (await t.owner().ebarimt.configs()).data.map((row) => [row.name, row.isDefault]),
    ).toEqual([
      ['Airport branch', true],
      ['Main shop', false],
    ]);

    const spare = await t.owner().ebarimt.createConfig({ ...settings(), name: 'Spare' });

    await t.owner().ebarimt.removeConfig({ id: spare.id });
    expect((await t.owner().ebarimt.configs()).data).toHaveLength(2);
  });
});
