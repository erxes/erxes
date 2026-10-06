import { useBroadcastRecipientEmail } from '@/broadcast/hooks/useBroadcastRecipientEmail';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClick,
  IconMail,
  IconMailOpened,
  IconSend,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Avatar,
  EmailPreviewDevice,
  EmailPreviewDeviceToggle,
  EmailPreviewFrame,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** What each provider event means, in the order they tend to arrive. */
const EVENT_ICON: Record<string, { icon: TablerIcon; className: string }> = {
  send: { icon: IconSend, className: 'text-muted-foreground' },
  delivery: { icon: IconCircleCheck, className: 'text-success' },
  open: { icon: IconMailOpened, className: 'text-info' },
  click: { icon: IconClick, className: 'text-info' },
  bounce: { icon: IconAlertTriangle, className: 'text-destructive' },
  complaint: { icon: IconAlertTriangle, className: 'text-destructive' },
  reject: { icon: IconAlertTriangle, className: 'text-destructive' },
  deferred: { icon: IconMail, className: 'text-warning' },
};

const EventRow = ({
  status,
  createdAt,
}: {
  status: string;
  createdAt?: string;
}) => {
  const { icon: Icon, className } = EVENT_ICON[status] || {
    icon: IconMail,
    className: 'text-muted-foreground',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`size-3.5 shrink-0 ${className}`} />
      <span className="capitalize">{status}</span>
      {createdAt && (
        <span className="text-muted-foreground">
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
        </span>
      )}
    </div>
  );
};

/**
 * The email this person was sent, as they received it.
 *
 * A campaign that just sends an email has no flow to open underneath a row,
 * and "no flow ran" is not an answer to what happened to them — the message
 * itself, and what the provider reported about it, is.
 */
export const BroadcastRecipientEmail = ({
  recipientId,
}: {
  recipientId: string;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'recipientEmail' });
  const { email, loading, error } = useBroadcastRecipientEmail(recipientId);
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          {error?.message || t('unavailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* The same header an inbox would draw, so what is read here is what
          the recipient had in front of them. */}
      <div className="flex flex-none items-start gap-3 border-b px-4 py-3">
        <Avatar size="lg">
          <Avatar.Fallback>
            {(email.to || '?').charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{email.subject}</div>
          <div className="truncate text-xs text-muted-foreground">
            {email.from} → {email.to}
          </div>
          {email.replyTo && (
            <div className="truncate text-xs text-muted-foreground">
              {t('reply-to')}: {email.replyTo}
            </div>
          )}
          {email.reason && (
            <div className="truncate text-xs text-destructive">
              {email.reason}
            </div>
          )}
        </div>

        <div className="flex flex-none flex-col items-end gap-2">
          <EmailPreviewDeviceToggle value={device} onChange={setDevice} />

          {/* Everything the provider said about this one message. */}
          {email.events.length ? (
            <div className="flex flex-col items-start gap-1">
              {email.events.map((event, index) => (
                <EventRow key={`${event.status}-${index}`} {...event} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {email.sentAt
                ? t('no-events-yet')
                : t('never-left', { status: email.status })}
            </p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <EmailPreviewFrame
          html={email.html}
          device={device}
          className="h-full"
        />
      </div>
    </div>
  );
};
