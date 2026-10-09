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
import { useRef } from 'react';
import { INTERNAL_NOTE_BUTTON } from '@/inbox/constants/internalNoteStyles';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="mt-2 flex min-w-0 items-center gap-1 py-1 sm:gap-2">
      {!isInternalNote && (
        <ResponseTemplateSelector onSelect={onTemplateSelect}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('response-templates', 'Response templates')}
            disabled={isSending}
            className="size-8 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <IconMessage2 className="h-4 w-4" />
          </Button>
        </ResponseTemplateSelector>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('attach-file', 'Attach file')}
        disabled={isSending}
        className="size-8 flex-none rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        onClick={() => fileInputRef.current?.click()}
      >
        <IconPaperclip className="h-4 w-4" />
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
        multiple
      />

      <div className="ml-auto flex min-w-0 items-center gap-3">
        <Kbd className="hidden gap-0.5 border-0 bg-transparent px-0 text-muted-foreground opacity-100 sm:inline-flex">
          <IconCommand size={12} />
          <IconCornerDownLeft size={12} />
        </Kbd>
        <Button
          type="button"
          size="sm"
          className={cn(
            'h-8 flex-none gap-1.5 rounded-lg px-3 shadow-none',
            isInternalNote && INTERNAL_NOTE_BUTTON,
          )}
          disabled={isSending}
          onClick={onSend}
        >
          {submitIcon}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};
