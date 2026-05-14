import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const CustomTourFieldGroup = {
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
    });

    return fields.map((field: any) => {
      field.group = group;
      return field;
    });
  },

  async customTourTypes(group: any, _params, { models }: IContext) {
    if (!group.customTourTypeIds || group.customTourTypeIds.length === 0) {
      return [];
    }

    const systemTypes: any[] = [
      {
        _id: 'tour',
        code: 'tour',
        branchId: group.branchId,
        label: 'Tour',
        pluralLabel: 'Tours',
      },
    ];

    const customTourTypes = await models.CustomTourTypes.find({
      _id: { $in: group.customTourTypeIds },
    });

    group.customTourTypeIds.forEach((element) => {
      const index = systemTypes.findIndex((type) => type._id === element);
      if (index !== -1) {
        customTourTypes.push(systemTypes[index]);
      }
    });

    return customTourTypes;
  },
};

export { CustomTourFieldGroup };
