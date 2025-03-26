import {
  IBundleCondition,
  IBundleRule
} from '../../../db/models/definitions/bundle';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { MODULE_NAMES } from '../../constants';
import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src/permissions';

interface IBundleEdit extends IBundleCondition {
  _id: string;
}
interface IBundleRuleEdit extends IBundleRule {
  _id: string;
}
const bundleMutations = {
  /**
   * Create new brand
   */
  async bundleConditionAdd(
    _root,
    doc: IBundleCondition,
    { user, models, subdomain }: IContext
  ) {
    const brand = await models.BundleCondition.createCondition({
      userId: user._id,
      ...doc
    });

    return brand;
  },

  /**
   * Update brand
   */
  async bundleConditionEdit(
    _root,
    { _id, ...fields }: IBundleEdit,
    { user, models, subdomain }: IContext
  ) {
    const updated = await models.BundleCondition.updateCondition(_id, fields);

    return updated;
  },

  /**
   * Delete brand
   */
  async bundleConditionRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const brand = await models.BundleCondition.getCondidtion({ _id });
    const removed = await models.BundleCondition.removeCondition(_id);

    return removed;
  },
  async bundleConditionDefault(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const brand = await models.BundleCondition.updateMany(
      {},
      { isDefault: false }
    );
    const updated = await models.BundleCondition.updateOne(
      { _id },
      { isDefault: true }
    );

    return updated;
  },
  async bundleRulesAdd(
    _root,
    doc: IBundleRule,
    { user, models, subdomain }: IContext
  ) {
    const brand = await models.BundleRule.createRule({
      ...doc
    });

    return brand;
  },
  async bundleRulesEdit(
    _root,
    { _id, ...fields }: IBundleRuleEdit,
    { user, models, subdomain }: IContext
  ) {
    const updated = await models.BundleRule.updateRule(_id, fields);
    return updated;
  },
  async bundleRulesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const brand = await models.BundleRule.getRule({ _id });
    const removed = await models.BundleRule.removeRule(_id);

    return removed;
  },
  async bundleConditionSetBulk(
    _root,
    { bundleId, productIds }: { bundleId: string; productIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    return await models.Products.updateMany(
      { _id: { $in: productIds } },
      { $set: { bundleId: bundleId } }
    );
  }
};

checkPermission(bundleMutations, 'bundleConditionAdd', 'manageBundle');
checkPermission(bundleMutations, 'bundleConditionEdit', 'manageBundle');
checkPermission(bundleMutations, 'bundleConditionRemove', 'manageBundle');
checkPermission(bundleMutations, 'bundleConditionSetBulk', 'manageBundle');

export default bundleMutations;
