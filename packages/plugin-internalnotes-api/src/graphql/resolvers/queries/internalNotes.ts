import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { InternalNotes } from "../../../models";

const internalNoteQueries = {
  async internalNoteDetail(_root, { _id }: { _id: string }) {
    return InternalNotes.findOne({ _id });
  },
  /**
   * InternalNotes list
   */
  internalNotes(
    _root,
    {
      contentType,
      contentTypeId
    }: { contentType: string; contentTypeId: string }
  ) {
    return InternalNotes.find({ contentType, contentTypeId }).sort({
      createdDate: 1
    });
  }
};

moduleRequireLogin(internalNoteQueries);

export default internalNoteQueries;