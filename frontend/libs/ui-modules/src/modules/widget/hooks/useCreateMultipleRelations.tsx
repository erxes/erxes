import { useMutation } from '@apollo/client';
import { CREATE_MULTIPLE_RELATIONS } from '../graphql/createRelations';
import { IRelationInput, toast } from 'erxes-ui';
import {
  GET_RELATIONS_BY_CONTENT_IDS,
  GET_RELATIONS_BY_ENTITY,
} from '../graphql/getRelations';

export const useCreateMultipleRelations = () => {
  const [createMultipleRelationsMutation, { loading, error }] = useMutation(
    CREATE_MULTIPLE_RELATIONS,
  );

  const createMultipleRelations = (
    relations: IRelationInput[],
    options?: { silent?: boolean },
  ) => {
    if (!relations.length) {
      return Promise.resolve(undefined);
    }

    return createMultipleRelationsMutation({
      variables: { relations },
      refetchQueries: [GET_RELATIONS_BY_ENTITY, GET_RELATIONS_BY_CONTENT_IDS],
      awaitRefetchQueries: true,
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
