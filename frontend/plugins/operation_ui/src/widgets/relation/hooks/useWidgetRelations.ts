import { TypedDocumentNode, useQuery } from '@apollo/client';
import { IRelation } from 'erxes-ui';
import { GET_RELATIONS_BY_ENTITY } from 'ui-modules';

interface WidgetRelationVariables {
  contentId: string;
  contentType: string;
  relatedContentType: string;
}

const WIDGET_RELATIONS: TypedDocumentNode<
  { getRelationsByEntity: (IRelation | null)[] | null },
  WidgetRelationVariables
> = GET_RELATIONS_BY_ENTITY;

export const useWidgetRelations = (variables: WidgetRelationVariables) => {
  const { data, loading, error, refetch } = useQuery(WIDGET_RELATIONS, {
    variables,
  });
  const ids = new Set(
    (data?.getRelationsByEntity ?? []).flatMap((relation) =>
      (relation?.entities ?? [])
        .filter((entity) => entity.contentType === variables.relatedContentType)
        .map((entity) => entity.contentId),
    ),
  );

  return { ids: [...ids], loading, error, refetch };
};
