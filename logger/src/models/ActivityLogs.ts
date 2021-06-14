import * as Random from 'meteor-random';
import { Document, Model, model, Schema } from 'mongoose';
import { field } from './Logs';

const ACTIVITY_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MERGE: 'merge',
  SEND: 'send',
  MOVED: 'moved',
  CONVERT: 'convert',
  ASSIGNEE: 'assignee',

  ALL: [
    'create',
    'update',
    'delete',
    'merge',
    'send',
    'moved',
    'convert',
    'assignee'
  ]
};

export interface IActivityLogInput {
  action: string;
  content?: any;
  contentType: string;
  contentId: string;
  createdBy: string;
}

export interface IActivityLog {
  action: string;
  content?: any;
  contentType: string;
  contentId: string;
  createdBy: string;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: string;
  createdAt: Date;
}

export const activityLogSchema = new Schema({
  _id: { type: String, default: () => Random.id() },
  contentId: field({ type: String, index: true }),
  contentType: field({ type: String, index: true }),
  action: field({ type: String, index: true }),
  content: Schema.Types.Mixed,
  createdBy: field({ type: String }),
  createdAt: field({
    type: Date,
    required: true,
    default: Date.now
  })
});

interface IAssigneeParams {
  contentId: string;
  userId: string;
  contentType: string;
  content: object;
}

interface IChecklistParams {
  item: any;
  contentType: string;
  action: string;
}

interface IArchiveParams {
  item: any;
  contentType: string;
  action: string;
  userId: string;
}

export interface IActivityLogModel extends Model<IActivityLogDocument> {
  addActivityLog(doc: IActivityLogInput): Promise<IActivityLogDocument>;
  addActivityLogs(docs: IActivityLogInput[]): Promise<IActivityLogDocument[]>;
  removeActivityLog(contentId: string): void;
  removeActivityLogs(
    contentType: string,
    contentIds: string[]
  ): Promise<{ n: number; ok: number }>;

  createSegmentLog(
    segment: any,
    customer: string[],
    type: string,
    maxBulk?: number
  );
  createLogFromWidget(type: string, payload): Promise<IActivityLogDocument>;
  createCocLog(params: {
    coc: any;
    contentType: string;
  }): Promise<IActivityLogDocument>;
  createCocLogs(params: {
    cocs: any;
    contentType: string;
  }): Promise<IActivityLogDocument[]>;
  createBoardItemsLog(params: {
    items: any[];
    contentType: string;
  }): Promise<IActivityLogDocument[]>;
  createBoardItemLog(params: {
    item: any;
    contentType: string;
  }): Promise<IActivityLogDocument>;
  createBoardItemMovementLog(
    item: any,
    type: string,
    userId: string,
    content: object
  ): Promise<IActivityLogDocument>;
  createAssigneLog(params: IAssigneeParams): Promise<IActivityLogDocument>;
  createChecklistLog(params: IChecklistParams): Promise<IActivityLogDocument>;

  createArchiveLog(params: IArchiveParams): Promise<IActivityLogDocument>;
}

export const loadClass = () => {
  class ActivityLog {
    public static addActivityLog(doc: IActivityLogInput) {
      return ActivityLogs.create(doc);
    }

    public static addActivityLogs(docs: IActivityLogInput[]) {
      return ActivityLogs.insertMany(docs);
    }

    public static async removeActivityLog(contentId: IActivityLogInput) {
      await ActivityLogs.deleteMany({ contentId });
    }

    /**
     * Remove internal notes
     */
    public static async removeActivityLogs(
      contentType: string,
      contentIds: string[]
    ) {
      // Removing every activity logs of contentType
      return ActivityLogs.deleteMany({
        contentType,
        contentId: { $in: contentIds }
      });
    }

    public static async createAssigneLog({
      contentId,
      userId,
      contentType,
      content
    }: IAssigneeParams) {
      return ActivityLogs.addActivityLog({
        contentType,
        contentId,
        action: 'assignee',
        content,
        createdBy: userId || ''
      });
    }

    public static createBoardItemsLog({
      items,
      contentType
    }: {
      items: any[];
      contentType: string;
    }) {
      const docs: IActivityLogInput[] = [];

      for (const item of items) {
        let action = ACTIVITY_ACTIONS.CREATE;
        let content = '';

        const sourceIds = item.sourceConversationIds;

        if (sourceIds && sourceIds.length > 0) {
          action = ACTIVITY_ACTIONS.CONVERT;
          content = sourceIds.slice(-1)[0];
        }

        docs.push({
          contentType,
          action,
          content,
          contentId: item._id,
          createdBy: item.userId || ''
        });
      }

      return ActivityLogs.addActivityLogs(docs);
    }

    public static createBoardItemLog({
      item,
      contentType
    }: {
      item: any;
      contentType: string;
    }) {
      let action = ACTIVITY_ACTIONS.CREATE;
      let content = '';

      const sourceIds = item.sourceConversationIds;

      if (sourceIds && sourceIds.length > 0) {
        action = ACTIVITY_ACTIONS.CONVERT;
        content = sourceIds.slice(-1)[0];
      }

      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item._id,
        action,
        createdBy: item.userId || '',
        content
      });
    }

    public static createBoardItemMovementLog(
      item: any,
      contentType: string,
      userId: string,
      content: object
    ) {
      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item._id,
        action: ACTIVITY_ACTIONS.MOVED,
        createdBy: userId,
        content
      });
    }

    public static async createLogFromWidget(type: string, payload) {
      switch (type) {
        case 'create-customer':
          return ActivityLogs.createCocLog({
            coc: payload,
            contentType: 'customer'
          });
        case 'create-company':
          return ActivityLogs.createCocLog({
            coc: payload,
            contentType: 'company'
          });
      }
    }

    public static createCocLogs({
      cocs,
      contentType
    }: {
      cocs: any;
      contentType: string;
    }) {
      const docs: IActivityLogInput[] = [];

      for (const coc of cocs) {
        let action = ACTIVITY_ACTIONS.CREATE;
        let content = '';

        if (coc.mergedIds && coc.mergedIds.length > 0) {
          action = ACTIVITY_ACTIONS.MERGE;
          content = coc.mergedIds;
        }

        docs.push({
          action,
          content,
          contentType,
          contentId: coc._id,
          createdBy: coc.ownerId || coc.integrationId
        });
      }

      return ActivityLogs.addActivityLogs(docs);
    }

    public static createCocLog({
      coc,
      contentType
    }: {
      coc: any;
      contentType: string;
    }) {
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
        createdBy: coc.ownerId || coc.integrationId
      });
    }

    /**
     * Create a customer or company segment logs
     */
    public static async createSegmentLog(
      segment: any,
      contentIds: string[] = [],
      type: string,
      maxBulk: number = 10000
    ) {
      const foundSegments = await ActivityLogs.find(
        {
          contentType: type,
          action: 'segment',
          contentId: { $in: contentIds },
          'content.id': segment._id
        },
        { contentId: 1 }
      );

      const foundContentIds = foundSegments.map(s => s.contentId);

      const diffContentIds = contentIds.filter(
        x => !foundContentIds.includes(x)
      );

      let bulkOpt: Array<{
        contentType: string;
        contentId: string;
        action: string;
        content: {};
      }> = [];

      let bulkCounter = 0;

      for (const contentId of diffContentIds) {
        bulkCounter = bulkCounter + 1;

        bulkOpt.push({
          contentType: type,
          contentId,
          action: 'segment',
          content: {
            id: segment._id,
            content: segment.name
          }
        });

        if (bulkCounter === maxBulk) {
          await ActivityLogs.insertMany(bulkOpt);
          bulkOpt = [];
          bulkCounter = 0;
        }
      }

      if (bulkOpt.length === 0) {
        return;
      }

      return ActivityLogs.insertMany(bulkOpt);
    }

    public static async createArchiveLog({
      item,
      contentType,
      action,
      userId
    }: IArchiveParams) {
      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item._id,
        action: 'archive',
        content: action,
        createdBy: userId
      });
    }

    public static async createChecklistLog({
      item,
      contentType,
      action
    }: IChecklistParams) {
      if (action === 'delete') {
        await ActivityLogs.updateMany(
          { 'content._id': item._id },
          { $set: { 'content.name': item.title || item.content } }
        );
      }

      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item.contentTypeId || item.checklistId,
        action,
        content: {
          _id: item._id,
          name: item.title || item.content
        },
        createdBy: item.createdUserId || ''
      });
    }
  }

  activityLogSchema.loadClass(ActivityLog);

  return activityLogSchema;
};

loadClass();

// tslint:disable-next-line
const ActivityLogs = model<IActivityLogDocument, IActivityLogModel>(
  'activity_logs',
  activityLogSchema
);

export default ActivityLogs;
