import { MAIL_SENDERS_QUERY } from '@/integrations/mail/composer/graphql/queries/mailSenders';
import type {
  ComposeEmailTarget,
  ComposerAttachment,
  ComposeValues,
} from '@/integrations/mail/composer/types/directMailComposer';
import { composeSchema } from '@/integrations/mail/composer/utils/directMailComposer';
import {
  useMailMessageRetry,
  useMailSendMail,
} from '@/integrations/mail/hooks/useMailConversationDetail';
import type { MailDeliveryOutcome } from '@/integrations/mail/types/mailDelivery';
import { useQuery } from '@apollo/client';
import { compactList } from '@/shared/utils/cursorList';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlockEditor } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useComposeEmail } from 'ui-modules';

import type { DirectMailComposerStore } from '@/integrations/mail/composer/types/directMailComposerState';

export const useDirectMailComposerState = (): DirectMailComposerStore => {
  const { canComposeEmail } = useComposeEmail();
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
  } = useQuery(MAIL_SENDERS_QUERY, {
    skip: !target || !canComposeEmail,
    fetchPolicy: 'cache-and-network',
  });
  const { mailSendMail, loading } = useMailSendMail();
  const { mailMessageRetry, loading: retryLoading } = useMailMessageRetry();
  const editor = useBlockEditor({ placeholder: "Type '/' for commands" });
  const senders = useMemo(
    () => compactList(data?.mailSenders),
    [data?.mailSenders],
  );
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
  const { watch, getValues } = form;
  const sending =
    loading || retryLoading || uploading || form.formState.isSubmitting;
  const integrationId = watch('integrationId');
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
  };
};
