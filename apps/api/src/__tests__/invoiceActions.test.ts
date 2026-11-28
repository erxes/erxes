import { paymentInvoices } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { onPaid, useActionRuns } from './actionRuns';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

const InvoiceOutput = z.object({ invoiceId: z.string() });

/** A gateway's invoice steps in a run: refunds, cancels, and what they refuse. */
describe('invoice actions', { timeout: 180_000 }, () => {
  useTestDatabase();

  const t = useActionRuns();

  it('refunds a paid invoice part by part, with the automation’s name as the reason, and fails on a refusal', async () => {
    const id = await t.active(
      'Refund returns',
      onPaid('return-1', [
        {
          id: 'part',
          type: 'action',
          action: 'test.invoice.refund',
          input: { invoiceId: '{{event.payload.invoiceId}}', amount: 30_000, reason: 'One back' },
        },
        {
          id: 'rest',
          type: 'action',
          action: 'test.invoice.refund',
          input: { invoiceId: '{{event.payload.invoiceId}}' },
        },
      ]),
    );

    const invoice = await t.paidInvoice('return-1');

    await settle();

    const refunds = (await t.owner().payments.refunds({ id: invoice.id })).data;
    const outputs = await t.outputsOf(id);

    expect((await t.runsOf(id))[0]?.status).toBe('succeeded');
    expect(
      refunds.map(({ amount, reason, method, status }) => [amount, reason, method, status]),
    ).toEqual([
      [30_000, 'One back', 'gateway', 'succeeded'],
      [70_000, 'Refund returns', 'gateway', 'succeeded'],
    ]);
    expect(outputs.part).toEqual({
      refundId: refunds[0]?.id,
      amount: 30_000,
      status: 'paid',
    });
    expect(outputs.rest).toEqual({
      refundId: refunds[1]?.id,
      amount: 70_000,
      status: 'refunded',
    });

    const refused = await t.active(
      'Refund refusals',
      onPaid('return-2', [
        {
          id: 'all',
          type: 'action',
          action: 'test.invoice.refund',
          input: { invoiceId: '{{event.payload.invoiceId}}' },
        },
      ]),
    );

    const second = await t.paidInvoice('return-2');

    await adminDb()
      .update(paymentInvoices)
      .set({ payment: { testPaid: true, testRefundFails: true } })
      .where(eq(paymentInvoices.id, second.id));
    await settle();

    expect((await t.runsOf(refused))[0]).toMatchObject({
      status: 'failed',
      error: 'The test gateway refused the refund',
    });
  });

  it('bills the automation when the run has no record, cancels once, and refuses an invoice paid another way', async () => {
    const id = await t.active(
      'Cash follow-up',
      onPaid('cash-1', [
        { id: 'bill', type: 'action', action: 'test.invoice.create', input: { amount: 5_000 } },
        {
          id: 'cancel',
          type: 'action',
          action: 'test.invoice.cancel',
          input: { invoiceId: '{{steps.bill.output.invoiceId}}' },
        },
        {
          id: 'again',
          type: 'action',
          action: 'test.invoice.cancel',
          input: { invoiceId: '{{steps.bill.output.invoiceId}}' },
        },
        {
          id: 'refund',
          type: 'action',
          action: 'test.invoice.refund',
          input: { invoiceId: '{{event.payload.invoiceId}}' },
        },
      ]),
    );

    await t.owner().payments.recordPayment({
      amount: 5_000,
      currency: 'MNT',
      description: 'Cash sale',
      referenceType: 'order',
      referenceId: 'cash-1',
      method: 'cash',
    });
    await t.retriedOut(id);

    const outputs = await t.outputsOf(id);
    const { invoiceId } = InvoiceOutput.parse(outputs.bill);

    expect((await t.runsOf(id))[0]).toMatchObject({
      status: 'failed',
      error: "That invoice didn't go through Test",
    });
    expect(await t.owner().payments.getInvoice({ id: invoiceId })).toMatchObject({
      status: 'cancelled',
      referenceType: 'automation',
      referenceId: id,
      description: 'Cash follow-up',
    });
    expect(outputs.cancel).toMatchObject({ invoiceId, status: 'cancelled' });
    expect(outputs.again).toMatchObject({ invoiceId, status: 'cancelled' });
  });
});
