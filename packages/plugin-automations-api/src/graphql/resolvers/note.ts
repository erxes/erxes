import { Users } from "../../apiCollections";
import { INoteDocument } from "../../models/definitions/notes";

export default {
  createdUser(note: INoteDocument) {
    return Users.findOne({ _id: note.createdBy });
  }
};
