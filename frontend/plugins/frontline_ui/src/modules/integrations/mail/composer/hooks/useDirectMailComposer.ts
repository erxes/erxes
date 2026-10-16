import { COMPOSE_EMAIL_EVENT } from '@/integrations/mail/composer/constants/directMailComposer';
import { useDirectMailBody } from '@/integrations/mail/composer/hooks/useDirectMailBody';
import { useDirectMailComposerStateContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerStateContext';
import { useDirectMailDraft } from '@/integrations/mail/composer/hooks/useDirectMailDraft';
import type {
  ComposeEmailTarget,
  ComposeValues,
} from '@/integrations/mail/composer/types/directMailComposer';
import type { DirectMailComposerState } from '@/integrations/mail/composer/types/directMailComposerState';
import { splitAddresses } from '@/integrations/mail/composer/utils/directMailComposer';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { z } from 'zod';

export const useDirectMailComposer = (): DirectMailComposerState => {
  const {
    canComposeEmail,
    target,
    form,
    editor,
    minimized,
    setMinimized,
    expanded,
    setExpanded,
    sending,
    failedDelivery,
    fieldActions,
    sendersLoading,
    selectedSender,
    sendersError,
    senders,
    setRecipientCustomerId,
    attachments,
    setAttachments,
    setUploading,
    recipientCustomerId,
    showCc,
    showBcc,
    setTarget,
    setFailedDelivery,
    setShowCc,
    setShowBcc,
    integrationId,
    refetch,
    mailSendMail,
    mailMessageRetry,
  } = useDirectMailComposerStateContext();
  const { reset, setValue, setError, getValues } = form;
  const { beginDraft, clearDraft } = useDirectMailDraft();

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

      const values = getValues();
      if (
        target &&
        (form.formState.isDirty ||
          values.subject.trim() ||
          values.body.trim() ||
          attachments.length ||
          failedDelivery)
      ) {
        setMinimized(false);
        if (detail.email !== target.email)
          toast({
            title:
              'Finish or discard your current draft before starting another email',
          });
        return;
      }
      beginDraft();
      setMinimized(false);
      setExpanded(false);
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
    beginDraft,
    canComposeEmail,
    editor,
    failedDelivery,
    form.formState.isDirty,
    getValues,
    reset,
    sending,
    setAttachments,
    setExpanded,
    setFailedDelivery,
    setMinimized,
    setRecipientCustomerId,
    setShowBcc,
    setShowCc,
    setTarget,
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

  const close = () => {
    clearDraft();
    editor.replaceBlocks(editor.document, [{ type: 'paragraph' }]);
    setTarget(null);
    setFailedDelivery(() => undefined);
    reset();
  };

  const handleBodyChange = useDirectMailBody();

  const submit = async (values: ComposeValues) => {
    if (!canComposeEmail || sending) return;
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

  return {
    canComposeEmail,
    target,
    form,
    editor,
    minimized,
    setMinimized,
    expanded,
    setExpanded,
    sending,
    failedDelivery,
    fieldActions,
    close,
    handleBodyChange,
    submit,
    sendersLoading,
    selectedSender,
    sendersError,
    senders,
    handleRetry,
    setRecipientCustomerId,
    attachments,
    setAttachments,
    setUploading,
  };
};
