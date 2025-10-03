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
};
