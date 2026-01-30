import { Model } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';

import { IModels } from '~/connectionResolvers';
import { SCORE_CAMPAIGN_STATUSES } from '~/modules/score/constants';

import {
  IScoreCampaign,
  IScoreCampaignDocument,
} from '../../@types/scoreCampaign';

import { scoreCampaignSchema } from '../definitions/scoreCampaign';

import { getLoyaltyOwner } from '~/utils/getOwner';
import {
  resolvePlaceholderValue,
  doScoreCampaign,
  refundLoyaltyScore as refundScoreUtil,
} from '../../utils';

/* -------------------- constants -------------------- */

// ReDoS-safe, linear-time regex
const PLACEHOLDER_REGEX = /\{\{\s*([^{\}]+?)\s*\}\}/g;

/* -------------------- types -------------------- */

export interface DoCampaignTypes {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  target: any;
  targetId?: string;
  actionMethod: 'add' | 'subtract';
  serviceName?: string;
}

/* -------------------- model interface -------------------- */

export interface IScoreCampaignModel
  extends Model<IScoreCampaignDocument> {
  getScoreCampaign(_id: string): Promise<IScoreCampaignDocument>;

  createScoreCampaign(
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;

  updateScoreCampaign(
    _id: string,
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument | null>;

  removeScoreCampaign(_id: string): Promise<any>;
  removeScoreCampaigns(_ids: string[]): Promise<any>;

  doCampaign(data: DoCampaignTypes): Promise<any>;

  checkScoreAviableSubtract(data: {
    ownerType: string;
    ownerId: string;
    campaignId: string;
    target: any;
  }): Promise<boolean>;

  refundLoyaltyScore(
    targetId: string,
    ownerType: string,
    ownerId: string,
  ): Promise<any>;
}

/* -------------------- model loader -------------------- */

export const loadScoreCampaignClass = (
  models: IModels,
  subdomain: string,
) => {
  class ScoreCampaign {
    /* ---------- queries ---------- */

    public static async getScoreCampaign(_id: string) {
      const campaign = await models.ScoreCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Score campaign not found');
      }

      return campaign;
    }

    /* ---------- mutations ---------- */

    public static async createScoreCampaign(
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      return models.ScoreCampaign.create({
        ...doc,
        createdBy: user._id,
        updatedBy: user._id,
      });
    }

    public static async updateScoreCampaign(
      _id: string,
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      const campaign = await this.getScoreCampaign(_id);

      if (campaign.ownerType && campaign.ownerType !== doc.ownerType) {
        throw new Error(
          'You cannot modify the ownership type of the score campaign.',
        );
      }

      return models.ScoreCampaign.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeScoreCampaign(_id: string) {
      return models.ScoreCampaign.updateOne(
        { _id },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );
    }

    public static async removeScoreCampaigns(_ids: string[]) {
      return models.ScoreCampaign.updateMany(
        { _id: { $in: _ids } },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );
    }

    /* ---------- validation ---------- */

    public static async checkScoreAviableSubtract({
      ownerType,
      ownerId,
      campaignId,
      target,
    }: {
      ownerType: string;
      ownerId: string;
      campaignId: string;
      target: any;
    }) {
      if (!ownerType || !ownerId) {
        throw new Error('Owner is required');
      }

      const owner = await getLoyaltyOwner(subdomain, {
        ownerType,
        ownerId,
      });

      if (!owner) {
        throw new Error('Owner not found');
      }

      const campaign = await models.ScoreCampaign.findOne({
        _id: campaignId,
        status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
      }).lean();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error('Owner type mismatch');
      }

      let { placeholder = '', currencyRatio = 0 } =
        campaign.subtract || {};

      // Safe, single-pass placeholder replacement
      placeholder = placeholder.replace(
        PLACEHOLDER_REGEX,
        (_full, key: string) => {
          const value = resolvePlaceholderValue(target, key.trim());
          return String(value ?? 0);
        },
      );

      // NO eval — numeric only
      const changeScore =
        Number(placeholder) * Number(currencyRatio) || 0;

      const oldScore = Number(owner.score ?? 0);

      if (oldScore - changeScore < 0) {
        throw new Error('Not enough score to subtract');
      }

      return true;
    }

    /* ---------- execution ---------- */

    public static async doCampaign(data: DoCampaignTypes) {
      return doScoreCampaign(models, data);
    }

    public static async refundLoyaltyScore(
      targetId: string,
      ownerType: string,
      ownerId: string,
    ) {
      return refundScoreUtil(models, {
        targetId,
        ownerType,
        ownerId,
        scoreCampaignIds: [],
        checkInId: undefined,
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);
  return scoreCampaignSchema;
};
