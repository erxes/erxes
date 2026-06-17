import { IContext } from '~/connectionResolvers';
import { IMastraProvider } from '@/provider/@types/provider';

/** Mutations for stored LLM provider credentials/configs. */
export const providerMutations = {
  mastraProviderSave: async (
    _parent: undefined,
    { doc }: { doc: IMastraProvider },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('providersManage');
    return models.MastraProvider.saveProvider(doc);
  },

  mastraProviderRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('providersRemove');
    return models.MastraProvider.removeProvider(_id);
  },
};
