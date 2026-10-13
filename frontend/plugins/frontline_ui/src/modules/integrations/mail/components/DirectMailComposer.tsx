import { useComposeEmail } from 'ui-modules';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { z } from 'zod';
import type { Block } from '@blocknote/core';
import { cn, toast, useBlockEditor } from 'erxes-ui';
import {
  serializeNoteBlocks,
  trimEmptyBlocks,
} from '@/activity/utils/noteBlocks';
import { MAIL_SENDERS_QUERY } from '@/integrations/mail/graphql/queries/mailSenders';
import { useRecipientVerification } from '@/integrations/mail/hooks/useRecipientVerification';
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
} from '@/integrations/mail/utils/directMailComposer';
import { COMPOSE_EMAIL_EVENT } from '@/integrations/mail/constants/directMailComposer';
import {
  ComposerFields,
  ComposerFooter,
  ComposerHeader,
} from './DirectMailComposerFields';
import {
  ComposerAttachments,
  ComposerStatus,
  type ComposerAttachment,
} from './DirectMailComposerStatus';

const ComposerWindow = ({
  expanded,
  minimized,
  children,
}: {
  expanded: boolean;
  minimized: boolean;
  children: ReactNode;
}) => (
  <>
    {expanded && !minimized && (
      <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
    )}
    <section
      aria-label="New email"
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden rounded-t-lg border bg-background text-foreground shadow-2xl',
        expanded && !minimized
          ? 'inset-x-4 top-6 bottom-4 sm:inset-x-[8vw] sm:top-[6vh]'
          : 'inset-x-2 bottom-0 sm:inset-x-auto sm:right-4',
        minimized
          ? 'sm:w-80'
          : !expanded &&
              'h-[min(600px,calc(100dvh-2rem))] sm:w-[min(600px,calc(100vw-2rem))]',
      )}
    >
      {children}
    </section>
  </>
);

export const DirectMailComposer = () => {
  const { canComposeEmail } = useComposeEmail();
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
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
  }>(MAIL_SENDERS_QUERY, { skip: !target || !canComposeEmail });
  const { mailSendMail, loading } = useMailSendMail();
  const { mailMessageRetry, loading: retryLoading } = useMailMessageRetry();
  const editor = useBlockEditor({ placeholder: "Type '/' for commands" });
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
  const { handleSubmit, reset, setValue, setError, watch, getValues } = form;
  const sending =
    loading || retryLoading || uploading || form.formState.isSubmitting;
  const integrationId = watch('integrationId');
  const to = watch('to');
  const cc = watch('cc');
  const bcc = watch('bcc');
  const {
    validRecipients,
    recipientsVerified,
    checkingRecipients,
    recipientVerificationError,
    recheckRecipients,
  } = useRecipientVerification({
    to,
    cc,
    bcc,
    showCc,
    showBcc,
    active: Boolean(target && canComposeEmail),
  });
  const selectedSender = senders.find(
    (sender) => sender.integrationId === integrationId,
  );
  const openCc = useCallback(() => {
    setShowCc(true);
    window.requestAnimationFrame(() =>
      document.getElementById('direct-mail-cc')?.focus(),
    );
  }, []);
  const openBcc = useCallback(() => {
    setShowBcc(true);
    window.requestAnimationFrame(() =>
      document.getElementById('direct-mail-bcc')?.focus(),
    );
  }, []);
  const closeEmptyFields = useCallback(() => {
    if (!getValues('cc').trim()) setShowCc(false);
    if (!getValues('bcc').trim()) setShowBcc(false);
  }, [getValues]);
  const fieldActions = useMemo(
    () => ({
      showCc,
      showBcc,
      openCc,
      openBcc,
      closeEmptyFields,
    }),
    [showCc, showBcc, openCc, openBcc, closeEmptyFields],
  );

  useEffect(() => {
    const handleComposeRequest = (event: Event) => {
      const detail = (event as CustomEvent<ComposeEmailTarget>).detail;
      if (
        !canComposeEmail ||
        sending ||
        !detail ||
        (detail.email && !z.string().email().safeParse(detail.email).success)
      ) {
        return;
      }

      if (target && (form.formState.isDirty || attachments.length)) {
        setMinimized(false);
        if (detail.email !== target.email)
          toast({
            title:
              'Finish or discard your current draft before starting another email',
          });
        return;
      }
      setMinimized(false);
      setExpanded(false);
      setShowFormatting(false);
      setAttachments([]);
      setTarget(detail);
      setRecipientCustomerId(detail.customerId);
      setFailedDelivery(() => undefined);
      setShowCc(false);
      setShowBcc(false);
      editor.replaceBlocks(editor.document, [{ type: 'paragraph' }]);
      reset({
        integrationId: '',
        to: detail.email || '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
      });
    };

    window.addEventListener(COMPOSE_EMAIL_EVENT, handleComposeRequest);
    return () =>
      window.removeEventListener(COMPOSE_EMAIL_EVENT, handleComposeRequest);
  }, [
    attachments.length,
    canComposeEmail,
    editor,
    form.formState.isDirty,
    reset,
    sending,
    target,
  ]);

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
      if (target.email) editor.focus();
      else document.getElementById('direct-mail-to')?.focus();
    }
  }, [editor, target]);

  if (!target || !canComposeEmail) return null;

  const close = () => {
    editor.replaceBlocks(editor.document, [{ type: 'paragraph' }]);
    setTarget(null);
    setFailedDelivery(() => undefined);
    reset();
  };

  const submit = async (values: ComposeValues) => {
    if (!canComposeEmail || sending || !recipientsVerified) return;
    if (failedDelivery) {
      mailMessageRetry(failedDelivery._id, close);
      return;
    }
    let body: string;
    try {
      body = await editor.blocksToHTMLLossy(editor.document);
      const content = new DOMParser().parseFromString(body, 'text/html').body;
      if (
        !content.textContent?.trim() &&
        !content.querySelector('img,video,audio')
      ) {
        setError('body', { type: 'manual', message: 'Message is required' });
        return;
      }
    } catch (error) {
      setError('body', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to prepare email message',
      });
      return;
    }
    mailSendMail(
      {
        integrationId: values.integrationId,
        customerId: recipientCustomerId,
        subject: values.subject.trim(),
        body,
        attachments: attachments.map(
          ({ name, url, type, size, contentId, disposition }) => ({
            name,
            url,
            type,
            size,
            contentId,
            disposition,
          }),
        ),
        to: splitAddresses(values.to),
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
      <ComposerWindow expanded={expanded} minimized={minimized}>
        <ComposerHeader
          onClose={close}
          loading={sending}
          minimized={minimized}
          expanded={expanded}
          onMinimize={() => setMinimized((value) => !value)}
          onExpand={() => {
            setMinimized(false);
            setExpanded((value) => !value);
          }}
        />

        <DirectMailComposerFieldsContext.Provider value={fieldActions}>
          <form
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              minimized && 'hidden',
            )}
            onSubmit={handleSubmit(submit)}
          >
            <ComposerFields
              editor={editor}
              onBodyChange={() =>
                setValue(
                  'body',
                  serializeNoteBlocks(
                    trimEmptyBlocks(editor.document as Block[]),
                  ),
                  {
                    shouldDirty: true,
                    shouldValidate: form.formState.isSubmitted,
                  },
                )
              }
              disabled={sending || Boolean(failedDelivery)}
              sendersLoading={sendersLoading}
              selectedSender={selectedSender}
              sendersError={sendersError}
              senders={senders}
              onRetry={handleRetry}
              onRecipientSelect={setRecipientCustomerId}
            />
            <ComposerAttachments
              attachments={attachments}
              disabled={sending || Boolean(failedDelivery)}
              onRemove={(id) =>
                setAttachments((items) =>
                  items.filter((item) => item.id !== id),
                )
              }
            />
            <ComposerStatus
              failedDelivery={failedDelivery}
              validRecipients={validRecipients}
              checkingRecipients={checkingRecipients}
              recipientsVerified={recipientsVerified}
              recipientVerificationError={recipientVerificationError}
              onRetryVerification={recheckRecipients}
            />
            <ComposerFooter
              disabled={
                sending ||
                !recipientsVerified ||
                (!failedDelivery &&
                  (sendersLoading || Boolean(sendersError) || !senders.length))
              }
              loading={sending}
              retry={Boolean(failedDelivery)}
              editor={editor}
              showFormatting={showFormatting}
              onToggleFormatting={() => setShowFormatting((value) => !value)}
              onDiscard={close}
              onUploadingChange={setUploading}
              onAttachment={(attachment) =>
                setAttachments((items) => [
                  ...items,
                  { ...attachment, id: crypto.randomUUID() },
                ])
              }
              editingDisabled={sending || Boolean(failedDelivery)}
            />
          </form>
        </DirectMailComposerFieldsContext.Provider>
      </ComposerWindow>
    </FormProvider>
  );
};
