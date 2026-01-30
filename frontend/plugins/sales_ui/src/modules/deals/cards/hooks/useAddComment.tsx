import { CLIENT_PORTAL_COMMENT_ADD } from '../../graphql/mutations/clientPortalCommentMutations';
import { OperationVariables, useMutation } from '@apollo/client';

export const useAddComment = (options?: OperationVariables) => {
  const [addComment, { loading, error }] = useMutation(
    CLIENT_PORTAL_COMMENT_ADD,
    options,
  );

  return {
    addComment,
    loading,
    error,
  };
};
