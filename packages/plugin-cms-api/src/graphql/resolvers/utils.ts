import { sendCommonMessage } from '../../messageBroker';

export const buildCustomFieldsMap = async (
  subdomain: string,
  fieldGroups: any[],
  customFieldsData: any
) => {
  const jsonMap: any = {};

  if (fieldGroups.length > 0) {
    for (const fieldGroup of fieldGroups) {
      const fields = await sendCommonMessage({
        subdomain,
        serviceName: 'core',
        action: 'fields.find',
        data: {
          query: {
            groupId: fieldGroup._id,
          },
        },
        isRPC: true,
        defaultValue: [],
      });

      jsonMap[fieldGroup.code] = fields.reduce((acc, field: any) => {
        const value = customFieldsData.find((c: any) => c.field === field._id);
        acc[field.code] = value ? value.value : null;
        return acc;
      }, {});
    }
  }

  return jsonMap;
};
