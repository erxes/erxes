import { InternalNotes } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const internalNoteQueries = {
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
