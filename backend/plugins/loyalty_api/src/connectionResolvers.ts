import { IAgentDocument } from '@/agent/@types';
import { IAgentModel, loadAgentClass } from '@/agent/db/models/Agent';
import { IAssignmentDocument } from '@/assignment/@types/assignment';
import { IAssignmentCampaignDocument } from '@/assignment/@types/assignmentCampaign';
import {
  IAssignmentModel,
  loadAssignmentClass,
} from '@/assignment/db/models/Assignment';
import {
  IAssignmentCampaignModel,
  loadAssignmentCampaignClass,
} from '@/assignment/db/models/AssignmentCampaign';
import { ILoyaltyConfigDocument } from '@/config/@types/config';
import {
  ILoyaltyConfigModel,
  loadLoyaltyConfigClass,
} from '@/config/db/models/Config';
import { ICouponDocument } from '@/coupon/@types/coupon';
import { ICouponCampaignDocument } from '@/coupon/@types/couponCampaign';
import { ICouponModel, loadCouponClass } from '@/coupon/db/models/Coupon';
import {
  ICouponCampaignModel,
  loadCouponCampaignClass,
} from '@/coupon/db/models/CouponCampaign';
import { IDonateDocument } from '@/donate/@types/donate';
import { IDonateCampaignDocument } from '@/donate/@types/donateCampaign';
import { IDonateModel, loadDonateClass } from '@/donate/db/models/Donate';
import {
  IDonateCampaignModel,
  loadDonateCampaignClass,
} from '@/donate/db/models/DonateCampaign';
import { ILotteryDocument } from '@/lottery/@types/lottery';
import { ILotteryCampaignDocument } from '@/lottery/@types/lotteryCampaign';
import { ILotteryModel, loadLotteryClass } from '@/lottery/db/models/Lottery';
import {
  ILotteryCampaignModel,
  loadLotteryCampaignClass,
} from '@/lottery/db/models/LotteryCampaign';
import { IPricingDocument } from '@/pricing/@types/pricing';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { IPricingModel, loadPricingClass } from '@/pricing/db/models/Pricing';
import {
  IPricingPlanModel,
  loadPricingPlanClass,
} from '@/pricing/db/models/PricingPlan';
import { IScoreCampaignDocument } from '@/score/@types/scoreCampaign';
import { IScoreLogDocument } from '@/score/@types/scoreLog';
import {
  IScoreCampaignModel,
  loadScoreCampaignClass,
} from '@/score/db/models/ScoreCampaign';
import { IScoreLogModel, loadScoreLogClass } from '@/score/db/models/ScoreLog';
import { ISpinDocument } from '@/spin/@types/spin';
import { ISpinCampaignDocument } from '@/spin/@types/spinCampaign';
import { ISpinModel, loadSpinClass } from '@/spin/db/models/Spin';
import {
  ISpinCampaignModel,
  loadSpinCampaignClass,
} from '@/spin/db/models/SpinCampaign';
import { IVoucherDocument } from '@/voucher/@types/voucher';
import { IVoucherCampaignDocument } from '@/voucher/@types/voucherCampaign';
import { IVoucherModel, loadVoucherClass } from '@/voucher/db/models/Voucher';
import {
  IVoucherCampaignModel,
  loadVoucherCampaignClass,
} from '@/voucher/db/models/VoucherCampaign';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';

export interface IModels {
  Agents: IAgentModel;
  Assignments: IAssignmentModel;
  AssignmentCampaigns: IAssignmentCampaignModel;
  Coupons: ICouponModel;
  CouponCampaigns: ICouponCampaignModel;
  Donates: IDonateModel;
  DonateCampaigns: IDonateCampaignModel;
  Lotteries: ILotteryModel;
  LotteryCampaigns: ILotteryCampaignModel;
  LoyaltyConfigs: ILoyaltyConfigModel;
  Pricing: IPricingModel;
  PricingPlans: IPricingPlanModel;
  ScoreCampaigns: IScoreCampaignModel;
  ScoreLogs: IScoreLogModel;
  Spins: ISpinModel;
  SpinCampaigns: ISpinCampaignModel;
  Vouchers: IVoucherModel;
  VoucherCampaigns: IVoucherCampaignModel;
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

  models.Agents = db.model<IAgentDocument, IAgentModel>(
    'agents',
    loadAgentClass(models),
  );

  models.Assignments = db.model<IAssignmentDocument, IAssignmentModel>(
    'assignments',
    loadAssignmentClass(models),
  );

  models.AssignmentCampaigns = db.model<
    IAssignmentCampaignDocument,
    IAssignmentCampaignModel
  >('assignment_campaigns', loadAssignmentCampaignClass(models));

  models.Coupons = db.model<ICouponDocument, ICouponModel>(
    'coupons',
    loadCouponClass(models),
  );

  models.CouponCampaigns = db.model<
    ICouponCampaignDocument,
    ICouponCampaignModel
  >('coupon_campaigns', loadCouponCampaignClass(models));

  models.Donates = db.model<IDonateDocument, IDonateModel>(
    'donates',
    loadDonateClass(models),
  );

  models.DonateCampaigns = db.model<
    IDonateCampaignDocument,
    IDonateCampaignModel
  >('donate_campaigns', loadDonateCampaignClass(models));

  models.Lotteries = db.model<ILotteryDocument, ILotteryModel>(
    'lotteries',
    loadLotteryClass(models),
  );

  models.LotteryCampaigns = db.model<
    ILotteryCampaignDocument,
    ILotteryCampaignModel
  >('lottery_campaigns', loadLotteryCampaignClass(models));

  models.LoyaltyConfigs = db.model<ILoyaltyConfigDocument, ILoyaltyConfigModel>(
    'loyalty_configs',
    loadLoyaltyConfigClass(models),
  );

  models.Pricing = db.model<IPricingDocument, IPricingModel>(
    'loyalty_pricing',
    loadPricingClass(models),
  );

  models.PricingPlans = db.model<IPricingPlanDocument, IPricingPlanModel>(
    'pricing',
    loadPricingPlanClass(models),
  );

  models.ScoreCampaigns = db.model<IScoreCampaignDocument, IScoreCampaignModel>(
    'score_campaigns',
    loadScoreCampaignClass(models, subdomain),
  );

  models.ScoreLogs = db.model<IScoreLogDocument, IScoreLogModel>(
    'score_logs',
    loadScoreLogClass(models, subdomain),
  );

  models.Spins = db.model<ISpinDocument, ISpinModel>(
    'spins',
    loadSpinClass(models),
  );

  models.SpinCampaigns = db.model<ISpinCampaignDocument, ISpinCampaignModel>(
    'spin_campaigns',
    loadSpinCampaignClass(models),
  );

  models.Vouchers = db.model<IVoucherDocument, IVoucherModel>(
    'vouchers',
    loadVoucherClass(models, subdomain),
  );

  models.VoucherCampaigns = db.model<
    IVoucherCampaignDocument,
    IVoucherCampaignModel
  >('voucher_campaigns', loadVoucherCampaignClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
