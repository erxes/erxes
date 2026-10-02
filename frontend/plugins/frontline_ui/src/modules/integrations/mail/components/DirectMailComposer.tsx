import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { MAIL_SENDERS_QUERY } from '@/integrations/mail/graphql/queries/mailSenders';
import {
  useMailMessageRetry,
  useMailSendMail,
} from '@/integrations/mail/hooks/useMailConversationDetail';
import type { MailDeliveryOutcome } from '@/integrations/mail/types/mailDelivery';
import { DirectMailComposerFieldsContext } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeEmailTarget,
  ComposeValues,
  MailSender,
} from '@/integrations/mail/types/directMailComposer';
import {
  composeSchema,
  splitAddresses,
  toHtml,
} from '@/integrations/mail/utils/directMailComposer';
import { COMPOSE_EMAIL_EVENT } from '@/integrations/mail/constants/directMailComposer';
import {
  ComposerFields,
  ComposerFooter,
  ComposerHeader,
} from './DirectMailComposerFields';

export const DirectMailComposer = () => {
  const [target, setTarget] = useState<ComposeEmailTarget | null>(null);
  const [recipientCustomerId, setRecipientCustomerId] = useState<string>();
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [failedDelivery, setFailedDelivery] = useState<MailDeliveryOutcome>();
  const {
    data,
    loading: sendersLoading,
    error: sendersError,
    refetch,
  } = useQuery<{
    mailSenders: MailSender[];
  }>(MAIL_SENDERS_QUERY, { skip: !target });
  const { mailSendMail, loading } = useMailSendMail();
  const { mailMessageRetry, loading: retryLoading } = useMailMessageRetry();
  const sending = loading || retryLoading;
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
    () => ({
      showCc,
      showBcc,
      openCc,
      openBcc,
      emails: target?.emails ?? [],
      targetCustomerId: target?.customerId,
    }),
    [showCc, showBcc, openCc, openBcc, target?.emails, target?.customerId],
  );

  useEffect(() => {
    const handleComposeRequest = (event: Event) => {
      const detail = (event as CustomEvent<ComposeEmailTarget>).detail;
      if (sending || !z.string().email().safeParse(detail?.email).success) {
        return;
      }

      const emails = [
        ...new Set([detail.email, ...(detail.emails ?? [])]),
      ].filter((email) => z.string().email().safeParse(email).success);

      setTarget({ ...detail, emails });
      setRecipientCustomerId(detail.customerId);
      setFailedDelivery(() => undefined);
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
  }, [reset, sending]);

  useEffect(() => {
    if (target && !integrationId && senders.length) {
      const preferredSender = senders.find(
        (sender) => sender.integrationId === target.integrationId,
      );
      setValue('integrationId', (preferredSender ?? senders[0]).integrationId, {
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
    setFailedDelivery(() => undefined);
    reset();
  };

  const submit = (values: ComposeValues) => {
    if (sending) return;
    if (failedDelivery) {
      mailMessageRetry(failedDelivery._id, close);
      return;
    }
    mailSendMail(
      {
        integrationId: values.integrationId,
        customerId: recipientCustomerId,
        subject: values.subject.trim(),
        body: toHtml(values.body.trim()),
        to: [values.to.trim()],
        cc: showCc ? splitAddresses(values.cc) : undefined,
        bcc: showBcc ? splitAddresses(values.bcc) : undefined,
      },
      close,
      (outcome) => {
        if (outcome.deliveryStatus === 'failed') setFailedDelivery(outcome);
      },
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
        <ComposerHeader onClose={close} loading={sending} />

        <DirectMailComposerFieldsContext.Provider value={fieldActions}>
          <form
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            onSubmit={handleSubmit(submit)}
          >
            <ComposerFields
              disabled={sending || Boolean(failedDelivery)}
              sendersLoading={sendersLoading}
              selectedSender={selectedSender}
              sendersError={sendersError}
              senders={senders}
              onRetry={handleRetry}
              onRecipientSelect={setRecipientCustomerId}
            />
            {failedDelivery && (
              <p role="alert" className="px-4 py-3 text-sm text-destructive">
                {failedDelivery.deliveryError || 'Email was not delivered.'}
                {' Retry sending, or close this draft to start a new email.'}
              </p>
            )}
            <ComposerFooter
              disabled={
                sending ||
                (!failedDelivery &&
                  (sendersLoading || Boolean(sendersError) || !senders.length))
              }
              loading={sending}
              retry={Boolean(failedDelivery)}
            />
          </form>
        </DirectMailComposerFieldsContext.Provider>
      </section>
    </FormProvider>
  );
};
