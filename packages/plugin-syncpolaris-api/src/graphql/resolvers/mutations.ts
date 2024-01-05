import { Syncpolariss } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const syncpolarisMutations = {
  /**
   * Creates a new syncpolaris
   */
  async syncpolarissAdd(_root, doc, _context: IContext) {
    const syncpolaris = await Syncpolariss.createSyncpolaris(doc);

    return syncpolaris;
  }
};

export default syncpolarisMutations;
