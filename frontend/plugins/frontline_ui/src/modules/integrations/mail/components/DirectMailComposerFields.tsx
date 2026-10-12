import type { MailAttachmentInput } from '../types/mailDelivery';
import {
  IconMinus,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconTypography,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Input,
  Select,
  Spinner,
  useBlockEditor,
  usePreviousHotkeyScope,
} from 'erxes-ui';
import { Controller, useFormContext } from 'react-hook-form';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useDirectMailComposerFields } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeValues,
  MailSender,
} from '@/integrations/mail/types/directMailComposer';
import { ToRow } from './DirectMailRecipientField';
import {
  DirectMailFormatting,
  DirectMailInsertTools,
} from './DirectMailToolbar';

export const ComposerHeader = ({
  onClose,
  onMinimize,
  onExpand,
  minimized,
  expanded,
  loading,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onExpand: () => void;
  minimized: boolean;
  expanded: boolean;
  loading: boolean;
}) => (
  <header
    className="flex h-9 flex-none items-center justify-between bg-[#f2f6fc] px-4 text-[#041e49]"
    onDoubleClick={(event) => {
      if (!(event.target instanceof Element) || !event.target.closest('button'))
        onExpand();
    }}
  >
    {minimized ? (
      <Button
        type="button"
        variant="ghost"
        className="h-8 p-0 text-sm font-medium hover:bg-transparent"
        onClick={onMinimize}
      >
        New Message
      </Button>
    ) : (
      <span className="text-sm font-medium">New Message</span>
    )}
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={
          minimized ? 'Restore email composer' : 'Minimize email composer'
        }
        onClick={onMinimize}
      >
        <IconMinus className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={expanded ? 'Exit full screen' : 'Full screen'}
        onClick={onExpand}
      >
        {expanded ? (
          <IconArrowsMinimize className="size-4" />
        ) : (
          <IconArrowsMaximize className="size-4" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label="Close email composer"
        onClick={onClose}
        disabled={loading}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  </header>
);

export const FromRow = ({
  sendersLoading,
  selectedSender,
  sendersError,
  senders,
  disabled,
  onRetry,
}: {
  sendersLoading: boolean;
  selectedSender?: MailSender;
  sendersError?: unknown;
  senders: MailSender[];
  disabled: boolean;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  const integrationError = errors.integrationId;

  const renderSender = () => {
    if (sendersLoading) {
      return (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Spinner size="sm" />
          {'Loading sender…'}
        </span>
      );
    }

    if (senders.length) {
      return (
        <Controller
          name="integrationId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <Select.Trigger
                aria-label="From"
                className="h-9 min-w-0 border-0 px-0 shadow-none"
              >
                <Select.Value placeholder="Select sender">
                  {selectedSender &&
                    `${selectedSender.name} <${selectedSender.address}>`}
                </Select.Value>
              </Select.Trigger>
              <Select.Content>
                {senders.map((sender) => (
                  <Select.Item
                    key={sender.integrationId}
                    value={sender.integrationId}
                  >
                    {sender.name} &lt;{sender.address}&gt;
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
        />
      );
    }

    return null;
  };

  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)] items-center border-b px-4 py-1.5">
      <span className="text-xs text-muted-foreground">From</span>
      <div className="flex min-h-9 min-w-0 items-center text-sm">
        {renderSender()}
      </div>
      {integrationError && (
        <p className="col-start-2 text-xs text-destructive">
          {String(integrationError.message ?? '')}
        </p>
      )}
      {Boolean(sendersError) && (
        <div className="col-start-2 text-xs text-destructive" role="alert">
          <p>{t('error-loading-data')}</p>
          <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
            {t('try-again')}
          </Button>
        </div>
      )}
      {!sendersLoading && !sendersError && !senders.length && (
        <p className="col-start-2 text-xs text-destructive">
          {t('no-integration-found', { name: t('email') })}
        </p>
      )}
    </div>
  );
};

const CcBccField = ({ field }: { field: 'cc' | 'bcc' }) => {
  const { t } = useTranslation('frontline');
  const {
    register,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  const error = errors[field];

  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)] items-center border-b px-4 py-1.5">
      <label
        className="text-xs text-muted-foreground"
        htmlFor={`direct-mail-${field}`}
      >
        {t(field)}
      </label>
      <Input
        id={`direct-mail-${field}`}
        className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
        {...register(field)}
      />
      {error && (
        <p className="col-start-2 text-xs text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export const CcBccFields = () => {
  const { showCc, showBcc } = useDirectMailComposerFields();
  return (
    <>
      {(['cc', 'bcc'] as const).map(
        (field) =>
          (field === 'cc' ? showCc : showBcc) && (
            <CcBccField key={field} field={field} />
          ),
      )}
    </>
  );
};

export const SubjectRow = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)] items-center border-b px-4 py-1.5">
      <label
        className="text-xs text-muted-foreground"
        htmlFor="direct-mail-subject"
      >
        Subject
      </label>
      <Input
        id="direct-mail-subject"
        className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
        {...register('subject')}
      />
      {errors.subject && (
        <p className="col-start-2 text-xs text-destructive">
          {errors.subject.message}
        </p>
      )}
    </div>
  );
};

export const BodyField = ({
  editor,
  disabled,
  onChange,
}: {
  editor: ReturnType<typeof useBlockEditor>;
  disabled: boolean;
  onChange: () => void;
}) => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-3">
      <Controller
        name="body"
        control={control}
        render={({ field }) => (
          <fieldset aria-label="Email message" className="min-w-0">
            <BlockEditor
              editor={editor}
              disabled={disabled}
              onChange={onChange}
              onFocus={() =>
                setHotkeyScopeAndMemorizePreviousScope('frontline-mail-editor')
              }
              onBlur={() => {
                field.onBlur();
                goBackToPreviousHotkeyScope();
              }}
              sideMenu={false}
              formattingToolbar={false}
              slashMenuOnTop
              className="min-h-full w-full [&_.bn-editor]:min-h-52 [&_.bn-editor]:bg-white [&_.bn-editor]:px-0 [&_.bn-editor]:text-sm [&_.bn-editor]:text-[#202124]"
            />
          </fieldset>
        )}
      />
      {errors.body && (
        <p className="mt-1 text-xs text-destructive">{errors.body.message}</p>
      )}
    </div>
  );
};

export const ComposerFields = ({
  disabled,
  onRecipientSelect,
  editor,
  onBodyChange,
  ...senderProps
}: ComponentProps<typeof FromRow> & {
  onRecipientSelect: (customerId?: string) => void;
  editor: ReturnType<typeof useBlockEditor>;
  onBodyChange: () => void;
}) => (
  <fieldset
    disabled={disabled}
    className="flex min-h-0 flex-1 flex-col text-[#444746]"
  >
    <FromRow {...senderProps} disabled={disabled} />
    <ToRow onRecipientSelect={onRecipientSelect} />
    <CcBccFields />
    <SubjectRow />
    <BodyField editor={editor} disabled={disabled} onChange={onBodyChange} />
  </fieldset>
);

export const ComposerFooter = ({
  disabled,
  loading,
  retry = false,
  editor,
  showFormatting,
  onToggleFormatting,
  onDiscard,
  onUploadingChange,
  onAttachment,
  editingDisabled,
}: {
  disabled: boolean;
  loading: boolean;
  retry?: boolean;
  editor: ReturnType<typeof useBlockEditor>;
  showFormatting: boolean;
  onToggleFormatting: () => void;
  onDiscard: () => void;
  onUploadingChange: (uploading: boolean) => void;
  onAttachment: (attachment: MailAttachmentInput) => void;
  editingDisabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <footer className="flex flex-none flex-col gap-3 bg-white px-4 pb-3 pt-2 text-[#444746]">
      {showFormatting && (
        <DirectMailFormatting editor={editor} disabled={editingDisabled} />
      )}
      <div className="flex items-center gap-1">
        <Button
          type="submit"
          disabled={disabled}
          className="mr-2 h-9 rounded-full bg-[#0b57d0] px-6 text-white hover:bg-[#0842a0]"
        >
          {loading && <Spinner size="sm" />}
          {t(retry ? 'email-delivery-retry' : 'send', retry ? 'Retry' : 'Send')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 aria-pressed:bg-[#d3e3fd]"
          title="Formatting options"
          aria-label="Formatting options"
          aria-pressed={showFormatting}
          onClick={onToggleFormatting}
          disabled={editingDisabled}
        >
          <IconTypography className="size-4" />
        </Button>
        <DirectMailInsertTools
          editor={editor}
          disabled={editingDisabled}
          onUploadingChange={onUploadingChange}
          onAttachment={onAttachment}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto size-8"
          title="Discard draft"
          aria-label="Discard draft"
          onClick={onDiscard}
          disabled={loading}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </footer>
  );
};
