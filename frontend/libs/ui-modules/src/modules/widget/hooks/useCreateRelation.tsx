import { useMutation } from '@apollo/client';
import { CREATE_RELATIONS } from '../graphql/createRelations';
import { IRelationInput, toast } from 'erxes-ui';
import {
  GET_RELATIONS_BY_CONTENT_IDS,
  GET_RELATIONS_BY_ENTITY,
} from '../graphql/getRelations';

export const useCreateRelation = () => {
  const [createRelationMutation, { loading, error }] =
    useMutation(CREATE_RELATIONS);

  const createRelation = (
    relation: IRelationInput,
    options?: { silent?: boolean },
  ) =>
    createRelationMutation({
      variables: { relation },
      refetchQueries: [GET_RELATIONS_BY_ENTITY, GET_RELATIONS_BY_CONTENT_IDS],
      awaitRefetchQueries: true,
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
