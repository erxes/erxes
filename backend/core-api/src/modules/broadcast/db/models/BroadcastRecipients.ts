import { broadcastRecipientSchema } from '@/broadcast/db/definitions/broadcastRecipients';
import { Document, Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';

export type BroadcastRecipientStatus =
  | 'pending'
  | 'claimed'
  | 'sent'
  | 'skipped'
  | 'failed'
  | 'missing';

export type BroadcastRecipientOutcome = Exclude<
  BroadcastRecipientStatus,
  'pending' | 'claimed'
>;

export interface IBroadcastRecipient {
  runId: string;
  engageMessageId: string;
  automationId?: string;
  customerId: string;

  status: BroadcastRecipientStatus;
  reason?: string;

  claimToken?: string;
  claimedUntil?: Date;
  attempts: number;

  executionId?: string;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBroadcastRecipientDocument
  extends IBroadcastRecipient,
    Document {
  _id: string;
}

export interface IBroadcastRecipientModel
  extends Model<IBroadcastRecipientDocument> {
  enrol(
    runId: string,
    engageMessageId: string,
    customerIds: string[],
    automationId?: string,
  ): Promise<number>;
  claimBlock(runId: string): Promise<IBroadcastRecipientDocument[]>;
  finish(
    recipientId: string,
    status: BroadcastRecipientOutcome,
    reason?: string,
    executionId?: string,
  ): Promise<void>;
  release(recipientIds: string[]): Promise<void>;
  isRunDrained(runId: string): Promise<boolean>;
}

const CLAIM_BLOCK_SIZE = 25;
const CLAIM_LEASE_MS = 5 * 60 * 1000;

export const loadBroadcastRecipientClass = (models: IModels) => {
  class BroadcastRecipient {
    /**
     * Writes the manifest for one block of the audience. Duplicates are
     * dropped by the unique index rather than by a pre-read, so a retried
     * enrolment cannot enlarge the run.
     */
    public static async enrol(
      runId: string,
      engageMessageId: string,
      customerIds: string[],
      automationId?: string,
    ) {
      if (!customerIds.length) {
        return 0;
      }

      const now = new Date();

      const result = await models.BroadcastRecipients.bulkWrite(
        customerIds.map((customerId) => ({
          updateOne: {
            filter: { runId, customerId },
            update: {
              $setOnInsert: {
                runId,
                engageMessageId,
                customerId,
                ...(automationId ? { automationId } : {}),
                status: 'pending',
                attempts: 0,
                createdAt: now,
                updatedAt: now,
              },
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );

      return result.upsertedCount || 0;
    }

    /**
     * Takes a small block under a lease. Small because a pause is only noticed
     * between blocks: the block size is how far past a pause a run can run on.
     * Rows whose lease expired are taken back here, so a worker that died
     * holding them does not strand them.
     */
    public static async claimBlock(runId: string) {
      const now = new Date();
      const claimable = [
        { status: 'pending' },
        { status: 'claimed', claimedUntil: { $lt: now } },
      ];

      const candidates = await models.BroadcastRecipients.find(
        { runId, $or: claimable },
        { _id: 1 },
      )
        .limit(CLAIM_BLOCK_SIZE)
        .lean();

      if (!candidates.length) {
        return [];
      }

      const claimToken = nanoid();

      await models.BroadcastRecipients.updateMany(
        {
          _id: { $in: candidates.map(({ _id }) => _id) },
          $or: claimable,
        },
        {
          $set: {
            status: 'claimed',
            claimToken,
            claimedUntil: new Date(now.getTime() + CLAIM_LEASE_MS),
          },
          $inc: { attempts: 1 },
        },
      );

      // Read back by token: rows another worker won are simply not ours.
      return models.BroadcastRecipients.find({ claimToken });
    }

    public static async finish(
      recipientId: string,
      status: BroadcastRecipientOutcome,
      reason?: string,
      executionId?: string,
    ) {
      await models.BroadcastRecipients.updateOne(
        { _id: recipientId },
        {
          $set: {
            status,
            finishedAt: new Date(),
            updatedAt: new Date(),
            ...(reason ? { reason } : {}),
            ...(executionId ? { executionId } : {}),
          },
          $unset: { claimToken: '', claimedUntil: '' },
        },
      );
    }

    /**
     * Hands rows back unsent. The email lane claims a block before it knows
     * how much of today's sending allowance it will be granted, so what it
     * could not send has to become someone else's to take tomorrow.
     */
    public static async release(recipientIds: string[]) {
      if (!recipientIds.length) {
        return;
      }

      await models.BroadcastRecipients.updateMany(
        { _id: { $in: recipientIds }, status: 'claimed' },
        {
          $set: { status: 'pending', updatedAt: new Date() },
          $unset: { claimToken: '', claimedUntil: '' },
        },
      );
    }

    /**
     * Asked instead of counting: the answer is whether anything is left, and
     * the index gives that without walking the run.
     */
    public static async isRunDrained(runId: string) {
      return !(await models.BroadcastRecipients.exists({
        runId,
        status: { $in: ['pending', 'claimed'] },
      }));
    }
  }

  broadcastRecipientSchema.loadClass(BroadcastRecipient);

  return broadcastRecipientSchema;
};
