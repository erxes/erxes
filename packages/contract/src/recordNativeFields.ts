import { CUSTOMER_STATES, PRODUCT_KINDS, PRODUCT_STATUSES } from '@erxes/core-db/enums';
import type { DATA_EXTENSION_NATIVE_TYPES } from '@erxes/core-db/dataExtensionEnums';

/**
 * The fields core's record types and custom objects have of their own, which formulas and
 * rollups read by key (`{firstName}`, `{price}`). A plugin's come from its manifest `objects`.
 */

type NativeType = (typeof DATA_EXTENSION_NATIVE_TYPES)[number];

interface Native {
  key: string;
  label: string;
  type: NativeType;
  options: string[];
}

const native = (
  key: string,
  label: string,
  type: NativeType,
  options: readonly string[] = [],
): Native => ({ key, label, type, options: [...options] });

const CREATED = native('createdAt', 'Created', 'dateTime');

/** A custom object's own fields: when a record was made and changed, and who made it. */
export const CUSTOM_OBJECT_NATIVE_FIELDS: readonly Native[] = [
  CREATED,
  native('updatedAt', 'Updated', 'dateTime'),
  native('createdBy', 'Created by', 'member'),
];

const contact = [
  native('primaryEmail', 'Email', 'text'),
  native('primaryPhone', 'Phone', 'text'),
  native('code', 'Code', 'text'),
  native('state', 'State', 'select', CUSTOMER_STATES),
  native('source', 'Source', 'text'),
  native('ownerId', 'Owner', 'member'),
  CREATED,
  native('lastActivityAt', 'Last activity', 'dateTime'),
];

/** Core's record types' own fields, by record type. */
export const CORE_NATIVE_FIELDS: Readonly<Record<string, readonly Native[]>> = {
  'core.customer': [
    native('firstName', 'First name', 'text'),
    native('lastName', 'Last name', 'text'),
    native('birthDate', 'Birthday', 'date'),
    native('position', 'Position', 'text'),
    native('department', 'Department', 'text'),
    ...contact,
  ],
  'core.company': [
    native('primaryName', 'Name', 'text'),
    native('website', 'Website', 'text'),
    native('industry', 'Industry', 'text'),
    native('size', 'Employees', 'number'),
    native('businessType', 'Business type', 'text'),
    ...contact,
  ],
  'core.product': [
    native('name', 'Name', 'text'),
    native('code', 'Code', 'text'),
    native('barcode', 'Barcode', 'text'),
    native('kind', 'Kind', 'select', PRODUCT_KINDS),
    native('status', 'Status', 'select', PRODUCT_STATUSES),
    native('unit', 'Unit', 'text'),
    native('price', 'Price', 'number'),
    native('currency', 'Currency', 'text'),
    native('weightGrams', 'Weight (g)', 'number'),
    CREATED,
  ],
  'core.member': [
    native('firstName', 'First name', 'text'),
    native('lastName', 'Last name', 'text'),
    native('email', 'Email', 'text'),
    native('phone', 'Phone', 'text'),
    native('employeeId', 'Employee ID', 'text'),
    native('birthDate', 'Birthday', 'date'),
    native('workStartedDate', 'Started work', 'date'),
    CREATED,
  ],
};
