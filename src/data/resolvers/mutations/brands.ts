import { Brands } from '../../../db/models';
import { IBrand, IBrandEmailConfig } from '../../../db/models/definitions/brands';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IBrandsEdit extends IBrand {
  _id: string;
}

const brandMutations = {
  /**
   * Create new brand
   */
  async brandsAdd(_root, doc: IBrand, { user }: IContext) {
    const brand = await Brands.createBrand({ userId: user._id, ...doc });

    await putCreateLog(
      {
        type: MODULE_NAMES.BRAND,
        newData: { ...doc, userId: user._id },
        object: brand,
      },
      user,
    );

    return brand;
  },

  /**
   * Update brand
   */
  async brandsEdit(_root, { _id, ...fields }: IBrandsEdit, { user }: IContext) {
    const brand = await Brands.getBrand(_id);
    const updated = await Brands.updateBrand(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.BRAND,
        object: brand,
        newData: fields,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete brand
   */
  async brandsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const brand = await Brands.getBrand(_id);
    const removed = await Brands.removeBrand(_id);

    await putDeleteLog({ type: MODULE_NAMES.BRAND, object: brand }, user);

    return removed;
  },

  /**
   * Update brands email config
   */
  async brandsConfigEmail(
    _root,
    { _id, emailConfig }: { _id: string; emailConfig: IBrandEmailConfig },
    { user }: IContext,
  ) {
    const brand = await Brands.getBrand(_id);
    const updated = await Brands.updateEmailConfig(_id, emailConfig);

    await putUpdateLog(
      {
        type: MODULE_NAMES.BRAND,
        object: brand,
        newData: { emailConfig },
        description: `${brand.name} email config has been changed`,
      },
      user,
    );

    return updated;
  },

  /**
   * Update brandId fields in given Integrations
   */
  async brandsManageIntegrations(_root, { _id, integrationIds }: { _id: string; integrationIds: string[] }) {
    return Brands.manageIntegrations({ _id, integrationIds });
  },
};

moduleCheckPermission(brandMutations, 'manageBrands');

export default brandMutations;
