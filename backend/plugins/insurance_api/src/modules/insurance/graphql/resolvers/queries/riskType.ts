import { IContext } from '~/connectionResolvers';

export const riskTypeQueries = {
  riskTypes: Object.assign(
    async (_parent: undefined, _args: any, { models }: IContext) => {
      return models.RiskType.find({});
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  riskType: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      return models.RiskType.findById(id);
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
