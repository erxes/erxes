import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TICKET_COMMENTS } from '@/activity/graphql/queries/getTicketComments';
import { INote } from '@/activity/types';

interface UseTicketCommentsArgs {
  contentId: string;
  /**
   * Id of the newest COMMENT activity on the ticket. It changes when either
   * side posts, which is the signal to pull the thread again.
   */
  syncToken?: string;
}

export const useTicketComments = ({
  contentId,
  syncToken,
}: UseTicketCommentsArgs) => {
  const { data, loading, error, refetch } = useQuery<{
    ticketGetNotes: INote[];
  }>(GET_TICKET_COMMENTS, {
    variables: { contentId },
    skip: !contentId,
  });

  const lastSyncToken = useRef(syncToken);

  useEffect(() => {
    if (!contentId || lastSyncToken.current === syncToken) {
      return;
    }

    lastSyncToken.current = syncToken;
    refetch();
  }, [contentId, syncToken, refetch]);

  return {
    comments: data?.ticketGetNotes ?? [],
    loading,
    error,
    refetch,
  };
};
