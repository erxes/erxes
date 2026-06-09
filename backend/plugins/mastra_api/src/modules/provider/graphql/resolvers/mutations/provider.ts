import { IContext } from '~/connectionResolvers';

export const providerMutations = {
  mastraProviderSave: async (_: any, { doc }: any, { models }: IContext) => {
    return models.MastraProvider.saveProvider(doc);
  },

  mastraProviderRemove: async (_: any, { _id }: { _id: string }, { models }: IContext) => {
    return models.MastraProvider.removeProvider(_id);
  },
};
