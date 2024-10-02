import { Pmss, Types } from '../../models';
import { IContext } from "@erxes/api-utils/src/types"

const pmsMutations = {
  /**
   * Creates a new pms
   */
  async pmssAdd(_root, doc, _context: IContext) {
    return Pmss.createPms(doc);
  },
  /**
   * Edits a new pms
   */
  async pmssEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
    return Pmss.updatePms(_id, doc);
  },
  /**
   * Removes a single pms
   */
  async pmssRemove(_root, { _id }, _context: IContext) {
    return Pmss.removePms(_id);
  },

  /**
   * Creates a new type for pms
   */
  async pmsTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async pmsTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async pmsTypesEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
  return Types.updateType(_id, doc);
  }
};

export default pmsMutations;
