import { Reportss, Types } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const reportsQueries = {
  reportss(_root, { typeId }, _context: IContext) {
    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Reportss.find(selector).sort({ order: 1, name: 1 });
  },

  reportsTypes(_root, _args, _context: IContext) {
    return Types.find({});
  },

  reportssTotalCount(_root, _args, _context: IContext) {
    return Reportss.find({}).countDocuments();
  }
};

export default reportsQueries;
