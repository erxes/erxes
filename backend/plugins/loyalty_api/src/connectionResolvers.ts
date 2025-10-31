import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { ILoyaltyDocument } from '@/loyalty/@types/loyalty';

import mongoose from 'mongoose';

import { loadLoyaltyClass, ILoyaltyModel } from '@/loyalty/db/models/loyalty';
import {
  IAgentModel,
  loadAgentClass,
} from '~/modules/loyalty/db/models/Agents';
import {
  IAssignmentCampaignModel,
  loadAssignmentCampaignClass,
} from '~/modules/loyalty/db/models/AssignmentCampaigns';
import {
  IAssignmentModel,
  loadAssignmentClass,
} from '~/modules/loyalty/db/models/Assignments';
import {
  ILoyaltyConfigModel,
  loadLoyaltyConfigClass,
} from '~/modules/loyalty/db/models/Configs';
import {
  ICouponCampaignModel,
  loadCouponCampaignClass,
} from '~/modules/loyalty/db/models/CouponCampaigns';
import {
  ICouponModel,
  loadCouponClass,
} from '~/modules/loyalty/db/models/Coupons';
import {
  IDonateCampaignModel,
  loadDonateCampaignClass,
} from '~/modules/loyalty/db/models/DonateCampaigns';
import {
  IDonateModel,
  loadDonateClass,
} from '~/modules/loyalty/db/models/Donates';
import {
  ILotteryModel,
  loadLotteryClass,
} from '~/modules/loyalty/db/models/Lotteries';
import {
  ILotteryCampaignModel,
  loadLotteryCampaignClass,
} from '~/modules/loyalty/db/models/LotteryCampaigns';
import {
  IScoreCampaignModel,
  loadScoreCampaignClass,
} from '~/modules/loyalty/db/models/ScoreCampaigns';
import {
  IScoreLogModel,
  loadScoreLogClass,
} from '~/modules/loyalty/db/models/ScoreLogs';
import {
  ISpinCampaignModel,
  loadSpinCampaignClass,
} from '~/modules/loyalty/db/models/SpinCampaigns';
import { ISpinModel, loadSpinClass } from '~/modules/loyalty/db/models/Spins';
import {
  IVoucherCampaignModel,
  loadVoucherCampaignClass,
} from '~/modules/loyalty/db/models/VoucherCampaigns';
import {
  IVoucherModel,
  loadVoucherClass,
} from '~/modules/loyalty/db/models/Vouchers';
import { IAgentDocument } from '~/modules/loyalty/@types/agents';
import { IAssignmentCampaignDocument } from '~/modules/loyalty/@types/assignmentCampaigns';
import { IAssignmentDocument } from '~/modules/loyalty/@types/assignments';
import { ILoyaltyConfigDocument } from '~/modules/loyalty/@types/config';
import { ICouponCampaignDocument } from '~/modules/loyalty/@types/couponCampaigns';
import { ICouponDocument } from '~/modules/loyalty/@types/coupons';
import { IDonateCampaignDocument } from '~/modules/loyalty/@types/donateCampaigns';
import { IDonateDocument } from '~/modules/loyalty/@types/donates';
import { ILotteryDocument } from '~/modules/loyalty/@types/lotteries';
import { ILotteryCampaignDocument } from '~/modules/loyalty/@types/lotteryCampaigns';
import { IScoreCampaignDocuments } from '~/modules/loyalty/@types/scoreCampaigns';
import { IScoreLogDocument } from '~/modules/loyalty/@types/scoreLog';
import { ISpinCampaignDocument } from '~/modules/loyalty/@types/spinCampaigns';
import { ISpinDocument } from '~/modules/loyalty/@types/spins';
import { IVoucherCampaignDocument } from '~/modules/loyalty/@types/voucherCampaigns';
import { IVoucherDocument } from '~/modules/loyalty/@types/vouchers';

export interface IModels {
  LoyaltyConfigs: ILoyaltyConfigModel;
  DonateCampaigns: IDonateCampaignModel;
  Donates: IDonateModel;
  AssignmentCampaigns: IAssignmentCampaignModel;
  Assignments: IAssignmentModel;
  VoucherCampaigns: IVoucherCampaignModel;
  Vouchers: IVoucherModel;
  SpinCampaigns: ISpinCampaignModel;
  Spins: ISpinModel;
  LotteryCampaigns: ILotteryCampaignModel;
  Lotteries: ILotteryModel;
  ScoreLogs: IScoreLogModel;
  ScoreCampaigns: IScoreCampaignModel;
  Agents: IAgentModel;
  CouponCampaigns: ICouponCampaignModel;
  Coupons: ICouponModel;
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

  models.LoyaltyConfigs = db.model<ILoyaltyConfigDocument, ILoyaltyConfigModel>(
    'loyalty_configs',
    loadLoyaltyConfigClass(models, subdomain),
  );
  models.DonateCampaigns = db.model<
    IDonateCampaignDocument,
    IDonateCampaignModel
  >('donate_campaigns', loadDonateCampaignClass(models, subdomain));
  models.Donates = db.model<IDonateDocument, IDonateModel>(
    'donates',
    loadDonateClass(models, subdomain),
  );
  models.SpinCampaigns = db.model<ISpinCampaignDocument, ISpinCampaignModel>(
    'spin_campaigns',
    loadSpinCampaignClass(models, subdomain),
  );
  models.Spins = db.model<ISpinDocument, ISpinModel>(
    'spins',
    loadSpinClass(models, subdomain),
  );
  models.LotteryCampaigns = db.model<
    ILotteryCampaignDocument,
    ILotteryCampaignModel
  >('lottery_campaigns', loadLotteryCampaignClass(models, subdomain));
  models.Lotteries = db.model<ILotteryDocument, ILotteryModel>(
    'lotteries',
    loadLotteryClass(models, subdomain),
  );
  models.VoucherCampaigns = db.model<
    IVoucherCampaignDocument,
    IVoucherCampaignModel
  >('voucher_campaigns', loadVoucherCampaignClass(models, subdomain));
  models.Vouchers = db.model<IVoucherDocument, IVoucherModel>(
    'vouchers',
    loadVoucherClass(models, subdomain),
  );
  models.AssignmentCampaigns = db.model<
    IAssignmentCampaignDocument,
    IAssignmentCampaignModel
  >('assignment_campaigns', loadAssignmentCampaignClass(models, subdomain));
  models.Assignments = db.model<IAssignmentDocument, IAssignmentModel>(
    'assignments',
    loadAssignmentClass(models, subdomain),
  );
  models.ScoreLogs = db.model<IScoreLogDocument, IScoreLogModel>(
    'score_logs',
    loadScoreLogClass(models, subdomain),
  );

  models.ScoreCampaigns = db.model<
    IScoreCampaignDocuments,
    IScoreCampaignModel
  >('score_campaigns', loadScoreCampaignClass(models, subdomain));

  models.CouponCampaigns = db.model<
    ICouponCampaignDocument,
    ICouponCampaignModel
  >('coupon_campaigns', loadCouponCampaignClass(models, subdomain));

  models.Coupons = db.model<ICouponDocument, ICouponModel>(
    'coupons',
    loadCouponClass(models, subdomain),
  );

  models.Agents = db.model<IAgentDocument, IAgentModel>(
    'agents',
    loadAgentClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
