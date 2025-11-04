import { QueryFunctionOptions, useQuery } from '@apollo/client';
import { GET_RELATIONS_BY_ENTITY } from '../graphql/getRelations';
import { IRelation } from 'erxes-ui';

export const useRelations = (
  options: QueryFunctionOptions<typeof GET_RELATIONS_BY_ENTITY>,
) => {
  const { data, loading } = useQuery(GET_RELATIONS_BY_ENTITY, options);

  const relations = data?.getRelationsByEntity as IRelation[];

  const ownEntities = relations?.flatMap((relation) =>
    relation.entities.filter(
      (entity) => entity.contentType !== options.variables?.contentType,
    ),
  );

  return { ownEntities, loading };
};
