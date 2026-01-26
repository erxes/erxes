// hooks/useAddComment.ts
import { useMutation } from '@apollo/client';
import { CLIENT_PORTAL_COMMENT_ADD } from '../../graphql/mutations/clientPortalCommentMutations';

interface AddCommentVariables {
  comment: {
    typeId: string;
    type: string;
    content: string;
    parentId?: string;
  };
}

interface AddCommentOptions {
  variables: AddCommentVariables;
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useAddComment = () => {
  const [mutate, state] = useMutation(CLIENT_PORTAL_COMMENT_ADD);

  const addComment = async ({
    variables,
    onCompleted,
    onError,
  }: AddCommentOptions) => {
    try {
      const res = await mutate({ variables });

      onCompleted?.(res.data?.clientPortalCommentAdd);

      return res.data?.clientPortalCommentAdd;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };

  return {
    addComment,
    ...state,
  };
};
