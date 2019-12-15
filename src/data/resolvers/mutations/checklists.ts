import { ChecklistItems, Checklists } from '../../../db/models';
import { IChecklist, IChecklistItem } from '../../../db/models/definitions/checklists';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IChecklistsEdit extends IChecklist {
  _id: string;
}

interface IChecklistItemsEdit extends IChecklistItem {
  _id: string;
}

const checklistMutations = {
  /**
   * Adds checklist object and also adds an activity log
   */
  async checklistsAdd(_root, args: IChecklist, { user }: IContext) {
    const checklist = await Checklists.createChecklist(args, user);

    await putCreateLog(
      {
        type: 'checklist',
        newData: JSON.stringify(args),
        object: checklist,
        description: `${checklist.contentType} has been created`,
      },
      user,
    );

    return checklist;
  },

  /**
   * Updates checklist object
   */
  async checklistsEdit(_root, { _id, ...doc }: IChecklistsEdit, { user }: IContext) {
    const checklist = await Checklists.getChecklist(_id);
    const updated = await Checklists.updateChecklist(_id, doc);

    await putUpdateLog(
      {
        type: 'checklist',
        object: checklist,
        newData: JSON.stringify(doc),
        description: `${checklist.contentType} written at ${checklist.createdDate} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove a checklist
   */
  async checklistsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const checklist = await Checklists.getChecklist(_id);
    const removed = await Checklists.removeChecklist(_id);

    await putDeleteLog(
      {
        type: 'checklist',
        object: checklist,
        description: `${checklist.contentType} written at ${checklist.createdDate} has been removed`,
      },
      user,
    );

    return removed;
  },

  /**
   * Adds checklistItems object and also adds an activity log
   */
  async checklistItemsAdd(_root, args: IChecklistItem, { user }: IContext) {
    const checklist = await Checklists.getChecklist(args.checklistId);

    const checklistItem = await ChecklistItems.createChecklistItem(args, user);

    await putCreateLog(
      {
        type: 'checklistItem',
        newData: JSON.stringify(args),
        object: checklistItem,
        description: `${checklist.contentType} has been created`,
      },
      user,
    );

    return checklistItem;
  },

  /**
   * Updates checklistItem object
   */
  async checklistItemsEdit(_root, { _id, ...doc }: IChecklistItemsEdit, { user }: IContext) {
    const checklistItem = await ChecklistItems.getChecklistItem(_id);
    const checklist = await Checklists.getChecklist(checklistItem.checklistId);
    const updated = await ChecklistItems.updateChecklistItem(_id, doc);

    await putUpdateLog(
      {
        type: 'checklistItem',
        object: checklistItem,
        newData: JSON.stringify(doc),
        description: `${checklist.contentType} written at ${checklistItem.createdDate} has been edited /checked/`,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove a channel
   */
  async checklistItemsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const checklistItem = await ChecklistItems.getChecklistItem(_id);
    const checklist = await Checklists.getChecklist(checklistItem.checklistId);
    const removed = await ChecklistItems.removeChecklistItem(_id);

    await putDeleteLog(
      {
        type: 'checklist',
        object: checklistItem,
        description: `${checklist.contentType} written at ${checklistItem.createdDate} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleRequireLogin(checklistMutations);

export default checklistMutations;
