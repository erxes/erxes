import { MutationHookOptions, useMutation } from '@apollo/client';
import { BROADCAST_MESSAGE_EDIT } from '../graphql/mutations';
import { BROADCAST_MESSAGE, BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastEdit = () => {
  const [mutate, { loading }] = useMutation(BROADCAST_MESSAGE_EDIT);

  const editBroadcast = ({
    variables,
    ...options
  }: MutationHookOptions<
    { engageMessageEdit: { _id: string; workflowAutomationId?: string } },
    any
  >) =>
    mutate({
      ...options,
      variables,
      // The detail sheet stays open behind the edit sheet, so its own query
      // has to come back with the campaign that was just saved.
      refetchQueries: [BROADCAST_MESSAGES, BROADCAST_MESSAGE],
    });

  return { editBroadcast, loading };
};
