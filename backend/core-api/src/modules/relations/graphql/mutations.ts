import { IRelation } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export const relationsMutations = {
  createRelation: async (
    _parent: undefined,
    { relation }: { relation: IRelation },
    { models }: { models: IModels },
  ) => {
    return models.Relations.createRelation({ relation });
  },
  createMultipleRelations: async (
    _parent: undefined,
    { relations }: { relations: IRelation[] },
    { models }: { models: IModels },
  ) => {
    return models.Relations.createMultipleRelations({ relations });
  },

  updateRelation: async (
    _parent: undefined,
    { id, relation }: { id: string; relation: IRelation },
    { models }: { models: IModels },
  ) => {
    return models.Relations.updateRelation({ _id: id, doc: relation });
  },

  deleteRelation: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: { models: IModels },
  ) => {
    return models.Relations.deleteRelation({ _id: id });
  },

  manageRelations: async (
    _parent: undefined,
    {
      contentType,
      contentId,
      relatedContentType,
      relatedContentIds,
    }: {
      contentType: string;
      contentId: string;
      relatedContentType: string;
      relatedContentIds: string[];
    },
    { models }: { models: IModels },
  ) => {
    return await models.Relations.manageRelations({
      contentType,
      contentId,
      relatedContentType,
      relatedContentIds,
    });
  },
};
