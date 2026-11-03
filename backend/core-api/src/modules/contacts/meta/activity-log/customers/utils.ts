import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { CUSTOMER_ACTIVITY_FIELDS } from './constants';

const humanizeCustomerField = (field: string) =>
  field
    .replaceAll('.', ' ')
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll(/\b\w/g, (letter) => letter.toUpperCase());

export const getCustomerFieldLabel = (field: string) => {
  if (field.startsWith('links.')) {
    const [, key] = field.split('.');
    return `${humanizeCustomerField(key)} Link`;
  }

  const match = CUSTOMER_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || humanizeCustomerField(field);
};

export const getCustomerDisplayText = (
  doc?: Partial<ICustomerDocument> | null,
) =>
  [doc?.firstName, doc?.middleName, doc?.lastName]
    .filter(Boolean)
    .join(' ') ||
  doc?.primaryEmail ||
  doc?.primaryPhone ||
  (doc?._id ? `Customer ${doc._id}` : 'this customer');

export const buildCustomerTarget = (
  customer?: ICustomerDocument | { _id: string } | null,
) => ({
  _id: customer?._id,
  moduleName: 'contacts',
  collectionName: 'customers',
  text: getCustomerDisplayText(customer as Partial<ICustomerDocument> | null),
});
