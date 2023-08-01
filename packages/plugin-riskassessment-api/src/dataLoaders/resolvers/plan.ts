import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Plans.findOne({ _id });
  },
  async structureDetail(
    { structureType, structureTypeId },
    {},
    { models, subdomain }: IContext
  ) {
    switch (structureType) {
      case 'branch':
        return await sendCoreMessage({
          subdomain,
          action: 'branches.findOne',
          data: {
            _id: structureTypeId
          },
          isRPC: true,
          defaultValue: null
        });
      case 'department':
        return await sendCoreMessage({
          subdomain,
          action: 'departments.findOne',
          data: {
            _id: structureTypeId
          },
          isRPC: true,
          defaultValue: null
        });
      case 'operation':
        return await models.Operations.findOne({ _id: structureTypeId }).lean();
      default:
        return null;
    }
  },

  async planner({ plannerId }, {}, { subdomain }: IContext) {
    return await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: plannerId
      },
      isRPC: true,
      defaultValue: null
    });
  }
};
