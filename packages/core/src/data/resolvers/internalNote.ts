import { IInternalNoteDocument } from "../../db/models/definitions/internalNotes";

export default {
  createdUser(note: IInternalNoteDocument) {
    return (
      note.createdUserId && {
        __typename: "User",
        _id: note.createdUserId
      }
    );
  }
};
