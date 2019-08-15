import { Brands } from '../../../db/models';
import { IBrand, IBrandEmailConfig } from '../../../db/models/definitions/brands';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

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
        type: 'brand',
        newData: JSON.stringify(doc),
        object: brand,
        description: `${doc.name} has been created`,
      },
      user,
    );

    return brand;
  },

  /**
   * Update brand
   */
  async brandsEdit(_root, { _id, ...fields }: IBrandsEdit, { user }: IContext) {
    const brand = await Brands.findOne({ _id });
    const updated = await Brands.updateBrand(_id, fields);

    if (brand) {
      await putUpdateLog(
        {
          type: 'brand',
          object: brand,
          newData: JSON.stringify(fields),
          description: `${fields.name} has been edited`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Delete brand
   */
  async brandsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const brand = await Brands.findOne({ _id });
    const removed = await Brands.removeBrand(_id);

    if (brand && removed) {
      await putDeleteLog(
        {
          type: 'brand',
          object: brand,
          description: `${brand.name} has been removed`,
        },
        user,
      );
    }

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
    const brand = await Brands.findOne({ _id });
    const updated = await Brands.updateEmailConfig(_id, emailConfig);

    if (brand) {
      await putUpdateLog(
        {
          type: 'brand',
          object: brand,
          description: `${brand.name} email config has been changed`,
        },
        user,
      );
    }

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
