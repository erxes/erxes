import { z } from 'zod';
import { defineIntegration, GatewayError } from '@erxes/plugin-sdk/integrations';

/**
 * Development and tests: nothing leaves the server. Core's `test-pay` sets
 * `testPaid` on the invoice; `testCheckFails` makes checks fail, as an
 * unreachable gateway does; `testPaymentIds` offers candidate payments, as
 * transfers matching on a bank statement do; `testRefundFails` makes refunds fail.
 */
export const test = defineIntegration({
  key: 'test',
  name: 'Test',
  summary: 'Nothing is charged: for trying out plugins.',
  category: 'payments',
  countries: [],
  permission: 'payments.manage',
  keys: z.object({}),
  client: () => ({}),
  async verify() {},
  payments: {
    currencies: [],
    refunds: 'partial',
    pays: 'test',
    async createInvoice(_client, input) {
      return {
        gatewayInvoiceId: `test_${input.invoiceId}`,
        payment: { qrText: `TEST:${input.invoiceId}`, qrImage: null, shortUrl: null, links: [] },
      };
    },
    async check(_client, { gatewayInvoiceId, amount, state }) {
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
    async refund(_client, { paymentId, amount, state }) {
      if (state.testRefundFails === true)
        throw new GatewayError('The test gateway refused the refund');

      return { refundId: `refund_${paymentId}_${amount}` };
    },
  },
});
