import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from 'erxes-ui';
import { POST_RATINGS } from '../graphql/queries/postRatingsQuery';
import {
  CMS_POST_RATING_CHANGE_STATUS,
  CMS_POST_RATING_DELETE,
} from '../graphql/mutations/postRatingsMutations';

export type PostRatingStatus = 'pending' | 'approved' | 'rejected';

export interface IPostRating {
  _id: string;
  postId: string;
  clientPortalId: string;
  authorId: string;
  rating: number;
  status: PostRatingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPostRatingBucket {
  rating: number;
  count: number;
}

export interface IPostRatingSummary {
  averageRating: number;
  totalCount: number;
  distribution: IPostRatingBucket[];
}

interface PostRatingPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

interface PostRatingsData {
  cmsPostRatings?: {
    ratings: IPostRating[];
    totalCount: number;
    pageInfo: PostRatingPageInfo;
    approvedSummary: IPostRatingSummary;
  };
}

interface PostRatingsVariables {
  postId: string;
  clientPortalId: string;
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

interface UsePostRatingsOptions {
  postId: string;
  clientPortalId: string;
}

interface RatingIdVariables {
  _id: string;
}

interface ChangeRatingStatusVariables extends RatingIdVariables {
  status: PostRatingStatus;
}

const EMPTY_SUMMARY: IPostRatingSummary = {
  averageRating: 0,
  totalCount: 0,
  distribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
};

const mergeRatings = (
  previousRatings: IPostRating[],
  nextRatings: IPostRating[],
): IPostRating[] => {
  const ratingsById = new Map<string, IPostRating>();

  [...previousRatings, ...nextRatings].forEach((rating) => {
    ratingsById.set(rating._id, rating);
  });

  return Array.from(ratingsById.values());
};

export const usePostRatings = ({
  postId,
  clientPortalId,
}: UsePostRatingsOptions) => {
  const { t } = useTranslation('content');
  const { toast } = useToast();
  const [loadingMore, setLoadingMore] = useState(false);
  const queryVariables: PostRatingsVariables = {
    postId,
    clientPortalId,
    limit: 50,
  };
  const skip = !postId || !clientPortalId;

  const { data, loading, error, refetch, fetchMore } = useQuery<
    PostRatingsData,
    PostRatingsVariables
  >(POST_RATINGS, {
    variables: queryVariables,
    skip,
    fetchPolicy: 'network-only',
  });

  const [changeStatusMutation, { loading: changingStatus }] = useMutation<
    { cmsPostRatingChangeStatus: IPostRating },
    ChangeRatingStatusVariables
  >(CMS_POST_RATING_CHANGE_STATUS);
  const [deleteMutation, { loading: deleting }] = useMutation<
    { cmsPostRatingDelete: { deletedCount?: number } },
    RatingIdVariables
  >(CMS_POST_RATING_DELETE);

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
            : t('rating-action-failed'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const changeStatus = (_id: string, status: PostRatingStatus) =>
    runMutation(
      () => changeStatusMutation({ variables: { _id, status } }),
      t('rating-status-updated-successfully'),
    );

  const deleteRating = (_id: string) =>
    runMutation(
      () => deleteMutation({ variables: { _id } }),
      t('rating-deleted-successfully'),
    );

  const loadMore = async (): Promise<void> => {
    const pageInfo = data?.cmsPostRatings?.pageInfo;

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
          if (!fetchMoreResult?.cmsPostRatings) {
            return previous;
          }

          return {
            ...previous,
            cmsPostRatings: {
              ...fetchMoreResult.cmsPostRatings,
              ratings: mergeRatings(
                previous.cmsPostRatings?.ratings ?? [],
                fetchMoreResult.cmsPostRatings.ratings ?? [],
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
            : t('failed-to-load-ratings'),
        variant: 'destructive',
      });
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    ratings: data?.cmsPostRatings?.ratings ?? [],
    totalCount: data?.cmsPostRatings?.totalCount ?? 0,
    summary: data?.cmsPostRatings?.approvedSummary ?? EMPTY_SUMMARY,
    hasMore: data?.cmsPostRatings?.pageInfo?.hasNextPage ?? false,
    error,
    loading,
    loadingMore,
    changingStatus,
    deleting,
    changeStatus,
    deleteRating,
    loadMore,
    refetch,
  };
};
