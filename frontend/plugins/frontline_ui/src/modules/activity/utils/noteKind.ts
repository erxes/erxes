import { activityCustomerId } from '@/activity/components/ActivityAuthor';
import { INote, TNoteKind } from '@/activity/types';

export const getNoteKind = (
  note: Pick<INote, 'isInternal' | 'createdBy' | 'mailMessageId'>,
): TNoteKind => {
  if (note.isInternal) {
    return 'internal';
  }

  if (activityCustomerId(note.createdBy)) {
    return note.mailMessageId ? 'emailReceived' : 'portalReceived';
  }

  return note.mailMessageId ? 'emailSent' : 'customerVisible';
};
