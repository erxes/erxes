import { MutationHookOptions, useMutation } from '@apollo/client';
import { BROADCAST_EMAIL_TEMPLATE_ADD } from '../graphql/mutations';
import { BROADCAST_EMAIL_TEMPLATES } from '../graphql/queries';

export const useBroadcastEmailTemplateAdd = () => {
  const [mutate, { loading }] = useMutation(BROADCAST_EMAIL_TEMPLATE_ADD);

  const addEmailTemplate = ({
    variables,
    ...options
  }: MutationHookOptions<{ broadcastEmailTemplateAdd: { _id: string } }, any>) => {
    return mutate({
      ...options,
      variables,
      refetchQueries: [BROADCAST_EMAIL_TEMPLATES],
    });
  };

  return { addEmailTemplate, loading };
};
