import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const CustomTourFieldGroup = {
  async fields(group: any, _params, { subdomain }: IContext) {
    if (Array.isArray(group?.fields)) {
      return group.fields;
    }

    if (typeof group?.fields === 'string') {
      try {
        const parsed = JSON.parse(group.fields);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return [];
      }
    }

    const fields = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'find',
      input: { query: { groupId: group._id } },
      defaultValue: [],
    });

    return fields.map((field: any) => ({
      ...field,
      group,
    }));
  },

  async customTourTypes(group: any, _params, { models }: IContext) {
    const customTourTypeIds = group.customTourTypeIds || [];

    if (!customTourTypeIds.length) {
      return [];
    }

    const systemTypes: any[] = [
      {
        _id: 'tour',
        code: 'tour',
        name: 'tour',
        branchId: group.branchId,
        label: 'Tour',
        pluralLabel: 'Tours',
        isActive: true,
      },
    ];

    const customTourTypes = await models.CustomTourTypes.find({
      _id: { $in: customTourTypeIds },
    });

    for (const systemType of systemTypes) {
      if (customTourTypeIds.includes(systemType._id)) {
        customTourTypes.push(systemType);
      }
    }

    return customTourTypes;
  },
};
