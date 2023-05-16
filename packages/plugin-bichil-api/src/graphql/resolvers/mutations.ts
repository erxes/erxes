import { Bichils } from '../../models';
import { IContext } from '../../connectionResolver';
import { findUnfinishedShiftsAndUpdate } from '../../utils';

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
  }
};

export default bichilMutations;
