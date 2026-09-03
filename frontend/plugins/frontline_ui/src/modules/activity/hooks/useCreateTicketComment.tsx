import { MutationHookOptions, useMutation } from '@apollo/client';
import { CREATE_TICKET_NOTE } from '@/activity/graphql/mutations/createTicketNote';
import { GET_TICKET_COMMENTS } from '@/activity/graphql/queries/getTicketComments';
import { NOTE_TYPES } from '@/activity/constants';

export const useCreateTicketComment = (contentId: string) => {
  const [mutate, { loading, error }] = useMutation(CREATE_TICKET_NOTE, {
    refetchQueries: [{ query: GET_TICKET_COMMENTS, variables: { contentId } }],
    awaitRefetchQueries: true,
  });

  const createTicketComment = (
    content: string,
    options?: Pick<MutationHookOptions, 'onCompleted' | 'onError'>,
  ) =>
    mutate({
      variables: {
        content,
        contentId,
        type: NOTE_TYPES.COMMENT,
      },
      ...options,
    });

  return { createTicketComment, loading, error };
};
