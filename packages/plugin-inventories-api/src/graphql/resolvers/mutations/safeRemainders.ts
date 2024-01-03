import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { SAFE_REMAINDER_STATUSES } from '../../../models/definitions/constants';
import { ISafeRemainder } from '../../../models/definitions/safeRemainders';

const safeRemainderMutations = {
  safeRemainderAdd: async (
    _root: any,
    params: ISafeRemainder,
    { models, subdomain, user }: IContext
  ) => {
    return await models.SafeRemainders.createRemainder(
      subdomain,
      params,
      user._id
    );
  },

  safeRemainderRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    // Delete safe remainder
    return models.SafeRemainders.removeRemainder(_id);
  },

  safeRemainderSubmit: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    const safeRemainder = await models.SafeRemainders.getRemainder(_id);

    if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      throw new Error('Already submited');
    }

    const { branchId, departmentId, date, productCategoryId } = safeRemainder;

    const afterSafeRems = await models.SafeRemainders.find({
      status: SAFE_REMAINDER_STATUSES.PUBLISHED,
      branchId,
      departmentId,
      productCategoryId,
      date: { $gt: date }
    }).lean();

    if (afterSafeRems.length) {
      throw new Error(
        'Cant publish cause has a after submited safe remainders'
      );
    }

    const items = await models.SafeRemainderItems.find({ remainderId: _id });

    let bulkOps: {
      updateOne: {
        filter: any;
        update: any;
        upsert: boolean;
      };
    }[] = [];

    for (const item of items) {
      const { branchId, departmentId, productId, preCount, count } = item;
      if (preCount === count) {
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: { productId, branchId, departmentId },
          update: {
            $inc: { count: count - preCount },
            $set: { productId, branchId, departmentId },
            $pull: { shortLogs: { date: { $lt: item.modifiedAt } } }
          },
          upsert: true
        }
      });

      if (bulkOps.length > 100) {
        await models.Remainders.bulkWrite(bulkOps);
        bulkOps = [];
      }
    }

    if (bulkOps.length) {
      await models.Remainders.bulkWrite(bulkOps);
    }

    return await models.SafeRemainders.updateOne(
      { _id },
      { $set: { status: SAFE_REMAINDER_STATUSES.PUBLISHED } }
    );
  }
};

checkPermission(safeRemainderMutations, 'safeRemainderAdd', 'manageRemainders');
checkPermission(
  safeRemainderMutations,
  'safeRemainderRemove',
  'manageRemainders'
);

export default safeRemainderMutations;
