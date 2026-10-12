import { cn } from 'erxes-ui';
import { INTERNAL_NOTE_BACKGROUND } from '@/inbox/constants/internalNoteStyles';
import { useGetTicketNote } from '@/activity/hooks/useGetTicketNote';
import { getNoteKind } from '@/activity/utils/noteKind';
import { hasNoteText } from '@/activity/utils/noteBlocks';
import { hasDeliveryIssue } from '@/activity/utils/hasDeliveryIssue';
import { NoteKindBadge } from './NoteKindBadge';
import { NoteText } from './NoteText';
import { NoteReadOnlyAttachments } from './NoteReadOnlyAttachments';
import { NoteUnsavedAttachments } from './NoteUnsavedAttachments';
import type { NoteInputReadOnlyProps } from '@/activity/types';

export const NoteInputReadOnly = ({ newValueId }: NoteInputReadOnlyProps) => {
  const { note, loading } = useGetTicketNote(newValueId);
  const kind = note ? getNoteKind(note) : undefined;

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden border rounded-lg min-h-14 px-4 py-3 gap-2 ml-4',
        kind === 'internal' && ['border-border', INTERNAL_NOTE_BACKGROUND],
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
