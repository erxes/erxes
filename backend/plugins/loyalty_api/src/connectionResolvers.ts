import { IPricingDocument } from '@/pricing/@types/pricing';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';

import { IAssignmentDocument } from '@/assignment/@types/assignment';
import {
  IAssignmentModel,
  loadAssignmentClass,
} from '@/assignment/db/models/assignment';
import { ICampaignDocument } from '@/campaign/@types';
import {
  ICampaignModel,
  loadCampaignClass,
} from '@/campaign/db/models/Campaign';
import { ICouponDocument } from '@/coupon/@types/coupon';
import { ICouponModel, loadCouponClass } from '@/coupon/db/models/coupon';
import { IDonateDocument } from '@/donate/@types/donate';
import { IDonateModel, loadDonateClass } from '@/donate/db/models/donate';
import { ILotteryDocument } from '@/lottery/@types/lottery';
import { ILotteryModel, loadLotteryClass } from '@/lottery/db/models/lottery';
import { IPricingModel, loadPricingClass } from '@/pricing/db/models/pricing';
import { IScoreDocument } from '@/score/@types/score';
import { IScoreModel, loadScoreClass } from '@/score/db/models/score';
import { ISpinDocument } from '@/spin/@types/spin';
import { ISpinModel, loadSpinClass } from '@/spin/db/models/spin';
import { IVoucherDocument } from '@/voucher/@types/voucher';
import { IVoucherModel, loadVoucherClass } from '@/voucher/db/models/voucher';
import { IAgentDocument } from './modules/agent/@types';
import { IAgentModel, loadAgentClass } from './modules/agent/db/models/Agent';
import { IScoreLogDocument } from './modules/score/@types/scoreLog';
import {
  IScoreLogModel,
  loadScoreLogClass,
} from './modules/score/db/models/ScoreLog';

export interface IModels {
  Pricing: IPricingModel;
  Campaign: ICampaignModel;
  Voucher: IVoucherModel;
  Coupon: ICouponModel;
  Score: IScoreModel;
  ScoreLog: IScoreLogModel;
  Lottery: ILotteryModel;
  Spin: ISpinModel;
  Donate: IDonateModel;
  Assignment: IAssignmentModel;
  Agent: IAgentModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Pricing = db.model<IPricingDocument, IPricingModel>(
    'loyalty_pricing',
    loadPricingClass(models),
  );

  models.Campaign = db.model<ICampaignDocument, ICampaignModel>(
    'loyalty_campaign',
    loadCampaignClass(models),
  );

  models.Voucher = db.model<IVoucherDocument, IVoucherModel>(
    'loyalty_voucher',
    loadVoucherClass(models),
  );

  models.Coupon = db.model<ICouponDocument, ICouponModel>(
    'loyalty_coupon',
    loadCouponClass(models),
  );

  models.Score = db.model<IScoreDocument, IScoreModel>(
    'loyalty_score',
    loadScoreClass(models),
  );

  models.ScoreLog = db.model<IScoreLogDocument, IScoreLogModel>(
    'loyalty_score_log',
    loadScoreLogClass(models),
  );

  models.Lottery = db.model<ILotteryDocument, ILotteryModel>(
    'loyalty_lottery',
    loadLotteryClass(models),
  );

  models.Spin = db.model<ISpinDocument, ISpinModel>(
    'loyalty_spin',
    loadSpinClass(models),
  );

  models.Donate = db.model<IDonateDocument, IDonateModel>(
    'loyalty_donate',
    loadDonateClass(models),
  );

  models.Assignment = db.model<IAssignmentDocument, IAssignmentModel>(
    'loyalty_assignment',
    loadAssignmentClass(models),
  );

  models.Assignment = db.model<IAssignmentDocument, IAssignmentModel>(
    'loyalty_assignment',
    loadAssignmentClass(models),
  );

  models.Agent = db.model<IAgentDocument, IAgentModel>(
    'loyalty_agent',
    loadAgentClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
