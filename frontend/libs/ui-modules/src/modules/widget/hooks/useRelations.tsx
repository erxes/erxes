import { QueryHookOptions, useQuery } from '@apollo/client';
import { IRelation } from 'erxes-ui';
import { useMemo } from 'react';
import { GET_RELATIONS_BY_ENTITY } from '../graphql/getRelations';
import { getRelatedEntities } from '../utils';

type TRelationsData = { getRelationsByEntity: IRelation[] };

type TRelationsVariables = {
  contentId: string;
  contentType: string;
  relatedContentType: string;
};

export const useRelations = (
  options: QueryHookOptions<TRelationsData, TRelationsVariables> & {
    variables: TRelationsVariables;
  },
) => {
  const { contentId, contentType, relatedContentType } = options.variables;

  const { data, loading, error, refetch } = useQuery<
    TRelationsData,
    TRelationsVariables
  >(GET_RELATIONS_BY_ENTITY, {
    ...options,
    skip: options.skip || !contentId,
  });

  const relations = data?.getRelationsByEntity;

  const ownEntities = useMemo(
    () =>
      getRelatedEntities(
        relations,
        { contentType, contentId },
        relatedContentType,
      ),
    [relations, contentType, contentId, relatedContentType],
  );

  const relatedIds = useMemo(
    () => ownEntities.map((entity) => entity.contentId),
    [ownEntities],
  );

  return {
    relations: relations || [],
    ownEntities,
    relatedIds,
    loading,
    error,
    refetch,
  };
};
