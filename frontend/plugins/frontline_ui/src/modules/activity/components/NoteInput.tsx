import {
  BlockEditor,
  cn,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

import { AssignMemberInEditor } from 'ui-modules';
import type { Block } from '@blocknote/core';
import { NoteAttachments } from '@/activity/components/NoteAttachments';
import { NoteAudienceHint } from '@/activity/components/NoteAudienceHint';
import { NoteInputToolbar } from '@/activity/components/NoteInputToolbar';
import { ComposerModeTabs } from '@/inbox/conversations/conversation-detail/components/ComposerModeTabs';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { TicketHotKeyScope } from '@/ticket/types/ticketHotkeyScope';
import {
  serializeNoteBlocks,
  trimEmptyBlocks,
} from '@/activity/utils/noteBlocks';
import { ITicketNoteMailDelivery } from '@/activity/types';
import { useCreateTicketNote } from '@/activity/hooks/useCreateTicketNote';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useNoteAttachments } from '@/activity/hooks/useNoteAttachments';
import { useNoteTemplateSuggestions } from '@/activity/hooks/useNoteTemplateSuggestions';
import { useTranslation } from 'react-i18next';

export const NoteInput = ({ contentId }: { contentId: string }) => {
  const { t } = useTranslation('frontline');
  const editor = useBlockEditor({
    placeholder: t('write-a-message', 'Write a message...'),
  });
  const { createTicketNote, loading } = useCreateTicketNote();
  const [isInternalNote, setIsInternalNote] = useState(true);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const { channels: availableChannels } = useGetChannels();
  const {
    suggestions,
    showSuggestions,
    selectedIndex,
    selectTemplate,
    resetSuggestions,
    handleEditorChange,
    handleKeyDown,
  } = useNoteTemplateSuggestions({ editor, enabled: !isInternalNote });

  const {
    attachments,
    attachmentPreview,
    isUploading,
    uploadFiles,
    removeAttachment,
    resetAttachments,
  } = useNoteAttachments();

  const handleInternalNoteChange = (value: boolean) => {
    setIsInternalNote(value);
    resetSuggestions();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    uploadFiles(e.dataTransfer.files);
  };

  const notifyDeliveryIssue = (delivery?: ITicketNoteMailDelivery | null) => {
    if (delivery?.status !== 'failed' && delivery?.status !== 'bounced') {
      return;
    }

    toast({
      title: t(
        'ticket-reply-not-delivered',
        'The reply was saved, but the email was not delivered',
      ),
      description:
        delivery.status === 'bounced'
          ? t(
              'email-bounced-for',
              'The receiving server rejected {{recipients}}',
              { recipients: (delivery.bouncedRecipients ?? []).join(', ') },
            )
          : (delivery.error ?? undefined),
      variant: 'destructive',
    });
  };

  const onSend = () => {
    const trimmedContent = trimEmptyBlocks((editor?.document || []) as Block[]);
    if (trimmedContent.length === 0 && attachments.length === 0) return;

    createTicketNote({
      variables: {
        content: serializeNoteBlocks(trimmedContent),
        contentId,
        mentions: getMentionedUserIds(
          trimmedContent as Parameters<typeof getMentionedUserIds>[0],
        ),
        attachments: attachments
          .filter((file) => !!file.url)
          .map(({ name, url, type, size }) => ({ name, url, type, size })),
        isInternal: isInternalNote,
      },
      onCompleted: ({ ticketCreateNote }) => {
        editor.replaceBlocks(editor.topLevelBlocks, []);
        resetAttachments();
        resetSuggestions();
        notifyDeliveryIssue(ticketCreateNote?.mailDelivery);
      },
      onError: (err) =>
        toast({
          title: err.message,
          variant: 'destructive',
        }),
    });
  };

  useScopedHotkeys('mod+enter', onSend, TicketHotKeyScope.NoteInput);

  /*
   * The keys that drive the template suggestions are listened for on the
   * editor node rather than on the wrapper below: only the editor takes focus,
   * and the wrapper is a drop target with no keyboard role of its own.
   */
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = editorRef.current;

    if (!node) {
      return;
    }

    node.addEventListener('keydown', handleKeyDown);

    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        'relative flex flex-col overflow-hidden border rounded-lg px-4 py-3 gap-1',
        'transition-colors duration-150',
        isInternalNote && 'border-warning/50 bg-warning/20',
      )}
    >
      <div className="flex flex-col gap-1.5 border-b border-border/50 pb-2 mb-1">
        <ComposerModeTabs
          isInternalNote={isInternalNote}
          disabled={loading}
          onInternalNoteChange={handleInternalNoteChange}
        />
        <NoteAudienceHint
          ticketId={contentId}
          isInternalNote={isInternalNote}
        />
      </div>

      {showSuggestions && !isInternalNote && (
        <ResponseTemplateDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          availableChannels={availableChannels}
          onSelect={selectTemplate}
        />
      )}

      <div ref={editorRef}>
        <BlockEditor
          editor={editor}
          onChange={handleEditorChange}
          onFocus={() =>
            setHotkeyScopeAndMemorizePreviousScope(TicketHotKeyScope.NoteInput)
          }
          onBlur={() => goBackToPreviousHotkeyScope()}
          className="read-only min-h-30 overflow-y-auto"
        >
          {isInternalNote && <AssignMemberInEditor editor={editor} />}
        </BlockEditor>
      </div>

      <NoteAttachments
        attachments={attachments}
        attachmentPreview={attachmentPreview}
        onRemove={removeAttachment}
      />

      <NoteInputToolbar
        isInternalNote={isInternalNote}
        onTemplateSelect={selectTemplate}
        onFilesSelected={uploadFiles}
        onSend={onSend}
        isSending={loading || isUploading}
      />
    </div>
  );
};
