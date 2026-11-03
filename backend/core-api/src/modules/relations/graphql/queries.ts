import { Resolver } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

const MAX_RELATION_CONTENT_IDS = 100;

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

  // Records of `relatedContentType` linked to any of `contentIds`.
  getRelationsByContentIds: async (
    _parent: undefined,
    {
      contentType,
      contentIds,
      relatedContentType,
    }: {
      contentType: string;
      contentIds: string[];
      relatedContentType: string;
    },
    { models }: { models: IModels },
  ) => {
    const ids = [...new Set(contentIds)].slice(0, MAX_RELATION_CONTENT_IDS);

    if (!ids.length) {
      return [];
    }

    return models.Relations.filterRelations({
      contentType,
      contentIds: ids,
      relatedContentType,
    });
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
