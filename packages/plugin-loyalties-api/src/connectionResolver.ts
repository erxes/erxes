import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IDonateCampaignDocument } from './models/definitions/donateCampaigns';
import {
  IDonateCampaignModel,
  loadDonateCampaignClass
} from './models/DonateCampaigns';
import { IDonateDocument } from './models/definitions/donates';
import { IDonateModel, loadDonateClass } from './models/Donates';
import {
  IAssignmentCampaignModel,
  loadAssignmentCampaignClass
} from './models/AssignmentCampaigns';
import { IAssignmentModel, loadAssignmentClass } from './models/Assignments';
import { IAssignmentCampaignDocument } from './models/definitions/assignmentCampaigns';
import { IAssignmentDocument } from './models/definitions/assignments';
import { ILotteryCampaignDocument } from './models/definitions/lotteryCampaigns';
import {
  ILotteryCampaignModel,
  loadLotteryCampaignClass
} from './models/LotteryCampaigns';
import { ILotteryDocument } from './models/definitions/lotteries';
import { ILotteryModel, loadLotteryClass } from './models/Lotteries';
import { ILoyaltyConfigDocument } from './models/definitions/config';
import { ILoyaltyConfigModel, loadLoyaltyConfigClass } from './models/Configs';
import { ISpinCampaignDocument } from './models/definitions/spinCampaigns';
import {
  ISpinCampaignModel,
  loadSpinCampaignClass
} from './models/SpinCampaigns';
import { ISpinDocument } from './models/definitions/spins';
import { ISpinModel, loadSpinClass } from './models/Spins';
import { IVoucherCampaignDocument } from './models/definitions/voucherCampaigns';
import {
  IVoucherCampaignModel,
  loadVoucherCampaignClass
} from './models/VoucherCampaigns';
import { IVoucherDocument } from './models/definitions/vouchers';
import { IVoucherModel, loadVoucherClass } from './models/Vouchers';
import { IScoreLogModel, loadScoreLogClass } from './models/ScoreLogs';
import { IScoreLogDocument } from './models/definitions/scoreLog';
import { createGenerateModels } from '@erxes/api-utils/src/core';

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
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.LoyaltyConfigs = db.model<ILoyaltyConfigDocument, ILoyaltyConfigModel>(
    'loyalty_configs',
    loadLoyaltyConfigClass(models, subdomain)
  );
  models.DonateCampaigns = db.model<
    IDonateCampaignDocument,
    IDonateCampaignModel
  >('donate_campaigns', loadDonateCampaignClass(models, subdomain));
  models.Donates = db.model<IDonateDocument, IDonateModel>(
    'donates',
    loadDonateClass(models, subdomain)
  );
  models.SpinCampaigns = db.model<ISpinCampaignDocument, ISpinCampaignModel>(
    'spin_campaigns',
    loadSpinCampaignClass(models, subdomain)
  );
  models.Spins = db.model<ISpinDocument, ISpinModel>(
    'spins',
    loadSpinClass(models, subdomain)
  );
  models.LotteryCampaigns = db.model<
    ILotteryCampaignDocument,
    ILotteryCampaignModel
  >('lottery_campaigns', loadLotteryCampaignClass(models, subdomain));
  models.Lotteries = db.model<ILotteryDocument, ILotteryModel>(
    'lotteries',
    loadLotteryClass(models, subdomain)
  );
  models.VoucherCampaigns = db.model<
    IVoucherCampaignDocument,
    IVoucherCampaignModel
  >('voucher_campaigns', loadVoucherCampaignClass(models, subdomain));
  models.Vouchers = db.model<IVoucherDocument, IVoucherModel>(
    'vouchers',
    loadVoucherClass(models, subdomain)
  );
  models.AssignmentCampaigns = db.model<
    IAssignmentCampaignDocument,
    IAssignmentCampaignModel
  >('assignment_campaigns', loadAssignmentCampaignClass(models, subdomain));
  models.Assignments = db.model<IAssignmentDocument, IAssignmentModel>(
    'assignments',
    loadAssignmentClass(models, subdomain)
  );
  models.ScoreLogs = db.model<IScoreLogDocument, IScoreLogModel>(
    'score_logs',
    loadScoreLogClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
