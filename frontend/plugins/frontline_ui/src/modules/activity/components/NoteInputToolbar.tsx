import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import {
  IconCommand,
  IconCornerDownLeft,
  IconMessage2,
  IconPaperclip,
} from '@tabler/icons-react';
import { Button, Input, Kbd, Spinner, Toggle } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const FILE_INPUT_ID = 'ticket-note-file-upload';

interface NoteInputToolbarProps {
  isInternalNote: boolean;
  onInternalNoteChange: (isInternalNote: boolean) => void;
  onTemplateSelect: (templateContent: string) => void;
  onFilesSelected: (files: FileList) => void;
  onSend: () => void;
  isSending: boolean;
}

export const NoteInputToolbar = ({
  isInternalNote,
  onInternalNoteChange,
  onTemplateSelect,
  onFilesSelected,
  onSend,
  isSending,
}: NoteInputToolbarProps) => {
  const { t } = useTranslation('frontline');

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onFilesSelected(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 mt-2 sm:gap-4">
      <Toggle
        pressed={isInternalNote}
        size="lg"
        variant="outline"
        className="min-w-20 max-w-full px-2 sm:px-5"
        onPressedChange={() => onInternalNoteChange(!isInternalNote)}
      >
        <span className="truncate">{t('internal-note')}</span>
      </Toggle>

      {!isInternalNote && (
        <ResponseTemplateSelector onSelect={onTemplateSelect}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconMessage2 className="h-4 w-4" />
          </Button>
        </ResponseTemplateSelector>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => document.getElementById(FILE_INPUT_ID)?.click()}
      >
        <IconPaperclip className="h-4 w-4" />
        <Input
          type="file"
          id={FILE_INPUT_ID}
          className="hidden"
          onChange={handleFileInput}
          multiple
        />
      </Button>

      <Button
        size="lg"
        className="ml-auto flex-none"
        disabled={isSending}
        onClick={onSend}
      >
        {isSending ? <Spinner size="sm" /> : null}
        {t('send')}
        <Kbd className="ml-1">
          <IconCommand size={12} />
          <IconCornerDownLeft size={12} />
        </Kbd>
      </Button>
    </div>
  );
};
