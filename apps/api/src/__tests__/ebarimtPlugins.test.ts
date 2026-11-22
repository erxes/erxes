import type { InvoiceLineInput } from '@erxes/core-contract';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { usePosApi } from './posApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** What a plugin tells eBarimt: how its lines are taxed, and that it sends its own receipts. */
describe('ebarimt and plugins', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const { fake, settings } = usePosApi();

  beforeAll(async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });
    await t.owner().ebarimt.saveSettings(settings());
  });

  const order = (referenceId: string, lines?: InvoiceLineInput[]) =>
    t.hr().payments.createInvoice({
      amount: 30_000,
      currency: 'MNT',
      description: 'Tour',
      referenceType: 'order',
      referenceId,
      lines,
    });

  it('taxes a line without a core product as the plugin says', async () => {
    const invoice = await order('o9', [
      {
        name: 'Museum ticket',
        quantity: 1,
        unitPrice: 10_000,
        barcode: '4006381333931',
        tax: { category: 'exempt', code: '501' },
      },
      { name: 'Guide', quantity: 1, unitPrice: 20_000 },
    ]);

    expect(invoice.lines[0]).toMatchObject({
      barcode: '4006381333931',
      tax: { category: 'exempt', code: '501' },
    });

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();
    expect(fake.puts).toMatchObject([
      {
        totalAmount: 300,
        receipts: [
          {
            taxType: 'VAT_FREE',
            totalVAT: 0,
            items: [
              {
                name: 'Museum ticket',
                barCode: '4006381333931',
                barCodeType: 'GS1',
                taxProductCode: '501',
              },
            ],
          },
          { taxType: 'VAT_ABLE', totalAmount: 200, items: [{ name: 'Guide', barCode: '' }] },
        ],
      },
    ]);
  });

  it('issues receipts for payments taken outside a gateway, coded by how they were paid', async () => {
    const recorded = (method: 'cash' | 'card', referenceId: string) =>
      t.hr().payments.recordPayment({
        method,
        amount: 30_000,
        currency: 'MNT',
        description: 'Tour',
        referenceType: 'order',
        referenceId,
      });

    await recorded('cash', 'cash1');
    await settle();
    expect(fake.puts.at(-1)).toMatchObject({ payments: [{ code: 'CASH', paidAmount: 300 }] });

    const card = await recorded('card', 'card1');

    await settle();
    expect(fake.puts.at(-1)).toMatchObject({
      payments: [{ code: 'PAYMENT_CARD', paidAmount: 300 }],
    });
    expect((await t.owner().ebarimt.receipts({ invoiceId: card.id })).data).toMatchObject([
      { kind: 'put', status: 'success' },
    ]);
  });

  it('issues receipts for every plugin’s invoices and core’s own, with no plugin picked', async () => {
    const ours = await t.owner().payments.createInvoice({
      amount: 30_000,
      currency: 'MNT',
      description: 'Walk-in',
      referenceType: 'order',
      referenceId: 'core1',
    });

    const theirs = await order('hr1');

    await t.owner().payments.payTestInvoice({ id: ours.id });
    await t.owner().payments.payTestInvoice({ id: theirs.id });
    await settle();

    for (const invoice of [ours, theirs]) {
      expect((await t.owner().ebarimt.receipts({ invoiceId: invoice.id })).data).toMatchObject([
        { kind: 'put', status: 'success', source: invoice.source },
      ]);
    }
  });

  it('never issues receipts for a plugin that sends its own', async () => {
    const invoice = await order('own');

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      scopes: ['payments:read', 'payments:write'],
      taxReceipts: 'own',
    });

    expect(await t.owner().ebarimt.saveSettings(settings())).toMatchObject({ status: 'active' });
    expect((await t.owner().ebarimt.printTemplates({})).data.map((row) => row.plugin)).toEqual([
      'core',
    ]);

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();
    expect((await t.owner().ebarimt.receipts({ invoiceId: invoice.id })).data).toEqual([]);
  });
});
