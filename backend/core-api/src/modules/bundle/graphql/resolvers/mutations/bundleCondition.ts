import { IBundleCondition } from '@/bundle/@types';
import { IContext } from '~/connectionResolvers';

export const bundleConditionMutations = {
  async bundleConditionAdd(
    _root: undefined,
    doc: IBundleCondition,
    { user, models }: IContext,
  ) {
    return models.BundleCondition.createCondition({
      userId: user._id,
      ...doc,
    });
  },

  async bundleConditionEdit(
    _root: undefined,
    { _id, ...fields }: { _id: string } & IBundleCondition,
    { models }: IContext,
  ) {
    return models.BundleCondition.updateCondition(_id, fields);
  },

  async bundleConditionRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.BundleCondition.removeCondition(_ids);
  },

  async bundleConditionDefault(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    await models.BundleCondition.updateMany({}, { isDefault: false });

    return models.BundleCondition.updateOne({ _id }, { isDefault: true });
  },

  async bundleConditionSetBulk(
    _root: undefined,
    { bundleId, productIds }: { bundleId: string; productIds: string[] },
    { models }: IContext,
  ) {
    return await models.Products.updateMany(
      { _id: { $in: productIds } },
      { $set: { bundleId: bundleId } },
    );
  },
};
