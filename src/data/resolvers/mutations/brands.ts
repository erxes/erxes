import { Brands } from '../../../db/models';
import { IBrand, IBrandEmailConfig } from '../../../db/models/definitions/brands';
import { IUserDocument } from '../../../db/models/definitions/users';
import { moduleRequireAdmin } from '../../permissions';

interface IBrandsEdit extends IBrand {
  _id: string;
}

const brandMutations = {
  /**
   * Create new brand
   */
  brandsAdd(_root, doc: IBrand, { user }: { user: IUserDocument }) {
    return Brands.createBrand({ userId: user._id, ...doc });
  },

  /**
   * Update brand
   */
  brandsEdit(_root, { _id, ...fields }: IBrandsEdit) {
    return Brands.updateBrand(_id, fields);
  },

  /**
   * Delete brand
   */
  brandsRemove(_root, { _id }: { _id: string }) {
    return Brands.removeBrand(_id);
  },

  /**
   * Update brands email config
   */
  async brandsConfigEmail(_root, { _id, emailConfig }: { _id: string; emailConfig: IBrandEmailConfig }) {
    return Brands.updateEmailConfig(_id, emailConfig);
  },

  /**
   * Update brandId fields in given Integrations
   */
  async brandsManageIntegrations(_root, { _id, integrationIds }: { _id: string; integrationIds: string[] }) {
    return Brands.manageIntegrations({ _id, integrationIds });
  },
};

moduleRequireAdmin(brandMutations);

export default brandMutations;
