import { useMutation } from '@apollo/client';
import { CREATE_MULTIPLE_RELATIONS } from '../graphql/createRelations';
import { IRelation, IRelationInput, toast } from 'erxes-ui';
import { addRelationsToCache } from '../relationsCache';

export const useCreateMultipleRelations = () => {
  const [createMultipleRelationsMutation, { loading, error }] = useMutation<{
    createMultipleRelations: IRelation[] | null;
  }>(CREATE_MULTIPLE_RELATIONS);

  const createMultipleRelations = (
    relations: IRelationInput[],
    options?: { silent?: boolean },
  ) => {
    if (!relations.length) {
      return Promise.resolve(undefined);
    }

    return createMultipleRelationsMutation({
      variables: { relations },
      update: (cache, { data }) =>
        addRelationsToCache(cache, data?.createMultipleRelations || []),
      onCompleted: () => {
        if (options?.silent) return;

        toast({
          title: 'Relations created successfully',
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
  };

  return { createMultipleRelations, loading, error };
};
