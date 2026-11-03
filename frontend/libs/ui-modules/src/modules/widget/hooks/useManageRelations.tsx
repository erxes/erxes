import { useMutation } from '@apollo/client';
import { MANAGE_RELATIONS } from '../graphql/manageRelations';
import { IRelation, toast } from 'erxes-ui';
import {
  addRelationsToCache,
  removeUnkeptRelationsFromCache,
} from '../relationsCache';

export const useManageRelations = () => {
  const [manageRelationsMutation, { loading, error }] = useMutation<{
    manageRelations: IRelation[] | null;
  }>(MANAGE_RELATIONS);

  // Sets the full list: ids missing from `relatedContentIds` are unlinked.
  const manageRelations = (
    variables: {
      contentType: string;
      contentId: string;
      relatedContentType: string;
      relatedContentIds: string[];
    },
    options?: { silent?: boolean },
  ) =>
    manageRelationsMutation({
      variables,
      update: (cache, { data }) => {
        if (!data?.manageRelations) return;

        removeUnkeptRelationsFromCache(cache, {
          ...variables,
          keptIds: variables.relatedContentIds,
        });
        addRelationsToCache(cache, data.manageRelations);
      },
      onCompleted: () => {
        if (options?.silent) return;

        toast({
          title: 'Relations updated successfully',
          variant: 'success',
        });
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    });

  return { manageRelations, loading, error };
};
