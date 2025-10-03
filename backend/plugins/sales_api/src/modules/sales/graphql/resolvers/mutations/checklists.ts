import { moduleRequireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import {
  IChecklist,
  IChecklistDocument,
  IChecklistItem,
  IChecklistItemDocument,
} from '~/modules/sales/@types';

const checklistsChanged = (checklist: IChecklistDocument) => {
  //   graphqlPubsub.publish(
  //     `salesChecklistsChanged:${checklist.contentType}:${checklist.contentTypeId}`,
  //     {
  //       salesChecklistsChanged: {
  //         _id: checklist._id,
  //         contentType: checklist.contentType,
  //         contentTypeId: checklist.contentTypeId,
  //       },
  //     },
  //   );
};

const checklistDetailChanged = (_id: string) => {
  //   graphqlPubsub.publish(`salesChecklistDetailChanged:${_id}`, {
  //     salesChecklistDetailChanged: {
  //       _id,
  //     },
  //   });
};

export const checklistMutations = {
  /**
   * Adds checklist object and also adds an activity log
   */
  async salesChecklistsAdd(
    _root: undefined,
    args: IChecklist,
    { models, user }: IContext,
  ) {
    const checklist = await models.Checklists.createChecklist(args, user);

    checklistsChanged(checklist);

    return checklist;
  },

  /**
   * Updates checklist object
   */
  async salesChecklistsEdit(
    _root: undefined,
    { _id, ...doc }: IChecklistDocument,
    { models }: IContext,
  ) {
    checklistDetailChanged(_id);

    return await models.Checklists.updateChecklist(_id, doc);
  },

  /**
   * Removes a checklist
   */
  async salesChecklistsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const checklist = await models.Checklists.getChecklist(_id);

    checklistsChanged(checklist);

    return await models.Checklists.removeChecklist(_id);
  },

  /**
   * Adds a checklist item and also adds an activity log
   */
  async salesChecklistItemsAdd(
    _root: undefined,
    args: IChecklistItem,
    { user, models }: IContext,
  ) {
    const checklistItem = await models.ChecklistItems.createChecklistItem(
      args,
      user,
    );

    checklistDetailChanged(checklistItem.checklistId);

    return checklistItem;
  },

  /**
   * Updates a checklist item
   */
  async salesChecklistItemsEdit(
    _root: undefined,
    { _id, ...doc }: IChecklistItemDocument,
    { models }: IContext,
  ) {
    const updated = await models.ChecklistItems.updateChecklistItem(_id, doc);

    checklistDetailChanged(updated.checklistId);

    return updated;
  },

  /**
   * Removes a checklist item
   */
  async salesChecklistItemsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const checklistItem = await models.ChecklistItems.getChecklistItem(_id);

    checklistDetailChanged(checklistItem.checklistId);

    return await models.ChecklistItems.removeChecklistItem(_id);
  },

  async salesChecklistItemsOrder(
    _root: undefined,
    { _id, destinationIndex }: { _id: string; destinationIndex: number },
    { models }: IContext,
  ) {
    return models.ChecklistItems.updateItemOrder(_id, destinationIndex);
  },
};

moduleRequireLogin(checklistMutations);
