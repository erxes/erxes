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
  createChecklistActivityLog,
  createChecklistItemActivityLog,
  createDealActivityDispatcher,
  generateChecklistActivityLogs,
  generateChecklistItemActivityLogs,
  getUserId,
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
    item: IChecklistItem,
    user: IUserDocument,
  ): Promise<IChecklistItemDocument>;
  updateChecklistItem(
    _id: string,
    doc: IChecklistItem,
  ): Promise<IChecklistItemDocument>;
  removeChecklistItem(_id: string): Promise<IChecklistItemDocument>;
  updateItemOrder(
    _id: string,
    destinationOrder: number,
  ): Promise<IChecklistItemDocument>;
}

export const loadCheckListClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

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

      if (!checklists.length) return;

      const checklistIds = checklists.map((c) => c._id);

      for (const checklist of checklists) {
        sendDbEventLog({
          action: 'delete',
          docId: checklist._id,
        });

        const checklistObj = checklist.toObject();
        const userId = getUserId(checklistObj);
        const activityDispatcher = createDealActivityDispatcher(
          subdomain,
          userId,
        );

        createChecklistActivityLog(
          activityDispatcher,
          checklistObj.contentTypeId,
          'delete',
          checklistObj,
          userId,
        );
      }

      await models.ChecklistItems.deleteMany({
        checklistId: { $in: checklistIds },
      });
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

      sendDbEventLog({
        action: 'create',
        docId: checklist._id,
        currentDocument: checklist.toObject(),
      });

      const checklistObj = checklist.toObject();
      const activityDispatcher = createDealActivityDispatcher(
        subdomain,
        user._id,
      );

      createChecklistActivityLog(
        activityDispatcher,
        checklistObj.contentTypeId,
        'create',
        checklistObj,
        user._id,
      );

      return checklist;
    }

    public static async updateChecklist(_id: string, doc: IChecklist) {
      const prev = await models.Checklists.findOne({ _id });
      if (!prev) throw new Error(`Checklist not found: ${_id}`);

      await models.Checklists.updateOne({ _id }, { $set: doc });
      const updated = await models.Checklists.findOne({ _id });
      if (!updated) throw new Error('Checklist not found after update');

      sendDbEventLog({
        action: 'update',
        docId: updated._id,
        currentDocument: updated.toObject(),
        prevDocument: prev.toObject(),
      });
      const activityDispatcher = createDealActivityDispatcher(
        subdomain,
        getUserId(prev.toObject()),
      );
      await generateChecklistActivityLogs(
        prev.toObject(),
        updated.toObject(),
        models,
        activityDispatcher.createActivityLog,
      );

      return updated;
    }

    public static async removeChecklist(_id: string) {
      const checklist = await models.Checklists.findOne({ _id });
      if (!checklist) throw new Error(`Checklist not found: ${_id}`);

      sendDbEventLog({
        action: 'delete',
        docId: checklist._id,
      });

      const checklistObj = checklist.toObject();
      const userId = getUserId(checklistObj);
      const activityDispatcher = createDealActivityDispatcher(
        subdomain,
        userId,
      );

      createChecklistActivityLog(
        activityDispatcher,
        checklistObj.contentTypeId,
        'delete',
        checklistObj,
        userId,
      );

      await models.ChecklistItems.deleteMany({ checklistId: checklist._id });
      await checklist.deleteOne();

      return checklist;
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
  const { sendDbEventLog } = dispatcher;

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
      const count = await models.ChecklistItems.countDocuments({ checklistId });

      const item = await models.ChecklistItems.create({
        checklistId,
        createdUserId: user._id,
        createdDate: new Date(),
        userId: user._id,
        order: count + 1,
        ...fields,
      });

      sendDbEventLog({
        action: 'create',
        docId: item._id,
        currentDocument: item.toObject(),
      });

      // Get checklist to find the deal (contentTypeId)
      const checklist = await models.Checklists.findOne({ _id: checklistId });
      if (checklist) {
        const itemObj = item.toObject();
        const activityDispatcher = createDealActivityDispatcher(
          subdomain,
          user._id,
        );

        createChecklistItemActivityLog(
          activityDispatcher,
          checklist.contentTypeId,
          'create',
          itemObj,
          itemObj.checklistId,
          user._id,
        );
      }

      return item;
    }

    public static async updateChecklistItem(_id: string, doc: IChecklistItem) {
      const prev = await models.ChecklistItems.findOne({ _id });
      if (!prev) throw new Error(`Checklist item not found: ${_id}`);

      await models.ChecklistItems.updateOne({ _id }, { $set: doc });
      const updated = await models.ChecklistItems.findOne({ _id });
      if (!updated) throw new Error('Checklist item not found after update');

      sendDbEventLog({
        action: 'update',
        docId: updated._id,
        currentDocument: updated.toObject(),
        prevDocument: prev.toObject(),
      });
      const activityDispatcher = createDealActivityDispatcher(
        subdomain,
        getUserId(prev.toObject()),
      );
      await generateChecklistItemActivityLogs(
        prev.toObject(),
        updated.toObject(),
        models,
        activityDispatcher.createActivityLog,
      );

      return updated;
    }

    public static async removeChecklistItem(_id: string) {
      const item = await models.ChecklistItems.findOne({ _id });
      if (!item) throw new Error(`Checklist item not found: ${_id}`);

      sendDbEventLog({
        action: 'delete',
        docId: item._id,
      });

      const itemObj = item.toObject();
      const userId = getUserId(itemObj);

      // Get checklist to find the deal (contentTypeId)
      const checklist = await models.Checklists.findOne({
        _id: itemObj.checklistId,
      });
      if (checklist) {
        const activityDispatcher = createDealActivityDispatcher(
          subdomain,
          userId,
        );

        createChecklistItemActivityLog(
          activityDispatcher,
          checklist.contentTypeId,
          'delete',
          itemObj,
          itemObj.checklistId,
          userId,
        );
      }

      await item.deleteOne();
      return item;
    }

    public static async updateItemOrder(_id: string, destinationOrder: number) {
      const current = await models.ChecklistItems.findOne({ _id });
      if (!current) throw new Error(`Checklist item not found: ${_id}`);

      const prev = current.toObject();

      await models.ChecklistItems.updateOne(
        { _id },
        { $set: { order: destinationOrder } },
      );

      const updated = await models.ChecklistItems.findOne({ _id });
      if (!updated) throw new Error('Checklist item not found after reorder');

      sendDbEventLog({
        action: 'update',
        docId: updated._id,
        currentDocument: updated.toObject(),
        prevDocument: prev,
      });

      await generateChecklistItemActivityLogs(
        prev,
        updated.toObject(),
        models,
        dispatcher.createActivityLog,
      );

      return updated;
    }
  }

  checklistItemSchema.loadClass(ChecklistItem);
  return checklistItemSchema;
};
