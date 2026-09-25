import { useGetTicketNote } from '@/activity/hooks/useGetTicketNote';
import { useRetryTicketNoteMail } from '@/activity/hooks/useRetryTicketNoteMail';
import {
  INote,
  ITicketNoteMailDelivery,
  ITicketNoteUnsavedAttachment,
  TNoteKind,
} from '@/activity/types';
import { getNoteKind } from '@/activity/utils/noteKind';
import { hasNoteText } from '@/activity/utils/noteBlocks';
import { storageImageSources } from '@/activity/utils/mailBody';
import { EmailBody } from '@/integrations/mail/components/EmailBody';
import {
  IconAlertTriangle,
  IconFile,
  IconLock,
  IconMailDown,
  IconMailUp,
  IconMessage2,
  IconRefresh,
  IconWorld,
} from '@tabler/icons-react';
import {
  BlockEditorReadOnly,
  Button,
  IAttachment,
  Spinner,
  cn,
  formatBytes,
  readImage,
} from 'erxes-ui';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface NoteInputReadOnlyProps {
  newValueId: string;
}

const NOTE_KIND_BADGES: Record<
  TNoteKind,
  { icon: ReactNode; labelKey: string; label: string }
> = {
  internal: {
    icon: <IconLock />,
    labelKey: 'internal-note',
    label: 'Internal Note',
  },
  emailReceived: {
    icon: <IconMailDown />,
    labelKey: 'note-email-received',
    label: 'Received by email',
  },
  portalReceived: {
    icon: <IconMessage2 />,
    labelKey: 'note-portal-received',
    label: 'Sent from the client portal',
  },
  emailSent: {
    icon: <IconMailUp />,
    labelKey: 'note-email-sent',
    label: 'Emailed to the customer',
  },
  customerVisible: {
    icon: <IconWorld />,
    labelKey: 'note-customer-visible',
    label: 'Visible to the customer',
  },
};

const hasDeliveryIssue = (delivery?: ITicketNoteMailDelivery | null) =>
  delivery?.status === 'failed' || delivery?.status === 'bounced';

const NoteDeliveryStatus = ({
  delivery,
}: {
  delivery: ITicketNoteMailDelivery;
}) => {
  const { t } = useTranslation('frontline');

  if (delivery.status === 'pending') {
    return (
      <span className="rounded-full bg-muted px-2 py-px text-[10px] font-medium text-muted-foreground">
        {t('email-delivery-pending', 'Sending…')}
      </span>
    );
  }

  if (!hasDeliveryIssue(delivery)) {
    return null;
  }

  return (
    <span className="rounded-full bg-destructive/10 px-2 py-px text-[10px] font-medium text-destructive">
      {delivery.status === 'bounced'
        ? t('email-delivery-bounced', 'Bounced')
        : t('email-delivery-failed', 'Not delivered')}
    </span>
  );
};

const NoteDeliveryRetry = ({
  noteId,
  delivery,
}: {
  noteId: string;
  delivery: ITicketNoteMailDelivery;
}) => {
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

const NoteDeliveryIssue = ({
  noteId,
  delivery,
}: {
  noteId: string;
  delivery: ITicketNoteMailDelivery;
}) => {
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

const NoteKindBadge = ({ note, kind }: { note: INote; kind: TNoteKind }) => {
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

const NoteMailBody = ({ note }: { note: INote }) => {
  const trusted = useMemo(
    () => [
      ...storageImageSources(note.content).map((url) => ({ url })),
      ...(note.attachments ?? []),
    ],
    [note.content, note.attachments],
  );

  return <EmailBody body={note.content} attachments={trusted} />;
};

const NoteText = ({ note, kind }: { note: INote; kind: TNoteKind }) => {
  if (kind === 'emailReceived') {
    return <NoteMailBody note={note} />;
  }

  return <BlockEditorReadOnly content={note.content} className="read-only" />;
};

export const NoteInputReadOnly = ({ newValueId }: NoteInputReadOnlyProps) => {
  const { note, loading } = useGetTicketNote(newValueId);
  const kind = note ? getNoteKind(note) : undefined;

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden border rounded-lg min-h-14 px-4 py-3 gap-2 ml-4',
        kind === 'internal' && 'border-warning/50 bg-warning/20',
        hasDeliveryIssue(note?.mailDelivery) && 'border-destructive/40',
      )}
    >
      {!loading && (
        <>
          {note && kind && <NoteKindBadge note={note} kind={kind} />}
          {note && kind && hasNoteText(note.content) && (
            <NoteText note={note} kind={kind} />
          )}
          <NoteReadOnlyAttachments attachments={note?.attachments} />
          <NoteUnsavedAttachments attachments={note?.unsavedAttachments} />
        </>
      )}
    </div>
  );
};

const NoteReadOnlyAttachments = ({
  attachments,
}: {
  attachments?: IAttachment[];
}) => {
  if (!attachments?.length) {
    return null;
  }

  const single = attachments.length === 1;

  return (
    <div className={cn(single ? 'flex' : 'grid grid-cols-3 gap-2')}>
      {attachments.map((attachment, index) => (
        <NoteReadOnlyAttachment
          key={`${attachment.url}-${index}`}
          attachment={attachment}
          single={single}
        />
      ))}
    </div>
  );
};

const NoteReadOnlyAttachment = ({
  attachment,
  single,
}: {
  attachment: IAttachment;
  single: boolean;
}) => {
  if (attachment.type?.startsWith('image')) {
    return (
      <a
        href={readImage(attachment.url)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={readImage(attachment.url, 400)}
          alt={attachment.name || 'attachment'}
          className={cn(
            'rounded object-cover',
            single ? 'max-h-72 max-w-sm' : 'h-32 w-full',
          )}
        />
      </a>
    );
  }

  return (
    <a
      href={readImage(attachment.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-3 rounded bg-accent px-3 py-2 no-underline hover:bg-accent/70"
    >
      <IconFile className="size-8 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-primary">
          {attachment.name || 'File'}
        </span>
        {Boolean(attachment.size) && (
          <span className="text-xs text-muted-foreground">
            {formatBytes(attachment.size)}
          </span>
        )}
      </div>
    </a>
  );
};

const DAY_MS = 24 * 60 * 60 * 1000;

const daysUntil = (value?: string | null) =>
  value ? Math.ceil((new Date(value).getTime() - Date.now()) / DAY_MS) : 0;

const NoteUnsavedAttachment = ({
  attachment,
}: {
  attachment: ITicketNoteUnsavedAttachment;
}) => {
  const { t } = useTranslation('frontline');
  const daysLeft = daysUntil(attachment.expiresAt);
  const link = attachment.url && daysLeft > 0 ? attachment.url : '';

  const status = link
    ? t(
        'attachment-not-saved-days',
        'Not saved · the link works for {{count}} more days',
        { count: daysLeft },
      )
    : t(
        'attachment-unavailable',
        'This attachment could not be stored and is no longer available',
      );

  const body = (
    <>
      <IconAlertTriangle className="size-8 shrink-0 text-warning" />
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            'truncate text-sm font-medium',
            link ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {attachment.name || 'File'}
          {Boolean(attachment.size) && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {formatBytes(attachment.size ?? 0)}
            </span>
          )}
        </span>
        <span className="text-xs text-warning">{status}</span>
      </div>
    </>
  );

  const className =
    'flex w-full items-center gap-3 rounded border border-warning/40 bg-warning/10 px-3 py-2 no-underline';

  if (!link) {
    return (
      <div className={className} title={attachment.error ?? undefined}>
        {body}
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={attachment.error ?? undefined}
      className={cn(className, 'hover:bg-warning/20')}
    >
      {body}
    </a>
  );
};

const NoteUnsavedAttachments = ({
  attachments,
}: {
  attachments?: ITicketNoteUnsavedAttachment[] | null;
}) => {
  if (!attachments?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {attachments.map((attachment, index) => (
        <NoteUnsavedAttachment
          key={`${attachment.url ?? attachment.name}-${index}`}
          attachment={attachment}
        />
      ))}
    </div>
  );
};
