import { useMutation } from '@apollo/client';
import { MANAGE_RELATIONS } from '../graphql/manageRelations';
import { toast } from 'erxes-ui';
import { GET_RELATIONS_BY_ENTITY } from '../graphql/getRelations';

export const useManageRelations = () => {
  const [manageRelationsMutation, { loading, error }] = useMutation(
    MANAGE_RELATIONS,
  );

  const manageRelations = (variables: {
    contentType: string, contentId: string, relatedContentType: string, relatedContentIds: string[]
  }) => {
    manageRelationsMutation({
      variables,
      refetchQueries: [GET_RELATIONS_BY_ENTITY],
      onCompleted: () => {
        toast({
          title: 'Relations created successfully',
          variant: 'success',
        });
      },
    });
  };

  return { manageRelations, loading, error };
};
