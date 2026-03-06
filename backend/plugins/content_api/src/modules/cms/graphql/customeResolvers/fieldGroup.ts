import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const CustomFieldGroup = {
  async fields(group: any, _params, { subdomain }: IContext) {
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

  async customPostTypes(group: any, _params, { models }: IContext) {
    if (!group.customPostTypeIds || group.customPostTypeIds.length === 0) {
      return [];
    }

    const systemTypes: any[] = [
      {
        _id: 'page',
        code: 'page',
        clientPortalId: group.clientPortalId,
        label: 'Page',
        pluralLabel: 'Pages',
      },
      {
        _id: 'post',
        code: 'post',
        clientPortalId: group.clientPortalId,
        label: 'Post',
        pluralLabel: 'Posts',
      },
      {
        _id: 'category',
        code: 'category',
        clientPortalId: group.clientPortalId,
        label: 'Category',
        pluralLabel: 'Categories',
      },
    ];

    const customPostTypes = await models.CustomPostTypes.find({
      _id: { $in: group.customPostTypeIds },
    });

    group.customPostTypeIds.forEach((element) => {
      const index = systemTypes.findIndex((t) => t._id === element);
      if (index !== -1) {
        customPostTypes.push(systemTypes[index]);
      }
    });

    return customPostTypes;
  },
};

export { CustomFieldGroup };
