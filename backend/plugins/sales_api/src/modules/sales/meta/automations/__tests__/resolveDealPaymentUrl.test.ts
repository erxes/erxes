import { resolveDealPaymentUrlWithDependencies } from '../resolveDealPaymentUrl';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));

const deal = {
  _id: 'deal-1',
  number: 'D-7',
  stageId: 'stage-1',
  totalAmount: 50000,
  mobileAmount: 20000,
  customerId: 'customer-1',
  productsData: [{ currency: 'MNT', tickUsed: true }],
};

const setup = (overrides: Partial<typeof deal> = {}, paymentIds = ['qpay-1']) => {
  const generateInvoiceUrl = jest
    .fn()
    .mockResolvedValue({ url: 'https://pay.example/invoice-1' });

  return {
    generateInvoiceUrl,
    dependencies: {
      getDeal: jest.fn().mockResolvedValue({ ...deal, ...overrides }),
      getPaymentIds: jest.fn().mockResolvedValue(paymentIds),
      generateInvoiceUrl,
    },
  };
};

describe('resolveDealPaymentUrlWithDependencies', () => {
  it('asks for what is still owed, as a sales:deal invoice', async () => {
    const { dependencies, generateInvoiceUrl } = setup();

    await expect(
      resolveDealPaymentUrlWithDependencies({
        source: { targetId: 'deal-1' },
        dependencies,
      }),
    ).resolves.toBe('https://pay.example/invoice-1');

    expect(generateInvoiceUrl).toHaveBeenCalledWith({
      amount: 30000,
      currency: 'MNT',
      description: 'Deal D-7',
      customerId: 'customer-1',
      customerType: 'customer',
      contentType: 'sales:deal',
      contentTypeId: 'deal-1',
      paymentIds: ['qpay-1'],
    });
  });

  it('reads the deal id from a trigger source too', async () => {
    const { dependencies } = setup();

    await resolveDealPaymentUrlWithDependencies({
      source: { _id: 'deal-1' },
      dependencies,
    });

    expect(dependencies.getDeal).toHaveBeenCalledWith('deal-1');
  });

  it('gives no link when the deal is paid in full', async () => {
    const { dependencies, generateInvoiceUrl } = setup({ mobileAmount: 50000 });

    await expect(
      resolveDealPaymentUrlWithDependencies({ source: { targetId: 'deal-1' }, dependencies }),
    ).resolves.toBe('');
    expect(generateInvoiceUrl).not.toHaveBeenCalled();
  });

  it('gives no link when the pipeline has no online payment', async () => {
    const { dependencies, generateInvoiceUrl } = setup({}, []);

    await expect(
      resolveDealPaymentUrlWithDependencies({ source: { targetId: 'deal-1' }, dependencies }),
    ).resolves.toBe('');
    expect(generateInvoiceUrl).not.toHaveBeenCalled();
  });
});
