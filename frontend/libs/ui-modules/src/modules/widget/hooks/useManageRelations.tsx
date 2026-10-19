import { useMutation } from '@apollo/client';
import { MANAGE_RELATIONS } from '../graphql/manageRelations';
import { toast } from 'erxes-ui';
import {
  GET_RELATIONS_BY_CONTENT_IDS,
  GET_RELATIONS_BY_ENTITY,
} from '../graphql/getRelations';

export const useManageRelations = () => {
  const [manageRelationsMutation, { loading, error }] =
    useMutation(MANAGE_RELATIONS);

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
      refetchQueries: [GET_RELATIONS_BY_ENTITY, GET_RELATIONS_BY_CONTENT_IDS],
      awaitRefetchQueries: true,
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
