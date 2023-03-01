import { Bichils } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const bichilMutations = {
  /**
   * Creates a new bichil
   */
  async bichilsAdd(_root, doc, _context: IContext) {
    const bichil = await Bichils.createBichil(doc);

    return bichil;
  }
};

export default bichilMutations;
