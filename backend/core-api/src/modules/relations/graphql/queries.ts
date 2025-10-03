import { IModels } from '~/connectionResolvers';

export const relationsQueries = {
  getRelationsByEntity: async (
    _parent: undefined,
    { contentType, contentId }: { contentType: string; contentId: string },
    { models }: { models: IModels },
  ) => {
    return models.Relations.getRelationsByEntity({ contentType, contentId });
  },
  getRelationsByEntities: async (
    _parent: undefined,
    { contentType, contentId }: { contentType: string; contentId: string },
    { models }: { models: IModels },
  ) => {
    return models.Relations.getRelationsByEntities({ contentType, contentId });
  },
};
