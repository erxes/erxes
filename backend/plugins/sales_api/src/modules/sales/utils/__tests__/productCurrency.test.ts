import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { normalizeProductCurrencies } from '../productCurrency';
import type { IProductData } from '../../@types/deal';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const getConfig = jest.mocked(sendTRPCMessage);
const row = (currency: string): IProductData => ({
  productId: 'product',
  uom: 'pcs',
  currency,
  quantity: 1,
  unitPrice: 100,
  globalUnitPrice: 100,
  unitPricePercent: 100,
});

beforeEach(() => getConfig.mockReset());

it('defaults blank currencies using the tenant config and preserves explicit currencies', async () => {
  getConfig.mockResolvedValue(['USD', 'MNT']);
  const result = await normalizeProductCurrencies('tenant', [
    row(''),
    row('  '),
    row('EUR'),
  ]);
  expect(result.map((product) => product.currency)).toEqual([
    'USD',
    'USD',
    'EUR',
  ]);
  expect(getConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenant',
      module: 'configs',
      action: 'getConfig',
      input: { code: 'dealCurrency', defaultValue: ['MNT'] },
    }),
  );
});

it('uses MNT when no currency is configured', async () => {
  getConfig.mockResolvedValue([]);
  expect(
    (await normalizeProductCurrencies('tenant', [row('')]))[0].currency,
  ).toBe('MNT');
});

it('does not load configuration when all currencies are explicit', async () => {
  const rows = [row('EUR')];
  expect(await normalizeProductCurrencies('tenant', rows)).toBe(rows);
  expect(getConfig).not.toHaveBeenCalled();
});

it('propagates configuration failures instead of silently choosing another currency', async () => {
  getConfig.mockRejectedValue(new Error('Config unavailable'));
  await expect(normalizeProductCurrencies('tenant', [row('')])).rejects.toThrow(
    'Config unavailable',
  );
});
