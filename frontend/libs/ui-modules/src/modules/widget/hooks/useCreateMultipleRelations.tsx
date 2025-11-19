import { useMutation } from '@apollo/client';
import { CREATE_MULTIPLE_RELATIONS } from '../graphql/createRelations';
import { IRelationInput, toast } from 'erxes-ui';
import { GET_RELATIONS_BY_ENTITY } from '../graphql/getRelations';

export const useCreateMultipleRelations = () => {
  const [createMultipleRelationsMutation, { loading, error }] = useMutation(
    CREATE_MULTIPLE_RELATIONS,
  );

  const createMultipleRelations = (relations: IRelationInput[]) => {
    createMultipleRelationsMutation({
      variables: { relations },
      refetchQueries: [GET_RELATIONS_BY_ENTITY],
      onCompleted: () => {
        toast({
          title: 'Relations created successfully',
          variant: 'success',
        });
      },
    });
  };

  return { createMultipleRelations, loading, error };
};
