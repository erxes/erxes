import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries, Zmss } from '../../models';

const zmsQueries = {
  async getZmsDictionary(_root, { _id }, _context: IContext) {
    return ZmsDictionaries.findOne({ _id });
  },

  async getDictionaries(_root, { isParent, parentId }, _context: IContext) {
    const query: any = { isParent: isParent ? true : { $ne: true } };
    if (parentId) {
      query.parentId = parentId;
    }
    const dictionaries = await ZmsDictionaries.find(query).lean();
    return dictionaries;
  },

  async getZms(_root, { _id }, _context: IContext) {
    return Zmss.findOne({ _id });
  },

  async getZmses() {
    const zmss = await Zmss.find({}).lean();
    return zmss;
  }
};
export default zmsQueries;
