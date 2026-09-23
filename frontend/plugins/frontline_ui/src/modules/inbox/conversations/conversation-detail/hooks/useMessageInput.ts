import type { MessageInputResult } from '@/inbox/conversations/conversation-detail/types/messageInput';
import {
  getBlockAttachments,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';

import {
  hideMessageInputState,
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useTranslation } from 'react-i18next';

import { discordReplyToState } from '@/integrations/discord/states/discordReplyToState';
import { IntegrationType } from '@/types/Integration';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';

import type { PollDraft } from '@/inbox/conversations/conversation-detail/components/PollComposer';

import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';

import type { MessageInputBlocks } from '@/inbox/conversations/conversation-detail/types/messageInput';
import { encodeDiscordMentions } from '@/inbox/conversations/conversation-detail/utils/messageInput';
import { useMessageInputMentions } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputMentions';
import { useMessageInputAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputAttachments';
import { useMessageInputTemplates } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputTemplates';
import { useMessageInputTyping } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputTyping';

export const useMessageInput = (conversationId: string): MessageInputResult => {
  const { t } = useTranslation('frontline');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const isMessenger = integration?.kind === IntegrationType.ERXES_MESSENGER;
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const [discordReplyTo, setDiscordReplyTo] = useAtom(discordReplyToState);
  const [messageReply, setMessageReply] = useAtom(messageReplyState);
  const isFacebook = integration?.kind === IntegrationType.FACEBOOK_MESSENGER;
  const facebookReply = isFacebook ? messageReply : null;
  const replyPreview = facebookReply || (isDiscord ? discordReplyTo : null);
  const discordReplyToMessageId = isDiscord
    ? discordReplyTo?.messageId
    : undefined;
  const replyToMessageId = facebookReply?.nativeReply
    ? facebookReply.providerMessageId
    : discordReplyToMessageId;

  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setOnlyInternal(isLead);
    setIsInternalNote(isLead);
  }, [integration?.kind, conversationId, setOnlyInternal, setIsInternalNote]);

  useEffect(() => {
    setDiscordReplyTo(null);
    setMessageReply(null);
  }, [conversationId, setDiscordReplyTo, setMessageReply]);

  const [content, setContent] = useState<MessageInputBlocks>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const editor = useBlockEditor();
  const { discordMentionItems, searchDiscordMentionItems, discordMentionNote } =
    useMessageInputMentions(conversationId, isDiscord);
  const {
    attachments,
    setAttachments,
    attachmentPreview,
    setAttachmentPreview,
    isLoading,
    handleFileInput,
    handleDrop,
    handleDeleteAttachment,
  } = useMessageInputAttachments();
  const {
    availableChannels,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    responseTemplateId,
    setResponseTemplateId,
    setSearchValue,
    handleTemplateSelect,
    handleKeyDown,
  } = useMessageInputTemplates(editor);
  const { pingAgentTyping, stopAgentTyping } = useMessageInputTyping(
    conversationId,
    isDiscord,
    isInternalNote,
  );
  useEffect(() => {
    if (facebookReply) {
      setIsInternalNote(false);
      editor?.focus();
    }
  }, [facebookReply, editor, setIsInternalNote]);
  const { addConversationMessage, loading } = useConversationMessageAdd();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleChange = useCallback(async () => {
    const blocks = await editor?.document;
    blocks?.pop();
    setContent(blocks);

    const html = await editor?.blocksToHTMLLossy(blocks);
    const plain = html?.replace(/<[^>]+>/g, '')?.trim() || '';

    if (plain.length >= 1) {
      setSearchValue(plain);
      pingAgentTyping();
    } else {
      setSearchValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }

    setMentionedUserIds(
      getMentionedUserIds(
        (blocks || []).map((block) => ({
          content: Array.isArray(block.content)
            ? block.content.flatMap((inline) =>
                inline.type === 'mention' &&
                'props' in inline &&
                '_id' in inline.props
                  ? [
                      {
                        type: inline.type,
                        props: { _id: String(inline.props._id) },
                      },
                    ]
                  : [],
              )
            : [],
        })),
      ),
    );
  }, [
    editor,
    pingAgentTyping,
    setSearchValue,
    setShowSuggestions,
    setSuggestions,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;

    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor?.blocksToHTMLLossy(outgoingBlocks);

    const blockAttachments = getBlockAttachments(content || []);
    const paperclipUrls = new Set(attachments.map((a) => a.url));
    const allAttachments = [
      ...attachments,
      ...blockAttachments.filter((a) => !paperclipUrls.has(a.url)),
    ];

    addConversationMessage({
      variables: {
        conversationId,
        content: sendContent,
        mentionedUserIds: isDiscord && !isInternalNote ? [] : mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
        attachments: allAttachments,
        responseTemplateId: responseTemplateId,
        ...(!isInternalNote && replyToMessageId ? { replyToMessageId } : {}),
      },
      onCompleted: () => {
        toast({
          title: t('message-sent', 'Message sent!'),
          variant: 'default',
        });
        if (content?.length) editor?.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(false);
        setAttachments([]);
        setAttachmentPreview(null);
        setShowSuggestions(false);
        setResponseTemplateId(null);
        setDiscordReplyTo(null);
        setMessageReply(null);
      },
      refetchQueries: [
        'Conversations',
        'ConversationMessages',
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
        ...(isFacebook ? ['FacebookConversationMessages'] : []),
      ],
      onError: (err) => {
        const windowExpired =
          isFacebook && /outside of (?:the )?allowed window/i.test(err.message);
        toast({
          title: windowExpired
            ? t('message-window-expired', 'Messaging window expired')
            : t('message-send-failed', "Couldn't send message"),
          description: windowExpired
            ? t(
                'message-window-expired-description',
                'You can reply once the customer sends a new message.',
              )
            : t(
                'message-send-failed-description',
                'Your message was not sent. Please try again in a moment.',
              ),
          variant: 'destructive',
        });
      },
    });
  }, [
    conversationId,
    isDiscord,
    isInternalNote,
    content,
    editor,
    attachments,
    addConversationMessage,
    mentionedUserIds,
    messageExtraInfo,
    responseTemplateId,
    replyToMessageId,
    isFacebook,
    t,
    setIsInternalNote,
    setAttachments,
    setAttachmentPreview,
    setShowSuggestions,
    setResponseTemplateId,
    setDiscordReplyTo,
    setMessageReply,
  ]);

  const handleSendPoll = useCallback(
    async (poll: PollDraft): Promise<boolean> => {
      if (!conversationId) return false;
      try {
        await addConversationMessage({
          variables: { conversationId, content: '', internal: false, poll },
          refetchQueries: [
            'Conversations',
            'ConversationMessages',
            'ConversationCounts',
            'FrontlineInboxSidebarWorkCounts',
          ],
        });
        toast({ title: t('poll-sent', 'Poll sent!'), variant: 'default' });
        return true;
      } catch (err) {
        toast({
          title: `Failed to send poll: ${(err as Error).message}`,
          variant: 'destructive',
        });
        return false;
      }
    },
    [conversationId, addConversationMessage, t],
  );

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  return {
    isInternalNote,
    setIsInternalNote,
    onlyInternal,
    hideInput,
    integration,
    isDiscord,
    isMessenger,
    replyPreview,
    setDiscordReplyTo,
    setMessageReply,
    discordMentionItems,
    searchDiscordMentionItems,
    discordMentionNote,
    availableChannels,
    content,
    attachments,
    attachmentPreview,
    editor,
    loading,
    isLoading,
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
    stopAgentTyping,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    handleFileInput,
    handleDrop,
    handleDeleteAttachment,
    handleTemplateSelect,
    handleKeyDown,
    handleChange,
    handleSubmit,
    handleSendPoll,
  };
};
