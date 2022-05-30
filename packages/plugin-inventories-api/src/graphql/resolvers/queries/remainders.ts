import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  IRemainderParams,
  IRemaindersParams
} from '../../../models/definitions/remainders';

const remainderQueries = {
  async remainders(
    _root,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) {
    models.Remainders.getRemainders(subdomain, params);
  },

  /**
   * Get one tag
   */
  remainderDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Remainders.findOne({ _id });
  },

  getRemainder(
    _root,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) {
    return models.Remainders.getRemainder(subdomain, params);
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
