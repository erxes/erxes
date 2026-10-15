import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IProductData } from '../@types/deal';

export const normalizeProductCurrencies = async (
  subdomain: string,
  productsData: IProductData[],
): Promise<IProductData[]> => {
  if (!productsData.some((product) => !product.currency?.trim())) {
    return productsData;
  }

  const currencies: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'configs',
    action: 'getConfig',
    method: 'query',
    input: { code: 'dealCurrency', defaultValue: ['MNT'] },
  });
  const firstCurrency: unknown = Array.isArray(currencies)
    ? currencies[0]
    : undefined;
  const defaultCurrency =
    typeof firstCurrency === 'string' && firstCurrency.trim()
      ? firstCurrency
      : 'MNT';

  return productsData.map((product) => ({
    ...product,
    currency: product.currency?.trim() ? product.currency : defaultCurrency,
  }));
};
