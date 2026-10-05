import { ComposerAttachment } from '@/inbox/conversations/conversation-detail/components/ComposerAttachment';
import { PendingAttachmentItem } from '@/inbox/conversations/conversation-detail/components/composer/PendingAttachmentItem';
import type { ComposerPreviewsProps } from '@/inbox/conversations/conversation-detail/types/composerAttachments';

export const ComposerPreviews = ({
  attachments,
  blockAttachments,
  pendingAttachments,
  onRemove,
  onRemoveBlockAttachment,
}: ComposerPreviewsProps) => {
  const previewedUrls = new Set(
    pendingAttachments.flatMap(({ uploadedUrl }) =>
      uploadedUrl ? [uploadedUrl] : [],
    ),
  );
  if (
    !attachments.length &&
    !blockAttachments.length &&
    !pendingAttachments.length
  )
    return null;

  return (
    <>
      {pendingAttachments.map((file) => (
        <PendingAttachmentItem key={file.id} file={file} onRemove={onRemove} />
      ))}
      {attachments
        .filter((attachment) => !previewedUrls.has(attachment.url))
        .map((attachment) => (
          <ComposerAttachment
            key={attachment.url}
            attachment={attachment}
            onRemove={() => onRemove(attachment.url)}
          />
        ))}
      {Array.from(
        new Map(
          blockAttachments.map((attachment) => [attachment.url, attachment]),
        ).values(),
      ).map((attachment) => (
        <ComposerAttachment
          key={`block-${attachment.url}`}
          attachment={attachment}
          onRemove={() => onRemoveBlockAttachment(attachment.url)}
        />
      ))}
    </>
  );
};
