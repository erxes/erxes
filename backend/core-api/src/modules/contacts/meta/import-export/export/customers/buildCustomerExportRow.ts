import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { getRealIdFromElk } from 'erxes-api-shared/utils';

const getFieldValue = (customer: ICustomerDocument | any, key: string): any => {
  // Handle custom fields
  if (key.startsWith('customFieldsData.')) {
    const fieldId = key.replace('customFieldsData.', '');
    if (customer.customFieldsData && Array.isArray(customer.customFieldsData)) {
      const customField = customer.customFieldsData.find(
        (cf: any) => getRealIdFromElk(cf.field || '') === fieldId,
      );
      return customField?.value || '';
    }
    return '';
  }

  // Handle system fields
  const value = (customer as any)[key];

  // Handle array fields
  if (Array.isArray(value)) {
    return value.join('; ');
  }

  // Handle date fields
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle boolean fields
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return value || '';
};

export const buildCustomerExportRow = (
  customer: ICustomerDocument | any,
  selectedFields?: string[],
): Record<string, any> => {
  const allFields: Record<string, any> = {
    _id: customer._id || '',
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    middleName: customer.middleName || '',
    primaryEmail: customer.primaryEmail || '',
    primaryPhone: customer.primaryPhone || '',
    emails: customer.emails?.join('; ') || '',
    phones: customer.phones?.join('; ') || '',
    position: customer.position || '',
    department: customer.department || '',
    leadStatus: customer.leadStatus || '',
    description: customer.description || '',
    code: customer.code || '',
    sex: customer.sex || '',
    birthDate: customer.birthDate
      ? new Date(customer.birthDate).toISOString()
      : '',
    state: customer.state || '',
    status: customer.status || '',
    emailValidationStatus: customer.emailValidationStatus || '',
    phoneValidationStatus: customer.phoneValidationStatus || '',
    isSubscribed: customer.isSubscribed ? 'Yes' : 'No',
    tagIds: customer.tagIds?.join('; ') || '',
    ownerId: customer.ownerId || '',
    createdAt: customer.createdAt
      ? new Date(customer.createdAt).toISOString()
      : '',
    updatedAt: customer.updatedAt
      ? new Date(customer.updatedAt).toISOString()
      : '',
  };

  // Add custom fields
  if (customer.customFieldsData && Array.isArray(customer.customFieldsData)) {
    customer.customFieldsData.forEach((cf: any) => {
      const fieldId = getRealIdFromElk(cf.field || '');
      allFields[`customFieldsData.${fieldId}`] = cf.value || '';
    });
  }

  // If selectedFields provided, only return those fields
  if (selectedFields && selectedFields.length > 0) {
    const result: Record<string, any> = {};
    selectedFields.forEach((key) => {
      result[key] = getFieldValue(customer, key);
    });
    return result;
  }

  return allFields;
};
