import { ICustomField } from 'erxes-api-shared/core-types';
import { IDeal, IProductData } from '~/modules/sales/@types';

const listSeparators = /[,;|\n]/;

export const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  return String(value)
    .split(listSeparators)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }

    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', ''].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const parseJSONValue = (value: unknown, label: string): unknown => {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error: any) {
    throw new Error(
      `Invalid ${label} JSON: ${error?.message || 'Unable to parse value'}`,
    );
  }
};

const parseProductsData = (value: unknown): IProductData[] | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = parseJSONValue(value, 'Products');

  if (!Array.isArray(parsed)) {
    throw new Error('Products JSON must be an array');
  }

  return parsed.map((productData) => {
    if (!productData?.productId) {
      throw new Error('Every product row must include productId');
    }

    return {
      ...productData,
      quantity: parseNumber(productData.quantity) ?? 1,
      unitPrice: parseNumber(productData.unitPrice) ?? 0,
      globalUnitPrice: parseNumber(productData.globalUnitPrice) ?? 0,
      unitPricePercent: parseNumber(productData.unitPricePercent) ?? 0,
      amount: parseNumber(productData.amount),
      tickUsed: parseBoolean(productData.tickUsed),
      isVatApplied: parseBoolean(productData.isVatApplied),
    };
  });
};

export const parseCustomFieldsData = (
  value: unknown,
): ICustomField[] | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = parseJSONValue(value, 'Custom fields');

  if (!Array.isArray(parsed)) {
    throw new Error('Custom fields JSON must be an array');
  }

  return parsed
    .map((item) => ({
      field: String(item?.field || '').trim(),
      value: item?.value,
    }))
    .filter((item) => item.field);
};

export const buildDealImportDoc = (
  row: any,
  userId: string,
  {
    stageId: resolvedStageId,
    assignedUserIds,
    labelIds,
    customerIds,
    companyIds,
    customFieldsData,
  }: {
    stageId?: string;
    assignedUserIds?: string[];
    labelIds?: string[];
    customerIds?: string[];
    companyIds?: string[];
    customFieldsData?: ICustomField[];
  } = {},
): IDeal => {
  const name = String(row.name || '').trim();
  const stageId = String(resolvedStageId || row.stageId || '').trim();

  if (!name) {
    throw new Error('Name is required');
  }

  if (!stageId) {
    throw new Error('Stage ID is required');
  }

  const productsData = parseProductsData(row.productsData);
  const parsedCustomFieldsData = customFieldsData
    ? undefined
    : parseCustomFieldsData(row.customFieldsData);

  return {
    name,
    stageId,
    number: row.number ? String(row.number).trim() : undefined,
    description: row.description,
    priority: row.priority,
    startDate: parseDate(row.startDate),
    closeDate: parseDate(row.closeDate),
    assignedUserIds: assignedUserIds ?? parseList(row.assignedUserIds),
    watchedUserIds: parseList(row.watchedUserIds),
    labelIds: labelIds ?? parseList(row.labelIds),
    tagIds: parseList(row.tagIds),
    branchIds: parseList(row.branchIds),
    departmentIds: parseList(row.departmentIds),
    customerIds: customerIds ?? parseList(row.customerIds),
    companyIds: companyIds ?? parseList(row.companyIds),
    productsData,
    customFieldsData: customFieldsData ?? parsedCustomFieldsData,
    initialStageId: stageId,
    userId,
    modifiedBy: userId,
  };
};
