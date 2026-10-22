import {
  emailAddressSchema,
  IEmailAddressDocument,
  TEmailLane,
  TEmailScreenReason,
  TEmailSuppressionReason,
  TMailKind,
} from 'erxes-api-shared/core-modules';
import { getEnv, normalizeEmail } from 'erxes-api-shared/utils';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { screenAddress } from '~/utils/email/intake';

export interface IEmailAddressModel extends Model<IEmailAddressDocument> {
  recordSent(emails: string[]): Promise<void>;
  recordDelivered(email: string): Promise<void>;
  recordSoftBounce(email: string, limit: number): Promise<void>;
  suppress(
    email: string,
    reason: TEmailSuppressionReason,
    userId?: string,
    screenReason?: TEmailScreenReason,
  ): Promise<void>;
  screen(email: string, screenReason: TEmailScreenReason): Promise<void>;
  release(email: string, userId?: string, note?: string): Promise<void>;

  laneFilter(lane: TEmailLane): FilterQuery<IEmailAddressDocument>;
  laneOf(
    address: Pick<IEmailAddressDocument, 'suppressedAt' | 'lastDeliveredAt'>,
  ): TEmailLane;
  listProven(emails: string[]): Promise<Set<string>>;
  listSuppressed(emails: string[], kind: TMailKind): Promise<Set<string>>;
  rescreen(
    address: Pick<IEmailAddressDocument, 'email' | 'screenReason'>,
  ): Promise<boolean>;
  messageLane(emails: string[]): Promise<TEmailLane | undefined>;
}

const normalizeAll = (emails: string[]) => [
  ...new Set((emails || []).filter(Boolean).map(normalizeEmail)),
];

const provenCutoff = () =>
  new Date(
    Date.now() -
      Number(getEnv({ name: 'EMAIL_PROVEN_WINDOW_DAYS' }) || 180) *
        24 *
        60 *
        60 *
        1000,
  );

export const loadEmailAddressClass = (models: IModels) => {
  class EmailAddress {
    public static async recordSent(emails: string[]) {
      const addresses = normalizeAll(emails);

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

    public static async suppress(
      email: string,
      reason: TEmailSuppressionReason,
      userId?: string,
      screenReason?: TEmailScreenReason,
    ) {
      await models.EmailAddresses.updateOne(
        { email: normalizeEmail(email) },
        {
          $set: {
            suppressedAt: new Date(),
            suppressionReason: reason,
            suppressedBy: userId,
            updatedAt: new Date(),
            ...(screenReason ? { screenReason } : {}),
          },
          ...(screenReason ? {} : { $unset: { screenReason: '' } }),
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      );
    }

    public static async screen(
      email: string,
      screenReason: TEmailScreenReason,
    ) {
      await models.EmailAddresses.suppress(
        email,
        'screened',
        undefined,
        screenReason,
      );
    }

    public static async release(email: string, userId?: string, note?: string) {
      await models.EmailAddresses.updateOne(
        { email: normalizeEmail(email) },
        {
          $unset: {
            suppressedAt: '',
            suppressionReason: '',
            screenReason: '',
            suppressedBy: '',
          },
          $set: {
            softBounceCount: 0,
            releasedAt: new Date(),
            releasedBy: userId,
            releaseNote: note,
            updatedAt: new Date(),
          },
        },
      );
    }

    public static laneFilter(
      lane: TEmailLane,
    ): FilterQuery<IEmailAddressDocument> {
      if (lane === 'suppressed') {
        return { suppressedAt: { $exists: true } };
      }

      const cutoff = provenCutoff();

      if (lane === 'proven') {
        return {
          suppressedAt: { $exists: false },
          lastDeliveredAt: { $gte: cutoff },
        };
      }

      return {
        suppressedAt: { $exists: false },
        $or: [
          { lastDeliveredAt: { $exists: false } },
          { lastDeliveredAt: { $lt: cutoff } },
        ],
      };
    }

    public static laneOf(
      address: Pick<IEmailAddressDocument, 'suppressedAt' | 'lastDeliveredAt'>,
    ): TEmailLane {
      if (address.suppressedAt) {
        return 'suppressed';
      }

      return address.lastDeliveredAt &&
        address.lastDeliveredAt >= provenCutoff()
        ? 'proven'
        : 'unknown';
    }

    public static async listProven(emails: string[]) {
      const addresses = normalizeAll(emails);

      if (!addresses.length) {
        return new Set<string>();
      }

      return new Set<string>(
        await models.EmailAddresses.find({
          email: { $in: addresses },
          ...models.EmailAddresses.laneFilter('proven'),
        }).distinct('email'),
      );
    }

    public static async listSuppressed(emails: string[], kind: TMailKind) {
      const addresses = normalizeAll(emails);

      if (!addresses.length) {
        return new Set<string>();
      }

      const closed = await models.EmailAddresses.find(
        {
          email: { $in: addresses },
          suppressedAt: { $exists: true },
          ...(kind === 'marketing'
            ? {}
            : { suppressionReason: { $ne: 'unsubscribe' } }),
        },
        { email: 1, suppressionReason: 1, screenReason: 1 },
      ).lean();

      const suppressed = new Set<string>();

      for (const address of closed) {
        if (
          address.suppressionReason === 'screened' &&
          (await models.EmailAddresses.rescreen(address))
        ) {
          continue;
        }

        suppressed.add(address.email);
      }

      return suppressed;
    }

    // Screening rules can loosen, so a screened address gets another chance on every send.
    public static async rescreen({
      email,
      screenReason,
    }: Pick<IEmailAddressDocument, 'email' | 'screenReason'>) {
      const verdict = await screenAddress(email);

      if (verdict.ok) {
        await models.EmailAddresses.release(
          email,
          undefined,
          'Passed re-screening',
        );

        return true;
      }

      if (verdict.reason !== screenReason) {
        await models.EmailAddresses.updateOne(
          { email },
          { $set: { screenReason: verdict.reason, updatedAt: new Date() } },
        );
      }

      return false;
    }

    public static async messageLane(emails: string[]) {
      const addresses = normalizeAll(emails);

      if (!addresses.length) {
        return undefined;
      }

      const proven = await models.EmailAddresses.listProven(addresses);

      return proven.size === addresses.length ? 'proven' : 'unknown';
    }
  }

  emailAddressSchema.loadClass(EmailAddress);

  return emailAddressSchema;
};
