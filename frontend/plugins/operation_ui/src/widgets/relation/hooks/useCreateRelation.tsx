import { useMutation } from '@apollo/client';
import { CREATE_RELATIONS } from '../graphql/createRelations';
import { IRelationInput, toast } from 'erxes-ui';
import { GET_RELATIONS_BY_ENTITY } from '../graphql/getRelations';

export const useCreateRelation = () => {
  const [createRelationMutation, { loading, error }] =
    useMutation(CREATE_RELATIONS);

  const createRelation = (relation: IRelationInput) => {
    createRelationMutation({
      variables: { relation },
      refetchQueries: [GET_RELATIONS_BY_ENTITY],
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Relation created successfully',
          variant: 'default',
        });
      },
    });
  };

  return { createRelation, loading, error };
};
