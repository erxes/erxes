import { Resolver } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { relationsFromContactFields } from '../utils/contactFieldsRead';

type TRelationsContext = { models: IModels; subdomain: string };

const MAX_RELATION_CONTENT_IDS = 100;

export const relationsQueries: Record<string, Resolver<any, any, any>> = {
  getRelationsByEntity: async (
    _parent: undefined,
    {
      contentType,
      contentId,
      relatedContentType,
    }: { contentType: string; contentId: string; relatedContentType: string },
    { models, subdomain }: TRelationsContext,
  ) => {
    // Contact links of records that keep them as fields are read there.
    const fromFields = await relationsFromContactFields(subdomain, models, {
      contentType,
      contentIds: [contentId],
      relatedContentType,
    });

    return (
      fromFields ||
      models.Relations.getRelationsByEntity({
        contentType,
        contentId,
        relatedContentType,
      })
    );
  },
  getRelationsByEntities: async (
    _parent: undefined,
    { contentType, contentId }: { contentType: string; contentId: string },
    { models }: { models: IModels },
  ) => {
    return models.Relations.getRelationsByEntities({ contentType, contentId });
  },

  // Records of `relatedContentType` linked to any of `contentIds`, e.g. the
  // deals of every customer a task is linked to.
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
    { models, subdomain }: TRelationsContext,
  ) => {
    const ids = [...new Set(contentIds)].slice(0, MAX_RELATION_CONTENT_IDS);

    if (!ids.length) {
      return [];
    }

    const query = { contentType, contentIds: ids, relatedContentType };
    const fromFields = await relationsFromContactFields(
      subdomain,
      models,
      query,
    );

    return fromFields || models.Relations.filterRelations(query);
  },

  cpGetRelationsByEntity: async (
    _parent: undefined,
    {
      contentType,
      contentId,
      relatedContentType,
    }: { contentType: string; contentId: string; relatedContentType: string },
    { models, subdomain }: TRelationsContext,
  ) => {
    const fromFields = await relationsFromContactFields(subdomain, models, {
      contentType,
      contentIds: [contentId],
      relatedContentType,
    });

    return (
      fromFields ||
      models.Relations.getRelationsByEntity({
        contentType,
        contentId,
        relatedContentType,
      })
    );
  },
};

relationsQueries.cpGetRelationsByEntity.wrapperConfig = {
  forClientPortal: true,
};
