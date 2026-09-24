import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from 'erxes-ui';
import { POST_COMMENTS } from '../graphql/queries/postCommentsQuery';
import {
  CMS_POST_COMMENT_ADD,
  CMS_POST_COMMENT_CHANGE_STATUS,
  CMS_POST_COMMENT_DELETE,
  CMS_POST_COMMENT_UPDATE,
} from '../graphql/mutations/postCommentsMutations';

export type PostCommentStatus = 'pending' | 'approved' | 'rejected';

export interface IPostComment {
  _id: string;
  postId: string;
  clientPortalId: string;
  content: string;
  authorKind: 'user' | 'portalUser';
  authorId: string;
  parentId?: string | null;
  status: PostCommentStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface PostCommentPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

interface PostCommentsData {
  cmsPostComments?: {
    comments: IPostComment[];
    totalCount: number;
    pageInfo: PostCommentPageInfo;
  };
}

interface PostCommentsVariables {
  postId: string;
  clientPortalId: string;
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

interface UsePostCommentsOptions {
  postId: string;
  clientPortalId: string;
}

interface AddCommentVariables {
  input: {
    postId: string;
    clientPortalId: string;
    content: string;
    parentId?: string;
  };
}

interface UpdateCommentVariables {
  _id: string;
  content: string;
}

interface DeleteCommentVariables {
  _id: string;
}

interface ChangeStatusVariables extends DeleteCommentVariables {
  status: PostCommentStatus;
}

const mergeComments = (
  previousComments: IPostComment[],
  nextComments: IPostComment[],
): IPostComment[] => {
  const commentsById = new Map<string, IPostComment>();

  [...previousComments, ...nextComments].forEach((comment) => {
    commentsById.set(comment._id, comment);
  });

  return Array.from(commentsById.values());
};

export const usePostComments = ({
  postId,
  clientPortalId,
}: UsePostCommentsOptions) => {
  const { t } = useTranslation('content');
  const { toast } = useToast();
  const [loadingMore, setLoadingMore] = useState(false);
  const queryVariables: PostCommentsVariables = {
    postId,
    clientPortalId,
    limit: 50,
  };
  const skip = !postId || !clientPortalId;

  const { data, loading, error, refetch, fetchMore } = useQuery<
    PostCommentsData,
    PostCommentsVariables
  >(POST_COMMENTS, {
    variables: queryVariables,
    skip,
    fetchPolicy: 'network-only',
  });

  const [addMutation, { loading: adding }] = useMutation<
    { cmsPostCommentAdd: IPostComment },
    AddCommentVariables
  >(CMS_POST_COMMENT_ADD);
  const [updateMutation, { loading: updating }] = useMutation<
    { cmsPostCommentUpdate: IPostComment },
    UpdateCommentVariables
  >(CMS_POST_COMMENT_UPDATE);
  const [deleteMutation, { loading: deleting }] = useMutation<
    { cmsPostCommentDelete: { deletedCount?: number } },
    DeleteCommentVariables
  >(CMS_POST_COMMENT_DELETE);
  const [changeStatusMutation, { loading: changingStatus }] = useMutation<
    { cmsPostCommentChangeStatus: IPostComment },
    ChangeStatusVariables
  >(CMS_POST_COMMENT_CHANGE_STATUS);

  const runMutation = async (
    mutation: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> => {
    try {
      await mutation();
      await refetch();
      toast({ title: t('success'), description: successMessage });
      return true;
    } catch (mutationError) {
      toast({
        title: t('error'),
        description:
          mutationError instanceof Error
            ? mutationError.message
            : t('comment-action-failed'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const addComment = (content: string, parentId?: string) =>
    runMutation(
      () =>
        addMutation({
          variables: {
            input: { postId, clientPortalId, content, parentId },
          },
        }),
      t(parentId ? 'reply-added-successfully' : 'comment-added-successfully'),
    );

  const updateComment = (_id: string, content: string) =>
    runMutation(
      () => updateMutation({ variables: { _id, content } }),
      t('comment-updated-successfully'),
    );

  const deleteComment = (_id: string) =>
    runMutation(
      () => deleteMutation({ variables: { _id } }),
      t('comment-deleted-successfully'),
    );

  const changeStatus = (_id: string, status: PostCommentStatus) =>
    runMutation(
      () => changeStatusMutation({ variables: { _id, status } }),
      t('comment-status-updated-successfully'),
    );

  const loadMore = async (): Promise<void> => {
    const pageInfo = data?.cmsPostComments?.pageInfo;

    if (!pageInfo?.hasNextPage || !pageInfo.endCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      await fetchMore({
        variables: {
          ...queryVariables,
          cursor: pageInfo.endCursor,
          direction: 'forward',
        },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult?.cmsPostComments) {
            return previous;
          }

          return {
            ...previous,
            cmsPostComments: {
              ...fetchMoreResult.cmsPostComments,
              comments: mergeComments(
                previous.cmsPostComments?.comments ?? [],
                fetchMoreResult.cmsPostComments.comments ?? [],
              ),
            },
          };
        },
      });
    } catch (fetchError) {
      toast({
        title: t('error'),
        description:
          fetchError instanceof Error
            ? fetchError.message
            : t('failed-to-load-comments'),
        variant: 'destructive',
      });
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    comments: data?.cmsPostComments?.comments ?? [],
    totalCount: data?.cmsPostComments?.totalCount ?? 0,
    hasMore: data?.cmsPostComments?.pageInfo?.hasNextPage ?? false,
    error,
    loading,
    loadingMore,
    adding,
    updating,
    deleting,
    changingStatus,
    addComment,
    updateComment,
    deleteComment,
    changeStatus,
    loadMore,
    refetch,
  };
};
