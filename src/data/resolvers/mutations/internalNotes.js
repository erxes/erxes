import { InternalNotes } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const internalNoteMutations = {
  /**
   * Adds internalNote object
   * @return {Promise}
   */
  internalNotesAdd(root, args, { user }) {
    return InternalNotes.createInternalNote(args, user);
  },

  /**
   * Updates internalNote object
  * @return {Promise} return Promise(null)
  */
  internalNotesEdit(root, { _id, ...doc }) {
    return InternalNotes.updateInternalNote(_id, doc);
  },

  /**
   * Remove a channel
   * @return {Promise}
   */
  internalNotesRemove(root, { _id }) {
    return InternalNotes.removeInternalNote(_id);
  },
};

moduleRequireLogin(internalNoteMutations);

export default internalNoteMutations;
