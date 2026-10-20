import { useMutation } from '@apollo/client';
import { CREATE_RELATIONS } from '../graphql/createRelations';
import { IRelation, IRelationInput, toast } from 'erxes-ui';
import { addRelationsToCache } from '../relationsCache';

export const useCreateRelation = () => {
  const [createRelationMutation, { loading, error }] = useMutation<{
    createRelation: IRelation;
  }>(CREATE_RELATIONS);

  const createRelation = (
    relation: IRelationInput,
    options?: { silent?: boolean },
  ) =>
    createRelationMutation({
      variables: { relation },
      update: (cache, { data }) =>
        addRelationsToCache(
          cache,
          data?.createRelation ? [data.createRelation] : [],
        ),
      onCompleted: () => {
        if (options?.silent) return;

        toast({
          title: 'Relation created successfully',
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

  return { createRelation, loading, error };
};
