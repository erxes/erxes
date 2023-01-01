import { IBrand } from '../../../db/models/definitions/brands';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { MODULE_NAMES } from '../../constants';
import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src/permissions';

interface IBrandsEdit extends IBrand {
  _id: string;
}

const brandMutations = {
  /**
   * Create new brand
   */
  async brandsAdd(_root, doc: IBrand, { user, models, subdomain }: IContext) {
    const brand = await models.Brands.createBrand({ userId: user._id, ...doc });

    await putCreateLog(
      models,
      subdomain,
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
  async brandsEdit(
    _root,
    { _id, ...fields }: IBrandsEdit,
    { user, models, subdomain }: IContext
  ) {
    const updated = await models.Brands.updateBrand(_id, fields);

    await putUpdateLog(
      models,
      subdomain,
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
  async brandsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const brand = await models.Brands.getBrand({ _id });
    const removed = await models.Brands.removeBrand(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.BRAND, object: brand },
      user
    );

    return removed;
  }
};

checkPermission(brandMutations, 'brandsAdd', 'manageBrands');
checkPermission(brandMutations, 'brandsEdit', 'manageBrands');
checkPermission(brandMutations, 'brandsRemove', 'manageBrands');

export default brandMutations;
