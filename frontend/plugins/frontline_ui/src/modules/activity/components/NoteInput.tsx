import { useCreateTicketNote } from '@/activity/hooks/useCreateTicketNote';
import { useNoteAttachments } from '@/activity/hooks/useNoteAttachments';
import { useNoteTemplateSuggestions } from '@/activity/hooks/useNoteTemplateSuggestions';
import { trimEmptyBlocks } from '@/activity/utils/noteBlocks';
import type { Block } from '@blocknote/core';
import { NoteAttachments } from '@/activity/components/NoteAttachments';
import { NoteInputToolbar } from '@/activity/components/NoteInputToolbar';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { TicketHotKeyScope } from '@/ticket/types/ticketHotkeyScope';
import {
  BlockEditor,
  cn,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssignMemberInEditor } from 'ui-modules';

export const NoteInput = ({ contentId }: { contentId: string }) => {
  const { t } = useTranslation('frontline');
  const editor = useBlockEditor({ placeholder: t('leave-a-note') });
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

  const onSend = () => {
    const trimmedContent = trimEmptyBlocks((editor?.document || []) as Block[]);
    if (trimmedContent.length === 0 && attachments.length === 0) return;

    createTicketNote({
      variables: {
        content: JSON.stringify(trimmedContent),
        contentId,
        mentions: getMentionedUserIds(
          trimmedContent as Parameters<typeof getMentionedUserIds>[0],
        ),
        attachments: attachments
          .filter((file) => !!file.url)
          .map(({ name, url, type, size }) => ({ name, url, type, size })),
      },
      onCompleted: () => {
        editor.replaceBlocks(editor.topLevelBlocks, []);
        resetAttachments();
        resetSuggestions();
      },
      onError: (err) =>
        toast({
          title: err.message,
          variant: 'destructive',
        }),
    });
  };

  useScopedHotkeys('mod+enter', onSend, TicketHotKeyScope.NoteInput);

  return (
    <div
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        'relative flex flex-col overflow-hidden border rounded-lg px-4 py-3 gap-1',
        'transition-colors duration-150',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
        'before:transition-colors before:duration-150',
        isInternalNote ? 'before:bg-primary' : 'before:bg-transparent',
      )}
    >
      {showSuggestions && !isInternalNote && (
        <ResponseTemplateDropdown
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          availableChannels={availableChannels}
          onSelect={selectTemplate}
        />
      )}

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

      <NoteAttachments
        attachments={attachments}
        attachmentPreview={attachmentPreview}
        onRemove={removeAttachment}
      />

      <NoteInputToolbar
        isInternalNote={isInternalNote}
        onInternalNoteChange={handleInternalNoteChange}
        onTemplateSelect={selectTemplate}
        onFilesSelected={uploadFiles}
        onSend={onSend}
        isSending={loading || isUploading}
      />
    </div>
  );
};
