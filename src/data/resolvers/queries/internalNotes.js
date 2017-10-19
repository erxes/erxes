import { InternalNotes } from '../../../db/models';

export default {
  /**
   * InternalNotes list
   * @param {Object} args
   * @return {Promise} sorted internalNotes list
   */
  internalNotes(root, { contentType, contentTypeId }) {
    return InternalNotes.find({ contentType, contentTypeId }).sort({ createdDate: 1 });
  },
};
