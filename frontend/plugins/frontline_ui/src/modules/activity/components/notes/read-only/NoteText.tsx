import { BlockEditorReadOnly } from 'erxes-ui';
import { NoteMailBody } from './NoteMailBody';
import type { NoteTextProps } from '@/activity/types';

export const NoteText = ({ note, kind }: NoteTextProps) => {
  if (kind === 'emailReceived') {
    return <NoteMailBody note={note} />;
  }

  return <BlockEditorReadOnly content={note.content} className="read-only" />;
};
