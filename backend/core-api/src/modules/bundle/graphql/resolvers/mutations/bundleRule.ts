import { IContext } from '~/connectionResolvers';
import { IBundleRule } from '~/modules/bundle/@types';

export const bundleRuleMutations = {
  async bundleRulesAdd(
    _root: undefined,
    doc: IBundleRule,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('bundleRulesManage');

    return models.BundleRule.createRule({
      ...doc,
    });
  },

  async bundleRulesEdit(
    _root: undefined,
    { _id, ...fields }: { _id: string } & IBundleRule,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('bundleRulesManage');

    return models.BundleRule.updateRule(_id, fields);
  },

  async bundleRulesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('bundleRulesManage');

    return models.BundleRule.removeRule(_ids);
  },
};
