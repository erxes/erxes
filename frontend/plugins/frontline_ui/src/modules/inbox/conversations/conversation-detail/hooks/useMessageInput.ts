import {
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  hideMessageInputState,
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { discordReplyToState } from '@/integrations/discord/states/discordReplyToState';
import { IntegrationType } from '@/types/Integration';
import { type PollDraft } from '@/inbox/conversations/conversation-detail/components/PollComposer';
import {
  encodeDiscordMentions,
  getMessageMentionedUserIds,
  getPlainTextFromHtml,
  mergeMessageAttachments,
  type MessageEditorBlock,
} from '@/inbox/conversations/utils/messageInputUtils';
import { useMessageAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';
import { useMessageInputDiscord } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputDiscord';
import { useMessageInputTemplates } from '@/inbox/conversations/conversation-detail/hooks/useMessageInputTemplates';

export const useMessageInput = (conversationId: string) => {
  const { t } = useTranslation('frontline');
  const internalNoteLabel = t('internal-note', {
    defaultValue: 'Internal note',
  });
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const [discordReplyTo, setDiscordReplyTo] = useAtom(discordReplyToState);
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const [content, setContent] = useState<MessageEditorBlock[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const editor = useBlockEditor();
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const attachmentState = useMessageAttachments();
  const templateState = useMessageInputTemplates(editor);
  const discordState = useMessageInputDiscord({
    conversationId,
    isDiscord,
    isInternalNote,
  });

  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setOnlyInternal(isLead);
    setIsInternalNote(isLead);
  }, [conversationId, integration?.kind, setIsInternalNote, setOnlyInternal]);

  useEffect(() => {
    setDiscordReplyTo(null);
  }, [conversationId, setDiscordReplyTo]);

  const handleChange = useCallback(async () => {
    const blocks = editor.document;
    blocks.pop();
    setContent(blocks);

    const html = await editor.blocksToHTMLLossy(blocks);
    const plainText = getPlainTextFromHtml(html);

    if (plainText) {
      templateState.setSearchValue(plainText);
      discordState.pingAgentTyping();
    } else {
      templateState.clearSuggestions();
    }

    setMentionedUserIds(getMessageMentionedUserIds(blocks));
  }, [discordState, editor, templateState]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;
    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor.blocksToHTMLLossy(outgoingBlocks);

    addConversationMessage({
      variables: {
        conversationId,
        content: sendContent,
        mentionedUserIds: isDiscord && !isInternalNote ? [] : mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
        attachments: mergeMessageAttachments(
          content,
          attachmentState.attachments,
        ),
        responseTemplateId: templateState.responseTemplateId,
        ...(isDiscord && !isInternalNote && discordReplyTo
          ? { replyToMessageId: discordReplyTo.messageId }
          : {}),
      },
      onCompleted: () => {
        toast({ title: t('message-sent'), variant: 'default' });
        if (content?.length) editor.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(onlyInternal);
        attachmentState.resetAttachments();
        templateState.resetTemplate();
        setDiscordReplyTo(null);
      },
      refetchQueries: ['Conversations'],
      onError: (error) =>
        toast({
          title: t('failed-to-send', { message: error.message }),
          variant: 'destructive',
        }),
    });
  }, [
    addConversationMessage,
    attachmentState,
    content,
    conversationId,
    discordReplyTo,
    editor,
    isDiscord,
    isInternalNote,
    mentionedUserIds,
    messageExtraInfo,
    onlyInternal,
    setDiscordReplyTo,
    setIsInternalNote,
    t,
    templateState,
  ]);

  const handleSendPoll = useCallback(
    async (poll: PollDraft): Promise<boolean> => {
      if (!conversationId) return false;

      try {
        await addConversationMessage({
          variables: { conversationId, content: '', internal: false, poll },
          refetchQueries: ['Conversations'],
        });
        toast({ title: 'Poll sent!', variant: 'default' });
        return true;
      } catch (error) {
        toast({
          title: `Failed to send poll: ${(error as Error).message}`,
          variant: 'destructive',
        });
        return false;
      }
    },
    [addConversationMessage, conversationId],
  );

  const handleEditorFocus = useCallback(() => {
    setHotkeyScopeAndMemorizePreviousScope(InboxHotkeyScope.MessageInput);
  }, [setHotkeyScopeAndMemorizePreviousScope]);

  const handleEditorBlur = useCallback(() => {
    goBackToPreviousHotkeyScope();
    discordState.stopAgentTyping();
  }, [discordState, goBackToPreviousHotkeyScope]);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => event.preventDefault(),
    [],
  );

  const handleInternalNoteChange = useCallback(
    (pressed: boolean) => setIsInternalNote(onlyInternal || pressed),
    [onlyInternal, setIsInternalNote],
  );

  const handleCancelDiscordReply = useCallback(
    () => setDiscordReplyTo(null),
    [setDiscordReplyTo],
  );

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  return {
    attachmentState,
    canSend: Boolean(content?.length || attachmentState.attachments.length),
    discordReplyTo,
    discordState,
    editor,
    handleCancelDiscordReply,
    handleChange,
    handleDragOver,
    handleEditorBlur,
    handleEditorFocus,
    handleInternalNoteChange,
    handleSendPoll,
    handleSubmit,
    hideInput,
    internalNoteLabel,
    isDiscord,
    isInternalNote,
    loading,
    templateState,
  };
};
