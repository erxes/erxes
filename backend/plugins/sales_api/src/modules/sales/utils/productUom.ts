import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IProductData } from '../@types/deal';

const precise = (value: number): number => Number(value.toPrecision(15));

export const syncProductUomInfo = (
  productsData: IProductData[],
): IProductData[] =>
  productsData.map((product) => {
    const info = product.uomInfo;
    if (!info) return product;
    const ratio = info.ratio || 1;
    return {
      ...product,
      uomInfo: {
        ...info,
        unitPrice:
          ratio === 1 ? product.unitPrice : precise(product.unitPrice / ratio),
        quantity:
          ratio === 1 ? product.quantity : precise(product.quantity * ratio),
      },
    };
  });

const getMissingBaseUoms = async (
  subdomain: string,
  productsData: IProductData[],
): Promise<Map<string, string>> => {
  const missingBaseIds = [
    ...new Set(
      productsData
        .filter((product) => product.uomInfo && !product.uom?.trim())
        .map((product) => product.productId),
    ),
  ];
  const baseUoms = new Map<string, string>();
  if (missingBaseIds.length) {
    const products: unknown = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      method: 'query',
      input: {
        query: { _id: { $in: missingBaseIds } },
        fields: { _id: 1, uom: 1 },
        limit: missingBaseIds.length,
      },
    });
    if (Array.isArray(products)) {
      for (const product of products as unknown[]) {
        if (
          product &&
          typeof product === 'object' &&
          '_id' in product &&
          'uom' in product &&
          typeof product._id === 'string' &&
          typeof product.uom === 'string'
        ) {
          baseUoms.set(product._id, product.uom);
        }
      }
    }
  }
  return baseUoms;
};

export const normalizeProductUomInfo = async (
  subdomain: string,
  productsData: IProductData[],
): Promise<IProductData[]> => {
  const baseUoms = await getMissingBaseUoms(subdomain, productsData);
  return productsData.map((product) => {
    const input = product.uomInfo;
    if (!input) return product;
    if (input.uom != null && typeof input.uom !== 'string') {
      throw new Error('UOM info unit must be a string');
    }
    const baseUom = product.uom?.trim() || baseUoms.get(product.productId);
    if (!baseUom) throw new Error('Product base UOM is required');

    if (
      input.ratio != null &&
      (!Number.isFinite(input.ratio) || input.ratio <= 0)
    ) {
      throw new Error('UOM info ratio must be a positive finite number');
    }
    const requestedUom = input.uom?.trim() || baseUom;
    const incompleteSelection = requestedUom !== baseUom && input.ratio == null;
    const selectedUom = incompleteSelection ? baseUom : requestedUom;
    const ratio = selectedUom === baseUom ? 1 : input.ratio ?? 1;
    const unitPrice = incompleteSelection
      ? product.unitPrice
      : input.unitPrice ?? product.unitPrice / ratio;
    const quantity = incompleteSelection
      ? product.quantity
      : input.quantity ?? product.quantity * ratio;
    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      throw new Error(
        'UOM info price and quantity must be finite non-negative numbers',
      );
    }

    // Entry values are authoritative; integrations consume these base-unit fields.
    const result: IProductData = {
      ...product,
      uom: baseUom,
      unitPrice: ratio === 1 ? unitPrice : precise(unitPrice * ratio),
      quantity: ratio === 1 ? quantity : precise(quantity / ratio),
      uomInfo: { uom: selectedUom, ratio, unitPrice, quantity },
    };
    if (
      !Number.isFinite(result.unitPrice) ||
      !Number.isFinite(result.quantity)
    ) {
      throw new Error('UOM info conversion exceeds the supported number range');
    }
    const taxableAmount =
      result.unitPrice * result.quantity - (product.discount || 0);
    result.tax =
      typeof product.taxPercent === 'number'
        ? precise((taxableAmount * product.taxPercent) / 100)
        : product.tax || 0;
    result.amount = precise(taxableAmount + result.tax);
    if (!Number.isFinite(result.amount)) {
      throw new Error('UOM info amount exceeds the supported number range');
    }
    if (selectedUom === baseUom) {
      delete result.uomInfo;
    }
    return result;
  });
};
