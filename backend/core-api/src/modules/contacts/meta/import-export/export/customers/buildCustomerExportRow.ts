import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { getRealIdFromElk } from 'erxes-api-shared/utils';
import { defaultContactFieldFormatter } from '../utils';

const getFieldValue = (
  customer: ICustomerDocument,
  key: string,
  tagMap?: Map<string, string>,
  formatValue = defaultContactFieldFormatter,
): string => {
  if (key.startsWith('propertiesData.')) {
    const fieldId = key.replace('propertiesData.', '');
    return formatValue((customer as any).propertiesData?.[fieldId]);
  }

  if (key.startsWith('customFieldsData.')) {
    const fieldId = key.replace('customFieldsData.', '');
    const customFieldsData = customer.customFieldsData || [];
    if (customFieldsData?.length) {
      const cf = customFieldsData.find(
        (c) => getRealIdFromElk(c.field || '') === fieldId,
      );
      return formatValue(cf?.value);
    }
    return '';
  }

  if (key === 'tagIds') {
    if (customer.tagIds?.length) {
      const tagNames = customer.tagIds
        .map((tagId: string) => tagMap?.get(String(tagId)) || tagId)
        .filter(Boolean);
      return formatValue(tagNames);
    }
    return '';
  }

  return formatValue((customer as any)[key]);
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

  const tagNames = tagIds?.length
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

  if (customFieldsData?.length) {
    for (const { field, value } of customFieldsData) {
      if (field && value !== undefined) {
        const fieldId = getRealIdFromElk(field || '');
        allFields[`customFieldsData.${fieldId}`] = formatValue(value);
      }
    }
  }

  const propertiesData = (customer as any).propertiesData;
  if (propertiesData && typeof propertiesData === 'object') {
    for (const [fieldId, value] of Object.entries(propertiesData)) {
      if (value !== undefined && value !== null) {
        allFields[`propertiesData.${fieldId}`] = formatValue(value);
      }
    }
  }

  if (selectedFields && selectedFields.length > 0) {
    const result: Record<string, any> = { _id: String(customer._id || '') };
    selectedFields.forEach((key) => {
      result[key] = getFieldValue(customer, key, tagMap, formatValue);
    });
    return result;
  }

  return allFields;
};
