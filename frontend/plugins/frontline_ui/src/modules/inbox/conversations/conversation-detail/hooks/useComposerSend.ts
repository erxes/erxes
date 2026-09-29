import type { Block } from '@blocknote/core';
import {
  getBlockAttachments,
  toast,
  useBlockEditor,
  type IAttachment,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { PollDraft } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import {
  composerStorage,
  encodeDiscordMentions,
  escapeComposerQuote,
} from '@/inbox/conversations/conversation-detail/utils/messageInput';

const REFETCH_AFTER_SEND = [
  'Conversations',
  'ConversationMessages',
  'ConversationCounts',
  'FrontlineInboxSidebarWorkCounts',
];

type ComposerSendOptions = {
  conversationId: string;
  draftKey: string | null;
  editor: ReturnType<typeof useBlockEditor>;
  content?: Block[];
  attachments: IAttachment[];
  mentionedUserIds: string[];
  isDiscord: boolean;
  isFacebook: boolean;
  isInternalNote: boolean;
  isUploading: boolean;
  responseTemplateId: string | null;
  resetComposer: () => void;
  onPartialDelivery: (remainingAttachments: IAttachment[]) => void;
};

export const useComposerSend = ({
  conversationId,
  draftKey,
  editor,
  content,
  attachments,
  mentionedUserIds,
  isDiscord,
  isFacebook,
  isInternalNote,
  isUploading,
  responseTemplateId,
  resetComposer,
  onPartialDelivery,
}: ComposerSendOptions) => {
  const { t } = useTranslation('frontline');
  const replyTo = useAtomValue(messageReplyState);
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const submittingRef = useRef(false);
  const activeConversationIdRef = useRef(conversationId);
  const activeDraftKeyRef = useRef(draftKey);

  useLayoutEffect(() => {
    activeConversationIdRef.current = conversationId;
    activeDraftKeyRef.current = draftKey;
  }, [conversationId, draftKey]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId || loading || isUploading || submittingRef.current)
      return;
    if (!content?.length && attachments.length === 0) return;
    submittingRef.current = true;
    const submittedConversationId = conversationId;
    const submittedDraftKey = draftKey;

    try {
      const outgoingBlocks =
        isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;
      const sendContent = isInternalNote
        ? JSON.stringify(content || [])
        : await editor.blocksToHTMLLossy(outgoingBlocks || []);
      const quotedContent =
        replyTo && !replyTo.nativeReply && !isInternalNote
          ? `<blockquote><strong>Replying to</strong><br/>${escapeComposerQuote(
              replyTo.preview,
            )}</blockquote>`
          : '';
      const blockAttachments = getBlockAttachments(content || []);
      const attachmentUrls = new Set(attachments.map(({ url }) => url));
      const allAttachments = [
        ...attachments,
        ...blockAttachments.filter(({ url }) => !attachmentUrls.has(url)),
      ];

      await addConversationMessage({
        variables: {
          conversationId: submittedConversationId,
          content: `${quotedContent}${sendContent || ''}`,
          mentionedUserIds:
            isDiscord && !isInternalNote ? [] : mentionedUserIds,
          internal: isInternalNote,
          extraInfo: messageExtraInfo,
          attachments: allAttachments,
          responseTemplateId,
          ...(!isInternalNote &&
          replyTo?.nativeReply &&
          replyTo.providerMessageId
            ? { replyToMessageId: replyTo.providerMessageId }
            : {}),
        },
        onCompleted: (result) => {
          const delivery = isFacebook
            ? result.conversationMessageAdd.extraData?.facebookDelivery
            : undefined;
          if (delivery?.status === 'partial') {
            const remainingAttachments = allAttachments.filter(
              ({ url }) => !delivery.sentAttachmentUrls.includes(url),
            );
            if (submittedDraftKey)
              composerStorage.removeItem(submittedDraftKey);
            if (
              activeConversationIdRef.current === submittedConversationId &&
              activeDraftKeyRef.current === submittedDraftKey
            ) {
              onPartialDelivery(remainingAttachments);
            }
            toast({
              title: remainingAttachments.length
                ? t('message-partially-sent', 'Message partially sent')
                : t('message-sent-with-warning', 'Message sent with a warning'),
              description: remainingAttachments.length
                ? t(
                    'message-partially-sent-description',
                    '{{count}} attachment(s) were not sent. Only these remain for retry.',
                    { count: remainingAttachments.length },
                  )
                : t(
                    'message-history-update-failed',
                    'Facebook accepted the message, but saving its history failed. Do not resend it.',
                  ),
              variant: 'destructive',
            });
            return;
          }
          toast({
            title: isInternalNote
              ? t('note-added', 'Internal note added')
              : t('message-sent', 'Message sent!'),
          });
          if (submittedDraftKey) composerStorage.removeItem(submittedDraftKey);
          if (
            activeConversationIdRef.current === submittedConversationId &&
            activeDraftKeyRef.current === submittedDraftKey
          ) {
            resetComposer();
          }
        },
        refetchQueries: [
          ...REFETCH_AFTER_SEND,
          ...(isFacebook ? ['FacebookConversationMessages'] : []),
        ],
        onError: (error) => {
          const windowExpired =
            isFacebook &&
            /outside of (?:the )?allowed window/i.test(error.message);
          toast({
            title: windowExpired
              ? t('message-window-expired', 'Messaging window expired')
              : t('failed-to-send', 'Failed to send'),
            description: windowExpired
              ? t(
                  'message-window-expired-description',
                  'You can reply once the customer sends a new message.',
                )
              : error.message,
            variant: 'destructive',
          });
        },
      });
    } finally {
      submittingRef.current = false;
    }
  }, [
    addConversationMessage,
    attachments,
    content,
    conversationId,
    draftKey,
    editor,
    isDiscord,
    isFacebook,
    isInternalNote,
    isUploading,
    loading,
    mentionedUserIds,
    messageExtraInfo,
    onPartialDelivery,
    replyTo,
    resetComposer,
    responseTemplateId,
    t,
  ]);

  const handleSendPoll = useCallback(
    async (poll: PollDraft): Promise<boolean> => {
      if (!conversationId) return false;
      try {
        await addConversationMessage({
          variables: { conversationId, content: '', internal: false, poll },
          refetchQueries: REFETCH_AFTER_SEND,
        });
        toast({ title: t('poll-sent', 'Poll sent!') });
        return true;
      } catch (error) {
        toast({
          title: t('failed-to-send-poll', 'Failed to send poll'),
          description: (error as Error).message,
          variant: 'destructive',
        });
        return false;
      }
    },
    [addConversationMessage, conversationId, t],
  );

  return { handleSubmit, handleSendPoll, loading };
};
