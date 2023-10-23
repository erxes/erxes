import { Reportss, Types } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const reportsMutations = {
  /**
   * Creates a new reports
   */
  async reportssAdd(_root, doc, _context: IContext) {
    return Reportss.createReports(doc);
  },
  /**
   * Edits a new reports
   */
  async reportssEdit(_root, { _id, ...doc }, _context: IContext) {
    return Reportss.updateReports(_id, doc);
  },
  /**
   * Removes a single reports
   */
  async reportssRemove(_root, { _id }, _context: IContext) {
    return Reportss.removeReports(_id);
  },

  /**
   * Creates a new type for reports
   */
  async reportsTypesAdd(_root, doc, _context: IContext) {
    return Types.createType(doc);
  },

  async reportsTypesRemove(_root, { _id }, _context: IContext) {
    return Types.removeType(_id);
  },

  async reportsTypesEdit(_root, { _id, ...doc }, _context: IContext) {
    return Types.updateType(_id, doc);
  }
};

export default reportsMutations;
