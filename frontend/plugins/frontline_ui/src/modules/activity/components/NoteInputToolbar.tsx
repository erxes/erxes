import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import {
  IconCommand,
  IconCornerDownLeft,
  IconLock,
  IconMessage2,
  IconPaperclip,
  IconSend,
} from '@tabler/icons-react';
import { Button, Input, Kbd, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const FILE_INPUT_ID = 'ticket-note-file-upload';

interface NoteInputToolbarProps {
  isInternalNote: boolean;
  onTemplateSelect: (templateContent: string) => void;
  onFilesSelected: (files: FileList) => void;
  onSend: () => void;
  isSending: boolean;
}

export const NoteInputToolbar = ({
  isInternalNote,
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

  const submitLabel = isInternalNote
    ? t('add-note', 'Add note')
    : t('send', 'Send');

  let submitIcon = <IconSend />;

  if (isSending) {
    submitIcon = <Spinner size="sm" />;
  } else if (isInternalNote) {
    submitIcon = <IconLock />;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 mt-2 sm:gap-4">
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
        className={cn(
          'ml-auto flex-none',
          isInternalNote && 'bg-warning text-foreground hover:bg-warning/80',
        )}
        disabled={isSending}
        onClick={onSend}
      >
        {submitIcon}
        {submitLabel}
        <Kbd className="ml-1">
          <IconCommand size={12} />
          <IconCornerDownLeft size={12} />
        </Kbd>
      </Button>
    </div>
  );
};
