import { ComposerAttachment } from '../ComposerAttachment';
import { PendingAttachmentItem } from './PendingAttachmentItem';
import type { ComposerPreviewsProps } from '../../types/composerAttachments';

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
      {blockAttachments.map((attachment, index) => (
        <ComposerAttachment
          key={`block-${attachment.url}-${index}`}
          attachment={attachment}
          onRemove={() => onRemoveBlockAttachment(attachment.url)}
        />
      ))}
    </>
  );
};
