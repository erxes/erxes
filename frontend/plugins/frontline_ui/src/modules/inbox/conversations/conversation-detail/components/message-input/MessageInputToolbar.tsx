import {
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconMessage2,
  IconPaperclip,
} from '@tabler/icons-react';
import { Button, Input, Kbd, Spinner, Toggle } from 'erxes-ui';
import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PollComposer,
  type PollDraft,
} from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';

interface MessageInputToolbarProps {
  canSend: boolean;
  internalNoteLabel: string;
  isDiscord: boolean;
  isInternalNote: boolean;
  isLoading: boolean;
  isUploading: boolean;
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onInternalNoteChange: (pressed: boolean) => void;
  onSend: () => void;
  onSendPoll: (poll: PollDraft) => Promise<boolean>;
  onTemplateSelect: (content: string, templateId?: string) => void;
}

export const MessageInputToolbar = ({
  canSend,
  internalNoteLabel,
  isDiscord,
  isInternalNote,
  isLoading,
  isUploading,
  onFileInput,
  onInternalNoteChange,
  onSend,
  onSendPoll,
  onTemplateSelect,
}: MessageInputToolbarProps) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="mt-auto flex min-w-0 flex-wrap items-center gap-1 border-t bg-muted/20 px-2 py-3 sm:gap-4 sm:px-6">
      <Toggle
        pressed={isInternalNote}
        size="sm"
        variant="outline"
        className="min-w-20 max-w-full px-2 sm:px-5"
        onPressedChange={onInternalNoteChange}
      >
        <span className="truncate">{internalNoteLabel}</span>
      </Toggle>

      <ResponseTemplateSelector onSelect={onTemplateSelect}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconMessage2 className="h-4 w-4" />
        </Button>
      </ResponseTemplateSelector>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <IconPaperclip className="h-4 w-4" />
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={onFileInput}
          multiple
        />
      </Button>

      {isDiscord && !isInternalNote && (
        <PollComposer onSubmit={onSendPoll} loading={isLoading} />
      )}

      <Button
        type="button"
        size="lg"
        className="ml-auto flex-none"
        disabled={isLoading || isUploading || !canSend}
        onClick={onSend}
      >
        {isLoading || isUploading ? <Spinner size="sm" /> : <IconArrowUp />}
        {t('send')}
        <Kbd className="ml-1 hidden sm:flex">
          <IconCommand size={12} />
          <IconCornerDownLeft size={12} />
        </Kbd>
      </Button>
    </div>
  );
};
