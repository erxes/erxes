import { IContext } from '~/connectionResolvers';

export const riskTypeMutations = {
  createRiskType: async (
    _parent: undefined,
    { name, description }: { name: string; description?: string },
    { models }: IContext,
  ) => {
    return models.RiskType.create({ name, description });
  },

  updateRiskType: async (
    _parent: undefined,
    {
      id,
      name,
      description,
    }: { id: string; name?: string; description?: string },
    { models }: IContext,
  ) => {
    return models.RiskType.findByIdAndUpdate(
      id,
      { name, description },
      { new: true },
    );
  },

  deleteRiskType: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    await models.RiskType.findByIdAndDelete(id);
    return true;
  },
};
