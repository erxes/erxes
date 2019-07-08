import { Deals, InternalNotes, Pipelines, Stages } from '../../../db/models';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IInternalNote } from '../../../db/models/definitions/internalNotes';
import { IUserDocument } from '../../../db/models/definitions/users';

import { moduleRequireLogin } from '../../permissions/wrappers';
import utils from '../../utils';

interface IInternalNotesEdit extends IInternalNote {
  _id: string;
}

const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(_root, args: IInternalNote, { user }: { user: IUserDocument }) {
    switch (args.contentType) {
      case 'deal': {
        const deal = await Deals.getDeal(args.contentTypeId);
        const stage = await Stages.getStage(deal.stageId || '');
        const pipeline = await Pipelines.getPipeline(stage.pipelineId || '');

        const title = `${user.details ? user.details.fullName : 'Someone'} mentioned you in "${deal.name}" deal`;

        utils.sendNotification({
          createdUser: user._id,
          notifType: NOTIFICATION_TYPES.DEAL_EDIT,
          title,
          content: title,
          link: `/deal/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}`,
          receivers: args.mentionedUserIds || [],
        });
      }

      default:
        break;
    }

    const internalNote = await InternalNotes.createInternalNote(args, user);

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
