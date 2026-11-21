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

  it('never issues receipts for a plugin that sends its own', async () => {
    const picked = await order('own');

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      scopes: ['payments:read', 'payments:write'],
      taxReceipts: 'own',
    });

    await expect(t.member().ebarimt.plugins({})).rejects.toMatchObject({ status: 403 });
    expect((await t.owner().ebarimt.plugins({})).data).toEqual([
      { plugin: 'hr', title: 'HR', ownReceipts: true },
    ]);
    await expect(t.owner().ebarimt.saveSettings(settings())).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });

    // Picked before the plugin said so: its invoices still get none.
    await t.owner().payments.payTestInvoice({ id: picked.id });
    await settle();
    expect((await t.owner().ebarimt.receipts({ invoiceId: picked.id })).data).toEqual([]);
  });
});
