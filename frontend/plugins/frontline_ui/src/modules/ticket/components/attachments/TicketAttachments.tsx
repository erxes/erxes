import { MessageAttachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import {
  getTelegramStreamPlayer,
  TelegramMessageAttachments,
} from '@/integrations/telegram/TelegramMessageAttachments';
import { AttachmentUploader } from '@/ticket/components/attachments/AttachmentUploader';
import { UnverifiedAttachmentCover } from '@/ticket/components/attachments/UnverifiedAttachmentCover';
import { useUnverifiedAttachments } from '@/ticket/hooks/useUnverifiedAttachments';
import type { IAttachment } from '@/ticket/types/attachments';

/** Reveals customer media before rendering a validated player or native attachment. */
const ReadOnlyTicketAttachment = ({
  attachment,
}: {
  attachment: IAttachment;
}) => {
  const { isCovered, reveal } = useUnverifiedAttachments();
  const isMedia = ['image', 'video', 'audio'].some((kind) =>
    attachment.type.startsWith(kind),
  );

  if (isMedia && isCovered(attachment.url)) {
    return (
      <div className="relative min-h-24 w-64 max-w-full rounded-lg border">
        <UnverifiedAttachmentCover onReveal={() => reveal(attachment.url)} />
      </div>
    );
  }

  const streamPlayer = attachment.type.startsWith('video')
    ? getTelegramStreamPlayer(attachment.url)
    : undefined;

  if (streamPlayer) {
    return <TelegramMessageAttachments attachments={[attachment]} />;
  }

  return <MessageAttachments attachments={[attachment]} />;
};

/** Selects editable attachment controls or a deduplicated read-only list. */
export const TicketAttachments = ({
  id,
  attachments,
  canEdit,
}: {
  id: string;
  attachments: IAttachment[];
  canEdit: boolean;
}) => {
  if (canEdit) {
    return <AttachmentUploader id={id} attachments={attachments} />;
  }

  const uniqueAttachments = new Map(
    attachments.map((attachment) => [attachment.url, attachment]),
  );

  return (
    <div className="flex flex-col gap-3">
      {[...uniqueAttachments.values()].map((attachment) => (
        <ReadOnlyTicketAttachment
          key={`${id}:${attachment.url}`}
          attachment={attachment}
        />
      ))}
    </div>
  );
};
