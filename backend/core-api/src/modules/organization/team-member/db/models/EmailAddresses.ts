import {
  emailAddressSchema,
  IEmailAddressDocument,
  TEmailSuppressionReason,
} from 'erxes-api-shared/core-modules';
import { normalizeEmail } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IEmailAddressModel extends Model<IEmailAddressDocument> {
  recordSent(emails: string[]): Promise<void>;
  recordDelivered(email: string): Promise<void>;
  recordSoftBounce(email: string, limit: number): Promise<void>;
  suppress(
    email: string,
    reason: TEmailSuppressionReason,
    userId?: string,
  ): Promise<void>;
  release(email: string): Promise<void>;
}

export const loadEmailAddressClass = (models: IModels) => {
  class EmailAddress {
    public static async recordSent(emails: string[]) {
      const addresses = [
        ...new Set((emails || []).filter(Boolean).map(normalizeEmail)),
      ];

      if (!addresses.length) {
        return;
      }

      await models.EmailAddresses.bulkWrite(
        addresses.map((email) => ({
          updateOne: {
            filter: { email },
            update: {
              $set: { lastSentAt: new Date(), updatedAt: new Date() },
              $setOnInsert: { createdAt: new Date() },
            },
            upsert: true,
          },
        })),
      );
    }

    /**
     * The only thing that makes an address "proven".
     *
     * Delivery also clears the soft-bounce tally: the mailbox answered, so
     * whatever was temporarily wrong with it is over.
     */
    public static async recordDelivered(email: string) {
      await models.EmailAddresses.updateOne(
        { email: normalizeEmail(email) },
        {
          $set: {
            lastDeliveredAt: new Date(),
            softBounceCount: 0,
            updatedAt: new Date(),
          },
          $inc: { deliveredCount: 1 },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      );
    }

    /**
     * A full mailbox or a server that was down is not a dead address — only a
     * run of them is. The tally decides, never the single event.
     */
    public static async recordSoftBounce(email: string, limit: number) {
      const address = await models.EmailAddresses.findOneAndUpdate(
        { email: normalizeEmail(email) },
        {
          $set: { lastSoftBounceAt: new Date(), updatedAt: new Date() },
          $inc: { softBounceCount: 1 },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true },
      );

      if (address && address.softBounceCount >= limit) {
        await models.EmailAddresses.suppress(email, 'hard_bounce');
      }
    }

    /**
     * The latest reason wins. Every reason that ever applied stays visible on
     * the delivery rows themselves; this field answers only "why is it closed
     * right now", which is what a person looking at the address wants.
     */
    public static async suppress(
      email: string,
      reason: TEmailSuppressionReason,
      userId?: string,
    ) {
      await models.EmailAddresses.updateOne(
        { email: normalizeEmail(email) },
        {
          $set: {
            suppressedAt: new Date(),
            suppressionReason: reason,
            suppressedBy: userId,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      );
    }

    /** No automatic path back on purpose — a person has to decide. */
    public static async release(email: string) {
      await models.EmailAddresses.updateOne(
        { email: normalizeEmail(email) },
        {
          $unset: {
            suppressedAt: '',
            suppressionReason: '',
            suppressedBy: '',
          },
          $set: { softBounceCount: 0, updatedAt: new Date() },
        },
      );
    }
  }

  emailAddressSchema.loadClass(EmailAddress);

  return emailAddressSchema;
};
