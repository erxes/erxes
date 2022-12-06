import { Mobinets, Types } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const mobinetQueries = {
  mobinets(_root, { typeId }, _context: IContext) {
    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Mobinets.find(selector).sort({ order: 1, name: 1 });
  },

  mobinetTypes(_root, _args, _context: IContext) {
    return Types.find({});
  },

  mobinetsTotalCount(_root, _args, _context: IContext) {
    return Mobinets.find({}).countDocuments();
  }
};

export default mobinetQueries;
