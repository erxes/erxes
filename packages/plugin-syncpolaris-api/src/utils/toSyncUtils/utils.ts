import { sendCommonMessage } from '../../messageBroker';
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
  const { _id, __v, ...data } = mainData;
  for (const [key, value] of Object.entries(data)) {
    if (polarisData.hasOwnProperty(key) === true && polarisData[key] != value) {
      if (dateNames.includes(key)) {
        const polarisDate = new Date(
          new Date(polarisData[key]).getTime() -
            new Date(polarisData[key]).getTimezoneOffset() * 60000,
        );
        const mainDate = new Date(String(value));
        if (polarisDate.getTime() !== mainDate.getTime()) {
          return mainData;
        }
      } else return mainData;
    }
  }
  return;
};

export const preSyncDatas = async (mainData, polarisData, fields) => {
  const customFieldsData = mainData?.customFieldsData;
  let updateData = {};
  const { _id, __v, ...data } = mainData;
  for await (const [key, value] of Object.entries(data)) {
    if (polarisData.hasOwnProperty(key) === true && polarisData[key] != value) {
      if (dateNames.includes(key)) {
        const polarisDate = new Date(
          new Date(polarisData[key]).getTime() -
            new Date(polarisData[key]).getTimezoneOffset() * 60000,
        );
        const mainDate = new Date(String(value));
        if (polarisDate.getTime() !== mainDate.getTime())
          updateData[key] = polarisDate;
      } else if (fields.find((c) => c.code === key)) {
        const field = fields.find((c) => c.code === key);
        const index = customFieldsData.findIndex((c) => c.field === field._id);
        index >= 0
          ? (customFieldsData[index].value = polarisData[key])
          : customFieldsData.push({
              field: field._id,
              value: polarisData[key],
            });
        updateData['customFieldsData'] = customFieldsData;
      } else updateData[key] = polarisData[key];
    }
  }
  return updateData;
};
