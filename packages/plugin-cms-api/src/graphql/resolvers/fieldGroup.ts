import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

const CustomFieldGroup = {
  async fields(group: any, _params, { models, subdomain }: IContext) {
    const fields = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'fields.find',
      data: {
        query: {
          groupId: group._id,
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    return fields.map((field: any) => {
      field.group = group;
      return field;
    });
  },
};

export { CustomFieldGroup };
