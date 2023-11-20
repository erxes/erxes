import { IContext } from '@erxes/api-utils/src/types';
import { ZmsDictionaries } from '../../models';

const zmsMutations = {
  /**
   * Creates a new zmsDictionary
   */

  async createZmsDictionary(_root, { ...doc }, _context: IContext) {
    return ZmsDictionaries.create(doc);
  },

  async zmsDictionaryEdit(_root, { _id, ...doc }, _context: IContext) {
    await ZmsDictionaries.updateOne({ _id }, { $set: doc });
    const updatedData = await ZmsDictionaries.findOne({ _id });
    return updatedData;
  },

  zmsDictionaryRemove: async (_root, { _id }) => {
    const deleteDate = await ZmsDictionaries.deleteOne({ _id: _id });
    return deleteDate;
  }
};

export default zmsMutations;
