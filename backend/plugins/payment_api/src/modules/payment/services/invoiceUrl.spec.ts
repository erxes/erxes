import { resolveInvoiceUrl, TInvoiceUrlInput } from './invoiceUrl';

jest.mock('erxes-api-shared/utils', () => ({
  getEnv: jest.fn(({ name }: { name: string }) =>
    name === 'DOMAIN' ? 'https://<subdomain>.example.com' : '',
  ),
}));

const input: TInvoiceUrlInput = {
  amount: 25000,
  contentType: 'sales:pos.orders',
  contentTypeId: 'order-1',
  paymentIds: ['payment-1'],
};

describe('resolveInvoiceUrl', () => {
  it('reuses an existing pending invoice', async () => {
    const createInvoice = jest.fn();
    const result = await resolveInvoiceUrl({
      input,
      subdomain: 'acme',
      dependencies: {
        createInvoice,
        findPendingInvoice: jest.fn().mockResolvedValue({ _id: 'invoice-1' }),
      },
    });

    expect(createInvoice).not.toHaveBeenCalled();
    expect(result.invoiceId).toBe('invoice-1');
    expect(result.url).toContain('/pl:payment/widget/invoice/invoice-1');
  });

  it('creates an invoice when no reusable invoice exists', async () => {
    const createInvoice = jest.fn().mockResolvedValue({ _id: 'invoice-2' });
    const result = await resolveInvoiceUrl({
      input,
      subdomain: 'acme',
      dependencies: {
        createInvoice,
        findPendingInvoice: jest.fn().mockResolvedValue(null),
      },
    });

    expect(createInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 25000,
        contentType: 'sales:pos.orders',
        contentTypeId: 'order-1',
        currency: 'MNT',
        paymentIds: ['payment-1'],
      }),
    );
    expect(result.invoiceId).toBe('invoice-2');
  });

  it('rejects invoice generation without online payment methods', async () => {
    await expect(
      resolveInvoiceUrl({
        input: { ...input, paymentIds: [] },
        subdomain: 'acme',
        dependencies: {
          createInvoice: jest.fn(),
          findPendingInvoice: jest.fn(),
        },
      }),
    ).rejects.toThrow('paymentIds is required');
  });
});
