import { moduleCheckPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { SAFE_REMAINDER_ITEM_STATUSES } from '~/modules/inventories/@types/constants';

const safeRemainderItemMutations = {
  async safeRemainderItemEdit(
    _root: any,
    params: {
      _id: string;
      status?: string;
      remainder: number;
    },
    { models, user }: IContext,
  ) {
    const { _id, status, remainder } = params;

    const doc = {
      count: remainder,
      status: status || SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
    };

    return await models.SafeRemainderItems.updateItem(_id, doc, user._id);
  },

  async safeRemainderItemRemove(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.SafeRemainderItems.removeItem(_id);
  },
};

moduleCheckPermission(safeRemainderItemMutations, 'manageRemainders');

export default safeRemainderItemMutations;
