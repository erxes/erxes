import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';

export interface IPosCustomerFormField {
  code: string;
  name: string;
  type: string;
  isSystem: boolean;
  options?: { label: string; value: string }[];
}

export interface IPosCustomerInput {
  [code: string]: unknown;
}

interface ICorePropertyField {
  _id: string;
  name: string;
  type: string;
  options?: { label: string; value: string; deprecated?: boolean }[];
}

const PROPERTY_PREFIX = 'property:';

// Names are the frontend's to translate; the type picks its input.
const SYSTEM_FIELDS: Record<string, { name: string; type: string }> = {
  firstName: { name: 'First name', type: 'text' },
  middleName: { name: 'Middle name', type: 'text' },
  lastName: { name: 'Last name', type: 'text' },
  primaryEmail: { name: 'Primary e-mail', type: 'email' },
  primaryPhone: { name: 'Primary phone', type: 'phone' },
  code: { name: 'Code', type: 'text' },
  sex: { name: 'Pronoun', type: 'sex' },
  birthDate: { name: 'Birthday', type: 'date' },
  description: { name: 'Description', type: 'textarea' },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{6,20}$/;

export const canCreateCustomer = (
  config?: IConfigDocument,
  posUser?: IPosUserDocument,
) => {
  if (!config || !posUser || !config.customerCreateConfig?.enabled) {
    return false;
  }

  if ((config.adminIds || []).includes(posUser._id)) {
    return true;
  }

  return (
    (config.cashierIds || []).includes(posUser._id) &&
    !!config.permissionConfig?.cashiers?.createCustomer
  );
};

const fetchProperties = async (
  subdomain: string,
  ids: string[],
): Promise<ICorePropertyField[]> => {
  if (!ids.length) {
    return [];
  }

  return sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'core',
    module: 'fields',
    action: 'find',
    input: {
      query: { _id: { $in: ids }, contentType: 'core:customer' },
      projection: { _id: 1, name: 1, type: 1, options: 1 },
    },
    defaultValue: [],
  });
};

// Deleted or archived properties drop out of the form silently.
export const resolveCustomerForm = async (
  subdomain: string,
  layout: string[][],
): Promise<IPosCustomerFormField[][]> => {
  const propertyIds = layout
    .flat()
    .filter((code) => code.startsWith(PROPERTY_PREFIX))
    .map((code) => code.slice(PROPERTY_PREFIX.length));

  const properties = await fetchProperties(subdomain, propertyIds);
  const propertyById = new Map(properties.map((field) => [field._id, field]));

  const toField = (code: string): IPosCustomerFormField | null => {
    if (SYSTEM_FIELDS[code]) {
      return { code, ...SYSTEM_FIELDS[code], isSystem: true };
    }

    const property = propertyById.get(code.slice(PROPERTY_PREFIX.length));

    if (!property) {
      return null;
    }

    return {
      code,
      name: property.name,
      type: property.type,
      isSystem: false,
      options: (property.options || [])
        .filter((option) => !option.deprecated)
        .map(({ label, value }) => ({ label, value })),
    };
  };

  return layout
    .map((row) =>
      row
        .map(toField)
        .filter((field): field is IPosCustomerFormField => !!field),
    )
    .filter((row) => row.length);
};

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && !value.length);

// Only what the layout places reaches core; anything else is dropped.
export const buildCustomerDoc = (
  layout: string[][],
  input: IPosCustomerInput,
) => {
  const placed = new Set(layout.flat());
  const doc: Record<string, unknown> = {};
  const propertiesData: Record<string, unknown> = {};

  for (const [code, rawValue] of Object.entries(input)) {
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (!placed.has(code) || isEmpty(value)) {
      continue;
    }

    if (code.startsWith(PROPERTY_PREFIX)) {
      propertiesData[code.slice(PROPERTY_PREFIX.length)] = value;
      continue;
    }

    if (SYSTEM_FIELDS[code]) {
      doc[code] = code === 'sex' ? Number(value) : value;
    }
  }

  if (!doc.primaryEmail && !doc.primaryPhone) {
    throw new Error('E-mail or phone is required');
  }

  if (doc.primaryEmail && !EMAIL_PATTERN.test(String(doc.primaryEmail))) {
    throw new Error('Invalid e-mail');
  }

  if (doc.primaryPhone && !PHONE_PATTERN.test(String(doc.primaryPhone))) {
    throw new Error('Invalid phone');
  }

  if (Object.keys(propertiesData).length) {
    doc.propertiesData = propertiesData;
  }

  return doc;
};

// Mirrors core's duplication check so the cashier can pick the existing one.
export const findDuplicateCustomer = async (
  subdomain: string,
  doc: Record<string, unknown>,
) => {
  const or = ['primaryEmail', 'primaryPhone', 'code']
    .filter((key) => doc[key])
    .map((key) => ({ [key]: doc[key] }));

  if (!or.length) {
    return null;
  }

  const [duplicate] = await sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'core',
    module: 'customers',
    action: 'findActiveCustomers',
    input: {
      query: { $or: or },
      fields: {
        _id: 1,
        code: 1,
        primaryPhone: 1,
        primaryEmail: 1,
        firstName: 1,
        lastName: 1,
      },
      limit: 1,
    },
    defaultValue: [],
  });

  return duplicate || null;
};
