import { ChecklistItems, Checklists } from '../../../db/models';
import {
  IChecklist,
  IChecklistItem
} from '../../../db/models/definitions/checklists';
import { graphqlPubsub } from '../../../pubsub';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IChecklistsEdit extends IChecklist {
  _id: string;
}

interface IChecklistItemsEdit extends IChecklistItem {
  _id: string;
}

const checklistsChanged = (checklist: IChecklistsEdit) => {
  graphqlPubsub.publish('checklistsChanged', {
    checklistsChanged: {
      _id: checklist._id,
      contentType: checklist.contentType,
      contentTypeId: checklist.contentTypeId
    }
  });
};

const checklistDetailChanged = (_id: string) => {
  graphqlPubsub.publish('checklistDetailChanged', {
    checklistDetailChanged: {
      _id
    }
  });
};

const checklistMutations = {
  /**
   * Adds checklist object and also adds an activity log
   */
  async checklistsAdd(_root, args: IChecklist, { user }: IContext) {
    const checklist = await Checklists.createChecklist(args, user);

    await putCreateLog(
      {
        type: MODULE_NAMES.CHECKLIST,
        newData: args,
        object: checklist
      },
      user
    );

    checklistsChanged(checklist);

    return checklist;
  },

  /**
   * Updates checklist object
   */
  async checklistsEdit(
    _root,
    { _id, ...doc }: IChecklistsEdit,
    { user }: IContext
  ) {
    const checklist = await Checklists.getChecklist(_id);
    const updated = await Checklists.updateChecklist(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.CHECKLIST,
        object: checklist,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    checklistDetailChanged(_id);

    return updated;
  },

  /**
   * Removes a checklist
   */
  async checklistsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const checklist = await Checklists.getChecklist(_id);
    const removed = await Checklists.removeChecklist(_id);

    await putDeleteLog(
      { type: MODULE_NAMES.CHECKLIST, object: checklist },
      user
    );

    checklistsChanged(checklist);

    return removed;
  },

  /**
   * Adds a checklist item and also adds an activity log
   */
  async checklistItemsAdd(_root, args: IChecklistItem, { user }: IContext) {
    const checklistItem = await ChecklistItems.createChecklistItem(args, user);

    await putCreateLog(
      {
        type: MODULE_NAMES.CHECKLIST_ITEM,
        newData: args,
        object: checklistItem
      },
      user
    );

    checklistDetailChanged(checklistItem.checklistId);

    return checklistItem;
  },

  /**
   * Updates a checklist item
   */
  async checklistItemsEdit(
    _root,
    { _id, ...doc }: IChecklistItemsEdit,
    { user }: IContext
  ) {
    const checklistItem = await ChecklistItems.getChecklistItem(_id);
    const updated = await ChecklistItems.updateChecklistItem(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.CHECKLIST_ITEM,
        object: checklistItem,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    checklistDetailChanged(updated.checklistId);

    return updated;
  },

  /**
   * Removes a checklist item
   */
  async checklistItemsRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const checklistItem = await ChecklistItems.getChecklistItem(_id);
    const removed = await ChecklistItems.removeChecklistItem(_id);

    await putDeleteLog(
      { type: MODULE_NAMES.CHECKLIST_ITEM, object: checklistItem },
      user
    );

    checklistDetailChanged(checklistItem.checklistId);

    return removed;
  },

  async checklistItemsOrder(
    _root,
    { _id, destinationIndex }: { _id: string; destinationIndex: number }
  ) {
    return ChecklistItems.updateItemOrder(_id, destinationIndex);
  }
};

moduleRequireLogin(checklistMutations);

export default checklistMutations;
