import { IContext } from '~/connectionResolvers';
import { IMastraProvider } from '@/provider/@types/provider';

/** Mutations for stored LLM provider credentials/configs. */
export const providerMutations = {
  mastraProviderSave: (
    _parent: undefined,
    { doc }: { doc: IMastraProvider },
    { models }: IContext,
  ) => {
    return models.MastraProvider.saveProvider(doc);
  },

  mastraProviderRemove: (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.MastraProvider.removeProvider(_id);
  },
};
