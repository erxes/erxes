import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { saveEbarimt, usePosApi } from './posApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** An eBarimt config turned off never drops a receipt unseen. */
describe('ebarimt configs turned off', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const { fake, settings } = usePosApi();

  const OFF = 'The eBarimt config "Pop-up" is turned off (Settings › Integrations)';

  let popUp = '';

  beforeAll(async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });
    await saveEbarimt(t.owner(), settings());
    popUp = (
      await t.owner().ebarimt.createConfig({ ...settings(), name: 'Pop-up', status: 'disabled' })
    ).id;
  });

  const turn = (status: 'active' | 'disabled') =>
    t.owner().ebarimt.updateConfig({ ...settings(), id: popUp, name: 'Pop-up', status });

  const ticket = (referenceId: string, currency = 'MNT', taxReceipt = true) => ({
    amount: 6_000,
    currency,
    description: 'Ticket',
    referenceType: 'order',
    referenceId,
    taxReceipt,
    ebarimtId: popUp,
  });

  const receiptsOf = async (invoiceId: string) =>
    (await t.owner().ebarimt.receipts({ invoiceId })).data;

  it('refuses an invoice or payment that would get its receipt from a config that is off', async () => {
    await expect(t.hr().payments.createInvoice(ticket('off1'))).rejects.toMatchObject({
      status: 400,
      code: 'EBARIMT_CONFIG_OFF',
      message: OFF,
    });
    await expect(
      t.hr().payments.recordPayment({ ...ticket('off2'), method: 'cash' }),
    ).rejects.toMatchObject({ status: 400, code: 'EBARIMT_CONFIG_OFF' });
    // An unknown one is still not found.
    await expect(
      t.hr().payments.createInvoice({ ...ticket('off3'), ebarimtId: 'no-such-config000' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    // An invoice that gets no receipt from it may still name it.
    expect((await t.hr().payments.createInvoice(ticket('off4', 'MNT', false))).ebarimtId).toBe(
      popUp,
    );
    expect((await t.hr().payments.createInvoice(ticket('off5', 'USD'))).ebarimtId).toBe(popUp);
  });

  it('keeps the receipt as failed when its config is turned off after the invoice was made', async () => {
    await turn('active');

    const invoice = await t.hr().payments.createInvoice(ticket('later'));

    await turn('disabled');

    const puts = fake.puts.length;

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();
    expect(fake.puts).toHaveLength(puts);
    expect(await receiptsOf(invoice.id)).toMatchObject([
      { kind: 'put', status: 'failed', settingsId: popUp, totalAmount: 6_000, error: OFF },
    ]);

    // Back on, a sync sends it and the failed try gives way.
    await turn('active');
    await t.owner().ebarimt.sync({ invoiceId: invoice.id });
    await settle();
    expect(await receiptsOf(invoice.id)).toMatchObject([
      { kind: 'put', status: 'success', settingsId: popUp },
    ]);

    // Off again, then refunded: the return is kept as failed and the receipt stays in force.
    await turn('disabled');
    await t.hr().payments.refund({ id: invoice.id, reason: 'Show cancelled' });
    await settle();

    const [unsent, issued] = await receiptsOf(invoice.id);

    expect(unsent).toMatchObject({
      kind: 'return',
      status: 'failed',
      previousId: issued?.id,
      error: OFF,
    });
    expect(issued?.inactiveAt).toBeNull();
    expect(fake.deletes).toEqual([]);
  });

  it('sends nothing and keeps nothing when the default is off and the invoice names no config', async () => {
    await saveEbarimt(t.owner(), { ...settings(), status: 'disabled' });

    const invoice = await t
      .hr()
      .payments.createInvoice({ ...ticket('default'), ebarimtId: undefined });

    await t.owner().payments.payTestInvoice({ id: invoice.id });
    await settle();
    expect(await receiptsOf(invoice.id)).toEqual([]);
  });
});
