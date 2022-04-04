import { INoteDocument } from "../../models/definitions/notes";

export default {
  createdUser(note: INoteDocument) {
    return note.createdBy && {
      __typename: 'User',
      _id: note.createdBy
    }
  }
};
