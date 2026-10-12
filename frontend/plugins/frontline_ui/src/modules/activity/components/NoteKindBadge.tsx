import { useTranslation } from 'react-i18next';
import { cn } from 'erxes-ui';
import { NOTE_KIND_BADGES } from '@/activity/constants/noteKindBadges';
import { NoteDeliveryStatus } from './NoteDeliveryStatus';
import { NoteDeliveryIssue } from './NoteDeliveryIssue';
import type { NoteKindBadgeProps } from '@/activity/types';

export const NoteKindBadge = ({ note, kind }: NoteKindBadgeProps) => {
  const { t } = useTranslation('frontline');
  const { icon, labelKey, label } = NOTE_KIND_BADGES[kind];
  const delivery = note.mailDelivery;
  const recipients = (delivery?.to ?? []).filter(Boolean).join(', ');

  const text =
    kind === 'emailSent' && recipients
      ? t('note-email-sent-to', 'Emailed to {{to}}', { to: recipients })
      : t(labelKey, label);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          'flex min-w-0 flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground [&>svg]:size-3.5',
          kind === 'internal' && 'text-warning',
        )}
      >
        {icon}
        {text}
        {delivery && <NoteDeliveryStatus delivery={delivery} />}
      </span>
      {delivery && <NoteDeliveryIssue noteId={note._id} delivery={delivery} />}
    </div>
  );
};
