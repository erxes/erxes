import { Activities, Types } from '../../models';
import { IContext } from "@erxes/api-utils/src/types"

const activityMutations = {
  /**
   * Creates a new activity
   */
  async activitiesAdd(_root, doc, _context: IContext) {
    return Activities.createActivity(doc);
  },
  /**
   * Edits a new activity
   */
  async activitiesEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
    return Activities.updateActivity(_id, doc);
  },
  /**
   * Removes a single activity
   */
  async activitiesRemove(_root, { _id }, _context: IContext) {
    return Activities.removeActivity(_id);
  },

  /**
   * Creates a new type for activity
   */
  async activityTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async activityTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async activityTypesEdit(
    _root,
    { _id, ...doc },
    _context: IContext
  ) {
  return Types.updateType(_id, doc);
  }
};

export default activityMutations;
