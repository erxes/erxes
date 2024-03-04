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

  for await (const f of fields) {
    const existingData = customFieldsData.find((c) => c.field === f._id);
    item[f.code] = existingData?.value;
  }
  return {
    fields: fields,
    item: item,
  };
};
export const dateNames = ['startDate', 'endDate'];
export const findDiffrentData = async (mainData, polarisData) => {
  if (polarisData) {
    const { _id, __v, ...data } = mainData;
    for (const [key, value] of Object.entries(data)) {
      const result = await compareDatas(polarisData, key, value);
      if (result) return mainData;
    }
  }
};

export const compareDatas = async (data, key, value) => {
  if (data.hasOwnProperty(key) === true && data[key] != value) {
    const comparedDate = await compareDate(data, key, value);
    const result = comparedDate ? true : false;
    return result;
  } else return false;
};

export const compareDate = async (data, key, value) => {
  if (dateNames.includes(key)) {
    const polarisDate = new Date(
      new Date(data[key]).getTime() -
        new Date(data[key]).getTimezoneOffset() * 60000,
    );
    const mainDate = new Date(String(value));
    if (polarisDate.getTime() === mainDate.getTime()) return false;
  }
  return true;
};

export const preSyncDatas = async (mainData, polarisData, fields) => {
  const customFieldsData = mainData?.customFieldsData;
  let updateData: any = {};
  if (polarisData) {
    const { _id, __v, ...data } = mainData;
    for await (const [key, value] of Object.entries(data)) {
      if (
        polarisData.hasOwnProperty(key) === true &&
        polarisData[key] != value
      ) {
        const result = await compareDatas(polarisData, key, value);
        if (result) updateData[key] = polarisData[key];

        if (fields.find((c) => c.code === key)) {
          const field = fields.find((c) => c.code === key);
          const index = customFieldsData.findIndex(
            (c) => c.field === field._id,
          );
          index >= 0
            ? (customFieldsData[index].value = polarisData[key])
            : customFieldsData.push({
                field: field._id,
                value: polarisData[key],
              });
          updateData['customFieldsData'] = customFieldsData;
        }
      }
    }
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
