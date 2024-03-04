import { sendCommonMessage } from '../../messageBroker';
import { getCustomerDetail } from '../customer/getCustomerDetail';
import { getLoanDetail } from '../loan/getLoanDetail';
import { getSavingDetail } from '../saving/getSavingDetail';
type CustomFieldType =
  | 'contacts:customer'
  | 'loans:contract'
  | 'savings:contract';

export const getCustomFields = async (
  subdomain,
  customFieldType: CustomFieldType,
  item?,
) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: 'forms',
    action: 'fields.find',
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: '' },
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1,
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  const customFieldsData = item?.customFieldsData || [];
  if (item) {
    for await (const f of fields) {
      const existingData = customFieldsData.find((c) => c.field === f._id);
      item[f.code] = existingData?.value;
    }
  }

  return {
    fields: fields,
    item: item || [],
  };
};
export const dateNames = ['startDate', 'endDate'];
export const findDiffrentData = async (mainData, polarisData) => {
  if (polarisData) {
    const { _id, __v, ...data } = mainData;
    for (const [key, value] of Object.entries(data)) {
      const result = await isDiffrentFind(polarisData, key, value);
      if (result) return mainData;
    }
  }
};

export const isDiffrentFind = async (data, key, value) => {
  if (data.hasOwnProperty(key) === true && data[key] != value) {
    return await compareDate(data, key, value);
  }
  return false;
};

export const compareDate = async (data, key, value) => {
  if (dateNames.includes(key)) {
    const polarisDate = new Date(
      new Date(data[key]).getTime() -
        new Date(data[key]).getTimezoneOffset() * 60000,
    );
    const mainDate = new Date(String(value));
    if (polarisDate.getTime() === mainDate.getTime()) return false;
  } else return true;
};

export const preSyncDatas = async (mainData, polarisData, subdomain) => {
  let updateData: any = {};

  if (polarisData) {
    const { _id, __v, customFieldsDate, ...data } = mainData;
    for await (const [key, value] of Object.entries(data)) {
      const isDiff = await isDiffrentFind(polarisData, key, value);
      if (isDiff) updateData[key] = data[key];
    }

    const customFieldsResult = await getCustomFields(
      subdomain,
      'contacts:customer',
    );
    const customFields = customFieldsResult.fields;
    const customFieldsData = mainData.customFieldsData || [];
    for await (const customField of customFields) {
      await setCustomField(customField, polarisData, customFieldsData);
    }
    updateData['customFieldsData'] = customFieldsData;
  }

  return updateData;
};

export const getCustomPolaris = async (subdomain, code) => {
  try {
    return await getCustomerDetail(subdomain, { code: code });
  } catch (error) {
    console.log('error:', error);
  }
};

export const getLoanAcntPolaris = async (subdomain, number) => {
  try {
    return await getLoanDetail(subdomain, { number: number });
  } catch (error) {
    console.log('error:', error);
  }
};

export const getSavingAcntPolaris = async (subdomain, number) => {
  try {
    return await getSavingDetail(subdomain, {
      number: number,
    });
  } catch (error) {
    console.log('error:', error);
  }
};

export const setCustomField = async (
  customField,
  customer,
  customFieldsData,
) => {
  if (customer.hasOwnProperty(customField.code)) {
    await setCustomFieldValue(customField, customFieldsData, customer);
  }
  return customFieldsData;
};
export const setCustomFieldValue = async (
  customField,
  customFieldsData,
  customer,
) => {
  const index = customFieldsData.findIndex((c) => c.field === customField._id);
  if (index >= 0) {
    customFieldsData[index].value = customer[customField.code];
  } else {
    customFieldsData.push({
      field: customField._id,
      value: customer[customField.code],
    });
  }
  return customFieldsData;
};
