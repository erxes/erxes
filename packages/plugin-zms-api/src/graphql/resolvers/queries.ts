import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries } from '../../models';

const zmsQueries = {
  async getZmsDictionary(_root, { _id }, _context: IContext) {
    return ZmsDictionaries.findOne({ _id });
  },

  async getDictionaries(_root, { isParent, parentId }, _context: IContext) {
    const query: any = { isParent: isParent ? true : { $ne: true } };
    if (parentId) {
      query.parentId = parentId;
    }
    const dictionaries = ZmsDictionaries.find(query).lean();

    return dictionaries;
  }
};
export default zmsQueries;
