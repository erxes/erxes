import { cn } from 'erxes-ui';
import { NoteReadOnlyAttachment } from './NoteReadOnlyAttachment';
import type { NoteReadOnlyAttachmentsProps } from '@/activity/types';

export const NoteReadOnlyAttachments = ({
  attachments,
}: NoteReadOnlyAttachmentsProps) => {
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
