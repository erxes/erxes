import { {Name}s, Types } from '../../models';
import { IContext } from "@erxes/api-utils/src/types"

const {name}Mutations = {
  /**
   * Creates a new {name}
   */
  async {name}sAdd(_root, doc, _context: IContext) {
    return {Name}s.create{Name}(doc);
  },
  /**
   * Edits a new {name}
   */
  async {name}sEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
    return {Name}s.update{Name}(_id, doc);
  },
  /**
   * Removes a single {name}
   */
  async {name}sRemove(_root, { _id }, _context: IContext) {
    return {Name}s.remove{Name}(_id);
  },

  /**
   * Creates a new type for {name}
   */
  async {name}TypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async {name}TypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async {name}TypesEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
  return Types.updateType(_id, doc);
  }
};

export default {name}Mutations;
