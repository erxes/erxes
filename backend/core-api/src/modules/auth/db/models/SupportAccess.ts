import { sendNotification } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISupportAccessPolicy,
  ISupportAccessPolicyInput,
  ISupportGrantApproval,
  ISupportGrantDocument,
  SUPPORT_ACCESS_MODES,
  SUPPORT_GRANT_HOURS,
  SupportAccessMode,
  supportGrantSchema,
} from '@/auth/db/definitions/supportAccess';
import { ISessionPolicy, revokeUserSessions } from '@/auth/session';
import { getAdminGroupIds } from '@/auth/supportAccess/permissionGroups';
import { armSupportAccessEnd } from '@/auth/supportAccess/queue';
import {
  isSupportAccessAvailable,
  ISupportStaff,
} from '@/auth/supportAccess/token';

// expired: approved, but endsAt has passed
export type SupportGrantListStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'revoked'
  | 'expired';

export type SupportVisit =
  | { outcome: 'entered'; userId: string; sessionPolicy: ISessionPolicy }
  | { outcome: 'pending' | 'off' };

export interface ISupportGrantModel extends Model<ISupportGrantDocument> {
  getPolicy(): Promise<ISupportAccessPolicy>;
  savePolicy(input: ISupportAccessPolicyInput): Promise<ISupportAccessPolicy>;
  enter(staff: ISupportStaff): Promise<SupportVisit>;
  request(staff: ISupportStaff, userId: string): Promise<ISupportGrantDocument>;
  approve(
    _id: string,
    approval: ISupportGrantApproval,
    decidedBy: string,
  ): Promise<ISupportGrantDocument>;
  deny(_id: string, decidedBy: string): Promise<ISupportGrantDocument>;
  revoke(_id: string, revokedBy: string): Promise<ISupportGrantDocument>;
  endAccess(userId: string): Promise<void>;
  listGrants(status?: SupportGrantListStatus): Promise<ISupportGrantDocument[]>;
  activeFor(user: IUserDocument): Promise<ISupportGrantDocument[]>;
}

const MODE_CONFIG = 'SUPPORT_ACCESS_MODE';
const ALLOW_UNTIL_CONFIG = 'SUPPORT_ACCESS_ALLOW_UNTIL';
const GROUPS_CONFIG = 'SUPPORT_ACCESS_GROUP_IDS';

const AUTO_GRANT_HOURS = 4;
// However long the grant, a session ends here: staff removed from global-profile are out within it
const MAX_SESSION_SECS = 8 * 60 * 60;
const SESSION_IDLE_SECS = 60 * 60;
const MAX_VISITS = 50;
const LIST_LIMIT = 100;

const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000);

const isMode = (value: unknown): value is SupportAccessMode =>
  SUPPORT_ACCESS_MODES.some((mode) => mode === value);

const effectiveMode = (
  mode: SupportAccessMode,
  allowUntil?: Date,
): SupportAccessMode =>
  mode === 'allow' && allowUntil && allowUntil <= new Date()
    ? 'approval'
    : mode;

const firstValue = (config?: { value?: unknown } | null) =>
  Array.isArray(config?.value) ? config.value[0] : undefined;

const toDate = (value: unknown) => {
  const date = typeof value === 'string' ? new Date(value) : undefined;

  return date && !Number.isNaN(date.getTime()) ? date : undefined;
};

const staffFields = (staff: ISupportStaff) => ({
  staffId: staff.staffId,
  staffName: staff.name,
  staffEmail: staff.email,
  reason: staff.reason,
});

export const loadSupportGrantClass = (models: IModels, subdomain: string) => {
  const active = () => ({ status: 'approved', endsAt: { $gt: new Date() } });

  const notifyOwners = async (
    grant: ISupportGrantDocument,
    event: 'requested' | 'entered',
  ) => {
    const owners = await models.Users.find(
      { isOwner: true, isActive: true },
      { _id: 1 },
    ).lean();

    if (!owners.length) {
      return;
    }

    const requested = event === 'requested';
    const notificationType = requested
      ? 'supportAccessRequested'
      : 'supportAccessEntered';

    sendNotification(subdomain, {
      title: requested
        ? 'Support access requested'
        : 'erxes support entered your workspace',
      message: `${grant.staffName}: ${grant.reason}`,
      type: requested ? 'warning' : 'info',
      fromUserId: grant.userId,
      userIds: owners.map((owner) => owner._id),
      contentType: 'core:security.supportAccess',
      contentTypeId: grant._id,
      action: event,
      priority: requested ? 'high' : 'medium',
      notificationType,
      event: `core:security:${notificationType}`,
    }).catch((e: Error) =>
      console.error(`Support access notification failed: ${e.message}`),
    );
  };

  class SupportGrant {
    public static async getPolicy(): Promise<ISupportAccessPolicy> {
      const [mode, allowUntil, groups] = await Promise.all(
        [MODE_CONFIG, ALLOW_UNTIL_CONFIG, GROUPS_CONFIG].map((code) =>
          models.Configs.findOne({ code }).lean(),
        ),
      );

      // Configs store string lists, so single values are one-item lists
      const storedMode = firstValue(mode);
      const configuredMode = isMode(storedMode) ? storedMode : 'approval';
      const until = toDate(firstValue(allowUntil));

      return {
        available: isSupportAccessAvailable(),
        mode: effectiveMode(configuredMode, until),
        configuredMode,
        allowUntil: until,
        permissionGroupIds: Array.isArray(groups?.value) ? groups.value : [],
      };
    }

    public static async savePolicy({
      mode,
      allowUntil,
      permissionGroupIds,
    }: ISupportAccessPolicyInput) {
      if (!isMode(mode)) {
        throw new Error('Support access mode must be off, approval or allow');
      }

      // Only the allow window ends and carries its own groups
      const allowing = mode === 'allow';
      const until = allowing && allowUntil ? new Date(allowUntil) : undefined;

      await models.Configs.createOrUpdateConfig({
        code: MODE_CONFIG,
        value: [mode],
      });
      await models.Configs.createOrUpdateConfig({
        code: ALLOW_UNTIL_CONFIG,
        value: until ? [until.toISOString()] : [],
      });
      await models.Configs.createOrUpdateConfig({
        code: GROUPS_CONFIG,
        value: allowing ? [...new Set(permissionGroupIds)] : [],
      });

      return models.SupportGrants.getPolicy();
    }

    /** A verified staff member: enters on an active grant or the allow window, otherwise asks the owner. */
    public static async enter(staff: ISupportStaff): Promise<SupportVisit> {
      const policy = await models.SupportGrants.getPolicy();

      if (policy.mode === 'off') {
        return { outcome: 'off' };
      }

      const userId = await models.AuthIdentities.provisionSupportUser(staff);
      let grant = await models.SupportGrants.findOne({
        staffId: staff.staffId,
        ...active(),
      });

      if (!grant && policy.mode === 'allow') {
        grant = await models.SupportGrants.create({
          ...staffFields(staff),
          userId,
          status: 'approved',
          autoApproved: true,
          permissionGroupIds: policy.permissionGroupIds.length
            ? policy.permissionGroupIds
            : await getAdminGroupIds(),
          decidedAt: new Date(),
          endsAt: hoursFromNow(AUTO_GRANT_HOURS),
        });

        await armSupportAccessEnd(subdomain, grant);
      }

      if (!grant?.endsAt) {
        await models.SupportGrants.request(staff, userId);

        return { outcome: 'pending' };
      }

      await models.SupportGrants.updateOne(
        { _id: grant._id },
        {
          $set: { reason: staff.reason, staffName: staff.name },
          $push: {
            visits: {
              $each: [{ enteredAt: new Date(), reason: staff.reason }],
              $slice: -MAX_VISITS,
            },
          },
        },
      );
      await models.AuthIdentities.activateSupportUser(
        userId,
        grant.permissionGroupIds,
      );
      await notifyOwners(grant, 'entered');

      const absoluteSecs = Math.max(
        Math.min(
          Math.floor((grant.endsAt.getTime() - Date.now()) / 1000),
          MAX_SESSION_SECS,
        ),
        1,
      );

      return {
        outcome: 'entered',
        userId,
        sessionPolicy: {
          idleSecs: Math.min(SESSION_IDLE_SECS, absoluteSecs),
          absoluteSecs,
        },
      };
    }

    /** Opens a request for the owner, or refreshes the reason on the one already waiting. */
    public static async request(staff: ISupportStaff, userId: string) {
      const findPending = () =>
        models.SupportGrants.findOneAndUpdate(
          { staffId: staff.staffId, status: 'pending' },
          { $set: { reason: staff.reason, staffName: staff.name } },
          { new: true },
        );

      const existing = await findPending();

      if (existing) {
        return existing;
      }

      try {
        const grant = await models.SupportGrants.create({
          ...staffFields(staff),
          userId,
          status: 'pending',
        });

        await notifyOwners(grant, 'requested');

        return grant;
      } catch (e) {
        // A parallel visit opened the request first
        const pending = await findPending();

        if (pending) {
          return pending;
        }

        throw e;
      }
    }

    public static async approve(
      _id: string,
      { hours, permissionGroupIds }: ISupportGrantApproval,
      decidedBy: string,
    ) {
      if (!SUPPORT_GRANT_HOURS.includes(hours)) {
        throw new Error('Access lasts 1, 4, 24 or 168 hours');
      }

      // No groups would fall back to viewer groups, which a setup visit cannot use
      if (!permissionGroupIds.length) {
        throw new Error('Pick at least one permission group');
      }

      // Conditional write: two owners answering at once cannot both win
      const grant = await models.SupportGrants.findOneAndUpdate(
        { _id, status: 'pending' },
        {
          $set: {
            status: 'approved',
            permissionGroupIds: [...new Set(permissionGroupIds)],
            decidedBy,
            decidedAt: new Date(),
            endsAt: hoursFromNow(hours),
          },
        },
        { new: true },
      );

      if (!grant) {
        throw new Error('This request was already answered');
      }

      await armSupportAccessEnd(subdomain, grant);

      return grant;
    }

    public static async deny(_id: string, decidedBy: string) {
      const grant = await models.SupportGrants.findOneAndUpdate(
        { _id, status: 'pending' },
        { $set: { status: 'denied', decidedBy, decidedAt: new Date() } },
        { new: true },
      );

      if (!grant) {
        throw new Error('This request was already answered');
      }

      return grant;
    }

    public static async revoke(_id: string, revokedBy: string) {
      const grant = await models.SupportGrants.findOneAndUpdate(
        { _id, ...active() },
        { $set: { status: 'revoked', revokedBy, revokedAt: new Date() } },
        { new: true },
      );

      if (!grant) {
        throw new Error('This access already ended');
      }

      await models.SupportGrants.endAccess(grant.userId);

      return grant;
    }

    /** Closes a support user's access unless another grant still covers it. */
    public static async endAccess(userId: string) {
      if (await models.SupportGrants.exists({ userId, ...active() })) {
        return;
      }

      await models.Users.updateOne(
        { _id: userId },
        { $set: { isActive: false } },
      );
      await revokeUserSessions(subdomain, userId);
      await models.OAuthRefreshTokens.updateMany(
        { userId, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
      );
    }

    public static async listGrants(status?: SupportGrantListStatus) {
      const now = new Date();
      const filters: Record<
        SupportGrantListStatus,
        FilterQuery<ISupportGrantDocument>
      > = {
        pending: { status: 'pending' },
        approved: { status: 'approved', endsAt: { $gt: now } },
        expired: { status: 'approved', endsAt: { $lte: now } },
        denied: { status: 'denied' },
        revoked: { status: 'revoked' },
      };

      return models.SupportGrants.find(status ? filters[status] : {})
        .sort({ createdAt: -1 })
        .limit(LIST_LIMIT);
    }

    // Owners see every visit in progress, a support user its own, everyone else none
    public static async activeFor(user: IUserDocument) {
      if (user.isOwner) {
        return models.SupportGrants.find(active()).sort({ endsAt: 1 });
      }

      if (await models.Users.isSupportUser(user._id)) {
        return models.SupportGrants.find({ userId: user._id, ...active() });
      }

      return [];
    }
  }

  supportGrantSchema.loadClass(SupportGrant);

  return supportGrantSchema;
};
