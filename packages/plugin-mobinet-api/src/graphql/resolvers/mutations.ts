import { Mobinets, Types } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const mobinetMutations = {
  /**
   * Creates a new mobinet
   */
  async mobinetsAdd(_root, doc, _context: IContext) {
    return Mobinets.createMobinet(doc);
  },
  /**
   * Edits a new mobinet
   */
  async mobinetsEdit(_root, { _id, ...doc }, _context: IContext) {
    return Mobinets.updateMobinet(_id, doc);
  },
  /**
   * Removes a single mobinet
   */
  async mobinetsRemove(_root, { _id }, _context: IContext) {
    return Mobinets.removeMobinet(_id);
  },

  /**
   * Creates a new type for mobinet
   */
  async mobinetTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async mobinetTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async mobinetTypesEdit(_root, { _id, ...doc }, _context: IContext) {
    return Types.updateType(_id, doc);
  }
};

export default mobinetMutations;
