import type { MailAttachmentInput } from '../types/mailDelivery';
import {
  IconMinus,
  IconArrowsMaximize,
  IconArrowsMinimize,
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
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useDirectMailComposerFields } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeValues,
  MailSender,
} from '@/integrations/mail/types/directMailComposer';
import { RecipientRow } from './DirectMailRecipientField';
import { splitAddresses } from '@/integrations/mail/utils/directMailComposer';
import { DirectMailInsertTools } from './DirectMailToolbar';

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
    className="flex h-9 flex-none items-center justify-between bg-muted px-4 text-foreground"
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
                className="h-9 min-w-0 border-0 px-0 shadow-none focus:shadow-none"
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

export const CcBccFields = () => {
  const { showCc, showBcc } = useDirectMailComposerFields();
  return (
    <>
      {(['cc', 'bcc'] as const).map(
        (field) =>
          (field === 'cc' ? showCc : showBcc) && (
            <RecipientRow key={field} fieldName={field} />
          ),
      )}
    </>
  );
};

const ComposerRecipients = ({
  onRecipientSelect,
}: {
  onRecipientSelect: (customerId?: string) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const { closeEmptyFields } = useDirectMailComposerFields();
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  const showFields = expanded || Boolean(errors.to || errors.cc || errors.bcc);
  const [to, cc, bcc] = useWatch({ control, name: ['to', 'cc', 'bcc'] });
  const recipients = [
    ...splitAddresses(to),
    ...splitAddresses(cc),
    ...splitAddresses(bcc),
  ];

  return (
    <>
      <div
        className={showFields ? undefined : 'hidden'}
        onFocusCapture={() => setExpanded(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setExpanded(false);
            closeEmptyFields();
          }
        }}
      >
        <RecipientRow fieldName="to" onRecipientSelect={onRecipientSelect} />
        <CcBccFields />
      </div>
      {!showFields && (
        <div className="flex flex-none items-center border-b px-4 py-1.5">
          <Button
            type="button"
            variant="ghost"
            className="h-9 min-w-0 w-full justify-start px-0 hover:bg-transparent"
            aria-label="Edit recipients"
            onClick={() => {
              setExpanded(true);
              window.requestAnimationFrame(() =>
                document.getElementById('direct-mail-to')?.focus(),
              );
            }}
          >
            <span className="truncate text-sm text-muted-foreground">
              {recipients[0] || 'Recipients'}
              {recipients.length > 1 && ` +${recipients.length - 1}`}
              {splitAddresses(bcc).length > 0 &&
                ` (${splitAddresses(bcc).length} Bcc)`}
            </span>
          </Button>
        </div>
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
        className="h-9 border-0 bg-transparent px-0 shadow-none hover:bg-transparent focus:bg-transparent focus-visible:shadow-none"
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
    <div className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-3">
      <Controller
        name="body"
        control={control}
        render={({ field }) => (
          <fieldset
            aria-label="Email message"
            data-mail-editor
            className="min-w-0"
            onMouseDownCapture={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest('.bn-formatting-toolbar button')
              )
                event.preventDefault();
            }}
          >
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
              slashMenuOnTop={false}
              className="min-h-full w-full [&_.bn-editor]:min-h-52 [&_.bn-editor]:bg-background [&_.bn-editor]:px-0 [&_.bn-editor]:text-sm [&_.bn-editor]:text-foreground"
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
    className="flex min-h-0 flex-1 flex-col text-foreground"
  >
    <FromRow {...senderProps} disabled={disabled} />
    <ComposerRecipients onRecipientSelect={onRecipientSelect} />
    <SubjectRow />
    <BodyField editor={editor} disabled={disabled} onChange={onBodyChange} />
  </fieldset>
);

export const ComposerFooter = ({
  disabled,
  loading,
  retry = false,
  editor,
  onDiscard,
  onUploadingChange,
  onAttachment,
  editingDisabled,
}: {
  disabled: boolean;
  loading: boolean;
  retry?: boolean;
  editor: ReturnType<typeof useBlockEditor>;
  onDiscard: () => void;
  onUploadingChange: (uploading: boolean) => void;
  onAttachment: (attachment: MailAttachmentInput) => void;
  editingDisabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <footer className="flex flex-none flex-col gap-3 bg-background px-4 pb-3 pt-2 text-foreground">
      <div className="flex items-center gap-1">
        <Button type="submit" disabled={disabled} className="mr-2">
          {loading && <Spinner size="sm" />}
          {t(retry ? 'email-delivery-retry' : 'send', retry ? 'Retry' : 'Send')}
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
