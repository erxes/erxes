import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getProductPricing } from '../getProductPricing';

jest.mock('erxes-api-shared/utils', () => ({
  chunkArray: <T>(items: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
      items.slice(index * size, (index + 1) * size),
    ),
  sendTRPCMessage: jest.fn(),
}));

const sendMessage = jest.mocked(sendTRPCMessage);
const pos = { branchId: 'branch', departmentId: 'department' };
const makeProducts = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    _id: `product-${index}`,
    unitPrice: 1000 + index,
  }));

beforeEach(() => {
  sendMessage.mockReset();
});

it('merges over 10000 catalog prices with at most four concurrent requests', async () => {
  let activeCalls = 0;
  let maxActiveCalls = 0;
  sendMessage.mockImplementation(async ({ input }) => {
    activeCalls++;
    maxActiveCalls = Math.max(maxActiveCalls, activeCalls);
    await Promise.resolve();
    const items: { itemId: string; price: number }[] = input.products;
    activeCalls--;
    return Object.fromEntries(
      items.map((item) => [item.itemId, { value: item.price / 10 }]),
    );
  });

  const products = makeProducts(10001);
  const pricing = await getProductPricing('tenant', pos, products);

  expect(sendMessage).toHaveBeenCalledTimes(101);
  expect(maxActiveCalls).toBe(4);
  expect(Object.keys(pricing)).toHaveLength(products.length);
  expect(pricing['product-99']).toEqual({ value: 109.9 });
  expect(pricing['product-100']).toEqual({ value: 110 });
  expect(pricing['product-10000']).toEqual({ value: 1100 });

  const requestedIds: string[] = [];
  for (const [request] of sendMessage.mock.calls) {
    expect(request).toMatchObject({
      subdomain: 'tenant',
      pluginName: 'loyalty',
      module: 'pricing',
      action: 'checkPricing',
      throwOnError: true,
      defaultValue: {},
      input: {
        prioritizeRule: 'only',
        totalAmount: 0,
        ...pos,
      },
    });
    const items: { itemId: string; productId: string; quantity: number }[] =
      request.input.products;
    expect(items.length).toBeLessThanOrEqual(100);
    for (const item of items) {
      expect(item.productId).toBe(item.itemId);
      expect(item.quantity).toBe(1);
      requestedIds.push(item.itemId);
    }
  }
  expect(requestedIds).toEqual(products.map((product) => product._id));
});

it('skips pricing requests for an empty catalog', async () => {
  await expect(getProductPricing('tenant', pos, [])).resolves.toEqual({});
  expect(sendMessage).not.toHaveBeenCalled();
});

it('keeps earlier discounts when another batch has no pricing', async () => {
  sendMessage
    .mockResolvedValueOnce({ 'product-0': { value: 100 } })
    .mockResolvedValueOnce({});

  await expect(
    getProductPricing('tenant', pos, makeProducts(101)),
  ).resolves.toEqual({ 'product-0': { value: 100 } });
});

it('rejects a failed batch and does not start the next four-batch wave', async () => {
  sendMessage
    .mockResolvedValueOnce({ 'product-0': { value: 100 } })
    .mockRejectedValueOnce(new Error('Pricing unavailable'))
    .mockResolvedValue({});

  await expect(
    getProductPricing('tenant', pos, makeProducts(501)),
  ).rejects.toThrow('Pricing unavailable');
  expect(sendMessage).toHaveBeenCalledTimes(4);
});
