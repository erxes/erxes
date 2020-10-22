import { Users } from '../../db/models';
import { IInternalNoteDocument } from '../../db/models/definitions/internalNotes';

export default {
  createdUser(note: IInternalNoteDocument) {
    return Users.findOne({ _id: note.createdUserId });
  },
};
