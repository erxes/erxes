import { InternalNotes, ActivityLogs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const internalNoteMutations = {
  /**
   * Adds internalNote object
   * @return {Promise}
   */
  async internalNotesAdd(root, args, { user }) {
    const internalNote = await InternalNotes.createInternalNote(args, user);
    await ActivityLogs.createInternalNoteLog(internalNote, user);
    return internalNote;
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
