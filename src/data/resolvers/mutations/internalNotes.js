import { InternalNotes } from '../../../db/models';

export default {
  /**
   * Adds internalNote object
   * @return {Promise}
   */
  internalNotesAdd(root, args, { user }) {
    if (!user) throw new Error('Login required');

    return InternalNotes.createInternalNote(args, user);
  },

  /**
   * Updates internalNote object
  * @return {Promise} return Promise(null)
  */
  internalNotesEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return InternalNotes.updateInternalNote(_id, doc);
  },

  /**
   * Remove a channel
   * @return {Promise}
   */
  internalNotesRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return InternalNotes.removeInternalNote(_id);
  },
};
