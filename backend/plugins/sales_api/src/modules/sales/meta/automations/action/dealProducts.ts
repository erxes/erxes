import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IProductData } from '~/modules/sales/@types';

export type TDealProductLine = {
  productId: string;
  quantity: number;
  unitPrice?: number;
};

type TCatalogProduct = {
  _id: string;
  name?: string;
  uom?: string;
  unitPrice?: number;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

const toIdList = (value: unknown): string[] =>
  String(value ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const parseItems = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error('Deal items must be a JSON array of lines');
  }
};

/**
 * The lines a Create deal action asks for: `items` when given, otherwise one
 * line per product in `productIds`. A line without a positive quantity is
 * dropped rather than written as an empty row.
 */
export const readDealProductLines = (
  config: Record<string, unknown>,
): TDealProductLine[] => {
  const items = parseItems(config.items);

  if (!items.length) {
    return toIdList(config.productIds).map((productId) => ({
      productId,
      quantity: 1,
    }));
  }

  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as Record<string, unknown>;
    const productId = String(record.productId ?? '').trim();
    // POS lines say `count`; a deal line written that way means the same.
    const quantity = toNumber(record.quantity ?? record.count);

    if (!productId || !quantity || quantity <= 0) {
      return [];
    }

    return [{ productId, quantity, unitPrice: toNumber(record.unitPrice) }];
  });
};

/**
 * Deal product rows for the lines, priced from the line or else the product.
 * Products that no longer exist are left out. Currency and deal totals are
 * filled by `Deals.createDeal`.
 */
export const toDealProductsData = (
  lines: TDealProductLine[],
  products: TCatalogProduct[],
): IProductData[] => {
  const productsById = new Map(products.map((product) => [product._id, product]));

  return lines.flatMap((line) => {
    const product = productsById.get(line.productId);

    if (!product) {
      return [];
    }

    const unitPrice = line.unitPrice ?? product.unitPrice ?? 0;

    return [
      {
        _id: nanoid(),
        productId: product._id,
        name: product.name,
        uom: product.uom,
        quantity: line.quantity,
        unitPrice,
        amount: line.quantity * unitPrice,
        tickUsed: true,
      } as IProductData,
    ];
  });
};

export const buildDealProductsData = async (
  subdomain: string,
  config: Record<string, unknown>,
): Promise<IProductData[] | undefined> => {
  const lines = readDealProductLines(config);

  if (!lines.length) {
    return undefined;
  }

  const productIds = [...new Set(lines.map((line) => line.productId))];
  const products: TCatalogProduct[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'find',
    input: { query: { _id: { $in: productIds } }, limit: productIds.length },
    defaultValue: [],
  });

  return toDealProductsData(lines, products);
};
