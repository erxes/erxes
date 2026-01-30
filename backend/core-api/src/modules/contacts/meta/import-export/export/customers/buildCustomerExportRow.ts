import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { getRealIdFromElk } from 'erxes-api-shared/utils';
import { defaultContactFieldFormatter } from '../utils';

const getFieldValue = (
  customer: ICustomerDocument,
  key: string,
  tagMap?: Map<string, string>,
  formatValue = defaultContactFieldFormatter,
): string => {
  const isCustomField = key.startsWith('customFieldsData.');

  if (isCustomField) {
    const fieldId = key.replace('customFieldsData.', '');
    const customFieldsData = customer.customFieldsData || [];
    if (!!customFieldsData?.length) {
      const customField = customFieldsData.find(
        (cf) => getRealIdFromElk(cf.field || '') === fieldId,
      );
      return formatValue(customField?.value);
    }
    return '';
  }

  const value = (customer as any)[key];

  if (key === 'tagIds') {
    if (!!customer.tagIds?.length) {
      const tagNames = customer.tagIds
        .map((tagId: string) => tagMap?.get(String(tagId)) || tagId)
        .filter(Boolean);
      return formatValue(tagNames);
    }
    return '';
  }

  return formatValue(value);
};

export const buildCustomerExportRow = (
  customer: ICustomerDocument,
  selectedFields?: string[],
  tagMap?: Map<string, string>,
  formatter = defaultContactFieldFormatter,
): Record<string, any> => {
  const formatValue = formatter || defaultContactFieldFormatter;
  const {
    _id,
    firstName,
    lastName,
    middleName,
    primaryEmail,
    primaryPhone,
    emails,
    phones,
    position,
    department,
    leadStatus,
    description,
    code,
    sex,
    birthDate,
    state,
    status,
    emailValidationStatus,
    phoneValidationStatus,
    isSubscribed,
    ownerId,
    createdAt,
    updatedAt,
    tagIds = [],
    customFieldsData = [],
  } = customer;

  // Get tag names from tagIds
  const tagNames = !!tagIds?.length
    ? tagIds
        .map((tagId: string) => tagMap?.get(String(tagId)) || tagId)
        .filter(Boolean)
        .join('; ')
    : '';

  const allFields: Record<string, any> = {
    _id: formatValue(_id),
    firstName: formatValue(firstName),
    lastName: formatValue(lastName),
    middleName: formatValue(middleName),
    primaryEmail: formatValue(primaryEmail),
    primaryPhone: formatValue(primaryPhone),
    emails: formatValue(emails),
    phones: formatValue(phones),
    position: formatValue(position),
    department: formatValue(department),
    leadStatus: formatValue(leadStatus),
    description: formatValue(description),
    code: formatValue(code),
    sex: formatValue(sex),
    birthDate: formatValue(birthDate ? new Date(birthDate) : ''),
    state: formatValue(state),
    status: formatValue(status),
    emailValidationStatus: formatValue(emailValidationStatus),
    phoneValidationStatus: formatValue(phoneValidationStatus),
    isSubscribed: formatValue(isSubscribed),
    tagIds: formatValue(tagNames),
    ownerId: formatValue(ownerId),
    createdAt: formatValue(createdAt ? new Date(createdAt) : ''),
    updatedAt: formatValue(updatedAt ? new Date(updatedAt) : ''),
  };

  // Add custom fields
  if (!!customFieldsData?.length) {
    for (const { field, value } of customFieldsData) {
      if (field && value) {
        const fieldId = getRealIdFromElk(field || '');
        allFields[`customFieldsData.${fieldId}`] = formatValue(value);
      }
    }
  }

  // If selectedFields provided, only return those fields
  if (selectedFields && selectedFields.length > 0) {
    // Always include _id for cursor-based pagination; it is not exported
    const result: Record<string, any> = { _id: String(customer._id || '') };
    selectedFields.forEach((key) => {
      result[key] = getFieldValue(customer, key, tagMap, formatValue);
    });
    return result;
  }

  return allFields;
};
