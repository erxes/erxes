import {
  TAutomationFindObjectTargetDefinition,
  TAutomationFindObjectType,
  TAutomationFindObjectResult,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SECRET_USER_FIELDS_PROJECTION } from '~/modules/organization/team-member/loggedUser';
import { PRODUCT_STATUSES } from '@/products/constants';
import { toProductStockView } from '@/products/meta/productStock';
import {
  COMPANY_TRIGGER_OUTPUT,
  CUSTOMER_TRIGGER_OUTPUT,
  TEAM_MEMBER_TRIGGER_OUTPUT,
} from './triggerOutputs';

type TFindObjectTarget = {
  label: string;
  lookupFields: TAutomationFindObjectTargetDefinition['lookupFields'];
  getCollection: (models: IModels) => {
    findOne: (
      filter: Record<string, unknown>,
      projection?: Record<string, 0>,
      options?: { sort: Record<string, -1> },
    ) => {
      lean: () => Promise<Record<string, unknown> | null>;
    };
  };
  // Fields never handed to an automation run, its history or an agent
  projection?: Record<string, 0>;
  generateFilter: (
    field: string,
    value: string,
  ) => Record<string, unknown> | null;
  output: TAutomationFindObjectTargetDefinition['output'];
  lookup?: TAutomationFindObjectTargetDefinition['lookup'];
  // The record as a run reads it, when that differs from the stored document
  toObject?: (
    models: IModels,
    doc: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
};

export const CORE_PRODUCT_FIND_OBJECT_TYPE = 'core:products.products';

const generateProductFilter = (field: string, value: string) => {
  const base = { status: { $ne: PRODUCT_STATUSES.DELETED } };

  if (field === '_id') {
    return { ...base, _id: value };
  }

  if (field === 'code') {
    return { ...base, code: value };
  }

  return null;
};

const generateCompanyFilter = (field: string, value: string) => {
  const base = { status: { $ne: 'deleted' } };

  if (field === '_id') {
    return { ...base, _id: value };
  }

  if (field === 'code') {
    return { ...base, code: value };
  }

  if (field === 'primaryName') {
    return {
      ...base,
      $or: [{ primaryName: value }, { names: { $in: [value] } }],
    };
  }

  if (field === 'primaryEmail') {
    return {
      ...base,
      $or: [{ primaryEmail: value }, { emails: { $in: [value] } }],
    };
  }

  if (field === 'primaryPhone') {
    return {
      ...base,
      $or: [{ primaryPhone: value }, { phones: { $in: [value] } }],
    };
  }

  return null;
};

const generateCustomerFilter = (field: string, value: string) => {
  const base = { status: { $ne: 'deleted' } };

  if (field === '_id') {
    return { ...base, _id: value };
  }

  if (field === 'code') {
    return { ...base, code: value };
  }

  if (field === 'primaryEmail') {
    return {
      ...base,
      $or: [{ primaryEmail: value }, { emails: { $in: [value] } }],
    };
  }

  if (field === 'primaryPhone') {
    return {
      ...base,
      $or: [{ primaryPhone: value }, { phones: { $in: [value] } }],
    };
  }

  return null;
};

const generateUserFilter = (field: string, value: string) => {
  if (field === '_id') {
    return { _id: value };
  }

  if (field === 'email') {
    return { email: value };
  }

  if (field === 'username') {
    return { username: value };
  }

  if (field === 'employeeId') {
    return { employeeId: value };
  }

  if (field === 'code') {
    return { code: value };
  }

  return null;
};

export const CORE_FIND_OBJECT_TARGETS: Record<string, TFindObjectTarget> = {
  [CORE_PRODUCT_FIND_OBJECT_TYPE]: {
    label: 'Product',
    lookupFields: [
      { value: '_id', label: 'ID' },
      { value: 'code', label: 'Code' },
    ],
    getCollection: (models) => models.Products,
    generateFilter: generateProductFilter,
    output: {
      variables: [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'unitPrice', label: 'Unit price' },
        { key: 'currency', label: 'Currency' },
        { key: 'uom', label: 'Unit' },
        { key: 'stockTracked', label: 'Stock tracked' },
        { key: 'remainder', label: 'In stock' },
        { key: 'branches', label: 'Stock by branch' },
      ],
    },
    lookup: {
      description:
        'A product\'s price and stock as they are now, found by the product code from the knowledge. remainder is the total in stock and branches splits it by branch. When stockTracked is false stock is not tracked: say nothing about availability.',
      byFields: ['code'],
    },
    toObject: (models, doc) =>
      toProductStockView(models, doc as Parameters<typeof toProductStockView>[1]),
  },
  [TAutomationFindObjectType.COMPANY]: {
    label: 'Company',
    lookupFields: [
      { value: '_id', label: 'ID' },
      { value: 'code', label: 'Code' },
      { value: 'primaryName', label: 'Primary Name' },
      { value: 'primaryEmail', label: 'Primary Email' },
      { value: 'primaryPhone', label: 'Primary Phone' },
    ],
    getCollection: (models) => models.Companies,
    generateFilter: generateCompanyFilter,
    output: COMPANY_TRIGGER_OUTPUT,
  },
  [TAutomationFindObjectType.CUSTOMER]: {
    label: 'Customer',
    lookupFields: [
      { value: '_id', label: 'ID' },
      { value: 'code', label: 'Code' },
      { value: 'primaryEmail', label: 'Primary Email' },
      { value: 'primaryPhone', label: 'Primary Phone' },
    ],
    getCollection: (models) => models.Customers,
    generateFilter: generateCustomerFilter,
    output: CUSTOMER_TRIGGER_OUTPUT,
    lookup: {
      description:
        "The customer's own profile as it is now: name, email, phone and status. Call it before stating anything about the customer.",
      customerField: '_id',
    },
  },
  [TAutomationFindObjectType.USER]: {
    label: 'Team member',
    lookupFields: [
      { value: '_id', label: 'ID' },
      { value: 'email', label: 'Email' },
      { value: 'username', label: 'Username' },
      { value: 'code', label: 'Code' },
      { value: 'employeeId', label: 'Employee ID' },
    ],
    getCollection: (models) => models.Users,
    projection: SECRET_USER_FIELDS_PROJECTION,
    generateFilter: generateUserFilter,
    output: TEAM_MEMBER_TRIGGER_OUTPUT,
  },
};

export const CORE_FIND_OBJECT_TARGETS_CONST: TAutomationFindObjectTargetDefinition[] =
  Object.entries(CORE_FIND_OBJECT_TARGETS).map(([value, target]) => ({
    value,
    label: target.label,
    lookupFields: target.lookupFields,
    output: target.output,
    ...(target.lookup ? { lookup: target.lookup } : {}),
  }));

export const buildFindObjectResult = ({
  objectType,
  field,
  value,
  doc,
}: {
  objectType: string;
  field: string;
  value: string;
  doc?: Record<string, unknown> | null;
}): TAutomationFindObjectResult => ({
  found: !!doc,
  objectType,
  objectId:
    typeof doc?._id === 'string'
      ? doc._id
      : doc?._id
        ? String(doc._id)
        : undefined,
  object: doc || null,
  matchedBy: {
    field,
    value,
  },
});
