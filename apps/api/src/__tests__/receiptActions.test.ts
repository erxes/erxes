import { describe, expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { useActionRuns } from './actionRuns';
import { forCustomer } from './automations.fixture';
import { useTestDatabase } from './db';
import { usePosApi } from './posApi';
import { settle } from './settle';

const RECEIPT_STEPS = ['ebarimt.receipt.email', 'ebarimt.receipt.sync', 'ebarimt.receipt.company'];

/** eBarimt's receipt steps: offered while it is on, and what a run does with them. */
describe('receipt actions', { timeout: 180_000 }, () => {
  useTestDatabase();

  const t = useActionRuns();
  const posApi = usePosApi();

  const receiptSteps = async () =>
    (await t.owner().automations.catalog({})).actions
      .filter((action) => action.integration === 'ebarimt')
      .map((action) => action.type);

  const receiptsOf = async (invoiceId: string) =>
    (await t.owner().ebarimt.receipts({ invoiceId })).data;

  it('offers eBarimt’s receipt steps while it is on, even with a refused receipt', async () => {
    expect(await receiptSteps()).toEqual([]);

    await t.owner().ebarimt.saveSettings(posApi.settings());
    expect(await receiptSteps()).toEqual(RECEIPT_STEPS);

    posApi.fake.refuse = 'Invalid merchant';
    await t.paidInvoice('refused-first');
    await settle();
    posApi.fake.refuse = null;
    expect(await receiptSteps()).toEqual(RECEIPT_STEPS);

    await t.owner().ebarimt.saveSettings({ ...posApi.settings(), status: 'disabled' });
    expect(await receiptSteps()).toEqual([]);
  });

  it('emails, reissues to a company and syncs receipts from a run', async () => {
    await t.owner().ebarimt.saveSettings({ ...posApi.settings(), status: 'active' });

    const issued = await t.paidInvoice('receipt-1');

    await settle();
    posApi.fake.refuse = 'Invalid merchant';

    const refused = await t.paidInvoice('receipt-2');

    await settle();
    posApi.fake.refuse = null;

    const id = await t.active(
      'Receipts',
      forCustomer('Receipts', [
        {
          id: 'email',
          type: 'action',
          action: 'ebarimt.receipt.email',
          input: { invoiceId: issued.id, to: 'buyer@acme.mn, not an address, books@acme.mn' },
        },
        {
          id: 'company',
          type: 'action',
          action: 'ebarimt.receipt.company',
          input: { invoiceId: issued.id, companyNo: '1234567' },
        },
        {
          id: 'sync',
          type: 'action',
          action: 'ebarimt.receipt.sync',
          input: { invoiceId: refused.id },
        },
      ]),
    );

    await t.owner().customers.create({ firstName: 'Receipts' });
    await settle();

    const [current, first] = await receiptsOf(issued.id);

    expect((await t.runsOf(id))[0]?.status).toBe('succeeded');
    expect((await t.outputsOf(id)).email).toEqual({ sent: 2 });
    expect(
      loggedEmails
        .filter((email) => email.subject.includes(first?.billId ?? 'no bill'))
        .map((email) => email.to)
        .toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['books@acme.mn', 'buyer@acme.mn']);
    expect(current).toMatchObject({
      buyerType: 'B2B_RECEIPT',
      customerTin: '12345678901',
      previousId: first?.id,
    });
    expect((await receiptsOf(refused.id))[0]).toMatchObject({ status: 'success' });
  });

  it('fails the email step of an invoice with no issued receipt', async () => {
    const pending = await t.owner().payments.createInvoice({
      amount: 1_000,
      currency: 'MNT',
      description: 'Unpaid',
      referenceType: 'order',
      referenceId: 'receipt-3',
    });

    const early = await t.active(
      'Early receipt',
      forCustomer('Early', [
        {
          id: 'email',
          type: 'action',
          action: 'ebarimt.receipt.email',
          input: { invoiceId: pending.id, to: 'buyer@acme.mn' },
        },
      ]),
    );

    await t.owner().customers.create({ firstName: 'Early' });
    await t.retriedOut(early);
    expect((await t.runsOf(early))[0]).toMatchObject({
      status: 'failed',
      error: 'The invoice has no issued receipt yet',
    });
  });
});
