import { Ads } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const adQueries = {
  ads(_root, { typeId }, _context: IContext) {
    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Ads.find(selector).sort({ order: 1, name: 1 });
  },

  adsTotalCount(_root, _args, _context: IContext) {
    return Ads.find({}).countDocuments();
  }
};

export default adQueries;
