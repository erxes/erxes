import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { SAFE_REMAINDER_ITEM_STATUSES } from '../../../models/definitions/constants';

export interface IUpdateSafeRemainderItemParams {
  _id: string;
  status?: string;
  remainder: number;
}

const safeRemainderItemMutations = {
  async updateSafeRemainderItem(
    _root,
    params: IUpdateSafeRemainderItemParams,
    { models }: IContext
  ) {
    const { _id, status, remainder } = params;
    const item = await models.SafeRemainderItems.getItemObject(_id);

    await models.SafeRemainderItems.updateOne(
      { _id },
      {
        $set: {
          lastTransactionDate: new Date(),
          count: remainder,
          status: status || SAFE_REMAINDER_ITEM_STATUSES.CHECKED
        }
      }
    );

    return models.SafeRemainderItems.getItemObject(_id);
  },

  async removeSafeRemainderItem(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    await models.SafeRemainderItems.getItemObject(_id);

    return models.SafeRemainderItems.deleteOne({ _id });
  }
};

checkPermission(
  safeRemainderItemMutations,
  'updateSafeRemainderItem',
  'manageRemainders'
);
checkPermission(
  safeRemainderItemMutations,
  'removeSafeRemainderItem',
  'manageRemainders'
);

export default safeRemainderItemMutations;
