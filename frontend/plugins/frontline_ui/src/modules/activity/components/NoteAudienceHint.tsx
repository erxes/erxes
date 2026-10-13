import {
  IconAlertTriangle,
  IconLock,
  IconMail,
  IconWorld,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTicketReplyTarget } from '@/activity/hooks/useTicketReplyTarget';

const HintRow = ({
  icon,
  children,
  warning = false,
}: {
  icon: ReactNode;
  children: ReactNode;
  warning?: boolean;
}) => (
  <p
    className={cn(
      'flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground [&>svg]:size-3.5 [&>svg]:flex-none',
      warning && 'text-warning',
    )}
  >
    {icon}
    <span className="truncate">{children}</span>
  </p>
);

const ReplyHint = ({ ticketId }: { ticketId: string }) => {
  const { t } = useTranslation('frontline');
  const { replyTarget, loading, error } = useTicketReplyTarget(ticketId);

  if (loading && !replyTarget) {
    return null;
  }

  if (!replyTarget || error) {
    return (
      <HintRow icon={<IconWorld />}>
        {t(
          'ticket-reply-portal-only',
          'The customer sees this reply in the client portal',
        )}
      </HintRow>
    );
  }

  if (!replyTarget.to) {
    return (
      <HintRow icon={<IconAlertTriangle />} warning>
        {t(
          'ticket-reply-no-recipient',
          'This ticket has no customer email, so a reply cannot be sent. Write an internal note instead.',
        )}
      </HintRow>
    );
  }

  return (
    <HintRow icon={<IconMail />}>
      {t('ticket-reply-emailed', 'Emailed to {{to}} from {{from}}', {
        to: replyTarget.to,
        from: replyTarget.from,
      })}
    </HintRow>
  );
};

export const NoteAudienceHint = ({
  ticketId,
  isInternalNote,
}: {
  ticketId: string;
  isInternalNote: boolean;
}) => {
  const { t } = useTranslation('frontline');

  if (isInternalNote) {
    return (
      <HintRow icon={<IconLock />}>
        {t('note-visibility', 'Only visible to your team')}
      </HintRow>
    );
  }

  return <ReplyHint ticketId={ticketId} />;
};
