import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { SAFE_REMAINDER_ITEM_STATUSES } from '../../../models/definitions/constants';

const safeRemainderItemMutations = {
  async safeRemainderItemEdit(
    _root: any,
    params: {
      _id: string;
      status?: string;
      remainder: number;
    },
    { models, user }: IContext
  ) {
    const { _id, status, remainder } = params;

    const doc = {
      lastTransactionDate: new Date(),
      count: remainder,
      status: status || SAFE_REMAINDER_ITEM_STATUSES.CHECKED
    };

    return await models.SafeRemainderItems.updateItem(_id, doc, user._id);
  },

  async safeRemainderItemRemove(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.SafeRemainderItems.removeItem(_id);
  }
};

checkPermission(
  safeRemainderItemMutations,
  'safeRemainderItemEdit',
  'manageRemainders'
);
checkPermission(
  safeRemainderItemMutations,
  'safeRemainderItemRemove',
  'manageRemainders'
);

export default safeRemainderItemMutations;
