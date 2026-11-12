import { type GatewayDriver, GatewayError } from './types';

/**
 * Development and tests: nothing leaves the server. Core's `test-pay` sets
 * `testPaid` on the invoice; `testRefundFails` makes refunds fail.
 */
export const testDriver = (): GatewayDriver => ({
  kind: 'test',
  refunds: 'partial',
  async verify() {},
  async createInvoice(input) {
    return {
      gatewayInvoiceId: `test_${input.invoiceId}`,
      payment: { qrText: `TEST:${input.invoiceId}`, qrImage: null, shortUrl: null, links: [] },
    };
  },
  async check(gatewayInvoiceId, amount, state) {
    const paid = state.testPaid === true;

    return { paid, paidAmount: paid ? amount : 0, paymentId: paid ? `pay_${gatewayInvoiceId}` : null };
  },
  async cancel() {},
  async refund(input, state) {
    if (state.testRefundFails === true) throw new GatewayError('The test gateway refused the refund');

    return { refundId: `refund_${input.paymentId}_${input.amount}` };
  },
});
