import { Model, model } from 'mongoose';
import { activityLogSchema, IActivityLogDocument, IActivityLogInput } from './definitions/activityLogs';

import { IItemCommonFieldsDocument } from './definitions/boards';
import { ACTIVITY_ACTIONS } from './definitions/constants';
import { ICustomerDocument } from './definitions/customers';
import { ISegmentDocument } from './definitions/segments';

export interface IActivityLogModel extends Model<IActivityLogDocument> {
  addActivityLog(doc: IActivityLogInput): Promise<IActivityLogDocument>;
  removeActivityLog(contentId: string): void;
  createSegmentLog(segment: ISegmentDocument, customer: ICustomerDocument, type: string);
  createLogFromWidget(type: string, payload): Promise<IActivityLogDocument>;
  createCocLog({ coc, contentType }: { coc: any; contentType: string }): Promise<IActivityLogDocument>;
  createBoardItemLog({
    item,
    contentType,
  }: {
    item: IItemCommonFieldsDocument;
    contentType: string;
  }): Promise<IActivityLogDocument>;
  createBoardItemMovementLog(
    item: IItemCommonFieldsDocument,
    type: string,
    userId: string,
    content: object,
  ): Promise<IActivityLogDocument>;
}

export const loadClass = () => {
  class ActivityLog {
    public static async addActivityLog(doc: IActivityLogInput) {
      const activity = await ActivityLogs.create(doc);

      return activity;
    }

    public static async removeActivityLog(contentId: IActivityLogInput) {
      await ActivityLogs.deleteMany({ contentId });
    }

    public static createBoardItemLog({ item, contentType }: { item: IItemCommonFieldsDocument; contentType: string }) {
      let action = ACTIVITY_ACTIONS.CREATE;
      let content = '';

      if (item.sourceConversationId) {
        action = ACTIVITY_ACTIONS.CONVERT;
        content = item.sourceConversationId;
      }

      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item._id,
        action,
        createdBy: item.userId || '',
        content,
      });
    }

    public static createBoardItemMovementLog(
      item: IItemCommonFieldsDocument,
      contentType: string,
      userId: string,
      content: object,
    ) {
      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item._id,
        action: ACTIVITY_ACTIONS.MOVED,
        createdBy: userId,
        content,
      });
    }

    public static async createLogFromWidget(type: string, payload) {
      switch (type) {
        case 'create-customer':
          return ActivityLogs.createCocLog({ coc: payload, contentType: 'customer' });
        case 'create-company':
          return ActivityLogs.createCocLog({ coc: payload, contentType: 'company' });
      }
    }

    public static createCocLog({ coc, contentType }: { coc: any; contentType: string }) {
      let action = ACTIVITY_ACTIONS.CREATE;
      let content = '';

      if (coc.mergedIds && coc.mergedIds.length > 0) {
        action = ACTIVITY_ACTIONS.MERGE;
        content = coc.mergedIds;
      }

      return ActivityLogs.addActivityLog({
        contentType,
        content,
        contentId: coc._id,
        action,
        createdBy: coc.ownerId || coc.integrationId,
      });
    }

    /**
     * Create a customer or company segment log
     */
    public static async createSegmentLog(segment: ISegmentDocument, customer: ICustomerDocument, type: string) {
      const foundSegment = await ActivityLogs.findOne({
        contentType: type,
        action: 'segment',
        contentId: customer._id,
        'content.id': segment._id,
      });

      if (foundSegment) {
        return foundSegment;
      }

      const doc = {
        contentType: type,
        contentId: customer._id,
        action: 'segment',
        content: {
          id: segment._id,
          content: segment.name,
        },
      };

      return ActivityLogs.create(doc);
    }
  }

  activityLogSchema.loadClass(ActivityLog);

  return activityLogSchema;
};

loadClass();

// tslint:disable-next-line
const ActivityLogs = model<IActivityLogDocument, IActivityLogModel>('activity_logs', activityLogSchema);

export default ActivityLogs;
