import { useQuery, useMutation } from '@apollo/client';
import { POST_COMMENTS } from '../graphql/queries/postCommentsQuery';
import {
  CMS_POST_COMMENT_ADD,
  CMS_POST_COMMENT_CHANGE_STATUS,
  CMS_POST_COMMENT_DELETE,
  CMS_POST_COMMENT_UPDATE,
} from '../graphql/mutations/postCommentsMutations';

interface UsePostCommentsOptions {
  postId: string;
  clientPortalId: string;
}

export function usePostComments({ postId, clientPortalId }: UsePostCommentsOptions) {
  const queryVars = { postId, clientPortalId, limit: 50 };
  const skip = !postId || !clientPortalId;

  const { data, loading, refetch } = useQuery(POST_COMMENTS, {
    variables: queryVars,
    skip,
    fetchPolicy: 'network-only',
  });

  const refetchOptions = { onCompleted: () => refetch() };
  const [addMutation, { loading: adding }] = useMutation(
    CMS_POST_COMMENT_ADD,
    refetchOptions,
  );
  const [updateMutation, { loading: updating }] = useMutation(
    CMS_POST_COMMENT_UPDATE,
    refetchOptions,
  );
  const [deleteMutation, { loading: deleting }] = useMutation(
    CMS_POST_COMMENT_DELETE,
    refetchOptions,
  );
  const [changeStatusMutation] = useMutation(
    CMS_POST_COMMENT_CHANGE_STATUS,
    refetchOptions,
  );

  const addComment = (content: string, parentId?: string) =>
    addMutation({
      variables: { input: { postId, clientPortalId, content, parentId } },
    });

  const updateComment = (_id: string, content: string) =>
    updateMutation({ variables: { _id, content } });

  const deleteComment = (_id: string) =>
    deleteMutation({ variables: { _id } });

  const changeStatus = (
    _id: string,
    status: 'pending' | 'approved' | 'rejected',
  ) => changeStatusMutation({ variables: { _id, status } });

  return {
    comments: (data?.cmsPostComments?.comments ?? []) as any[],
    totalCount: (data?.cmsPostComments?.totalCount ?? 0) as number,
    loading,
    adding,
    updating,
    deleting,
    addComment,
    updateComment,
    deleteComment,
    changeStatus,
    refetch,
  };
}
