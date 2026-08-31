import { useMutation } from '@apollo/client';
import {
  WIDGETS_POLL_CONNECT,
  WIDGETS_POLL_SUBMIT,
} from '../graphql/pollWidgetOperations';
import { TPollConnectResponse, TPollSubmitResponse } from '../types';

export const usePollWidget = () => {
  const [connectPoll, { data, loading, error }] =
    useMutation<TPollConnectResponse>(WIDGETS_POLL_CONNECT);

  const [submitPoll, { loading: submitting }] =
    useMutation<TPollSubmitResponse>(WIDGETS_POLL_SUBMIT);

  return {
    connectPoll,
    submitPoll,
    poll: data?.widgetsPollConnect?.poll || null,
    votedOptionIds: data?.widgetsPollConnect?.votedOptionIds || [],
    loading,
    submitting,
    error,
  };
};
