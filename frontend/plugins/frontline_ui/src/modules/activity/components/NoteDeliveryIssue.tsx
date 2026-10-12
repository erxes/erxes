import { useTranslation } from 'react-i18next';
import { NoteDeliveryRetry } from './NoteDeliveryRetry';
import type { NoteDeliveryIssueProps } from '@/activity/types';

export const NoteDeliveryIssue = ({
  noteId,
  delivery,
}: NoteDeliveryIssueProps) => {
  const { t } = useTranslation('frontline');

  let reason: string | null | undefined = null;

  if (delivery.status === 'bounced') {
    reason = t(
      'email-bounced-for',
      'The receiving server rejected {{recipients}}',
      { recipients: (delivery.bouncedRecipients ?? []).join(', ') },
    );
  } else if (delivery.status === 'failed') {
    reason = delivery.error;
  }

  if (!reason && !delivery.canRetry) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {reason && (
        <p className="break-words text-xs text-destructive">{reason}</p>
      )}
      {delivery.canRetry && (
        <NoteDeliveryRetry noteId={noteId} delivery={delivery} />
      )}
    </div>
  );
};
