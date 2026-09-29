import {
  IconChevronDown,
  IconMail,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Input,
  Popover,
  Spinner,
  Textarea,
  ValidationStatus,
} from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCustomers } from 'ui-modules';
import { z } from 'zod';
import { useDirectMailComposerFields } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeValues,
  MailSender,
} from '@/integrations/mail/types/directMailComposer';

const VerifiedEmailSelect = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { customers, loading, error, handleFetchMore, totalCount } =
    useCustomers({
      variables: {
        emailValidationStatus: ValidationStatus.Valid,
        searchValue: deferredSearch,
      },
    });
  const options = [
    ...new Set([
      value,
      ...customers.flatMap((customer) => [
        customer.primaryEmail ?? '',
        ...(customer.emails ?? []),
      ]),
    ]),
  ].filter((email) => z.string().email().safeParse(email).success);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 min-w-0 justify-between px-0 font-normal hover:bg-transparent"
          aria-label="Select recipient"
        >
          <span className="truncate">{value}</span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search verified emails"
            focusOnMount
          />
          <Command.List className="max-h-64 overflow-y-auto">
            <Combobox.Empty loading={loading} error={error} />
            {!loading &&
              options.map((email) => (
                <Command.Item
                  key={email}
                  value={email}
                  onSelect={() => {
                    onValueChange(email);
                    setOpen(false);
                  }}
                >
                  <IconMail className="size-4 text-muted-foreground" />
                  <span className="truncate">{email}</span>
                  <Combobox.Check checked={email === value} />
                </Command.Item>
              ))}
            {!loading && (
              <Combobox.FetchMore
                fetchMore={handleFetchMore}
                currentLength={customers.length}
                totalCount={totalCount}
              />
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

export const ComposerHeader = ({
  onClose,
  loading,
}: {
  onClose: () => void;
  loading: boolean;
}) => (
  <header className="flex h-12 flex-none items-center justify-between border-b bg-muted/30 px-4">
    <span className="flex items-center gap-2 text-sm font-semibold">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <IconMail className="size-4" />
      </span>
      {'New email'}
    </span>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      aria-label="Close email composer"
      onClick={onClose}
      disabled={loading}
    >
      <IconX className="size-4" />
    </Button>
  </header>
);

export const FromRow = ({
  sendersLoading,
  selectedSender,
  sendersError,
  hasSenders,
  onRetry,
}: {
  sendersLoading: boolean;
  selectedSender?: MailSender;
  sendersError?: unknown;
  hasSenders: boolean;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const {
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

    if (selectedSender) {
      return (
        <span className="truncate" title={selectedSender.address}>
          {selectedSender.name}{' '}
          <span className="text-muted-foreground">
            &lt;{selectedSender.address}&gt;
          </span>
        </span>
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
      {!sendersLoading && !sendersError && !hasSenders && (
        <p className="col-start-2 text-xs text-destructive">
          {t('no-integration-found', { name: t('email') })}
        </p>
      )}
    </div>
  );
};

export const ToRow = () => {
  const { t } = useTranslation('frontline');
  const { showCc, showBcc, openCc, openBcc } = useDirectMailComposerFields();
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();

  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center border-b px-4 py-1.5">
      <label className="text-xs text-muted-foreground" htmlFor="direct-mail-to">
        To
      </label>
      <Controller
        name="to"
        control={control}
        render={({ field }) => (
          <VerifiedEmailSelect
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <div className="flex items-center gap-1">
        {!showCc && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={openCc}
          >
            {t('cc')}
          </Button>
        )}
        {!showBcc && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={openBcc}
          >
            {t('bcc')}
          </Button>
        )}
      </div>
      {errors.to && (
        <p className="col-start-2 col-span-2 text-xs text-destructive">
          {errors.to.message}
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

export const BodyField = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  return (
    <div className="min-h-0 flex-1 bg-muted/10 p-3">
      <Textarea
        id="direct-mail-body"
        aria-label="Email message"
        className="h-full min-h-52 resize-none rounded-lg border-0 bg-transparent p-2 text-sm leading-6 shadow-none focus-visible:ring-0"
        placeholder="Write your message"
        {...register('body')}
      />
      {errors.body && (
        <p className="mt-1 text-xs text-destructive">{errors.body.message}</p>
      )}
    </div>
  );
};

export const ComposerFooter = ({
  disabled,
  loading,
}: {
  disabled: boolean;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <footer className="flex flex-none items-center justify-end border-t bg-muted/20 px-4 py-2.5">
      <Button type="submit" disabled={disabled}>
        {loading ? <Spinner size="sm" /> : <IconSend className="size-4" />}
        {t('send')}
      </Button>
    </footer>
  );
};
