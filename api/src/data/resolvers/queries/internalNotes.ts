import { InternalNotes } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';

const internalNoteQueries = {
  async internalNoteDetail(_root, { _id }: { _id: string }) {
    return InternalNotes.findOne({ _id });
  },
  /**
   * InternalNotes list
   */
  internalNotes(_root, { contentType, contentTypeId }: { contentType: string; contentTypeId: string }) {
    return InternalNotes.find({ contentType, contentTypeId }).sort({
      createdDate: 1,
    });
  },
};

moduleRequireLogin(internalNoteQueries);

export default internalNoteQueries;
