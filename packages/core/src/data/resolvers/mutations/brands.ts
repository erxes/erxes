import { IBrand } from '../../../db/models/definitions/brands';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { MODULE_NAMES } from '../../constants';
import { IContext } from '../../../connectionResolver';

interface IBrandsEdit extends IBrand {
  _id: string;
}

const brandMutations = {
  /**
   * Create new brand
   */
  async brandsAdd(_root, doc: IBrand, { user, models }: IContext) {
    const brand = await models.Brands.createBrand({ userId: user._id, ...doc });

    await putCreateLog(
      models,
      {
        type: MODULE_NAMES.BRAND,
        newData: { ...doc, userId: user._id },
        object: brand
      },
      user
    );

    return brand;
  },

  /**
   * Update brand
   */
  async brandsEdit(_root, { _id, ...fields }: IBrandsEdit, { user, models }: IContext) {
    const updated = await models.Brands.updateBrand(_id, fields);

    await putUpdateLog(
      models,
      {
        type: MODULE_NAMES.BRAND,
        object: updated,
        newData: fields
      },
      user
    );

    return updated;
  },

  /**
   * Delete brand
   */
  async brandsRemove(_root, { _id }: { _id: string }, { user, models }: IContext) {
    const brand = await models.Brands.getBrand({ _id });
    const removed = await models.Brands.removeBrand(_id);

    await putDeleteLog(models, { type: MODULE_NAMES.BRAND, object: brand }, user);

    return removed;
  }
};

moduleCheckPermission(brandMutations, 'manageBrands');

export default brandMutations;
