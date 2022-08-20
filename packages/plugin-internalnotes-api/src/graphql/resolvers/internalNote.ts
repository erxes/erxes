import { IContext } from '../../connectionResolver';
import { IInternalNoteDocument } from '../../models/definitions/internalNotes';

export default {
  createdUser(note: IInternalNoteDocument) {
    return note.createdUserId && {
      __typename: 'User',
      _id: note.createdUserId
    };
  }
};
