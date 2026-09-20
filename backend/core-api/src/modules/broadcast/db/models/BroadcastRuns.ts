import { IEngageMessageDocument } from '@/broadcast/@types';
import { broadcastRunSchema } from '@/broadcast/db/definitions/broadcastRuns';
import { Document, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export type BroadcastRunStatus =
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface IBroadcastRun {
  engageMessageId: string;
  runCount: number;

  method: string;
  email?: Record<string, any>;
  messenger?: Record<string, any>;
  notification?: Record<string, any>;
  automationId?: string;
  fromEmail?: string;
  fromUserId?: string;
  cpId?: string;
  configSet?: string;

  // Which occurrence of a schedule opened this run, absent when started by hand.
  scheduledFor?: Date;

  status: BroadcastRunStatus;
  totalCount: number;
  startedAt: Date;
  finishedAt?: Date;
}

export interface IBroadcastRunDocument extends IBroadcastRun, Document {
  _id: string;
}

export interface IBroadcastRunModel extends Model<IBroadcastRunDocument> {
  startRun(
    campaign: IEngageMessageDocument,
    runCount: number,
    extras?: {
      automationId?: string;
      configSet?: string;
      scheduledFor?: Date;
    },
  ): Promise<IBroadcastRunDocument>;
  finishRun(
    runId: string,
    status: Exclude<BroadcastRunStatus, 'running'>,
  ): Promise<boolean>;
}

export const loadBroadcastRunClass = (models: IModels) => {
  class BroadcastRun {
    /**
     * Freezes what this run sends. Everything the delivery path needs is read
     * from here afterwards, so editing the campaign mid-run cannot change the
     * message the remaining recipients receive.
     */
    public static async startRun(
      campaign: IEngageMessageDocument,
      runCount: number,
      extras: {
        automationId?: string;
        configSet?: string;
        scheduledFor?: Date;
      } = {},
    ) {
      return models.BroadcastRuns.create({
        engageMessageId: campaign._id,
        runCount,
        method: campaign.method,
        email: campaign.email?.toObject?.() ?? campaign.email,
        messenger: campaign.messenger?.toObject?.() ?? campaign.messenger,
        notification:
          campaign.notification?.toObject?.() ?? campaign.notification,
        ...extras,
        fromEmail: campaign.fromEmail,
        fromUserId: campaign.fromUserId,
        cpId: campaign.cpId,
        status: 'running',
      });
    }

    /**
     * Closes the run, and says whether this call is the one that closed it.
     *
     * Every drain that empties the manifest asks to settle it, so without an
     * answer they would each announce the same finish.
     */
    public static async finishRun(
      runId: string,
      status: Exclude<BroadcastRunStatus, 'running'>,
    ) {
      const { modifiedCount } = await models.BroadcastRuns.updateOne(
        { _id: runId, status: 'running' },
        { $set: { status, finishedAt: new Date() } },
      );

      return modifiedCount > 0;
    }
  }

  broadcastRunSchema.loadClass(BroadcastRun);

  return broadcastRunSchema;
};
