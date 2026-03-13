import { IContext } from '~/connectionResolvers';
import { IBundleRule } from '~/modules/bundle/@types';

export const bundleRuleMutations = {
  async bundleRulesAdd(
    _root: undefined,
    doc: IBundleRule,
    { models }: IContext,
  ) {
    return models.BundleRule.createRule({
      ...doc,
    });
  },

  async bundleRulesEdit(
    _root: undefined,
    { _id, ...fields }: { _id: string } & IBundleRule,
    { models }: IContext,
  ) {
    return models.BundleRule.updateRule(_id, fields);
  },

  async bundleRulesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.BundleRule.removeRule(_ids);
  },
};
