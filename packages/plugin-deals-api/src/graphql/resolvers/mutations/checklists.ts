import {
  IChecklist,
  IChecklistItem,
} from '../../../models/definitions/checklists';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IChecklistsEdit extends IChecklist {
  _id: string;
}

interface IChecklistItemsEdit extends IChecklistItem {
  _id: string;
}

const dealsChecklistsChanged = (checklist: IChecklistsEdit) => {
  graphqlPubsub.publish(
    `dealsChecklistsChanged:${checklist.contentType}:${checklist.contentTypeId}`,
    {
      dealsChecklistsChanged: {
        _id: checklist._id,
        contentType: checklist.contentType,
        contentTypeId: checklist.contentTypeId,
      },
    }
  );
};

const dealsChecklistDetailChanged = (_id: string) => {
  graphqlPubsub.publish(`dealsChecklistDetailChanged:${_id}`, {
    dealsChecklistDetailChanged: {
      _id,
    },
  });
};

const checklistMutations = {
  /**
   * Adds checklist object and also adds an activity log
   */
  async dealChecklistsAdd(
    _root,
    args: IChecklist,
    { models, user, subdomain }: IContext
  ) {
    const checklist = await models.Checklists.createChecklist(args, user);

    await putCreateLog(
      models,
      subdomain,
      {
        type: 'checklist',
        newData: args,
        object: checklist,
      },
      user
    );

    dealsChecklistsChanged(checklist);

    return checklist;
  },

  /**
   * Updates checklist object
   */
  async dealChecklistsEdit(
    _root,
    { _id, ...doc }: IChecklistsEdit,
    { user, models, subdomain }: IContext
  ) {
    const checklist = await models.Checklists.getChecklist(_id);
    const updated = await models.Checklists.updateChecklist(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'checklist',
        object: checklist,
        newData: doc,
        updatedDocument: updated,
      },
      user
    );

    dealsChecklistDetailChanged(_id);

    return updated;
  },

  /**
   * Removes a checklist
   */
  async dealChecklistsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const checklist = await models.Checklists.getChecklist(_id);
    const removed = await models.Checklists.removeChecklist(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: 'checklist', object: checklist },
      user
    );

    dealsChecklistsChanged(checklist);

    return removed;
  },

  /**
   * Adds a checklist item and also adds an activity log
   */
  async dealChecklistItemsAdd(
    _root,
    args: IChecklistItem,
    { user, models, subdomain }: IContext
  ) {
    const checklistItem = await models.ChecklistItems.createChecklistItem(
      args,
      user
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: 'checkListItem',
        newData: args,
        object: checklistItem,
      },
      user
    );

    dealsChecklistDetailChanged(checklistItem.checklistId);

    return checklistItem;
  },

  /**
   * Updates a checklist item
   */
  async dealChecklistItemsEdit(
    _root,
    { _id, ...doc }: IChecklistItemsEdit,
    { user, models, subdomain }: IContext
  ) {
    const checklistItem = await models.ChecklistItems.getChecklistItem(_id);
    const updated = await models.ChecklistItems.updateChecklistItem(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'checkListItem',
        object: checklistItem,
        newData: doc,
        updatedDocument: updated,
      },
      user
    );

    dealsChecklistDetailChanged(updated.checklistId);

    return updated;
  },

  /**
   * Removes a checklist item
   */
  async dealChecklistItemsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const checklistItem = await models.ChecklistItems.getChecklistItem(_id);
    const removed = await models.ChecklistItems.removeChecklistItem(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: 'checkListItem', object: checklistItem },
      user
    );

    dealsChecklistDetailChanged(checklistItem.checklistId);

    return removed;
  },

  async dealChecklistItemsOrder(
    _root,
    { _id, destinationIndex }: { _id: string; destinationIndex: number },
    { models }: IContext
  ) {
    return models.ChecklistItems.updateItemOrder(_id, destinationIndex);
  },
};

moduleRequireLogin(checklistMutations);

export default checklistMutations;
