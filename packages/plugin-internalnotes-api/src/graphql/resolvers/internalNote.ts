import { Users } from "../../apiCollections";
import { IInternalNoteDocument } from "../../models/definitions/internalNotes";

export default {
  createdUser(note: IInternalNoteDocument) {
    return Users.findOne({ _id: note.createdUserId });
  }
};