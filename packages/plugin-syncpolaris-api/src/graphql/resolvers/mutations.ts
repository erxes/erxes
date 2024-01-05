import { Syncpolariss, Types } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const syncpolarisMutations = {
  /**
   * Creates a new syncpolaris
   */
  async syncpolarissAdd(_root, doc, _context: IContext) {
    return Syncpolariss.createSyncpolaris(doc);
  },
  /**
   * Edits a new syncpolaris
   */
  async syncpolarissEdit(_root, { _id, ...doc }, _context: IContext) {
    return Syncpolariss.updateSyncpolaris(_id, doc);
  },
  /**
   * Removes a single syncpolaris
   */
  async syncpolarissRemove(_root, { _id }, _context: IContext) {
    return Syncpolariss.removeSyncpolaris(_id);
  },

  /**
   * Creates a new type for syncpolaris
   */
  async syncpolarisTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async syncpolarisTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async syncpolarisTypesEdit(_root, { _id, ...doc }, _context: IContext) {
    return Types.updateType(_id, doc);
  }
};

export default syncpolarisMutations;
