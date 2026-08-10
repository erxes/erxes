import { resolvePosOrderPaymentUrlWithDependencies } from './resolvePosOrderPaymentUrl';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));

describe('resolvePosOrderPaymentUrlWithDependencies', () => {
  it('generates a payment URL from the node output without reading the order', async () => {
    const generateInvoiceUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://example.com/invoice/invoice-1' });
    const getOrder = jest.fn();

    const result = await resolvePosOrderPaymentUrlWithDependencies({
      source: {
        _id: 'order-1',
        finalAmount: 25000,
        number: '1001',
        posId: 'pos-1',
        posToken: 'pos-token',
      },
      dependencies: {
        getOrder,
        getPos: jest.fn().mockResolvedValue({
          paymentIds: ['payment-1'],
          token: 'pos-token',
        }),
        generateInvoiceUrl,
      },
    });

    expect(getOrder).not.toHaveBeenCalled();
    expect(generateInvoiceUrl).toHaveBeenCalledWith({
      amount: 25000,
      contentType: 'sales:pos.orders',
      contentTypeId: 'order-1',
      currency: 'MNT',
      customerId: undefined,
      customerType: undefined,
      data: { posToken: 'pos-token' },
      description: 'POS order 1001',
      paymentIds: ['payment-1'],
    });
    expect(result).toBe('https://example.com/invoice/invoice-1');
  });

  it('falls back to the stored order when the source carries no amount', async () => {
    const generateInvoiceUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://example.com/invoice/invoice-2' });
    const getOrder = jest.fn().mockResolvedValue({
      _id: 'order-1',
      finalAmount: 12000,
      number: '1002',
      posId: 'pos-1',
    });

    const result = await resolvePosOrderPaymentUrlWithDependencies({
      source: { targetId: 'order-1' },
      dependencies: {
        getOrder,
        getPos: jest.fn().mockResolvedValue({
          paymentIds: ['payment-1'],
          token: 'pos-token',
        }),
        generateInvoiceUrl,
      },
    });

    expect(getOrder).toHaveBeenCalledWith('order-1');
    expect(generateInvoiceUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 12000,
        contentTypeId: 'order-1',
        data: { posToken: 'pos-token' },
      }),
    );
    expect(result).toBe('https://example.com/invoice/invoice-2');
  });

  it('does not generate an invoice without configured online payments', async () => {
    const generateInvoiceUrl = jest.fn();

    const result = await resolvePosOrderPaymentUrlWithDependencies({
      source: {
        _id: 'order-1',
        finalAmount: 25000,
        number: '1001',
        posId: 'pos-1',
      },
      dependencies: {
        getOrder: jest.fn(),
        getPos: jest.fn().mockResolvedValue({ paymentIds: [] }),
        generateInvoiceUrl,
      },
    });

    expect(generateInvoiceUrl).not.toHaveBeenCalled();
    expect(result).toBe('');
  });
});
