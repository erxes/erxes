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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useThrottledCallback } from 'use-debounce';
import { useMutation } from '@apollo/client';
import { CONVERSATION_AGENT_TYPING } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationAgentTyping';

import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useTranslation } from 'react-i18next';

import type { Block } from '@blocknote/core';
import { IntegrationType } from '@/types/Integration';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import {
  type PollDraft,
} from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { useDiscordMentions } from '@/inbox/conversations/conversation-detail/hooks/useDiscordMentions';
import { useResponseTemplateSuggestions } from '@/inbox/conversations/conversation-detail/hooks/useResponseTemplateSuggestions';
import { useMessageAttachments } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';

const encodeDiscordMentions = (blocks?: Block[]): Block[] | undefined =>
  blocks?.map((block) =>
    Array.isArray(block?.content)
      ? ({
          ...block,
          content: block.content.map(
            (inline: { type?: string; props?: { _id?: string } }) =>
              inline?.type === 'mention'
                ? {
                    type: 'text',
                    text: `{@discord:${inline.props?._id}}`,
                    styles: {},
                  }
                : inline,
          ),
        } as Block)
      : block,
  );

const ATTACHMENT_BLOCK_TYPES = new Set([
  'audio',
  'file',
  'gallery',
  'image',
  'video',
]);

const withoutAttachmentBlocks = (blocks?: Block[]) =>
  blocks?.filter((block) => !ATTACHMENT_BLOCK_TYPES.has(block.type));

const draftKey = (conversationId: string) =>
  `frontline:conversation-draft:${conversationId}`;

export const useMessageInputController = (conversationId: string) => {
  const { t } = useTranslation('frontline');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const [replyTo, setReplyTo] = useAtom(messageReplyState);

  const {
    discordMentionItems,
    discordMentionNote,
    searchDiscordMentionItems,
  } = useDiscordMentions(conversationId, isDiscord);

  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setOnlyInternal(isLead);
    setIsInternalNote(isLead);
  }, [integration?.kind, conversationId, setOnlyInternal, setIsInternalNote]);

  useEffect(() => {
    setReplyTo(null);
  }, [conversationId, setReplyTo]);

  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const {
    attachments,
    attachmentPreview,
    handleDeleteAttachment,
    handleDrop,
    handleFileInput,
    isLoading,
    setAttachmentPreview,
    setAttachments,
  } = useMessageAttachments(isDiscord);


  const editor = useBlockEditor();
  const restoringDraftRef = useRef(false);
  const attachmentExtractionTimerRef = useRef<number>();
  const { addConversationMessage, loading } = useConversationMessageAdd();

  useEffect(
    () => () => {
      window.clearTimeout(attachmentExtractionTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!editor || !conversationId) return;
    restoringDraftRef.current = true;
    try {
      const stored = window.localStorage.getItem(draftKey(conversationId));
      const blocks = stored ? (JSON.parse(stored) as Block[]) : [];
      editor.replaceBlocks(editor.document, blocks);
      setContent(blocks.length ? blocks : undefined);
    } catch {
      window.localStorage.removeItem(draftKey(conversationId));
      editor.replaceBlocks(editor.document, []);
      setContent(undefined);
    } finally {
      window.setTimeout(() => {
        restoringDraftRef.current = false;
      }, 0);
    }
  }, [conversationId, editor]);

  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);
  const pingAgentTyping = useThrottledCallback(
    () => {
      if (isDiscord && !isInternalNote && conversationId) {
        notifyAgentTyping({
          variables: { conversationId, typing: true },
        }).catch(() => undefined);
      }
    },
    10000,
    { leading: true, trailing: false },
  );
  const stopAgentTyping = useCallback(() => {
    pingAgentTyping.cancel();
    if (isDiscord && conversationId) {
      notifyAgentTyping({
        variables: { conversationId, typing: false },
      }).catch(() => undefined);
    }
  }, [isDiscord, conversationId, notifyAgentTyping, pingAgentTyping]);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const {
    availableChannels,
    handleKeyDown,
    handleTemplateSelect,
    responseTemplateId,
    selectedIndex,
    setResponseTemplateId,
    setSearchValue,
    setShowSuggestions,
    setSuggestions,
    showSuggestions,
    suggestions,
  } = useResponseTemplateSuggestions(editor);

  const handleChange = useCallback(async () => {
    if (restoringDraftRef.current) return;
    const editorBlocks = editor?.document || [];
    const attachmentBlocks = editorBlocks.filter((block) =>
      ATTACHMENT_BLOCK_TYPES.has(block.type),
    );
    const textBlocks = editorBlocks.filter(
      (block) => !ATTACHMENT_BLOCK_TYPES.has(block.type),
    );

    if (attachmentBlocks.length) {
      const extractedAttachments = getBlockAttachments(attachmentBlocks);
      setAttachments((current) => {
        const urls = new Set(current.map((attachment) => attachment.url));
        return [
          ...current,
          ...extractedAttachments.filter(
            (attachment) => !urls.has(attachment.url),
          ),
        ];
      });

      window.clearTimeout(attachmentExtractionTimerRef.current);
      attachmentExtractionTimerRef.current = window.setTimeout(async () => {
        if (!editor) return;

        const currentBlocks = editor.document;
        const blocksToRemove = currentBlocks.filter((block) =>
          ATTACHMENT_BLOCK_TYPES.has(block.type),
        );
        if (!blocksToRemove.length) return;

        const remainingBlocks = currentBlocks.filter(
          (block) => !ATTACHMENT_BLOCK_TYPES.has(block.type),
        );

        try {
          if (!remainingBlocks.length) {
            await editor.replaceBlocks(currentBlocks, [
              { type: 'paragraph', content: '' },
            ]);
            return;
          }

          editor.setTextCursorPosition(
            remainingBlocks[remainingBlocks.length - 1],
            'end',
          );
          await editor.removeBlocks(blocksToRemove);
        } catch {
          // Keep the block in the editor if its drag transaction is still
          // active. A later change retries extraction without losing the file.
        }
      }, 120);
    }

    setContent(editorBlocks.length ? (editorBlocks as Block[]) : undefined);

    const html = await editor?.blocksToHTMLLossy(textBlocks);
    const plain = html?.replace(/<[^>]+>/g, '')?.trim() || '';

    if (plain.length >= 1) {
      setSearchValue(plain);
      pingAgentTyping();
    } else {
      setSearchValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }

    setMentionedUserIds(getMentionedUserIds(textBlocks));
    if (conversationId && editorBlocks.length) {
      window.localStorage.setItem(
        draftKey(conversationId),
        JSON.stringify(editorBlocks),
      );
    } else if (conversationId) {
      window.localStorage.removeItem(draftKey(conversationId));
    }
  }, [conversationId, editor, pingAgentTyping]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;

    const messageBlocks = isInternalNote
      ? content
      : withoutAttachmentBlocks(outgoingBlocks);
    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor?.blocksToHTMLLossy(messageBlocks);
    const quotedContent =
      replyTo && !replyTo.nativeReply && !isInternalNote
        ? `<blockquote><strong>Replying to</strong><br/>${replyTo.preview.replace(
            /[&<>"']/g,
            (character) =>
              ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
              }[character] || character),
          )}</blockquote>`
        : '';

    const blockAttachments = getBlockAttachments(content || []);
    const paperclipUrls = new Set(attachments.map((a) => a.url));
    const allAttachments = [
      ...attachments,
      ...blockAttachments.filter((a) => !paperclipUrls.has(a.url)),
    ];

    addConversationMessage({
      variables: {
        conversationId,
        content: `${quotedContent}${sendContent || ''}`,
        mentionedUserIds: isDiscord && !isInternalNote ? [] : mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
        attachments: allAttachments,
        responseTemplateId: responseTemplateId,
        ...(!isInternalNote && replyTo?.nativeReply && replyTo.providerMessageId
          ? { replyToMessageId: replyTo.providerMessageId }
          : {}),
      },
      onCompleted: () => {
        toast({ title: t('message-sent'), variant: 'default' });
        if (content?.length) editor?.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(false);
        setAttachments([]);
        setAttachmentPreview(null);
        setShowSuggestions(false);
        setResponseTemplateId(null);
        setReplyTo(null);
        window.localStorage.removeItem(draftKey(conversationId));
      },
      refetchQueries: [
        'Conversations',
        'ConversationMessages',
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
      ],
      onError: (err) =>
        toast({
          title: 'Message not sent',
          description: err.message.includes('fetch failed')
            ? 'Could not reach Discord. Check the connection and try again.'
            : err.message.replace(
                /^Failed to add message to conversation:\s*/i,
                '',
              ),
          variant: 'destructive',
        }),
    });
  }, [
    conversationId,
    content,
    mentionedUserIds,
    isInternalNote,
    isDiscord,
    replyTo,
    setReplyTo,
    messageExtraInfo,
    attachments,
    editor,
    addConversationMessage,
    setIsInternalNote,
    responseTemplateId,
    t,
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
        toast({ title: 'Poll sent!', variant: 'default' });
        return true;
      } catch (err) {
        toast({
          title: `Failed to send poll: ${(err as Error).message}`,
          variant: 'destructive',
        });
        return false;
      }
    },
    [conversationId, addConversationMessage],
  );

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  return {
    attachments, attachmentPreview, availableChannels, content,
    discordMentionItems, discordMentionNote, editor,
    goBackToPreviousHotkeyScope, handleChange, handleDeleteAttachment,
    handleDrop, handleFileInput, handleKeyDown, handleSendPoll, handleSubmit,
    handleTemplateSelect, hideInput, isDiscord, isInternalNote, isLoading,
    loading, onlyInternal, replyTo, searchDiscordMentionItems, selectedIndex,
    setHotkeyScopeAndMemorizePreviousScope, setIsInternalNote, setReplyTo,
    setShowSuggestions, showSuggestions, stopAgentTyping, suggestions, t,
  };
};

export type MessageInputController = ReturnType<typeof useMessageInputController>;
