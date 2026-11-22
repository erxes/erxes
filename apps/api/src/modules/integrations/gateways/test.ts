import { z } from 'zod';
import { defineIntegration } from '../define';
import { type GatewayDriver, GatewayError } from './types';

/**
 * Development and tests: nothing leaves the server. Core's `test-pay` sets
 * `testPaid` on the invoice; `testCheckFails` makes checks fail, as an
 * unreachable gateway does; `testPaymentIds` offers candidate payments, as
 * transfers matching on a bank statement do; `testRefundFails` makes refunds fail.
 */
const testDriver = (): GatewayDriver => ({
  kind: 'test',
  async verify() {},
  async createInvoice(input) {
    return {
      gatewayInvoiceId: `test_${input.invoiceId}`,
      payment: { qrText: `TEST:${input.invoiceId}`, qrImage: null, shortUrl: null, links: [] },
    };
  },
  async check(gatewayInvoiceId, amount, state) {
    if (state.testCheckFails === true) throw new GatewayError('The test gateway is unreachable');

    const paid = state.testPaid === true;

    const paymentIds = Array.isArray(state.testPaymentIds)
      ? state.testPaymentIds.map(String)
      : undefined;

    return {
      paid,
      paidAmount: paid ? amount : 0,
      paymentId: paid ? (paymentIds?.[0] ?? `pay_${gatewayInvoiceId}`) : null,
      ...(paymentIds && { paymentIds }),
    };
  },
  async cancel() {},
  async refund(input, state) {
    if (state.testRefundFails === true)
      throw new GatewayError('The test gateway refused the refund');

    return { refundId: `refund_${input.paymentId}_${input.amount}` };
  },
});

export const test = defineIntegration({
  key: 'test',
  name: 'Test',
  summary: 'Nothing is charged: for trying out plugins.',
  category: 'payments',
  countries: [],
  permission: 'payments.manage',
  keys: z.object({}),
  verify: () => testDriver().verify(),
  payments: { currencies: [], refunds: 'partial', pays: 'test', driver: testDriver },
});
