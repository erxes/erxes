import { IContext } from '../../../connectionResolver';
import { ITaskDocument } from '../../../models/definitions/tasks';
import { ITicketDocument } from '../../../models/definitions/tickets';
import { IDealDocument } from '../../../models/definitions/deals';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Tickets.findOne({ _id });
  },

  branches(
    item: ITicketDocument | ITaskDocument | IDealDocument,
    args,
    { subdomain }: IContext
  ) {
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
  departments(
    item: ITicketDocument | ITaskDocument | IDealDocument,
    args,
    { subdomain }: IContext
  ) {
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
