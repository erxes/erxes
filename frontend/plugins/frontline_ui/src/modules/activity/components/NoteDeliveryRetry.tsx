import { useTranslation } from 'react-i18next';
import { Button, Spinner } from 'erxes-ui';
import { IconRefresh } from '@tabler/icons-react';
import { useRetryTicketNoteMail } from '@/activity/hooks/useRetryTicketNoteMail';
import type { NoteDeliveryRetryProps } from '@/activity/types';

export const NoteDeliveryRetry = ({
  noteId,
  delivery,
}: NoteDeliveryRetryProps) => {
  const { t } = useTranslation('frontline');
  const { retryTicketNoteMail, loading } = useRetryTicketNoteMail();

  let hint = t(
    'email-delivery-permanent-hint',
    'Fix the mail configuration before sending again.',
  );

  if (delivery.status === 'pending') {
    hint = t(
      'email-delivery-stuck-hint',
      'This email has been sending for a while. Try sending it again.',
    );
  } else if (delivery.retryable) {
    hint = t(
      'email-delivery-retry-hint',
      'This looks temporary. Sending again may work.',
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">{hint}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={loading}
        onClick={() => retryTicketNoteMail(noteId)}
      >
        {loading ? <Spinner size="sm" /> : <IconRefresh />}
        {t('email-delivery-retry', 'Try again')}
      </Button>
    </div>
  );
};
