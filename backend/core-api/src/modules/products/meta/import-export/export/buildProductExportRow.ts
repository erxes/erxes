import { defaultContactFieldFormatter } from './utils';
import { toPlainText } from './exportText';

type Maps = {
  categoryMap: Map<string, string>;
  vendorMap: Map<string, string>;
  tagMap: Map<string, string>;
  brandMap: Map<string, string>;
};

const joinNames = (ids: any[] | undefined, map: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(String(id)) || '')
    .filter(Boolean)
    .join('; ');
};

export const buildProductExportRow = (
  product: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
  formatter = defaultContactFieldFormatter,
): Record<string, any> => {
  const formatValue = formatter || ((v: any) => (v == null ? '' : String(v)));

  const categoryName = product.categoryId
    ? maps?.categoryMap?.get(String(product.categoryId)) || ''
    : '';

  const vendorName = product.vendorId
    ? maps?.vendorMap?.get(String(product.vendorId)) || ''
    : '';

  const tagNames = joinNames(product.tagIds || [], maps?.tagMap || new Map());
  const brandNames = joinNames(
    product.scopeBrandIds || [],
    maps?.brandMap || new Map(),
  );

  const imageUrl = product.attachment?.url || '';
  const imageUrls = Array.isArray(product.attachmentMore)
    ? product.attachmentMore
        .map((a: any) => a?.url || '')
        .filter(Boolean)
        .join('; ')
    : '';

  const allFields: Record<string, any> = {
    _id: formatValue(product._id),
    name: formatValue(product.name),
    code: formatValue(product.code),
    unitPrice: formatValue(product.unitPrice),

    tags: formatValue(tagNames),
    scopeBrandIds: formatValue(brandNames),

    shortName: formatValue(product.shortName),
    description: formatValue(toPlainText(product.description)),
    uom: formatValue(product.uom),
    status: formatValue(product.status),
    type: formatValue(product.type),

    categoryName: formatValue(categoryName),
    vendorId: formatValue(vendorName),

    barcodes: formatValue(
      Array.isArray(product.barcodes)
        ? product.barcodes.join('; ')
        : product.barcodes,
    ),
    barcodeDescription: formatValue(toPlainText(product.barcodeDescription)),
    currency: formatValue(product.currency),

    imageUrl: formatValue(imageUrl),
    imageUrls: formatValue(imageUrls),

    createdAt: formatValue(
      product.createdAt ? new Date(product.createdAt) : '',
    ),
    updatedAt: formatValue(
      product.updatedAt ? new Date(product.updatedAt) : '',
    ),
  };

  if (product.propertiesData && typeof product.propertiesData === 'object') {
    for (const [fieldId, value] of Object.entries(product.propertiesData)) {
      allFields[`propertiesData.${fieldId}`] = formatValue(value);
    }
  }

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(product._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
