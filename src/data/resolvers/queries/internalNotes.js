import { InternalNotes } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const internalNoteQueries = {
  /**
   * InternalNotes list
   * @param {Object} args
   * @return {Promise} sorted internalNotes list
   */
  internalNotes(root, { contentType, contentTypeId }) {
    return InternalNotes.find({ contentType, contentTypeId }).sort({ createdDate: 1 });
  },
};

moduleRequireLogin(internalNoteQueries);

export default internalNoteQueries;
