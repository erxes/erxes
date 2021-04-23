import { IInternalNoteDocument } from '../../db/models/definitions/internalNotes';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(note: IInternalNoteDocument) {
    return getDocument('users', { _id: note.createdUserId });
  }
};
