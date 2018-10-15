import { ActivityLogs, InternalNotes } from '../../../db/models';
import { IInternalNote } from '../../../db/models/definitions/internalNotes';
import { IUserDocument } from '../../../db/models/definitions/users';
import { moduleRequireLogin } from '../../permissions';

interface IInternalNotesEdit extends IInternalNote {
  _id: string;
}

const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(_root, args: IInternalNote, { user }: { user: IUserDocument }) {
    const internalNote = await InternalNotes.createInternalNote(args, user);

    await ActivityLogs.createInternalNoteLog(internalNote, user);

    return internalNote;
  },

  /**
   * Updates internalNote object
   */
  internalNotesEdit(_root, { _id, ...doc }: IInternalNotesEdit) {
    return InternalNotes.updateInternalNote(_id, doc);
  },

  /**
   * Remove a channel
   */
  internalNotesRemove(_root, { _id }: { _id: string }) {
    return InternalNotes.removeInternalNote(_id);
  },
};

moduleRequireLogin(internalNoteMutations);

export default internalNoteMutations;
