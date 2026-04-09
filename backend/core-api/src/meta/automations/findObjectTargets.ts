import {
  TAutomationFindObjectTargetDefinition,
  TAutomationFindObjectType,
  TAutomationFindObjectResult,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  COMPANY_TRIGGER_OUTPUT,
  CUSTOMER_TRIGGER_OUTPUT,
  TEAM_MEMBER_TRIGGER_OUTPUT,
} from './triggerOutputs';

type TFindObjectTarget = {
  label: string;
  lookupFields: TAutomationFindObjectTargetDefinition['lookupFields'];
  getCollection: (models: IModels) => any;
  generateFilter: (field: string, value: string) => Record<string, any> | null;
  output: TAutomationFindObjectTargetDefinition['output'];
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

export const CORE_FIND_OBJECT_TARGETS: Record<
  TAutomationFindObjectType,
  TFindObjectTarget
> = {
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
  }));

export const buildFindObjectResult = ({
  objectType,
  field,
  value,
  doc,
}: {
  objectType: TAutomationFindObjectType;
  field: string;
  value: string;
  doc?: Record<string, any> | null;
}): TAutomationFindObjectResult => ({
  found: !!doc,
  objectType,
  objectId: doc?._id,
  object: doc || null,
  matchedBy: {
    field,
    value,
  },
});
