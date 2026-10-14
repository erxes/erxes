import {
  IVoucher,
  IVoucherDocument,
  IVoucherHistoryEntry,
  IVoucherInput,
  IVoucherParams,
  IVoucherTarget,
  IVoucherTerms,
  TVoucherHistoryAction,
} from '@/voucher/@types/voucher';
import {
  IVoucherCampaign,
  IVoucherCampaignDocument,
} from '@/voucher/@types/voucherCampaign';
import { VOUCHER_STATUS } from '@/voucher/constants';
import { voucherSchema } from '@/voucher/db/definitions/voucher';
import {
  ownersWithinLimit,
  VoucherOwnerLimitError,
} from '@/voucher/services/ownerLimit';
import {
  holdStep,
  mayApplyTo,
  releaseStep,
  useStep,
  voucherRefusal,
} from '@/voucher/services/voucherLifecycle';
import {
  addValidity,
  isCampaignIssuing,
  PICKED_SALE_VOUCHER_TYPES,
  termsOfCampaign,
  voucherExpiresAt,
  voucherTerms,
} from '@/voucher/services/voucherTerm';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Model, UpdateQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export interface IVoucherModel extends Model<IVoucherDocument> {
  getVoucher(_id: string): Promise<IVoucherDocument>;
  createVoucher(doc: IVoucher): Promise<IVoucherDocument>;
  createVouchers(doc: IVoucherInput): Promise<IVoucherDocument>;
  updateVoucher(_id: string, doc: IVoucher): Promise<IVoucherDocument>;
  buyVoucher(params: IBuyParams): Promise<IVoucherDocument>;
  removeVouchers(_ids: string[]): void;
  removeVouchersByFilter(params: IVoucherParams): Promise<number>;

  checkVoucher(
    args: TOwnedVoucher & {
      totalAmount?: number;
      targetId?: string;
    },
  ): Promise<TSaleVoucherRules>;
  holdVoucher(
    args: TOwnedVoucher & {
      target: IVoucherTarget;
      totalAmount?: number;
      userId?: string;
    },
  ): Promise<IVoucherDocument>;
  releaseVoucher(args: {
    voucherId: string;
    target: IVoucherTarget;
    userId?: string;
  }): Promise<IVoucherDocument>;
  useVoucher(
    args: TOwnedVoucher & { target?: IVoucherTarget; userId?: string },
  ): Promise<IVoucherDocument>;
  useBonus(args: {
    voucherId: string;
    count: number;
    target?: IVoucherTarget;
    userId?: string;
  }): Promise<void>;
  releaseTarget(args: { targetId: string; userId?: string }): Promise<number>;
  returnTarget(args: { targetId: string; userId?: string }): Promise<number>;
  cancelVoucher(args: {
    _id: string;
    reason: string;
    userId?: string;
  }): Promise<IVoucherDocument>;
  markVoucherUsed(args: {
    _id: string;
    note: string;
    userId?: string;
  }): Promise<IVoucherDocument>;
  extendVoucher(args: {
    _id: string;
    endDate: Date;
    userId?: string;
  }): Promise<IVoucherDocument>;
}

type TOwnedVoucher = { voucherId: string; ownerType: string; ownerId: string };

/** The campaign as this voucher applies it: its own terms over the campaign. */
export type TSaleVoucherRules = IVoucherCampaign &
  IVoucherTerms & { _id: string };

const historyEntry = (
  action: TVoucherHistoryAction,
  {
    by,
    target,
    note,
  }: { by?: string; target?: Partial<IVoucherTarget>; note?: string } = {},
): IVoucherHistoryEntry => ({
  action,
  at: new Date(),
  ...(by ? { by } : {}),
  ...(target?.targetId
    ? { targetType: target.targetType, targetId: target.targetId }
    : {}),
  ...(note ? { note } : {}),
});

// The campaign's own term, unless the issuer gave one.
const issuedConfig = (
  campaign: IVoucherCampaignDocument,
  issuedAt: Date,
  config?: IVoucher['config'],
) => {
  if (config?.endDate || !campaign.validity) {
    return config;
  }

  return { ...config, endDate: addValidity(issuedAt, campaign.validity) };
};

export const loadVoucherClass = (models: IModels, subdomain: string) => {
  const getVoucherLean = async (_id: string) => {
    const voucher = await models.Vouchers.findOne({ _id }).lean();

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    return voucher;
  };

  // Moves it only if nobody moved it since it was read: two tills cannot
  // both take one voucher.
  const moveVoucher = async (
    voucher: IVoucherDocument,
    update: UpdateQuery<IVoucherDocument>,
  ) => {
    const moved = await models.Vouchers.findOneAndUpdate(
      {
        _id: voucher._id,
        status: voucher.status,
        'usedIn.targetId': voucher.usedIn?.targetId ?? null,
      },
      update,
      { new: true },
    );

    if (!moved) {
      throw new Error('The voucher changed meanwhile; try again');
    }

    return moved;
  };

  class Voucher {
    public static async getVoucher(_id: string) {
      const voucherRule = await models.Vouchers.findOne({ _id });

      if (!voucherRule) {
        throw new Error('not found voucher rule');
      }

      return voucherRule;
    }

    public static async createVoucher(doc: IVoucher) {
      const { campaignId, ownerType, ownerId, userId = '', config } = doc;

      if (!ownerId || !ownerType) {
        throw new Error('Not create voucher, owner is undefined');
      }

      const now = new Date();

      const voucherCampaign = await models.VoucherCampaigns.getVoucherCampaign(
        campaignId,
      );

      if (!isCampaignIssuing(voucherCampaign, now)) {
        throw new Error('Cannot create voucher: campaign is not running');
      }

      const { refused, reason } = await ownersWithinLimit(
        models,
        subdomain,
        voucherCampaign,
        [ownerId],
      );

      if (refused.length) {
        throw new VoucherOwnerLimitError(reason as string);
      }

      switch (voucherCampaign.voucherType) {
        case 'spin':
          return models.Spins.createSpin({
            campaignId: voucherCampaign.spinCampaignId,
            ownerType,
            ownerId,
            voucherCampaignId: campaignId,
            userId,
          });
        case 'lottery':
          return models.Lotteries.createLottery({
            campaignId: voucherCampaign.lotteryCampaignId,
            ownerType,
            ownerId,
            voucherCampaignId: campaignId,
            userId,
          });
        case 'score':
          return models.ScoreLogs.changeScore({
            ownerType,
            ownerId,
            changeScore: voucherCampaign.score,
            description: 'score voucher',
          });
        default:
          return models.Vouchers.create({
            campaignId,
            ownerType,
            ownerId,
            createdAt: now,
            status: VOUCHER_STATUS.NEW,
            userId,
            config: issuedConfig(voucherCampaign, now, config),
            terms: termsOfCampaign(voucherCampaign),
            ...(doc.createdVia ? { createdVia: doc.createdVia } : {}),
            history: [
              historyEntry('issued', {
                by: userId || doc.createdVia?.actorId,
                note: doc.createdVia?.sourceName,
              }),
            ],
          });
      }
    }

    public static async createVouchers(doc: IVoucherInput) {
      let { campaignId, ownerType, ownerIds, tagIds, userId = '' } = doc;

      if (!ownerIds?.length && !tagIds?.length) {
        throw new Error('Cannot create voucher: owner is undefined');
      }

      const now = new Date();

      const voucherCampaign = await models.VoucherCampaigns.getVoucherCampaign(
        campaignId,
      );

      if (!isCampaignIssuing(voucherCampaign, now)) {
        throw new Error('Cannot create voucher: campaign is not running');
      }

      if (tagIds?.length) {
        const customers = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'customers',
          action: 'find',
          input: {
            query: {
              tagIds: { $in: tagIds },
              ...(ownerIds?.length && { _id: { $in: ownerIds } }),
            },
          },
          defaultValue: [],
        });

        if (customers?.length) {
          ownerIds = customers.map((customer) => customer._id) || [];
        }
      }

      // Those already at the campaign's limit are left out, not failed.
      ({ allowed: ownerIds } = await ownersWithinLimit(
        models,
        subdomain,
        voucherCampaign,
        ownerIds || [],
      ));

      try {
        const BATCH_SIZE = 100;

        for (let i = 0; i < (ownerIds || []).length; i += BATCH_SIZE) {
          const batch = (ownerIds || []).slice(i, i + BATCH_SIZE);

          await Promise.all(
            batch.map(async (ownerId) => {
              switch (voucherCampaign.voucherType) {
                case 'spin':
                  return models.Spins.createSpin({
                    campaignId: voucherCampaign.spinCampaignId,
                    ownerType,
                    ownerId,
                    voucherCampaignId: campaignId,
                    userId,
                  });
                case 'lottery':
                  return models.Lotteries.createLottery({
                    campaignId: voucherCampaign.lotteryCampaignId,
                    ownerType,
                    ownerId,
                    voucherCampaignId: campaignId,
                    userId,
                  });
                case 'score':
                  return models.ScoreLogs.changeScore({
                    ownerType,
                    ownerId,
                    changeScore: voucherCampaign.score,
                    description: 'score voucher',
                  });
                default:
                  return models.Vouchers.create({
                    campaignId,
                    ownerType,
                    ownerId,
                    createdAt: now,
                    status: VOUCHER_STATUS.NEW,
                    userId,
                    config: issuedConfig(voucherCampaign, now),
                    terms: termsOfCampaign(voucherCampaign),
                    history: [historyEntry('issued', { by: userId })],
                  });
              }
            }),
          );
        }

        return 'success';
      } catch (error) {
        console.error('Failed to create vouchers:', error);
        throw new Error(error.message || 'Failed to create vouchers');
      }
    }

    public static async updateVoucher(_id: string, doc: IVoucher) {
      const { ownerType, ownerId, userId = '' } = doc;

      if (!ownerId || !ownerType) {
        throw new Error('Cannot create voucher: owner is undefined');
      }

      const voucher = await models.Vouchers.findOne({ _id }).lean();

      if (!voucher) {
        throw new Error(`Voucher ${_id} not found`);
      }

      // A status moves only through its own steps (use, cancel, mark used).
      if (doc.status && doc.status !== voucher.status) {
        throw new Error(
          "A voucher's status changes only by using, cancelling or marking it used",
        );
      }

      const campaignId = doc.campaignId || voucher.campaignId;

      await models.VoucherCampaigns.getVoucherCampaign(campaignId);

      const now = new Date();

      return models.Vouchers.updateOne(
        { _id },
        {
          $set: {
            campaignId,
            ownerType,
            ownerId,
            modifiedAt: now,
            userId,
          },
        },
      );
    }

    public static async buyVoucher(doc: IBuyParams) {
      const { campaignId, ownerType, ownerId, count = 1 } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('can not buy voucher, owner is undefined');
      }

      const voucherCampaign = await models.VoucherCampaigns.getVoucherCampaign(
        campaignId,
      );

      if (!voucherCampaign.buyScore) {
        throw new Error('can not buy this voucher');
      }

      await models.ScoreLogs.changeScore({
        ownerType,
        ownerId,
        changeScore: -1 * voucherCampaign.buyScore * count,
        description: 'buy voucher',
      });

      return models.Vouchers.createVoucher({ campaignId, ownerType, ownerId });
    }

    public static async removeVouchers(_ids: string[]) {
      return models.Vouchers.deleteMany({ _id: { $in: _ids } });
    }

    public static async removeVouchersByFilter(params: IVoucherParams) {
      const { campaignId, ownerId, ownerType, status, fromDate, toDate } =
        params || {};
      const filter: any = {};

      if (campaignId) filter.campaignId = campaignId;
      if (ownerId) filter.ownerId = ownerId;
      if (ownerType) filter.ownerType = ownerType;
      if (status) filter.status = status;
      if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = new Date(fromDate);
        if (toDate) filter.createdAt.$lte = new Date(toDate);
      }

      const result = await models.Vouchers.deleteMany(filter);
      return result.deletedCount;
    }

    public static async checkVoucher({
      ownerType,
      ownerId,
      voucherId,
      totalAmount = 0,
      targetId,
    }: TOwnedVoucher & { totalAmount?: number; targetId?: string }) {
      const voucher = await models.Vouchers.findOne({
        _id: voucherId,
        ownerId,
        ownerType,
      }).lean();

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      // Free, or already this order's own.
      if (!mayApplyTo(voucher, targetId)) {
        throw new Error(voucherRefusal(voucher));
      }

      const voucherCampaign = await models.VoucherCampaigns.findOne({
        _id: voucher.campaignId,
      }).lean();

      if (!voucherCampaign) {
        throw new Error('Campaign not found');
      }

      const terms = voucherTerms(voucher, voucherCampaign);

      if (!PICKED_SALE_VOUCHER_TYPES.includes(terms.voucherType || '')) {
        throw new Error('This voucher is not picked at a sale');
      }

      if (voucherCampaign.status !== 'active') {
        throw new Error('Campaign is not active');
      }

      const { minimumSpend, maximumSpend } = (terms.restrictions || {}) as {
        minimumSpend?: number;
        maximumSpend?: number;
      };

      if (totalAmount && maximumSpend && maximumSpend < totalAmount) {
        throw new Error(
          `This voucher allows a maximum spend of ${maximumSpend}`,
        );
      }

      if (totalAmount && minimumSpend && minimumSpend > totalAmount) {
        throw new Error(
          `This voucher requires a minimum spend of ${minimumSpend}`,
        );
      }

      // Used on this very order: re-pricing it later is not a new use.
      const expiresAt = voucherExpiresAt(voucher, voucherCampaign);

      if (
        voucher.status !== VOUCHER_STATUS.LOSS &&
        expiresAt &&
        expiresAt < new Date()
      ) {
        throw new Error('This voucher is expired');
      }

      return { ...voucherCampaign, ...terms };
    }

    public static async holdVoucher({
      voucherId,
      ownerType,
      ownerId,
      target,
      totalAmount,
      userId,
    }) {
      await models.Vouchers.checkVoucher({
        voucherId,
        ownerType,
        ownerId,
        totalAmount,
        targetId: target.targetId,
      });

      const voucher = await getVoucherLean(voucherId);

      if (holdStep(voucher, target) === 'noop') {
        return voucher;
      }

      return moveVoucher(voucher, {
        $set: {
          status: VOUCHER_STATUS.ONHOLD,
          usedIn: target,
          heldAt: new Date(),
        },
        $push: { history: historyEntry('held', { by: userId, target }) },
      });
    }

    public static async releaseVoucher({ voucherId, target, userId }) {
      const voucher = await getVoucherLean(voucherId);

      if (releaseStep(voucher, target) === 'noop') {
        return voucher;
      }

      return moveVoucher(voucher, {
        $set: { status: VOUCHER_STATUS.NEW },
        $unset: { usedIn: '', heldAt: '' },
        $push: { history: historyEntry('released', { by: userId, target }) },
      });
    }

    public static async useVoucher({
      voucherId,
      ownerType,
      ownerId,
      target,
      userId,
    }) {
      const voucher = await models.Vouchers.findOne({
        _id: voucherId,
        ownerId,
        ownerType,
      }).lean();

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      if (useStep(voucher, target) === 'noop') {
        return voucher;
      }

      // Expired by now is refused, even if it was valid when picked.
      await models.Vouchers.checkVoucher({
        voucherId,
        ownerType,
        ownerId,
        targetId: target?.targetId,
      });

      return moveVoucher(voucher, {
        $set: {
          status: VOUCHER_STATUS.LOSS,
          usedAt: new Date(),
          ...(target ? { usedIn: target } : {}),
        },
        $unset: { heldAt: '' },
        $push: { history: historyEntry('used', { by: userId, target }) },
      });
    }

    public static async useBonus({ voucherId, count, target, userId }) {
      const voucher = await models.Vouchers.findOne({ _id: voucherId }).lean();

      if (!voucher || !count) {
        return;
      }

      const campaign = await models.VoucherCampaigns.findOne({
        _id: voucher.campaignId,
      }).lean();

      if (!campaign) {
        return;
      }

      const { bonusCount = 0 } = voucherTerms(voucher, campaign);
      const earlier = voucher.bonusInfo || [];
      // Another sync of the same order restates its count, not adds to it.
      const repeated = earlier.some(
        (use) => !!target && use.targetId === target.targetId,
      );
      const bonusInfo = [
        ...earlier.filter((use) => !target || use.targetId !== target.targetId),
        { usedCount: count, ...(target ? { targetId: target.targetId } : {}) },
      ];
      const usedCount = bonusInfo.reduce((sum, use) => sum + use.usedCount, 0);

      await models.Vouchers.updateOne(
        { _id: voucherId },
        {
          $set: {
            bonusInfo,
            ...(bonusCount - usedCount <= 0
              ? {
                  status: VOUCHER_STATUS.LOSS,
                  usedAt: new Date(),
                  ...(target ? { usedIn: target } : {}),
                }
              : {}),
          },
          ...(repeated
            ? {}
            : {
                $push: {
                  history: historyEntry('used', {
                    by: userId,
                    target,
                    note: `${count} of ${bonusCount}`,
                  }),
                },
              }),
        },
      );
    }

    public static async releaseTarget({ targetId, userId }) {
      const { modifiedCount } = await models.Vouchers.updateMany(
        { status: VOUCHER_STATUS.ONHOLD, 'usedIn.targetId': targetId },
        {
          $set: { status: VOUCHER_STATUS.NEW },
          $unset: { usedIn: '', heldAt: '' },
          $push: {
            history: historyEntry('released', {
              by: userId,
              note: 'Order cancelled',
            }),
          },
        },
      );

      return modifiedCount;
    }

    /** A fully returned order gives its vouchers back, with their own expiry. */
    public static async returnTarget({ targetId, userId }) {
      const returned = historyEntry('returned', {
        by: userId,
        target: { targetId },
      });

      const { modifiedCount } = await models.Vouchers.updateMany(
        { status: VOUCHER_STATUS.LOSS, 'usedIn.targetId': targetId },
        {
          $set: { status: VOUCHER_STATUS.NEW },
          $unset: { usedIn: '', usedAt: '' },
          $push: { history: returned },
        },
      );

      const bonusVouchers = await models.Vouchers.find({
        'bonusInfo.targetId': targetId,
      }).lean();

      for (const voucher of bonusVouchers) {
        await models.Vouchers.updateOne(
          { _id: voucher._id },
          {
            $set: {
              bonusInfo: (voucher.bonusInfo || []).filter(
                (use) => use.targetId !== targetId,
              ),
              status: VOUCHER_STATUS.NEW,
            },
            $unset: { usedIn: '', usedAt: '' },
            $push: { history: returned },
          },
        );
      }

      return modifiedCount + bonusVouchers.length;
    }

    public static async cancelVoucher({ _id, reason, userId }) {
      if (!reason?.trim()) {
        throw new Error('Say why the voucher is cancelled');
      }

      const voucher = await getVoucherLean(_id);

      if (voucher.status !== VOUCHER_STATUS.NEW) {
        throw new Error(
          `Only an unused voucher can be cancelled: ${voucherRefusal(voucher)}`,
        );
      }

      return moveVoucher(voucher, {
        $set: {
          status: VOUCHER_STATUS.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancelReason: reason.trim(),
        },
        $push: {
          history: historyEntry('cancelled', {
            by: userId,
            note: reason.trim(),
          }),
        },
      });
    }

    public static async markVoucherUsed({ _id, note, userId }) {
      if (!note?.trim()) {
        throw new Error('Say where the voucher was used');
      }

      const voucher = await getVoucherLean(_id);

      if (voucher.status !== VOUCHER_STATUS.NEW) {
        throw new Error(
          `Only an unused voucher can be marked used: ${voucherRefusal(
            voucher,
          )}`,
        );
      }

      return moveVoucher(voucher, {
        $set: {
          status: VOUCHER_STATUS.LOSS,
          usedAt: new Date(),
          usedIn: { targetType: 'manual', note: note.trim() },
        },
        $push: {
          history: historyEntry('markedUsed', {
            by: userId,
            note: note.trim(),
          }),
        },
      });
    }

    public static async extendVoucher({ _id, endDate, userId }) {
      const voucher = await getVoucherLean(_id);

      if (
        ![VOUCHER_STATUS.NEW, VOUCHER_STATUS.ONHOLD].includes(
          voucher.status || '',
        )
      ) {
        throw new Error(
          `Only an unused voucher can be extended: ${voucherRefusal(voucher)}`,
        );
      }

      const campaign = await models.VoucherCampaigns.getVoucherCampaign(
        voucher.campaignId,
      );
      const until = new Date(endDate);
      const current = voucherExpiresAt(voucher, campaign);

      if (until <= (current || new Date())) {
        throw new Error('The new end must be later than the current one');
      }

      if (
        campaign.finishDateOfUse &&
        until > new Date(campaign.finishDateOfUse)
      ) {
        throw new Error(
          "The campaign's last day of use comes first; a voucher cannot outlast it",
        );
      }

      return moveVoucher(voucher, {
        $set: { config: { ...voucher.config, endDate: until } },
        $push: {
          history: historyEntry('extended', {
            by: userId,
            note: until.toISOString(),
          }),
        },
      });
    }
  }

  voucherSchema.loadClass(Voucher);

  return voucherSchema;
};
