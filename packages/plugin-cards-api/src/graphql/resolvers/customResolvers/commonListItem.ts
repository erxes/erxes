import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { IItemCommonFields } from '../../../models/definitions/boards';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Tickets.findOne({ _id });
  },

  branches(item: IItemCommonFields, args, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'branches.find',
      data: {
        query: { _id: { $in: item.branchIds } }
      },
      isRPC: true,
      defaultValue: []
    });
  },
  departments(item: IItemCommonFields, args, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: {
        _id: { $in: item.departmentIds }
      },
      isRPC: true,
      defaultValue: []
    });
  }
};
