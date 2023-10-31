import { Callss, Types, Integrations } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const callsQueries = {
  callss(_root, { typeId }, _context: IContext) {
    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Callss.find(selector).sort({ order: 1, name: 1 });
  },

  callsTypes(_root, _args, _context: IContext) {
    return Types.find({});
  },

  callssTotalCount(_root, _args, _context: IContext) {
    return Callss.find({}).countDocuments();
  },

  callsIntegrationDetail(_root, { integrationId }, _context: IContext) {
    return Integrations.findOne({ inboxId: integrationId });
  }
};

export default callsQueries;
