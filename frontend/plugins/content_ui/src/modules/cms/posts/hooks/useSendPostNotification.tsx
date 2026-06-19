import { useMutation } from '@apollo/client';
import { CMS_POSTS_SEND_NOTIFICATION } from '../graphql/mutations/postsSendNotificationMutation';

type SendPostNotificationResult = {
  success: boolean;
  recipientCount: number;
};

export const useSendPostNotification = () => {
  const [sendNotification, { loading }] = useMutation<
    { cmsPostsSendNotification: SendPostNotificationResult },
    { id: string }
  >(CMS_POSTS_SEND_NOTIFICATION);

  const sendPostNotification = async (postId: string) => {
    const result = await sendNotification({
      variables: { id: postId },
    });

    return result.data?.cmsPostsSendNotification;
  };

  return {
    sendPostNotification,
    loading,
  };
};
