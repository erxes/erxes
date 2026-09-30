import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { MAIL_SENDERS_QUERY } from '@/integrations/mail/graphql/queries/mailSenders';
import { useMailSendMail } from '@/integrations/mail/hooks/useMailConversationDetail';
import { DirectMailComposerFieldsContext } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeEmailTarget,
  ComposeValues,
  MailSender,
} from '@/integrations/mail/types/directMailComposer';
import {
  COMPOSE_EMAIL_EVENT,
  composeSchema,
  splitAddresses,
  toHtml,
} from '@/integrations/mail/utils/directMailComposer';
import {
  BodyField,
  CcBccFields,
  ComposerFooter,
  ComposerHeader,
  FromRow,
  SubjectRow,
} from './DirectMailComposerFields';
import { ToRow } from './DirectMailRecipientField';

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
  const form = useForm<ComposeValues>({
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
  const { handleSubmit, reset, setValue, watch } = form;
  const integrationId = watch('integrationId');
  const selectedSender = senders.find(
    (sender) => sender.integrationId === integrationId,
  );
  const openCc = useCallback(() => setShowCc(true), []);
  const openBcc = useCallback(() => setShowBcc(true), []);
  const fieldActions = useMemo(
    () => ({ showCc, showBcc, openCc, openBcc, emails: target?.emails ?? [] }),
    [showCc, showBcc, openCc, openBcc, target?.emails],
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
    <FormProvider {...form}>
      <section
        aria-label="New email"
        className="fixed inset-x-2 bottom-2 z-50 flex max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[min(40rem,calc(100vw-2rem))]"
      >
        <ComposerHeader onClose={close} loading={loading} />

        <DirectMailComposerFieldsContext.Provider value={fieldActions}>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            onSubmit={handleSubmit(submit)}
          >
            <FromRow
              sendersLoading={sendersLoading}
              selectedSender={selectedSender}
              sendersError={sendersError}
              hasSenders={senders.length > 0}
              onRetry={handleRetry}
            />
            <ToRow />
            <CcBccFields />
            <SubjectRow />
            <BodyField />
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
        </DirectMailComposerFieldsContext.Provider>
      </section>
    </FormProvider>
  );
};
