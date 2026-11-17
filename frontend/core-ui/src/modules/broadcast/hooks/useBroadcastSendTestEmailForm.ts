import { useBroadcastEmailReadiness } from '@/broadcast/hooks/useBroadcastEmailReadiness';
import { useBroadcastTestEmail } from '@/broadcast/hooks/useBroadcastTestEmail';
import { ChangeEvent, useCallback, useState } from 'react';
import { z } from 'zod';

const isSingleEmail = (value: string) =>
  !value.includes(',') && z.string().email().safeParse(value.trim()).success;

const sendLabelKeyOf = (sending: boolean, loadingSender: boolean) => {
  if (sending) {
    return 'sendTestEmailSending';
  }

  return loadingSender
    ? 'sendTestEmailLoadingSenderInfo'
    : 'sendTestEmailAction';
};

/**
 * Sending one test copy to one address, or the reasons it cannot be sent
 * yet. A list of addresses is refused with its own message.
 */
export const useBroadcastSendTestEmailForm = () => {
  const {
    from,
    blockers,
    ready,
    loading: senderLoading,
  } = useBroadcastEmailReadiness({ requireSubject: true });
  const { send, loading: sending } = useBroadcastTestEmail(from);
  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);
  const isValid = isSingleEmail(to);
  const showInvalid = to.length > 0 && !isValid;

  const onToChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setTo(event.target.value),
    [],
  );

  const handleSend = useCallback(async () => {
    if (await send(to)) {
      setOpen(false);
    }
  }, [send, to]);

  return {
    open,
    setOpen,
    ready,
    blockers,
    to,
    onToChange,
    showInvalid,
    invalidKey: to.includes(',')
      ? 'sendTestEmailSingleRecipientOnly'
      : 'sendTestEmailInvalidAddress',
    sendDisabled: !to || !isValid || sending || senderLoading,
    sendLabelKey: sendLabelKeyOf(sending, senderLoading),
    handleSend,
  };
};
