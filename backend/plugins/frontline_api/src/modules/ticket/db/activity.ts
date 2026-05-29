import { Schema, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IActivity, IActivityDocument, IActivityUpdate } from '@/ticket/@types/activity';

// ─── Schema ───────────────────────────────────────────────────────────────────

const metadataSchema = new Schema(
  {
    newValue:      { type: String, label: 'New Value' },
    previousValue: { type: String, label: 'Previous Value' },
  },
  { _id: false },
);

const activitySchema = new Schema(
  {
    action:    { type: String, label: 'Action',     required: true },
    contentId: { type: String, label: 'Content ID', required: true },
    module:    { type: String, label: 'Module',     required: true },
    metadata:  { type: metadataSchema, label: 'Metadata' },
    createdBy: { type: String, label: 'Created By' },
  },
  { timestamps: true },
);

// ─── Model ────────────────────────────────────────────────────────────────────

export interface IActivityModel extends Model<IActivityDocument> {
  createActivity(doc: IActivity): Promise<IActivityDocument>;
  updateActivity(doc: IActivityUpdate): Promise<IActivityDocument | null>;
  removeActivity(activityId: string): Promise<IActivityDocument | null>;
}

export const loadActivityClass = (models: IModels) => {
  class Activity {
    public static async createActivity(doc: IActivity): Promise<IActivityDocument> {
      const activity = await models.Activity.create(doc);
      await graphqlPubsub.publish(`ticketActivityChanged:${doc.contentId}`, {
        ticketActivityChanged: { type: 'created', activity },
      });
      return activity;
    }

    public static async updateActivity(doc: IActivityDocument): Promise<IActivityDocument | null> {
      const { _id, ...rest } = doc;
      const updated = await models.Activity.findOneAndUpdate(
        { _id },
        { $set: { ...rest } },
        { new: true },
      );
      await graphqlPubsub.publish(`ticketActivityChanged:${doc.contentId}`, {
        ticketActivityChanged: { type: 'updated', activity: updated },
      });
      return updated;
    }

    public static async removeActivity(activityId: string): Promise<IActivityDocument | null> {
      const deleted = await models.Activity.findOneAndDelete({ _id: activityId });
      await graphqlPubsub.publish(`ticketActivityChanged:${deleted?.contentId}`, {
        ticketActivityChanged: { type: 'removed', activity: deleted },
      });
      return deleted;
    }
  }

  activitySchema.loadClass(Activity);
  return activitySchema;
};
