import type { Block } from '@blocknote/core';
import {
  getBlockAttachments,
  getMentionedUserIds,
  stripHtml,
  type IAttachment,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { currentUserState } from 'ui-modules';
import {
  isInternalState,
  isInternalNoteCollapsedState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import {
  clearLegacyConversationDrafts,
  composerStorage,
  getConversationDraftKey,
  parseConversationDraft,
} from '@/inbox/conversations/conversation-detail/utils/messageInput';
import { NOTE_ONLY_INTEGRATION_KINDS } from '@/inbox/conversations/conversation-detail/constants/composer';
import type {
  ComposerDraftOptions,
  ComposerDraftResult,
} from '@/inbox/conversations/conversation-detail/types/composer';

export const useComposerDraft = ({
  conversationId,
  integrationKind,
  editor,
  resetAttachments,
  retainAttachments,
  resetSuggestions,
  setResponseTemplateId,
  setSearchValue,
  pingAgentTyping,
}: ComposerDraftOptions): ComposerDraftResult => {
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const currentUserId = useAtomValue(currentUserState)?._id;
  const [replyTo, setReplyTo] = useAtom(messageReplyState);
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const setIsInternalNoteCollapsed = useSetAtom(isInternalNoteCollapsedState);
  const draftInternalRef = useRef(false);
  const restoredDraftKeyRef = useRef<string>();
  const restoringDraftRef = useRef(false);
  const draftKey = currentUserId
    ? getConversationDraftKey(currentUserId, conversationId)
    : null;
  useEffect(() => {
    clearLegacyConversationDrafts();
  }, []);

  useEffect(() => {
    if (!draftKey || restoredDraftKeyRef.current === draftKey) return;
    restoredDraftKeyRef.current = draftKey;
    restoringDraftRef.current = true;
    resetAttachments();
    resetSuggestions();

    try {
      const draft = parseConversationDraft(composerStorage.getItem(draftKey));
      draftInternalRef.current = draft.internal ?? false;
      editor.replaceBlocks(editor.document, draft.blocks);
      setContent(draft.blocks.length ? draft.blocks : undefined);
      setIsInternalNote(draftInternalRef.current);
    } catch {
      draftInternalRef.current = false;
      composerStorage.removeItem(draftKey);
      editor.replaceBlocks(editor.document, []);
      setContent(() => undefined);
      setIsInternalNote(false);
    } finally {
      window.setTimeout(() => {
        restoringDraftRef.current = false;
      }, 0);
    }
  }, [draftKey, editor, resetAttachments, resetSuggestions, setIsInternalNote]);

  useEffect(() => {
    const isNoteOnly = NOTE_ONLY_INTEGRATION_KINDS.includes(
      integrationKind ?? '',
    );
    setIsInternalNoteCollapsed(false);
    setOnlyInternal(isNoteOnly);
    setIsInternalNote(isNoteOnly || draftInternalRef.current);
  }, [
    conversationId,
    integrationKind,
    setIsInternalNote,
    setIsInternalNoteCollapsed,
    setOnlyInternal,
  ]);

  useEffect(() => {
    if (replyTo && !onlyInternal) {
      setIsInternalNote(false);
      setIsInternalNoteCollapsed(false);
    }
  }, [replyTo, onlyInternal, setIsInternalNote, setIsInternalNoteCollapsed]);

  const handleInternalNoteChange = useCallback(
    (internal: boolean) => {
      setIsInternalNoteCollapsed(false);
      setIsInternalNote(internal);
      resetSuggestions();
      setResponseTemplateId(null);
      if (content?.length && draftKey) {
        composerStorage.setItem(
          draftKey,
          JSON.stringify({ blocks: content, internal }),
        );
      }
    },
    [
      content,
      draftKey,
      resetSuggestions,
      setIsInternalNote,
      setIsInternalNoteCollapsed,
      setResponseTemplateId,
    ],
  );

  const handleChange = useCallback(async () => {
    if (restoringDraftRef.current) return;

    const blocks = editor.document as Block[];
    const html = await editor.blocksToHTMLLossy(blocks);
    const plain = stripHtml(html).trim();
    const hasBlockAttachments = getBlockAttachments(blocks).length > 0;
    const nextContent = plain || hasBlockAttachments ? blocks : undefined;

    setContent(nextContent);
    setSearchValue(plain);
    if (plain) pingAgentTyping();
    setMentionedUserIds(getMentionedUserIds(blocks));

    if (nextContent && draftKey) {
      composerStorage.setItem(
        draftKey,
        JSON.stringify({ blocks, internal: isInternalNote }),
      );
    } else if (draftKey) {
      composerStorage.removeItem(draftKey);
    }
  }, [draftKey, editor, isInternalNote, pingAgentTyping, setSearchValue]);

  const resetComposer = useCallback(() => {
    editor.replaceBlocks(editor.document, []);
    setContent(() => undefined);
    setMentionedUserIds([]);
    setIsInternalNote(onlyInternal);
    resetAttachments();
    resetSuggestions();
    setResponseTemplateId(null);
    setReplyTo(null);
  }, [
    editor,
    onlyInternal,
    resetAttachments,
    resetSuggestions,
    setIsInternalNote,
    setReplyTo,
    setResponseTemplateId,
  ]);

  const handlePartialDelivery = useCallback(
    (remainingAttachments: IAttachment[]) => {
      resetComposer();
      retainAttachments(remainingAttachments);
    },
    [resetComposer, retainAttachments],
  );

  return {
    draftKey,
    content,
    mentionedUserIds,
    handleInternalNoteChange,
    handleChange,
    resetComposer,
    handlePartialDelivery,
  };
};
