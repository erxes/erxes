import { IModels } from '~/connectionResolvers';

export const relationsQueries = {
  getRelationsByEntity: async (
    _parent: undefined,
    {
      contentType,
      contentId,
      relatedContentType,
    }: { contentType: string; contentId: string; relatedContentType: string },
    { models }: { models: IModels },
  ) => {
    return models.Relations.getRelationsByEntity({
      contentType,
      contentId,
      relatedContentType,
    });
  },
  getRelationsByEntities: async (
    _parent: undefined,
    { contentType, contentId }: { contentType: string; contentId: string },
    { models }: { models: IModels },
  ) => {
    return models.Relations.getRelationsByEntities({ contentType, contentId });
  },
};
