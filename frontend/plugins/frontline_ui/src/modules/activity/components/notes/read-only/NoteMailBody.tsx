import { useMemo } from 'react';
import { storageImageSources } from '@/activity/utils/mailBody';
import { EmailBody } from '@/integrations/mail/components/EmailBody';
import type { NoteMailBodyProps } from '@/activity/types';

export const NoteMailBody = ({ note }: NoteMailBodyProps) => {
  const trusted = useMemo(
    () => [
      ...storageImageSources(note.content).map((url) => ({ url })),
      ...(note.attachments ?? []),
    ],
    [note.content, note.attachments],
  );

  return <EmailBody body={note.content} attachments={trusted} />;
};
