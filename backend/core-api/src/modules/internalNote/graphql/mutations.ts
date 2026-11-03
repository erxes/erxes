import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { addInternalNote } from '~/modules/internalNote/services';
import { IInternalNote } from '~/modules/internalNote/types';

export const internalNoteMutations = {
  /**
   * Adds internalNote object and also adds an activity log
   */
  async internalNotesAdd(
    _root: undefined,
    args: IInternalNote,
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('internalNotesManage');

    return addInternalNote({ models, subdomain, user, doc: args });
  },

  /**
   * Updates internalNote object
   */
  async internalNotesEdit(
    _root,
    { _id, ...doc }: IInternalNote & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('internalNotesManage');

    graphqlPubsub.publish('activityLogsChanged', {});

    return models.InternalNotes.updateInternalNote(_id, doc);
  },

  /**
   * Removes an internal note
   */
  async internalNotesRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('internalNotesManage');

    graphqlPubsub.publish('activityLogsChanged', {});

    return models.InternalNotes.removeInternalNote(_id);
  },
};
