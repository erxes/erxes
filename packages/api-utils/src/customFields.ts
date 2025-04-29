// customFieldsMap

import { sendMessage } from './core';

export const customFieldsMap = async (
  object: any,
  contentType: string,
  subdomain: string
) => {
  const fieldGroups = await sendMessage({
    serviceName: 'core',
    subdomain,
    action: 'fieldsGroups.find',
    data: {
      query: {
        contentType,
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  const jsonMap: any = {};

  if (fieldGroups.length > 0) {
    for (const fieldGroup of fieldGroups) {
      const fields = await sendMessage({
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
        const value = object.customFieldsData.find(
          (c: any) => c.field === field._id
        );
        acc[field.code] = value ? value.value : null;
        return acc;
      }, {});
    }
  }

  return jsonMap;
};
