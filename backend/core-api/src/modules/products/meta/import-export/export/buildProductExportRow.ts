import { defaultContactFieldFormatter } from './utils'; 
import { toPlainText } from './exportText';

type Maps = {
  categoryMap: Map<string, string>;
  vendorMap: Map<string, string>;
  tagMap: Map<string, string>;
  brandMap: Map<string, string>;
};

const stripHtml = (input: string) => input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const extractTextFromBlocks = (val: any): string => {

  const texts: string[] = [];

  const walk = (node: any) => {
    if (!node) return;

    if (typeof node === 'string') {
      texts.push(node);
      return;
    }

    if (Array.isArray(node)) {
      for (const n of node) walk(n);
      return;
    }

    if (typeof node === 'object') {
      if (typeof node.text === 'string') texts.push(node.text);
      if (Array.isArray(node.content)) walk(node.content);
      if (Array.isArray(node.children)) walk(node.children);

      if (node.type === 'text' && typeof node.text === 'string') texts.push(node.text);

      for (const k of Object.keys(node)) {
        if (k === 'text' || k === 'content' || k === 'children') continue;
        walk(node[k]);
      }
    }
  };

  walk(val);
  return texts.join(' ').replace(/\s+/g, ' ').trim();
};

const normalizeDescription = (value: any): string => {
  if (value === null || value === undefined) return '';

  if (typeof value === 'object') {
    return extractTextFromBlocks(value);
  }

  const str = String(value).trim();
  if (!str) return '';

  if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
    try {
      const parsed = JSON.parse(str);
      const txt = extractTextFromBlocks(parsed);
      return txt || '';
    } catch {
    }
  }

  if (/<[a-z][\s\S]*>/i.test(str)) {
    return stripHtml(str);
  }

  return str;
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
  const brandNames = joinNames(product.scopeBrandIds || [], maps?.brandMap || new Map());

  const allFields: Record<string, any> = {
    _id: formatValue(product._id), 
    name: formatValue(product.name),
    code: formatValue(product.code),
    unitPrice: formatValue(product.unitPrice),

    tagIds: formatValue(tagNames),
    scopeBrandIds: formatValue(brandNames),

    shortName: formatValue(product.shortName),
    description: formatValue(toPlainText(product.description)),
    uom: formatValue(product.uom),
    status: formatValue(product.status),
    type: formatValue(product.type),

    categoryId: formatValue(categoryName), 
    vendorId: formatValue(vendorName),

    barcodes: formatValue(Array.isArray(product.barcodes) ? product.barcodes.join('; ') : product.barcodes),
    barcodeDescription: formatValue(toPlainText(product.barcodeDescription)),
    currency: formatValue(product.currency),

    createdAt: formatValue(product.createdAt ? new Date(product.createdAt) : ''),
    updatedAt: formatValue(product.updatedAt ? new Date(product.updatedAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(product._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
