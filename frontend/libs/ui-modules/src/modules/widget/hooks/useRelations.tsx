import { useQuery } from '@apollo/client';
import { GET_RELATIONS_BY_ENTITY } from '../graphql/getRelations';
import { IRelation } from 'erxes-ui';

export const useRelations = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const { data, loading } = useQuery(GET_RELATIONS_BY_ENTITY, {
    variables: {
      contentId,
      contentType,
    },
  });

  const relations = data?.getRelationsByEntity as IRelation[];

  const ownEntities = relations?.flatMap((relation) =>
    relation.entities.filter((entity) => entity.contentType !== contentType),
  );

  return { ownEntities, loading };
};
