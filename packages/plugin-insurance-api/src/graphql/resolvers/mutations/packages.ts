import { IContext } from '../../../connectionResolver';
import { IInsurancePackage } from '../../../models/definitions/package';

const mutations = {
  insurancePackageAdd: async (
    _root,
    { input }: { input: IInsurancePackage },
    { models, user }: IContext
  ) => {
    return models.Packages.createInsurancePackage(input, user ? user._id : '');
  },

  insurancePackageEdit: async (
    _root,
    { _id, input }: { _id: string; input: IInsurancePackage },
    { models, user }: IContext
  ) => {
    return models.Packages.updateInsurancePackage(
      { _id, ...input } as any,
      user._id
    );
  },

  insurancePackageRemove: async (_root, { _id }, { models }: IContext) => {
    await models.Packages.remove({ _id });
    return 'removed';
  }
};

export default mutations;
