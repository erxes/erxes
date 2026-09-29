import { BlockEditorReadOnly, RelativeDateDisplay } from 'erxes-ui';
import { IconLock } from '@tabler/icons-react';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import type { IMessage } from '@/inbox/types/Conversation';

export const MailInternalNotes = ({ notes }: { notes: IMessage[] }) => {
  if (!notes.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-warning/25 bg-warning/[0.04]">
      <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-2.5 text-xs font-medium text-warning">
        <IconLock className="size-3.5" />
        Internal notes
        <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px]">
          {notes.length}
        </span>
      </div>
      <div className="divide-y divide-warning/15">
        {notes.map((note) => (
          <article key={note._id} className="px-4 py-3">
            <BlockEditorReadOnly
              content={note.content}
              className="read-only internal-note text-sm leading-6"
            />
            <Attachments attachments={note.attachments} />
            <div className="mt-2 text-[11px] text-muted-foreground">
              <RelativeDateDisplay value={note.createdAt}>
                <RelativeDateDisplay.Value value={note.createdAt} />
              </RelativeDateDisplay>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
