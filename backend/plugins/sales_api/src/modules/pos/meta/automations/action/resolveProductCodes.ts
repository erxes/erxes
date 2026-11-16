import { sendTRPCMessage } from 'erxes-api-shared/utils';

type TProductRef = { _id: string; code?: string };

export type TFindProductsByCodes = (codes: string[]) => Promise<TProductRef[]>;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const parseItems = (value: unknown): unknown[] | null => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const codeOf = (item: unknown) => {
  const record = toRecord(item);
  const code = record.code;

  return !record.productId && typeof code === 'string' && code.trim()
    ? code.trim()
    : '';
};

/**
 * Order lines may name a product by its code, which is what an AI agent knows
 * from the knowledge and the product lookup; the order needs its id. Prices
 * are left to the POS, which sets them from the product. A code that matches
 * no product fails the step rather than dropping the line.
 */
export const resolveItemProductCodes = async (
  rawItems: unknown,
  findByCodes: TFindProductsByCodes,
) => {
  const items = parseItems(rawItems);
  const codes = [...new Set((items || []).map(codeOf).filter(Boolean))];

  if (!items || !codes.length) {
    return rawItems;
  }

  const products = await findByCodes(codes);
  const idByCode = new Map(
    products.map(({ _id, code }) => [String(code ?? ''), _id]),
  );
  const missing = codes.filter((code) => !idByCode.has(code));

  if (missing.length) {
    throw new Error(`No product with code: ${missing.join(', ')}`);
  }

  return items.map((item) => {
    const code = codeOf(item);
    return code ? { ...toRecord(item), productId: idByCode.get(code) } : item;
  });
};

export const findProductsByCodes =
  (subdomain: string): TFindProductsByCodes =>
  (codes) =>
    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { code: { $in: codes }, status: { $ne: 'deleted' } },
        limit: codes.length,
        fields: { _id: 1, code: 1 },
      },
      defaultValue: [],
    });
