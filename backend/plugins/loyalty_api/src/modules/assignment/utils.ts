import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const generateFieldMaxValue = async (
  subdomain: string,
  fieldId: string,
  segments: any[],
  customerId: string,
) => {
  const customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: { _id: customerId },
    defaultValue: null,
  });

  //get property value and value to check from sub segments
  for (const { _id, conditions } of segments || []) {
    for (const condition of conditions || []) {
      const { propertyName, propertyValue, propertyOperator } = condition || {};

      if (propertyName.includes(fieldId) && propertyOperator === 'numbere') {
        const { customFieldsData = [] } = customer || {};

        const customFieldData = customFieldsData.find(
          (customFieldData) => customFieldData?.field === fieldId,
        );

        const segment = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'segment',
          action: 'findOne',
          input: {
            'conditions.subSegmentId': _id,
          },
          defaultValue: null,
        });

        return {
          checkValue: Number(propertyValue) || 0,
          segmentId: segment?._id,
          currentValue: Number(customFieldData?.value) || 0,
        };
      }
    }
  }
};
