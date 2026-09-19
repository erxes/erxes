import { Button, DropdownMenu, Input, Kbd, Spinner, cn } from 'erxes-ui';
import {
  IconArrowUp,
  IconChevronDown,
  IconCommand,
  IconCornerDownLeft,
  IconLock,
  IconMessage2,
  IconPaperclip,
} from '@tabler/icons-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { PollComposer, type PollDraft } from './PollComposer';
import { ResponseTemplateSelector } from './ResponseTemplateSelector';
import { SendSurveyDialog } from './SendSurveyDialog';

type ComposerToolbarProps = {
  conversationId: string;
  integrationChannelId?: string;
  isDiscord: boolean;
  isMessenger: boolean;
  isInternalNote: boolean;
  onlyInternal: boolean;
  isUploading: boolean;
  loading: boolean;
  sendDisabled: boolean;
  onInternalNoteChange: (internal: boolean) => void;
  onFilesSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateSelect: (content: string, templateId?: string) => void;
  onSendPoll: (poll: PollDraft) => Promise<boolean>;
  onSubmit: () => void;
};

export const ComposerToolbar = ({
  conversationId,
  integrationChannelId,
  isDiscord,
  isMessenger,
  isInternalNote,
  onlyInternal,
  isUploading,
  loading,
  sendDisabled,
  onInternalNoteChange,
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

  return (
    <div className="mt-1 flex min-w-0 flex-none flex-wrap items-center gap-1 border-t border-border/50 px-2 py-2 sm:gap-2 sm:px-3">
      {!isInternalNote && (
        <ResponseTemplateSelector onSelect={onTemplateSelect} disabled={isBusy}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('response-templates', 'Response templates')}
            className="size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
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
        className="size-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
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

      {isDiscord && !isInternalNote && (
        <PollComposer onSubmit={onSendPoll} loading={loading} />
      )}

      {isMessenger && !isInternalNote && (
        <SendSurveyDialog
          conversationId={conversationId}
          channelId={integrationChannelId}
        />
      )}

      <div className="ml-auto flex min-w-0 items-center justify-end gap-1 sm:gap-2">
        {!onlyInternal && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                aria-label={t('message-mode', 'Message mode')}
                className={cn(
                  'h-9 max-w-36 gap-1.5 px-2 sm:max-w-none sm:px-3',
                  isInternalNote && 'border-warning/50 bg-warning/20',
                )}
              >
                {isInternalNote ? <IconLock /> : <IconMessage2 />}
                <span className="truncate">
                  {isInternalNote
                    ? t('internal-note', 'Internal Note')
                    : t('reply', 'Reply')}
                </span>
                <IconChevronDown className="size-3.5 flex-none" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.RadioGroup
                value={isInternalNote ? 'note' : 'reply'}
                onValueChange={(value) =>
                  onInternalNoteChange(value === 'note')
                }
              >
                <DropdownMenu.RadioItem value="reply">
                  {t('reply-to-customer', 'Reply to customer')}
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="note">
                  {t('internal-note', 'Internal Note')}
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}

        <Button
          type="button"
          size="sm"
          aria-label={submitLabel}
          className={cn(
            'h-9 flex-none rounded-lg px-2.5 sm:px-4',
            isInternalNote && 'bg-warning text-foreground hover:bg-warning/80',
          )}
          disabled={sendDisabled}
          onClick={onSubmit}
        >
          {isBusy ? (
            <Spinner size="sm" />
          ) : isInternalNote ? (
            <IconLock />
          ) : (
            <IconArrowUp />
          )}
          <span>{submitLabel}</span>
          <Kbd className="ml-1 hidden lg:flex">
            <IconCommand size={12} />
            <IconCornerDownLeft size={12} />
          </Kbd>
        </Button>
      </div>
    </div>
  );
};
