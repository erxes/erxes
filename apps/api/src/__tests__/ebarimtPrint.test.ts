import { describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { loggedEmails } from '~/modules/email/email';
import { useTestDatabase } from './db';
import { usePosApi } from './posApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describe('ebarimt print templates', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const { settings } = usePosApi();

  const paidReceipt = async () => {
    await t.owner().payments.addGateway({ name: 'Test', config: { kind: 'test' } });

    const invoice = await t.hr().payments.createInvoice({
      amount: 22_000,
      currency: 'MNT',
      description: 'Order #9',
      referenceType: 'order',
      referenceId: 'o9',
      lines: [{ name: 'Tea <hot>', quantity: 2, unitPrice: 11_000 }],
      taxBuyer: { consumerNo: '12345678' },
    });

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();

    const [receipt] = (await t.owner().ebarimt.receipts({ invoiceId: invoice.id })).data;

    if (!receipt) throw new Error('no receipt issued');

    return { invoice, receipt };
  };

  it('has a default template for each plugin eBarimt issues receipts for', async () => {
    expect(await t.owner().ebarimt.printTemplates({})).toEqual({ data: [] });
    await expect(
      t.owner().ebarimt.previewPrint({ paperSize: '80mm', blocks: [] }),
    ).rejects.toMatchObject({ status: 409, code: 'EBARIMT_NOT_SET_UP' });

    await t.owner().ebarimt.saveSettings(settings());

    const { data } = await t.owner().ebarimt.printTemplates({});

    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      plugin: 'hr',
      paperSize: '80mm',
      headerText: '',
      updatedAt: null,
    });
    expect(data[0]?.blocks.map((block) => block.type)).toEqual([
      'merchant',
      'header',
      'bill',
      'buyer',
      'lines',
      'totals',
      'qr',
      'lottery',
      'footer',
    ]);
    await expect(t.member().ebarimt.printTemplates({})).rejects.toMatchObject({ status: 403 });
    expect(await t.other().ebarimt.printTemplates({})).toEqual({ data: [] });
  });

  it('saves, previews and resets a plugin’s template', async () => {
    await t.owner().ebarimt.saveSettings(settings());

    await expect(
      t.owner().ebarimt.savePrintTemplate({ plugin: 'sales', paperSize: '58mm' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      t.owner().ebarimt.savePrintTemplate({
        plugin: 'hr',
        blocks: [
          { type: 'qr', visible: true },
          { type: 'qr', visible: false },
        ],
      }),
    ).rejects.toMatchObject({ status: 400 });

    const saved = await t.owner().ebarimt.savePrintTemplate({
      plugin: 'hr',
      paperSize: '58mm',
      blocks: [
        { type: 'lottery', visible: true },
        { type: 'merchant', visible: true },
        { type: 'qr', visible: false },
      ],
      headerText: 'Welcome',
      footerText: 'Thank you',
    });

    // Parts it didn't list follow, visible.
    expect(saved.blocks.slice(0, 4)).toEqual([
      { type: 'lottery', visible: true },
      { type: 'merchant', visible: true },
      { type: 'qr', visible: false },
      { type: 'header', visible: true },
    ]);
    expect(saved).toMatchObject({ paperSize: '58mm', footerText: 'Thank you' });
    expect(saved.updatedAt).not.toBeNull();

    const preview = await t.owner().ebarimt.previewPrint({
      paperSize: saved.paperSize,
      blocks: saved.blocks,
      headerText: '<b>Hi</b>',
    });

    expect(preview.paperSize).toBe('58mm');
    expect(preview.html).toContain('size:58mm auto');
    expect(preview.html).toContain('&lt;b&gt;Hi&lt;/b&gt;');
    expect(preview.html).not.toContain('<b>Hi</b>');
    expect(preview.html).not.toContain('data-block="qr"');
    expect(preview.html.indexOf('data-block="lottery"')).toBeLessThan(
      preview.html.indexOf('data-block="merchant"'),
    );

    expect(await t.owner().ebarimt.resetPrintTemplate({ plugin: 'hr' })).toMatchObject({
      paperSize: '80mm',
      footerText: '',
      updatedAt: null,
    });
  });

  it('prints an issued receipt with its plugin’s template', async () => {
    await t.owner().ebarimt.saveSettings(settings());
    await t.owner().ebarimt.savePrintTemplate({ plugin: 'hr', footerText: 'Come again' });

    const { invoice, receipt } = await paidReceipt();
    const printed = await t.hr().ebarimt.printReceipt({ id: receipt.id });

    expect(printed.paperSize).toBe('80mm');
    expect(printed.html).toContain('Come again');
    expect(printed.html).toContain('Tea &lt;hot&gt;');
    expect(printed.html).toContain(receipt.billId ?? 'no bill');
    expect(printed.html).toContain(`Сугалаа: ${receipt.lottery ?? ''}`);
    expect(printed.html).toContain('12345678');
    expect(printed.html).toContain('<svg');

    expect((await t.owner().ebarimt.printReceipt({ id: receipt.id })).html).toBe(printed.html);
    await expect(t.other().ebarimt.printReceipt({ id: receipt.id })).rejects.toMatchObject({
      status: 404,
    });

    // Refunded in full: the receipt is returned and no longer prints.
    await t.hr().payments.refund({ id: invoice.id, reason: 'Cancelled' });
    await settle();
    await expect(t.hr().ebarimt.printReceipt({ id: receipt.id })).rejects.toMatchObject({
      status: 409,
      code: 'RECEIPT_NOT_PRINTABLE',
    });
  });

  it('emails an issued receipt with its QR code as an image', async () => {
    await t.owner().ebarimt.saveSettings(settings());

    const { receipt } = await paidReceipt();

    await expect(
      t.hr().ebarimt.emailReceipt({ id: receipt.id, to: 'not an address' }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      t.other().ebarimt.emailReceipt({ id: receipt.id, to: 'buyer@example.mn' }),
    ).rejects.toMatchObject({ status: 404 });

    // Production with nothing set up: it would reach only the log.
    config.isProduction = true;
    await expect(
      t.hr().ebarimt.emailReceipt({ id: receipt.id, to: 'buyer@example.mn' }),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_NOT_CONFIGURED' });
    config.isProduction = false;

    expect(await t.hr().ebarimt.emailReceipt({ id: receipt.id, to: 'buyer@example.mn' })).toEqual({
      ok: true,
    });
    await settle();

    const sent = loggedEmails.findLast((email) => email.to === 'buyer@example.mn');

    expect(sent?.subject).toContain(receipt.billId ?? 'no bill');
    expect(sent?.text).toContain('Tea <hot>');
    expect(sent?.text).toContain(`Сугалаа: ${receipt.lottery ?? ''}`);
    expect(sent?.attachments).toEqual([
      expect.objectContaining({ cid: 'ebarimt-qr', filename: 'ebarimt-qr.png' }),
    ]);
  });
});
