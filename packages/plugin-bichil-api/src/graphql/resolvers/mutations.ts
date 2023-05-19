import { Bichils } from '../../models';
import { IContext } from '../../connectionResolver';
import { findUnfinishedShiftsAndUpdate } from '../../utils';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

const bichilMutations = {
  /**
   * Creates a new bichil
   */
  async bichilsAdd(_root, doc, _context: IContext) {
    const bichil = await Bichils.createBichil(doc);

    return bichil;
  },

  async finishUnfinishedShifts(_root, doc, { subdomain }: IContext) {
    return findUnfinishedShiftsAndUpdate(subdomain);
  },

  async bichilRemoveSalaryReport(_root, { _id }, { models }: IContext) {
    return models.Salaries.deleteOne({ _id });
  }
};

requireLogin(bichilMutations, 'bichilRemoveSalaryReport');

checkPermission(
  bichilMutations,
  'bichilRemoveSalaryReport',
  'removeSalaries',
  []
);

export default bichilMutations;
