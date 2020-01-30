import { ChecklistItems, Checklists } from '../../../db/models';
import { IChecklist, IChecklistItem } from '../../../db/models/definitions/checklists';
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
        object: checklist,
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
        type: MODULE_NAMES.CHECKLIST,
        object: checklist,
        newData: doc,
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a checklist
   */
  async checklistsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const checklist = await Checklists.getChecklist(_id);
    const removed = await Checklists.removeChecklist(_id);

    await putDeleteLog({ type: MODULE_NAMES.CHECKLIST, object: checklist }, user);

    return removed;
  },

  /**
   * Adds checklistItems object and also adds an activity log
   */
  async checklistItemsAdd(_root, args: IChecklistItem, { user }: IContext) {
    const checklistItem = await ChecklistItems.createChecklistItem(args, user);

    await putCreateLog(
      {
        type: MODULE_NAMES.CHECKLIST_ITEM,
        newData: args,
        object: checklistItem,
      },
      user,
    );

    return checklistItem;
  },

  /**
   * Updates a checklist item
   */
  async checklistItemsEdit(_root, { _id, ...doc }: IChecklistItemsEdit, { user }: IContext) {
    const checklistItem = await ChecklistItems.getChecklistItem(_id);
    const updated = await ChecklistItems.updateChecklistItem(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.CHECKLIST_ITEM,
        object: checklistItem,
        newData: doc,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a checklist item
   */
  async checklistItemsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const checklistItem = await ChecklistItems.getChecklistItem(_id);
    const removed = await ChecklistItems.removeChecklistItem(_id);

    await putDeleteLog({ type: MODULE_NAMES.CHECKLIST_ITEM, object: checklistItem }, user);

    return removed;
  },
};

moduleRequireLogin(checklistMutations);

export default checklistMutations;
