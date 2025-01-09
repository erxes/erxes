import { IContext } from "../../connectionResolver";
import { IInternalNoteDocument } from "../../db/models/definitions/internalNotes";

export default {
  async createdUser(note: IInternalNoteDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: note.createdUserId });
  }
};
