import { MutationHookOptions, useMutation } from '@apollo/client';
import { BROADCAST_SEND_TEST_EMAIL } from '../graphql/mutations';

export const useBroadcastSendTestEmail = () => {
  const [mutate, { loading }] = useMutation(BROADCAST_SEND_TEST_EMAIL);

  const sendTestEmail = ({
    variables,
    ...options
  }: MutationHookOptions<{ engageMessageSendTestEmail: string }, any>) => {
    return mutate({
      ...options,
      variables,
    });
  };

  return { sendTestEmail, loading };
};
