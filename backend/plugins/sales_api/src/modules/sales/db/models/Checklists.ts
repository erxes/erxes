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
    { contentType, contentTypeId, ...fields }: IChecklist,
    user: IUserDocument,
  ): Promise<IChecklistDocument>;

  updateChecklist(_id: string, doc: IChecklist): Promise<IChecklistDocument>;

  removeChecklist(_id: string): Promise<IChecklistDocument>;
}

export interface IChecklistItemModel extends Model<IChecklistItemDocument> {
  getChecklistItem(_id: string): Promise<IChecklistItemDocument>;
  createChecklistItem(
    { checklistId, ...fields }: IChecklistItem,
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
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class Checklist {
    public static async getChecklist(_id: string) {
      const checklist = await models.Checklists.findOne({ _id });

      if (!checklist) {
        throw new Error('Checklist not found');
      }

      return checklist;
    }

    public static async removeChecklists(contentTypeIds: string[]) {
      const checklists = await models.Checklists.find({
        contentTypeId: { $in: contentTypeIds },
      });

      if (checklists && checklists.length === 0) {
        return;
      }

      const checklistIds = checklists.map((list) => list._id);

      // Create activity logs for each checklist being deleted
      for (const checklist of checklists) {
        sendDbEventLog({
          action: 'delete',
          docId: checklist._id,
        });

        createActivityLog({
          activityType: 'delete',
          target: {
            _id: checklist._id,
            moduleName: 'sales',
            collectionName: 'checklists',
          },
          action: {
            type: 'delete',
            description: 'Checklist deleted',
          },
          changes: {
            title: checklist.title,
            contentType: checklist.contentType,
            deletedAt: new Date(),
          },
          metadata: {
            contentTypeId: checklist.contentTypeId,
            userId: checklist.userId,
          },
        });
      }

      await models.ChecklistItems.deleteMany({
        checklistId: { $in: checklistIds },
      });

      await models.Checklists.deleteMany({ _id: { $in: checklistIds } });
    }

    /*
     * Create new checklist
     */
    public static async createChecklist(
      { contentType, contentTypeId, ...fields }: IChecklist,
      user: IUserDocument,
    ) {
      const checklist = await models.Checklists.create({
        contentTypeId,
        contentType,
        createdUserId: user._id,
        createdDate: new Date(),
        userId: user._id,
        ...fields,
      });

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: checklist._id,
        currentDocument: checklist.toObject(),
      });

      // Create activity log
      createActivityLog({
        activityType: 'create',
        target: {
          _id: checklist._id,
          moduleName: 'sales',
          collectionName: 'checklists',
        },
        action: {
          type: 'create',
          description: 'Checklist created',
        },
        changes: {
          title: checklist.title,
          contentType: checklist.contentType,
          createdAt: new Date(),
        },
        metadata: {
          contentTypeId: checklist.contentTypeId,
          userId: user._id,
        },
      });

      return checklist;
    }

    /*
     * Update checklist
     */
    public static async updateChecklist(_id: string, doc: IChecklist) {
      const prevChecklist = await models.Checklists.findOne({ _id });
      
      if (!prevChecklist) {
        throw new Error(`Checklist not found with id ${_id}`);
      }

      await models.Checklists.updateOne({ _id }, { $set: doc });

      const updatedChecklist = await models.Checklists.findOne({ _id });

      if (!updatedChecklist) {
        throw new Error('Checklist not found');
      }
      
      if (updatedChecklist) {
        // Send database event log
        sendDbEventLog({
          action: 'update',
          docId: updatedChecklist._id,
          currentDocument: updatedChecklist.toObject(),
          prevDocument: prevChecklist.toObject(),
        });

        // Generate activity logs for changed fields
        await generateChecklistActivityLogs(
          prevChecklist.toObject(),
          updatedChecklist.toObject(),
          models,
          createActivityLog,
        );
      }

      return updatedChecklist;
    }

    /*
     * Remove checklist item
     */
    public static async removeChecklist(_id: string) {
      const checklistObj = await models.Checklists.findOne({ _id });

      if (!checklistObj) {
        throw new Error(`Checklist not found with id ${_id}`);
      }

      // Send database event log before deletion
      sendDbEventLog({
        action: 'delete',
        docId: checklistObj._id,
      });

      // Create activity log for checklist deletion
      createActivityLog({
        activityType: 'delete',
        target: {
          _id: checklistObj._id,
          moduleName: 'sales',
          collectionName: 'checklists',
        },
        action: {
          type: 'delete',
          description: 'Checklist deleted',
        },
        changes: {
          title: checklistObj.title,
          contentType: checklistObj.contentType,
          deletedAt: new Date(),
        },
        metadata: {
          contentTypeId: checklistObj.contentTypeId,
          userId: checklistObj.userId,
        },
      });

      // Also delete all checklist items and create activity logs for them
      const checklistItems = await models.ChecklistItems.find({
        checklistId: checklistObj._id,
      });

      for (const item of checklistItems) {
        // Create activity log for checklist item deletion
        createActivityLog({
          activityType: 'delete',
          target: {
            _id: item._id,
            moduleName: 'sales',
            collectionName: 'checklistItems',
          },
          action: {
            type: 'delete',
            description: 'Checklist item deleted (parent checklist removed)',
          },
          changes: {
            content: item.content,
            deletedAt: new Date(),
          },
          metadata: {
            checklistId: checklistObj._id,
            userId: item.userId,
          },
        });
      }

      await models.ChecklistItems.deleteMany({
        checklistId: checklistObj._id,
      });

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
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class ChecklistItem {
    public static async getChecklistItem(_id: string) {
      const checklistItem = await models.ChecklistItems.findOne({ _id });

      if (!checklistItem) {
        throw new Error('Checklist item not found');
      }

      return checklistItem;
    }

    /*
     * Create new checklistItem
     */
    public static async createChecklistItem(
      { checklistId, ...fields }: IChecklistItem,
      user: IUserDocument,
    ) {
      const itemsCount = await models.ChecklistItems.find({
        checklistId,
      }).countDocuments();

      const checklistItem = await models.ChecklistItems.create({
        checklistId,
        createdUserId: user._id,
        createdDate: new Date(),
        userId: user._id,
        order: itemsCount + 1,
        ...fields,
      });

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: checklistItem._id,
        currentDocument: checklistItem.toObject(),
      });

      // Create activity log
      createActivityLog({
        activityType: 'create',
        target: {
          _id: checklistItem._id,
          moduleName: 'sales',
          collectionName: 'checklistItems',
        },
        action: {
          type: 'create',
          description: 'Checklist item created',
        },
        changes: {
          content: checklistItem.content,
          isChecked: checklistItem.isChecked,
          order: checklistItem.order,
          createdAt: new Date(),
        },
        metadata: {
          checklistId: checklistItem.checklistId,
          userId: user._id,
        },
      });

      return checklistItem;
    }

    /*
     * Update checklistItem
     */
    public static async updateChecklistItem(_id: string, doc: IChecklistItem) {
      const prevItem = await models.ChecklistItems.findOne({ _id });
      
      if (!prevItem) {
        throw new Error(`Checklist item not found with id ${_id}`);
      }

      await models.ChecklistItems.updateOne({ _id }, { $set: doc });

      const checklistItem = await models.ChecklistItems.findOne({ _id });
      
      if (checklistItem) {
        // Send database event log
        sendDbEventLog({
          action: 'update',
          docId: checklistItem._id,
          currentDocument: checklistItem.toObject(),
          prevDocument: prevItem.toObject(),
        });

        // Generate activity logs for changed fields
        await generateChecklistItemActivityLogs(
          prevItem.toObject(),
          checklistItem.toObject(),
          models,
          createActivityLog,
        );

        // Special activity log for item completion
        if (doc.isChecked !== undefined && doc.isChecked !== prevItem.isChecked) {
          createActivityLog({
            activityType: 'complete',
            target: {
              _id: checklistItem._id,
              moduleName: 'sales',
              collectionName: 'checklistItems',
            },
            action: {
              type: doc.isChecked ? 'complete' : 'incomplete',
              description: doc.isChecked ? 'Checklist item completed' : 'Checklist item marked incomplete',
            },
            changes: {
              isChecked: doc.isChecked,
              completedAt: doc.isChecked ? new Date() : undefined,
            },
            metadata: {
              checklistId: checklistItem.checklistId,
              userId: checklistItem.userId,
            },
          });
        }
      }
      if (!checklistItem) {
        throw new Error(`Checklist item not found after update with id ${_id}`);
      }
      return checklistItem;
    }

    /*
     * Remove checklist item
     */
    public static async removeChecklistItem(_id: string) {
      const checklistItem = await models.ChecklistItems.findOne({ _id });

      if (!checklistItem) {
        throw new Error(`Checklist item not found with id ${_id}`);
      }

      // Send database event log before deletion
      sendDbEventLog({
        action: 'delete',
        docId: checklistItem._id,
      });

      // Create activity log
      createActivityLog({
        activityType: 'delete',
        target: {
          _id: checklistItem._id,
          moduleName: 'sales',
          collectionName: 'checklistItems',
        },
        action: {
          type: 'delete',
          description: 'Checklist item deleted',
        },
        changes: {
          content: checklistItem.content,
          deletedAt: new Date(),
        },
        metadata: {
          checklistId: checklistItem.checklistId,
          userId: checklistItem.userId,
        },
      });

      await checklistItem.deleteOne();

      return checklistItem;
    }

    public static async updateItemOrder(_id: string, destinationOrder: number) {
      const currentItem = await models.ChecklistItems.findOne({ _id });

      if (!currentItem) {
        throw new Error(`Checklist item with id = ${_id} not found`);
      }

      const prevOrder = currentItem.order;

      const swappedItem = await models.ChecklistItems.findOne({
        checklistId: currentItem.checklistId,
        order: destinationOrder,
      });

      if (swappedItem) {
        await models.ChecklistItems.updateOne(
          { _id: swappedItem._id },
          { $set: { order: prevOrder } },
        );

        const updatedSwappedItem = {
          ...swappedItem.toObject(),
          order: prevOrder,
        };

        // DB event log
        sendDbEventLog({
          action: 'update',
          docId: swappedItem._id,
          currentDocument: updatedSwappedItem,
          prevDocument: swappedItem.toObject(),
        });

        // Activity log
        createActivityLog({
          activityType: 'reorder',
          target: {
            _id: swappedItem._id,
            moduleName: 'sales',
            collectionName: 'checklistItems',
          },
          action: {
            type: 'reorder',
            description: 'Checklist item order changed',
          },
          changes: {
            order: {
              from: swappedItem.order,
              to: prevOrder,
            },
            reorderedAt: new Date(),
          },
          metadata: {
            checklistId: swappedItem.checklistId,
            userId: swappedItem.userId,
          },
        });
      }

      await models.ChecklistItems.updateOne(
        { _id },
        { $set: { order: destinationOrder } },
      );

      const updatedItem = await models.ChecklistItems.findOne({ _id });

      if (!updatedItem) {
        throw new Error(`Checklist item not found after reorder: ${_id}`);
      }
      
      if (updatedItem) {
        // Send database event log for order change
        sendDbEventLog({
          action: 'update',
          docId: updatedItem._id,
          currentDocument: updatedItem,
          prevDocument: currentItem.toObject(),
        });

        // Create activity log for order change
        createActivityLog({
          activityType: 'reorder',
          target: {
            _id: updatedItem._id,
            moduleName: 'sales',
            collectionName: 'checklistItems',
          },
          action: {
            type: 'reorder',
            description: 'Checklist item order changed',
          },
          changes: {
            order: {
              from: prevOrder,
              to: destinationOrder,
            },
            reorderedAt: new Date(),
          },
          metadata: {
            checklistId: updatedItem.checklistId,
            userId: updatedItem.userId,
          },
        });
      }

      return updatedItem;
    }
  }

  checklistItemSchema.loadClass(ChecklistItem);

  return checklistItemSchema;
};