import { IAssignmentDocument } from '@/assignment/@types/assignment';
import {
  IAssignmentCampaignDocument,
} from '@/assignment/@types/assignmentCampaign';
import {
  IAssignmentModel,
  loadAssignmentClass,
} from '@/assignment/db/models/Assignment';
import {
  IAssignmentCampaignModel,
  loadAssignmentCampaignClass,
} from '@/assignment/db/models/AssignmentCampaign';
import { ICampaignDocument } from '@/campaign/@types';
import {
  ICampaignModel,
  loadCampaignClass,
} from '@/campaign/db/models/Campaign';
import { ICouponDocument } from '@/coupon/@types/coupon';
import {
  ICouponModel,
  loadCouponClass,
} from '@/coupon/db/models/Coupon';
import { IDonateDocument } from '@/donate/@types/donate';
import {
  IDonateModel,
  loadDonateClass,
} from '@/donate/db/models/Donate';
import { ILotteryDocument } from '@/lottery/@types/lottery';
import {
  ILotteryModel,
  loadLotteryClass,
} from '@/lottery/db/models/Lottery';
import { IPricingDocument } from '@/pricing/@types/pricing';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import {
  IPricingModel,
  loadPricingClass,
} from '@/pricing/db/models/Pricing';
import {
  IPricingPlanModel,
  loadPricingPlanClass,
} from '@/pricing/db/models/PricingPlan';
import { IScoreDocument } from '@/score/@types/score';
import {
  IScoreModel,
  loadScoreClass,
} from '@/score/db/models/Score';
import { ISpinDocument } from '@/spin/@types/spin';
import {
  ISpinModel,
  loadSpinClass,
} from '@/spin/db/models/Spin';
import {
  ISpinCampaignModel,
  loadSpinCampaignClass
} from '@/spin/db/models/SpinCampaign';
import { IVoucherDocument } from '@/voucher/@types/voucher';
import {
  IVoucherModel,
  loadVoucherClass,
} from '@/voucher/db/models/Voucher';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';
import { IAgentDocument } from './modules/agent/@types';
import { IAgentModel, loadAgentClass } from './modules/agent/db/models/Agent';
import {
  ILoyaltyConfigDocument,
} from './modules/config/@types/config';
import {
  ILoyaltyConfigModel,
  loadLoyaltyConfigClass,
} from './modules/config/db/models/Config';
import {
  ICouponCampaignDocument,
} from './modules/coupon/@types/couponCampaign';
import {
  ICouponCampaignModel,
  loadCouponCampaignClass,
} from './modules/coupon/db/models/CouponCampaign';
import {
  IDonateCampaignDocument,
} from './modules/donate/@types/donateCampaign';
import {
  IDonateCampaignModel,
  loadDonateCampaignClass,
} from './modules/donate/db/models/DonateCampaign';
import {
  ILotteryCampaignDocument,
} from './modules/lottery/@types/lotteryCampaign';
import {
  ILotteryCampaignModel,
  loadLotteryCampaignClass,
} from './modules/lottery/db/models/LotteryCampaign';
import {
  IScoreCampaignDocument,
} from './modules/score/@types/scoreCampaign';
import {
  IScoreLogDocument,
} from './modules/score/@types/scoreLog';
import {
  IScoreCampaignModel,
  loadScoreCampaignClass,
} from './modules/score/db/models/ScoreCampaign';
import {
  IScoreLogModel,
  loadScoreLogClass,
} from './modules/score/db/models/ScoreLog';
import { ISpinCampaignDocument } from './modules/spin/@types/spinCampaign';
import { IVoucherCampaignDocument } from './modules/voucher/@types/voucherCampaign';
import { IVoucherCampaignModel, loadVoucherCampaignClass } from './modules/voucher/db/models/VoucherCampaign';

export interface IModels {
  Agent: IAgentModel;
  Assignment: IAssignmentModel;
  AssignmentCampaign: IAssignmentCampaignModel;
  Campaign: ICampaignModel;
  Coupon: ICouponModel;
  CouponCampaign: ICouponCampaignModel;
  Donate: IDonateModel;
  DonateCampaign: IDonateCampaignModel;
  Lottery: ILotteryModel;
  LotteryCampaign: ILotteryCampaignModel;
  LoyaltyConfig: ILoyaltyConfigModel;
  Pricing: IPricingModel;
  PricingPlans: IPricingPlanModel;
  Score: IScoreModel;
  ScoreCampaign: IScoreCampaignModel;
  ScoreLog: IScoreLogModel;
  Spin: ISpinModel;
  SpinCampaign: ISpinCampaignModel;
  Voucher: IVoucherModel;
  VoucherCampaign: IVoucherCampaignModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}



export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Agent = db.model<IAgentDocument, IAgentModel>(
    'loyalty_agent',
    loadAgentClass(models),
  );

  models.Assignment = db.model<IAssignmentDocument, IAssignmentModel>(
    'loyalty_assignment',
    loadAssignmentClass(models),
  );

  models.AssignmentCampaign = db.model<
    IAssignmentCampaignDocument,
    IAssignmentCampaignModel
  >(
    'assignment_campaigns',
    loadAssignmentCampaignClass(models),
  );

  models.Campaign = db.model<ICampaignDocument, ICampaignModel>(
    'loyalty_campaign',
    loadCampaignClass(models),
  );

  models.Coupon = db.model<ICouponDocument, ICouponModel>(
    'loyalty_coupon',
    loadCouponClass(models),
  );

  models.CouponCampaign = db.model<
    ICouponCampaignDocument,
    ICouponCampaignModel
  >(
    'coupon_campaigns',
    loadCouponCampaignClass(models),
  );

  models.Donate = db.model<IDonateDocument, IDonateModel>(
    'loyalty_donate',
    loadDonateClass(models),
  );

  models.DonateCampaign = db.model<
    IDonateCampaignDocument,
    IDonateCampaignModel
  >(
    'donate_campaigns',
    loadDonateCampaignClass(models),
  );

  models.Lottery = db.model<ILotteryDocument, ILotteryModel>(
    'loyalty_lottery',
    loadLotteryClass(models),
  );

  models.LotteryCampaign = db.model<
    ILotteryCampaignDocument,
    ILotteryCampaignModel
  >(
    'lottery_campaigns',
    loadLotteryCampaignClass(models),
  );

  models.LoyaltyConfig = db.model<
    ILoyaltyConfigDocument,
    ILoyaltyConfigModel
  >(
    'loyalty_configs',
    loadLoyaltyConfigClass(models),
  );

  models.Pricing = db.model<IPricingDocument, IPricingModel>(
    'loyalty_pricing',
    loadPricingClass(models),
  );

  models.PricingPlans = db.model<
    IPricingPlanDocument,
    IPricingPlanModel
  >(
    'pricing',
    loadPricingPlanClass(models),
  );

  models.Score = db.model<IScoreDocument, IScoreModel>(
    'loyalty_score',
    loadScoreClass(models),
  );

  models.ScoreCampaign = db.model<
    IScoreCampaignDocument,
    IScoreCampaignModel
  >(
    'score_campaigns',
    loadScoreCampaignClass(models, subdomain),
  );

  models.ScoreLog = db.model<IScoreLogDocument, IScoreLogModel>(
    'loyalty_score_log',
    loadScoreLogClass(models),
  );

  models.Spin = db.model<ISpinDocument, ISpinModel>(
    'loyalty_spin',
    loadSpinClass(models),
  );
  models.SpinCampaign = db.model<ISpinCampaignDocument, ISpinCampaignModel>(
    'spin_campaigns',
    loadSpinCampaignClass(models),
  );

  models.Voucher = db.model<IVoucherDocument, IVoucherModel>(
    'loyalty_voucher',
    loadVoucherClass(models),
  );

  models.VoucherCampaign = db.model<IVoucherCampaignDocument, IVoucherCampaignModel>(
    'voucher_campaigns',
    loadVoucherCampaignClass(models),
  );

  return models;
};

export const generateModels =
  createGenerateModels<IModels>(loadClasses);
