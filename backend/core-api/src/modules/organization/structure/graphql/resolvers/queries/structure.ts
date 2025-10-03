import { IContext } from '~/connectionResolvers';

export const structuresQueries = {
  async structureDetail(
    _parent: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Structures.findOne();
  },
};
