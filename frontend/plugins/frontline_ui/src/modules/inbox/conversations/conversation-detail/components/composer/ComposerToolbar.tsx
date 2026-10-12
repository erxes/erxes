import { Button, Input, Kbd, Spinner, cn } from 'erxes-ui';
import {
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconLock,
  IconMessage2,
  IconPaperclip,
} from '@tabler/icons-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERNAL_NOTE_BUTTON } from '@/inbox/constants/internalNoteStyles';

import {
  PollComposer,
  type PollDraft,
} from '@/inbox/conversations/conversation-detail/components/PollComposer';
import { ResponseTemplateSelector } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateSelector';
import { SendSurveyDialog } from '@/inbox/conversations/conversation-detail/components/SendSurveyDialog';

type ComposerToolbarProps = {
  conversationId: string;
  integrationChannelId?: string;
  isDiscord: boolean;
  isTelegram?: boolean;
  isMessenger: boolean;
  isInternalNote: boolean;
  isUploading: boolean;
  loading: boolean;
  sendDisabled: boolean;
  onFilesSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateSelect: (content: string, templateId?: string) => void;
  onSendPoll: (poll: PollDraft) => Promise<boolean>;
  onSubmit: () => void;
};

export const ComposerToolbar = ({
  conversationId,
  integrationChannelId,
  isDiscord,
  isTelegram = false,
  isMessenger,
  isInternalNote,
  isUploading,
  loading,
  sendDisabled,
  onFilesSelected,
  onTemplateSelect,
  onSendPoll,
  onSubmit,
}: ComposerToolbarProps) => {
  const { t } = useTranslation('frontline');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBusy = loading || isUploading;
  const submitLabel = isInternalNote
    ? t('add-note', 'Add note')
    : t('send', 'Send');
  let submitIcon = <IconArrowUp />;

  if (isBusy) {
    submitIcon = <Spinner size="sm" />;
  } else if (isInternalNote) {
    submitIcon = <IconLock />;
  }

  return (
    <div
      data-composer-footer
      className="flex min-w-0 flex-none items-center gap-1 px-3 py-2 sm:gap-2"
    >
      {!isInternalNote && (
        <ResponseTemplateSelector onSelect={onTemplateSelect} disabled={isBusy}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('response-templates', 'Response templates')}
            className="size-8 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            disabled={isBusy}
          >
            <IconMessage2 className="size-4" />
          </Button>
        </ResponseTemplateSelector>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('attach-file', 'Attach file')}
        className="size-8 flex-none rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        onClick={() => fileInputRef.current?.click()}
        disabled={isBusy}
      >
        <IconPaperclip className="size-4" />
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFilesSelected}
        multiple
      />

      {(isDiscord || isTelegram) && !isInternalNote && (
        <PollComposer
          provider={isTelegram ? 'Telegram' : 'Discord'}
          onSubmit={onSendPoll}
          loading={loading}
        />
      )}

      {isMessenger && !isInternalNote && (
        <SendSurveyDialog
          conversationId={conversationId}
          channelId={integrationChannelId}
        />
      )}

      <div className="ml-auto flex min-w-0 items-center justify-end gap-3">
        <Kbd className="hidden gap-0.5 border-0 bg-transparent px-0 text-muted-foreground opacity-100 sm:inline-flex">
          <IconCommand size={12} />
          <IconCornerDownLeft size={12} />
        </Kbd>
        <Button
          type="button"
          size="sm"
          aria-label={submitLabel}
          className={cn(
            'h-8 flex-none gap-1.5 rounded-lg px-3 shadow-none',
            isInternalNote && INTERNAL_NOTE_BUTTON,
          )}
          disabled={sendDisabled}
          onClick={onSubmit}
        >
          {submitIcon}
          <span>{submitLabel}</span>
        </Button>
      </div>
    </div>
  );
};
