import { MutationHookOptions, useMutation } from '@apollo/client';
import {
  POLL_ADD,
  POLL_EDIT,
  POLL_REMOVE,
  POLL_SEND_TO_CONVERSATION,
  POLL_TOGGLE_STATUS,
} from '@/poll/graphql/pollMutations';
import {
  GET_POLL_LIST,
  GET_POLL_TOTAL_COUNT,
} from '@/poll/graphql/pollQueries';

const refetchPollQueries = [GET_POLL_LIST, GET_POLL_TOTAL_COUNT];

export const usePollAdd = (options?: MutationHookOptions) => {
  const [addPoll, { loading }] = useMutation(POLL_ADD, {
    refetchQueries: refetchPollQueries,
    ...options,
  });

  return { addPoll, loading };
};

export const usePollEdit = (options?: MutationHookOptions) => {
  const [editPoll, { loading }] = useMutation(POLL_EDIT, {
    refetchQueries: refetchPollQueries,
    ...options,
  });

  return { editPoll, loading };
};

export const usePollRemove = (options?: MutationHookOptions) => {
  const [removePolls, { loading }] = useMutation(POLL_REMOVE, {
    refetchQueries: refetchPollQueries,
    ...options,
  });

  return { removePolls, loading };
};

export const usePollToggleStatus = (options?: MutationHookOptions) => {
  const [togglePollStatus, { loading }] = useMutation(POLL_TOGGLE_STATUS, {
    refetchQueries: refetchPollQueries,
    ...options,
  });

  return { togglePollStatus, loading };
};

export const usePollSendToConversation = (options?: MutationHookOptions) => {
  const [sendPoll, { loading }] = useMutation(POLL_SEND_TO_CONVERSATION, {
    ...options,
  });

  return { sendPoll, loading };
};
