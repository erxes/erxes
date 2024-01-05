import { Syncpolariss, Types } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const syncpolarisQueries = {
  syncpolariss(_root, { typeId }, _context: IContext) {
    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Syncpolariss.find(selector).sort({ order: 1, name: 1 });
  },

  syncpolarisTypes(_root, _args, _context: IContext) {
    return Types.find({});
  },

  syncpolarissTotalCount(_root, _args, _context: IContext) {
    return Syncpolariss.find({}).countDocuments();
  }
};

export default syncpolarisQueries;
