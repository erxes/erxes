import { NoteUnsavedAttachment } from './NoteUnsavedAttachment';
import type { NoteUnsavedAttachmentsProps } from '@/activity/types';

export const NoteUnsavedAttachments = ({
  attachments,
}: NoteUnsavedAttachmentsProps) => {
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
