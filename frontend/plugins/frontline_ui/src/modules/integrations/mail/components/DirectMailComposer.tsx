import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
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
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  useForm,
  type Control,
  type FieldError,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useCustomers } from 'ui-modules';

import { MAIL_SENDERS_QUERY } from '@/integrations/mail/graphql/queries/mailSenders';
import { useMailSendMail } from '@/integrations/mail/hooks/useMailConversationDetail';

const COMPOSE_EMAIL_EVENT = 'frontline:compose-email';

interface MailSender {
  integrationId: string;
  name: string;
  address: string;
}

interface ComposeEmailTarget {
  customerId?: string;
  companyId?: string;
  email: string;
  emails?: string[];
}

const splitAddresses = (value: string): string[] =>
  value
    .split(/[,;]+/)
    .map((address) => address.trim())
    .filter(Boolean);

const optionalRecipients = z
  .string()
  .refine(
    (value) =>
      splitAddresses(value).every(
        (address) => z.string().email().safeParse(address).success,
      ),
    'Enter valid email addresses separated by commas',
  );

const composeSchema = z.object({
  integrationId: z.string().min(1, 'Choose a sender'),
  to: z.string().trim().email('Enter a valid recipient email'),
  cc: optionalRecipients,
  bcc: optionalRecipients,
  subject: z.string().trim().min(1, 'Subject is required'),
  body: z.string().trim().min(1, 'Message is required'),
});

type ComposeValues = z.infer<typeof composeSchema>;

const toHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br/>');

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

const ComposerHeader = ({
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

const FromRow = ({
  sendersLoading,
  selectedSender,
  integrationError,
  sendersError,
  hasSenders,
  onRetry,
}: {
  sendersLoading: boolean;
  selectedSender?: MailSender;
  integrationError?: FieldError;
  sendersError?: unknown;
  hasSenders: boolean;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('frontline');

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
          {integrationError.message}
        </p>
      )}
      {sendersError && (
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

const ToRow = ({
  control,
  errors,
  showCc,
  showBcc,
  onShowCc,
  onShowBcc,
}: {
  control: Control<ComposeValues>;
  errors: FieldErrors<ComposeValues>;
  showCc: boolean;
  showBcc: boolean;
  onShowCc: () => void;
  onShowBcc: () => void;
}) => {
  const { t } = useTranslation('frontline');

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
            onClick={onShowCc}
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
            onClick={onShowBcc}
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

const CcBccField = ({
  field,
  register,
  error,
}: {
  field: 'cc' | 'bcc';
  register: UseFormRegister<ComposeValues>;
  error?: FieldError;
}) => {
  const { t } = useTranslation('frontline');

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

const SubjectRow = ({
  register,
  error,
}: {
  register: UseFormRegister<ComposeValues>;
  error?: FieldError;
}) => (
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
    {error && (
      <p className="col-start-2 text-xs text-destructive">{error.message}</p>
    )}
  </div>
);

const BodyField = ({
  register,
  error,
}: {
  register: UseFormRegister<ComposeValues>;
  error?: FieldError;
}) => (
  <div className="min-h-0 flex-1 bg-muted/10 p-3">
    <Textarea
      id="direct-mail-body"
      aria-label="Email message"
      className="h-full min-h-52 resize-none rounded-lg border-0 bg-transparent p-2 text-sm leading-6 shadow-none focus-visible:ring-0"
      placeholder="Write your message"
      {...register('body')}
    />
    {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
  </div>
);

const ComposerFooter = ({
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

export const DirectMailComposer = () => {
  const [target, setTarget] = useState<ComposeEmailTarget | null>(null);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const {
    data,
    loading: sendersLoading,
    error: sendersError,
    refetch,
  } = useQuery<{
    mailSenders: MailSender[];
  }>(MAIL_SENDERS_QUERY, { skip: !target });
  const { mailSendMail, loading } = useMailSendMail();
  const senders = useMemo(() => data?.mailSenders ?? [], [data?.mailSenders]);
  const {
    formState: { errors },
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ComposeValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: {
      integrationId: '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
    },
  });
  const integrationId = watch('integrationId');
  const selectedSender = senders.find(
    (sender) => sender.integrationId === integrationId,
  );

  useEffect(() => {
    const handleComposeRequest = (event: Event) => {
      const detail = (event as CustomEvent<ComposeEmailTarget>).detail;
      if (
        (!detail?.customerId && !detail?.companyId) ||
        !z.string().email().safeParse(detail.email).success
      ) {
        return;
      }

      const emails = [
        ...new Set([detail.email, ...(detail.emails ?? [])]),
      ].filter((email) => z.string().email().safeParse(email).success);

      setTarget({ ...detail, emails });
      setShowCc(false);
      setShowBcc(false);
      reset({
        integrationId: '',
        to: detail.email,
        cc: '',
        bcc: '',
        subject: '',
        body: '',
      });
    };

    window.addEventListener(COMPOSE_EMAIL_EVENT, handleComposeRequest);
    return () =>
      window.removeEventListener(COMPOSE_EMAIL_EVENT, handleComposeRequest);
  }, [reset]);

  useEffect(() => {
    if (target && !integrationId && senders.length) {
      setValue('integrationId', senders[0].integrationId, {
        shouldValidate: true,
      });
    }
  }, [integrationId, senders, setValue, target]);

  useEffect(() => {
    if (target) {
      document.getElementById('direct-mail-body')?.focus();
    }
  }, [target]);

  if (!target) return null;

  const close = () => {
    setTarget(null);
    reset();
  };

  const submit = (values: ComposeValues) => {
    mailSendMail(
      {
        integrationId: values.integrationId,
        customerId: target.customerId,
        subject: values.subject.trim(),
        body: toHtml(values.body.trim()),
        to: [values.to.trim()],
        cc: showCc ? splitAddresses(values.cc) : undefined,
        bcc: showBcc ? splitAddresses(values.bcc) : undefined,
      },
      close,
    );
  };

  const handleRetry = () => {
    refetch().catch(() => undefined);
  };

  return (
    <section
      aria-label="New email"
      className="fixed inset-x-2 bottom-2 z-50 flex max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[min(40rem,calc(100vw-2rem))]"
    >
      <ComposerHeader onClose={close} loading={loading} />

      <form
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        onSubmit={handleSubmit(submit)}
      >
        <FromRow
          sendersLoading={sendersLoading}
          selectedSender={selectedSender}
          integrationError={errors.integrationId}
          sendersError={sendersError}
          hasSenders={senders.length > 0}
          onRetry={handleRetry}
        />
        <ToRow
          control={control}
          errors={errors}
          showCc={showCc}
          showBcc={showBcc}
          onShowCc={() => setShowCc(true)}
          onShowBcc={() => setShowBcc(true)}
        />
        {(['cc', 'bcc'] as const).map(
          (field) =>
            (field === 'cc' ? showCc : showBcc) && (
              <CcBccField
                key={field}
                field={field}
                register={register}
                error={errors[field]}
              />
            ),
        )}
        <SubjectRow register={register} error={errors.subject} />
        <BodyField register={register} error={errors.body} />
        <ComposerFooter
          disabled={
            loading ||
            sendersLoading ||
            Boolean(sendersError) ||
            !senders.length
          }
          loading={loading}
        />
      </form>
    </section>
  );
};
