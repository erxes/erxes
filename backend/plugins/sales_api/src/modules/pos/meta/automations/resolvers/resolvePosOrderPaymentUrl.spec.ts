import { resolvePosOrderPaymentUrlWithDependencies } from './resolvePosOrderPaymentUrl';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));

describe('resolvePosOrderPaymentUrlWithDependencies', () => {
  it('generates a payment URL from the order and POS configuration', async () => {
    const generateInvoiceUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://example.com/invoice/invoice-1' });

    const result = await resolvePosOrderPaymentUrlWithDependencies({
      orderId: 'order-1',
      dependencies: {
        getOrder: jest.fn().mockResolvedValue({
          _id: 'order-1',
          finalAmount: 25000,
          number: '1001',
          posId: 'pos-1',
        }),
        getPos: jest.fn().mockResolvedValue({
          paymentIds: ['payment-1'],
        }),
        generateInvoiceUrl,
      },
    });

    expect(generateInvoiceUrl).toHaveBeenCalledWith({
      amount: 25000,
      contentType: 'sales:pos.orders',
      contentTypeId: 'order-1',
      currency: 'MNT',
      customerId: undefined,
      customerType: undefined,
      description: 'POS order 1001',
      paymentIds: ['payment-1'],
    });
    expect(result).toBe('https://example.com/invoice/invoice-1');
  });

  it('does not generate an invoice without configured online payments', async () => {
    const generateInvoiceUrl = jest.fn();

    const result = await resolvePosOrderPaymentUrlWithDependencies({
      orderId: 'order-1',
      dependencies: {
        getOrder: jest.fn().mockResolvedValue({
          _id: 'order-1',
          finalAmount: 25000,
          number: '1001',
          posId: 'pos-1',
        }),
        getPos: jest.fn().mockResolvedValue({ paymentIds: [] }),
        generateInvoiceUrl,
      },
    });

    expect(generateInvoiceUrl).not.toHaveBeenCalled();
    expect(result).toBe('');
  });
});
