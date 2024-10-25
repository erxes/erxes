import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putUpdateLog } from '../../../logUtils';
import { ICleaning } from '../../../models/definitions/cleaning';

const cleaningMutations = {
  /**
   * Create or update config object
   */

  async pmsCleaningCreate(_root, doc, { user, models, subdomain }: IContext) {
    return await models.Cleaning.createCleaning(doc);
  },

  async pmsCleaningUpdate(
    _root,
    { _id, doc }: { _id: string; doc: ICleaning },
    { user, models, subdomain }: IContext
  ) {
    return await models.Cleaning.updateCleaning(_id, doc);
  },
};

export default cleaningMutations;
