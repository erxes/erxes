import { useMutation } from '@apollo/client';
import { CMS_POSTS_SEND_NOTIFICATION } from '../graphql/mutations/postsSendNotificationMutation';

const readRecipientCount = (result: unknown) =>
  typeof result === 'object' &&
  result !== null &&
  'recipientCount' in result &&
  typeof result.recipientCount === 'number'
    ? result.recipientCount
    : 0;

export const useSendPostNotification = () => {
  const [sendNotification, { loading }] = useMutation(
    CMS_POSTS_SEND_NOTIFICATION,
  );

  const sendPostNotification = async (postId: string) => {
    const result = await sendNotification({
      variables: { id: postId },
    });

    return {
      recipientCount: readRecipientCount(result.data?.cmsPostsSendNotification),
    };
  };

  return {
    sendPostNotification,
    loading,
  };
};
