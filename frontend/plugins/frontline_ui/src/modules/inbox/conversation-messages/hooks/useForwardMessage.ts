import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, type IAttachment } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import { readFacebookDelivery } from '@/integrations/facebook/types/FacebookReplyDelivery';
import { readInstagramDelivery } from '@/integrations/instagram/utils/instagramReplyDelivery';
import { compactList } from '@/shared/utils/cursorList';
import {
  forwardMessageSchema,
  type ForwardMessageForm,
} from '@/inbox/conversation-messages/types/forwardMessage';
import { buildForwardMessage } from '@/inbox/conversation-messages/utils/forwardMessage';
import { previewOf } from '@/inbox/conversation-messages/utils/messageActionText';
import { useTranslation } from 'react-i18next';

export const useForwardMessage = (
  open: boolean,
  onOpenChange: (open: boolean) => void,
) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const message = useConversationMessageContext();
  const { _id: sourceConversationId } = useConversationContext();
  const preview = previewOf(message);
  const form = useForm<ForwardMessageForm>({
    resolver: zodResolver(forwardMessageSchema),
    defaultValues: { destinationId: '', note: '' },
  });
  const [remainingByDestination, setRemainingByDestination] = useState<
    Record<string, IAttachment[]>
  >({});
  const selectedId = form.watch('destinationId');
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const { data, loading: conversationsLoading } = useQuery(GET_CONVERSATIONS, {
    variables: { limit: 50, status: 'open' },
    skip: !open,
    fetchPolicy: 'cache-and-network',
  });
  const conversations = useMemo(
    () =>
      compactList(data?.conversations?.list).filter(
        (conversation) => conversation._id !== sourceConversationId,
      ),
    [data?.conversations?.list, sourceConversationId],
  );

  const handleForward = async ({ destinationId, note }: ForwardMessageForm) => {
    if (loading || remainingByDestination[destinationId]?.length === 0) return;
    const { snapshot, attachments, content } = buildForwardMessage(
      message,
      preview,
      note,
    );
    const retryAttachments = remainingByDestination[destinationId];
    const outgoingAttachments = retryAttachments || attachments;
    try {
      const result = await addConversationMessage({
        variables: {
          conversationId: destinationId,
          content: retryAttachments ? '' : content,
          attachments: outgoingAttachments,
          internal: false,
          extraInfo: {
            forwardedNote: note.trim(),
            forwardedFrom: {
              conversationId: sourceConversationId,
              messageId: message._id,
            },
            forwardedSnapshot: snapshot,
          },
        },
        refetchQueries: [
          'Conversations',
          'ConversationMessages',
          'ConversationCounts',
          'FrontlineInboxSidebarWorkCounts',
          'FacebookConversationMessages',
          'InstagramConversationMessages',
        ],
      });
      const extraData = result.data?.conversationMessageAdd?.extraData;
      const instagramDelivery = readInstagramDelivery(extraData);
      const delivery = readFacebookDelivery(extraData) || instagramDelivery;
      if (delivery?.status === 'partial') {
        const remaining = outgoingAttachments.filter(
          ({ url }) => !delivery.sentAttachmentUrls.includes(url),
        );
        setRemainingByDestination((current) => ({
          ...current,
          [destinationId]: remaining,
        }));
        toast({
          title: remaining.length
            ? t('message-partially-forwarded')
            : t('message-forwarded-with-warning'),
          description: remaining.length
            ? t('retry-sends-remaining-attachments')
            : instagramDelivery
            ? t(
                'instagram-forward-history-failed',
                'Instagram accepted the message, but saving its history failed. Do not resend it.',
              )
            : t('facebook-forward-history-failed'),
          variant: 'destructive',
        });
        return;
      }
      if (retryAttachments) {
        setRemainingByDestination((current) => ({
          ...current,
          [destinationId]: [],
        }));
      }
      toast({ title: t('message-forwarded'), variant: 'default' });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('forward-failed', { message: (error as Error).message }),
        variant: 'destructive',
      });
    }
  };

  return {
    form,
    preview,
    conversations,
    conversationsLoading,
    selectedId,
    loading,
    retryCount: remainingByDestination[selectedId]?.length,
    handleForward,
  };
};
