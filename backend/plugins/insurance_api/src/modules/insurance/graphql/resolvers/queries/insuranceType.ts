import { IContext } from '~/connectionResolvers';

export const insuranceTypeQueries = {
  insuranceTypes: Object.assign(
    async (_parent: undefined, _args: any, { models }: IContext) => {
      return models.InsuranceType.find({});
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  insuranceType: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      return models.InsuranceType.findById(id);
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
