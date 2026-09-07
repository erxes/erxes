import { useGetTicketNote } from '@/activity/hooks/useGetTicketNote';
import { IconFile } from '@tabler/icons-react';
import {
  BlockEditorReadOnly,
  IAttachment,
  cn,
  formatBytes,
  readImage,
} from 'erxes-ui';

interface NoteInputReadOnlyProps {
  newValueId: string;
}

export const NoteInputReadOnly = ({ newValueId }: NoteInputReadOnlyProps) => {
  const { note, loading } = useGetTicketNote(newValueId);

  return (
    <div className="flex flex-col border rounded-lg min-h-14 px-4 py-3 gap-2 ml-4">
      {!loading && (
        <>
          <BlockEditorReadOnly
            content={note?.content || ''}
            className="read-only"
          />
          <NoteReadOnlyAttachments attachments={note?.attachments} />
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
