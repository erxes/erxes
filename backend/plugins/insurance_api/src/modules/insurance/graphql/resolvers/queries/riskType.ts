import { IContext } from '~/connectionResolvers';

export const riskTypeQueries = {
  riskTypes: async (_parent: undefined, _args: any, { models }: IContext) => {
    return models.RiskType.find({});
  },

  riskType: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    return models.RiskType.findById(id);
  },
};
