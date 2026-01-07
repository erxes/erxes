import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IChecklist,
  IChecklistDocument,
  IChecklistItem,
  IChecklistItemDocument,
} from '../../@types';
import {
  checklistItemSchema,
  checklistSchema,
} from '../definitions/checklists';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import {
  generateChecklistActivityLogs,
  generateChecklistItemActivityLogs,
} from '~/utils/activityLogs';

export interface IChecklistModel extends Model<IChecklistDocument> {
  getChecklist(_id: string): Promise<IChecklistDocument>;
  removeChecklists(contentTypeIds: string[]): Promise<void>;
  createChecklist(
    checklist: IChecklist,
    user: IUserDocument,
  ): Promise<IChecklistDocument>;
  updateChecklist(_id: string, doc: IChecklist): Promise<IChecklistDocument>;
  removeChecklist(_id: string): Promise<IChecklistDocument>;
}

export interface IChecklistItemModel extends Model<IChecklistItemDocument> {
  getChecklistItem(_id: string): Promise<IChecklistItemDocument>;
  createChecklistItem(
    checklistItem: IChecklistItem,
    user: IUserDocument,
  ): Promise<IChecklistItemDocument>;
  updateChecklistItem(
    _id: string,
    doc: IChecklistItem,
  ): Promise<IChecklistItemDocument>;
  removeChecklistItem(_id: string): Promise<IChecklistItemDocument>;
  updateItemOrder(_id: string, destinationOrder: number): Promise<IChecklistItemDocument>;
}

export const loadCheckListClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn, // now always defined
) => {
  const { sendDbEventLog, createActivityLog } = dispatcher;

  class Checklist {
    public static async getChecklist(_id: string) {
      const checklist = await models.Checklists.findOne({ _id });
      if (!checklist) throw new Error('Checklist not found');
      return checklist;
    }

    public static async removeChecklists(contentTypeIds: string[]) {
      const checklists = await models.Checklists.find({
        contentTypeId: { $in: contentTypeIds },
      });

      if (!checklists?.length) return;

      const checklistIds = checklists.map(c => c._id);

      for (const checklist of checklists) {
        sendDbEventLog?.({ action: 'delete', docId: checklist._id });
        createActivityLog?.({
          activityType: 'delete',
          target: { _id: checklist._id, moduleName: 'sales', collectionName: 'checklists' },
          action: { type: 'delete', description: 'Checklist deleted' },
          changes: { title: checklist.title, contentType: checklist.contentType, deletedAt: new Date() },
          metadata: { contentTypeId: checklist.contentTypeId, userId: checklist.userId },
        });
      }

      await models.ChecklistItems.deleteMany({ checklistId: { $in: checklistIds } });
      await models.Checklists.deleteMany({ _id: { $in: checklistIds } });
    }

    public static async createChecklist(
      { contentType, contentTypeId, ...fields }: IChecklist,
      user: IUserDocument,
    ) {
      const checklist = await models.Checklists.create({
        contentType,
        contentTypeId,
        createdUserId: user._id,
        createdDate: new Date(),
        userId: user._id,
        ...fields,
      });

      sendDbEventLog?.({ action: 'create', docId: checklist._id, currentDocument: checklist.toObject() });
      createActivityLog?.({
        activityType: 'create',
        target: { _id: checklist._id, moduleName: 'sales', collectionName: 'checklists' },
        action: { type: 'create', description: 'Checklist created' },
        changes: { title: checklist.title, contentType: checklist.contentType, createdAt: new Date() },
        metadata: { contentTypeId: checklist.contentTypeId, userId: user._id },
      });

      return checklist;
    }

    public static async updateChecklist(_id: string, doc: IChecklist) {
      const prevChecklist = await models.Checklists.findOne({ _id });
      if (!prevChecklist) throw new Error(`Checklist not found with id ${_id}`);

      await models.Checklists.updateOne({ _id }, { $set: doc });
      const updatedChecklist = await models.Checklists.findOne({ _id });
      if (!updatedChecklist) throw new Error('Checklist not found');

      sendDbEventLog?.({
        action: 'update',
        docId: updatedChecklist._id,
        currentDocument: updatedChecklist.toObject(),
        prevDocument: prevChecklist.toObject(),
      });

      await generateChecklistActivityLogs(prevChecklist.toObject(), updatedChecklist.toObject(), models, createActivityLog);

      return updatedChecklist;
    }

    public static async removeChecklist(_id: string) {
      const checklistObj = await models.Checklists.findOne({ _id });
      if (!checklistObj) throw new Error(`Checklist not found with id ${_id}`);

      sendDbEventLog?.({ action: 'delete', docId: checklistObj._id });
      createActivityLog?.({
        activityType: 'delete',
        target: { _id: checklistObj._id, moduleName: 'sales', collectionName: 'checklists' },
        action: { type: 'delete', description: 'Checklist deleted' },
        changes: { title: checklistObj.title, contentType: checklistObj.contentType, deletedAt: new Date() },
        metadata: { contentTypeId: checklistObj.contentTypeId, userId: checklistObj.userId },
      });

      const checklistItems = await models.ChecklistItems.find({ checklistId: checklistObj._id });
      for (const item of checklistItems) {
        createActivityLog?.({
          activityType: 'delete',
          target: { _id: item._id, moduleName: 'sales', collectionName: 'checklistItems' },
          action: { type: 'delete', description: 'Checklist item deleted (parent checklist removed)' },
          changes: { content: item.content, deletedAt: new Date() },
          metadata: { checklistId: checklistObj._id, userId: item.userId },
        });
      }

      await models.ChecklistItems.deleteMany({ checklistId: checklistObj._id });
      await checklistObj.deleteOne();
      return checklistObj;
    }
  }

  checklistSchema.loadClass(Checklist);
  return checklistSchema;
};

export const loadCheckListItemClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog, createActivityLog } = dispatcher;

  class ChecklistItem {
    public static async getChecklistItem(_id: string) {
      const item = await models.ChecklistItems.findOne({ _id });
      if (!item) throw new Error('Checklist item not found');
      return item;
    }

    public static async createChecklistItem(
      { checklistId, ...fields }: IChecklistItem,
      user: IUserDocument,
    ) {
      const itemsCount = await models.ChecklistItems.countDocuments({ checklistId });
      const checklistItem = await models.ChecklistItems.create({
        checklistId,
        createdUserId: user._id,
        createdDate: new Date(),
        userId: user._id,
        order: itemsCount + 1,
        ...fields,
      });

      sendDbEventLog?.({ action: 'create', docId: checklistItem._id, currentDocument: checklistItem.toObject() });
      createActivityLog?.({
        activityType: 'create',
        target: { _id: checklistItem._id, moduleName: 'sales', collectionName: 'checklistItems' },
        action: { type: 'create', description: 'Checklist item created' },
        changes: { content: checklistItem.content, isChecked: checklistItem.isChecked, order: checklistItem.order, createdAt: new Date() },
        metadata: { checklistId: checklistItem.checklistId, userId: user._id },
      });

      return checklistItem;
    }

    public static async updateChecklistItem(_id: string, doc: IChecklistItem) {
      const prevItem = await models.ChecklistItems.findOne({ _id });
      if (!prevItem) throw new Error(`Checklist item not found with id ${_id}`);

      await models.ChecklistItems.updateOne({ _id }, { $set: doc });
      const updatedItem = await models.ChecklistItems.findOne({ _id });
      if (!updatedItem) throw new Error(`Checklist item not found after update: ${_id}`);

      sendDbEventLog?.({ action: 'update', docId: updatedItem._id, currentDocument: updatedItem.toObject(), prevDocument: prevItem.toObject() });
      await generateChecklistItemActivityLogs(prevItem.toObject(), updatedItem.toObject(), models, createActivityLog);

      // Completion activity
      if (doc.isChecked !== undefined && doc.isChecked !== prevItem.isChecked) {
        createActivityLog?.({
          activityType: 'complete',
          target: { _id: updatedItem._id, moduleName: 'sales', collectionName: 'checklistItems' },
          action: { type: doc.isChecked ? 'complete' : 'incomplete', description: doc.isChecked ? 'Checklist item completed' : 'Checklist item marked incomplete' },
          changes: { isChecked: doc.isChecked, completedAt: doc.isChecked ? new Date() : undefined },
          metadata: { checklistId: updatedItem.checklistId, userId: updatedItem.userId },
        });
      }

      return updatedItem;
    }

    public static async removeChecklistItem(_id: string) {
      const item = await models.ChecklistItems.findOne({ _id });
      if (!item) throw new Error(`Checklist item not found with id ${_id}`);

      sendDbEventLog?.({ action: 'delete', docId: item._id });
      createActivityLog?.({
        activityType: 'delete',
        target: { _id: item._id, moduleName: 'sales', collectionName: 'checklistItems' },
        action: { type: 'delete', description: 'Checklist item deleted' },
        changes: { content: item.content, deletedAt: new Date() },
        metadata: { checklistId: item.checklistId, userId: item.userId },
      });

      await item.deleteOne();
      return item;
    }

    public static async updateItemOrder(_id: string, destinationOrder: number) {
      const currentItem = await models.ChecklistItems.findOne({ _id });
      if (!currentItem) throw new Error(`Checklist item not found with id ${_id}`);

      const prevOrder = currentItem.order;
      const swappedItem = await models.ChecklistItems.findOne({ checklistId: currentItem.checklistId, order: destinationOrder });

      if (swappedItem) {
        await models.ChecklistItems.updateOne({ _id: swappedItem._id }, { $set: { order: prevOrder } });
        const updatedSwappedItem = { ...swappedItem.toObject(), order: prevOrder };

        sendDbEventLog?.({ action: 'update', docId: swappedItem._id, currentDocument: updatedSwappedItem, prevDocument: swappedItem.toObject() });
        createActivityLog?.({
          activityType: 'reorder',
          target: { _id: swappedItem._id, moduleName: 'sales', collectionName: 'checklistItems' },
          action: { type: 'reorder', description: 'Checklist item order changed' },
          changes: { order: { from: swappedItem.order, to: prevOrder }, reorderedAt: new Date() },
          metadata: { checklistId: swappedItem.checklistId, userId: swappedItem.userId },
        });
      }

      await models.ChecklistItems.updateOne({ _id }, { $set: { order: destinationOrder } });
      const updatedItem = await models.ChecklistItems.findOne({ _id });
      if (!updatedItem) throw new Error(`Checklist item not found after reorder: ${_id}`);

      sendDbEventLog?.({ action: 'update', docId: updatedItem._id, currentDocument: updatedItem.toObject(), prevDocument: currentItem.toObject() });
      createActivityLog?.({
        activityType: 'reorder',
        target: { _id: updatedItem._id, moduleName: 'sales', collectionName: 'checklistItems' },
        action: { type: 'reorder', description: 'Checklist item order changed' },
        changes: { order: { from: prevOrder, to: destinationOrder }, reorderedAt: new Date() },
        metadata: { checklistId: updatedItem.checklistId, userId: updatedItem.userId },
      });

      return updatedItem;
    }
  }

  checklistItemSchema.loadClass(ChecklistItem);
  return checklistItemSchema;
};
