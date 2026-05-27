import { Resolver } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export const relationsQueries: Record<string, Resolver<any, any, any>> = {
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

  cpGetRelationsByEntity: async (
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
};

relationsQueries.cpGetRelationsByEntity.wrapperConfig = {
  forClientPortal: true,
};
