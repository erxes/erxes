import { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';
import { IAccountDocument } from './modules/accounting/@types/account';
import { IAccountCategoryDocument } from './modules/accounting/@types/accountCategory';
import {
  IAdjustInvDetailDocument,
  IAdjustInventoryDocument,
} from './modules/accounting/@types/adjustInventory';
import { IConfigDocument } from './modules/accounting/@types/config';
import { ICtaxRowDocument } from './modules/accounting/@types/ctaxRow';
import {
  IAdjustFixedAssetDocument,
  IAdjustFxaDetailDocument,
} from './modules/accounting/@types/adjustFixedAsset';
import { IPermissionDocument } from './modules/accounting/@types/permission';
import {
  ITransactionCounterDocument,
  ITransactionDocument,
} from './modules/accounting/@types/transaction';
import { IVatRowDocument } from './modules/accounting/@types/vatRow';
import {
  IAccountCategoryModel,
  loadAccountCategoryClass,
} from './modules/accounting/db/models/AccountCategories';
import {
  IAccountModel,
  loadAccountClass,
} from './modules/accounting/db/models/Accounts';
import {
  IAdjustInvDetailsModel,
  IAdjustInventoriesModel,
  loadAdjustInvDetailsClass,
  loadAdjustInventoriesClass,
} from './modules/accounting/db/models/AdjustInventories';
import {
  IConfigModel,
  loadConfigClass,
} from './modules/accounting/db/models/Configs';
import {
  ICtaxRowModel,
  loadCtaxRowClass,
} from './modules/accounting/db/models/CtaxRows';
import {
  IAdjustFixedAssetModel,
  IAdjustFxaDetailModel,
  loadAdjustFixedAssetClass,
  loadAdjustFxaDetailClass,
} from './modules/accounting/db/models/FixedAssets';
import {
  IPermissionModel,
  loadPermissionClass,
} from './modules/accounting/db/models/Permissions';
import {
  ITransactionModel,
  loadTransactionClass,
} from './modules/accounting/db/models/Transactions';
import { transactionCounterSchema } from './modules/accounting/db/definitions/transaction';
import {
  IVatRowModel,
  loadVatRowClass,
} from './modules/accounting/db/models/VatRows';
import {
  IReserveRemModel,
  loadReserveRemClass,
} from './modules/inventories/db/models/ReserveRems';
import { IFixedAssetCategoryDocument } from './modules/fixedAssets/@types/fixedAssetCategory';
import { IFixedAssetDocument } from './modules/fixedAssets/@types/fixedAsset';
import { IFxaInstanceDocument } from './modules/fixedAssets/@types/fxaInstance';
import { IFxaInstanceLogDocument } from './modules/fixedAssets/@types/fxaInstanceLog';
import {
  IFixedAssetCategoryModel,
  loadFixedAssetCategoryClass,
} from './modules/fixedAssets/db/models/FixedAssetCategories';
import {
  IFixedAssetModel,
  loadFixedAssetClass,
} from './modules/fixedAssets/db/models/FixedAssets';
import {
  IFxaInstanceModel,
  loadFxaInstanceClass,
} from './modules/fixedAssets/db/models/FxaInstances';
import {
  IFxaInstanceLogModel,
  loadFxaInstanceLogClass,
} from './modules/fixedAssets/db/models/FxaInstanceLogs';
import {
  ISafeRemainderItemModel,
  loadSafeRemainderItemClass,
} from './modules/inventories/db/models/SafeRemainderItems';
import {
  ISafeRemainderModel,
  loadSafeRemainderClass,
} from './modules/inventories/db/models/SafeRemainders';
import { IReserveRemDocument } from './modules/inventories/@types/reserveRems';
import { ISafeRemainderItemDocument } from './modules/inventories/@types/safeRemainderItems';
import { ISafeRemainderDocument } from './modules/inventories/@types/safeRemainders';

export interface IModels {
  Accounts: IAccountModel;
  Transactions: ITransactionModel;
  AccountCategories: IAccountCategoryModel;
  Configs: IConfigModel;
  VatRows: IVatRowModel;
  CtaxRows: ICtaxRowModel;
  Permissions: IPermissionModel;
  AdjustInventories: IAdjustInventoriesModel;
  AdjustInvDetails: IAdjustInvDetailsModel;
  FixedAssetCategories: IFixedAssetCategoryModel;
  FixedAssets: IFixedAssetModel;
  FxaInstances: IFxaInstanceModel;
  FxaInstanceLogs: IFxaInstanceLogModel;
  AdjustFixedAssets: IAdjustFixedAssetModel;
  AdjustFxaDetails: IAdjustFxaDetailModel;
  TransactionCounters: mongoose.Model<ITransactionCounterDocument>;

  ReserveRems: IReserveRemModel;
  SafeRemainderItems: ISafeRemainderItemModel;
  SafeRemainders: ISafeRemainderModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  commonQuerySelector: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventHandlers: ScopedEventHandlers,
): IModels => {
  const models = {} as IModels;
  const accountingEventHandlers = eventHandlers('accounting');

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'accountings_configs',
    loadConfigClass(
      models,
      subdomain,
      accountingEventHandlers('accounting', 'accountings_configs'),
    ),
  );

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accounts',
    loadAccountClass(
      models,
      subdomain,
      accountingEventHandlers('accounting', 'accounts'),
    ),
  );

  models.AccountCategories = db.model<
    IAccountCategoryDocument,
    IAccountCategoryModel
  >(
    'account_categories',
    loadAccountCategoryClass(
      models,
      subdomain,
      accountingEventHandlers('accounting', 'account_categories'),
    ),
  );

  models.AdjustInventories = db.model<
    IAdjustInventoryDocument,
    IAdjustInventoriesModel
  >('adjust_inventories', loadAdjustInventoriesClass(models, subdomain));

  models.AdjustInvDetails = db.model<
    IAdjustInvDetailDocument,
    IAdjustInvDetailsModel
  >('adjust_inv_details', loadAdjustInvDetailsClass(models, subdomain));

  models.FixedAssetCategories = db.model<
    IFixedAssetCategoryDocument,
    IFixedAssetCategoryModel
  >('fixed_asset_categories', loadFixedAssetCategoryClass());

  models.FixedAssets = db.model<IFixedAssetDocument, IFixedAssetModel>(
    'fixed_assets',
    loadFixedAssetClass(),
  );

  models.FxaInstances = db.model<IFxaInstanceDocument, IFxaInstanceModel>(
    'fxa_instances',
    loadFxaInstanceClass(),
  );

  models.FxaInstanceLogs = db.model<
    IFxaInstanceLogDocument,
    IFxaInstanceLogModel
  >('fxa_instance_logs', loadFxaInstanceLogClass());

  models.AdjustFixedAssets = db.model<
    IAdjustFixedAssetDocument,
    IAdjustFixedAssetModel
  >('adjust_fixed_assets', loadAdjustFixedAssetClass(models));

  models.AdjustFxaDetails = db.model<
    IAdjustFxaDetailDocument,
    IAdjustFxaDetailModel
  >('adjust_fxa_details', loadAdjustFxaDetailClass(models));

  models.Permissions = db.model<IPermissionDocument, IPermissionModel>(
    'accounting_permissions',
    loadPermissionClass(models, subdomain),
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'accountings_transactions',
    loadTransactionClass(
      models,
      subdomain,
      accountingEventHandlers('accounting', 'transactions'),
    ),
  );

  models.TransactionCounters = db.model<ITransactionCounterDocument>(
    'accountings_transaction_counters',
    transactionCounterSchema,
    'accountings_transaction_counters',
  );

  models.VatRows = db.model<IVatRowDocument, IVatRowModel>(
    'vat_rows',
    loadVatRowClass(models, subdomain),
  );
  models.CtaxRows = db.model<ICtaxRowDocument, ICtaxRowModel>(
    'ctax_rows',
    loadCtaxRowClass(models, subdomain),
  );

  models.ReserveRems = db.model<IReserveRemDocument, IReserveRemModel>(
    'inventories_reserverems',
    loadReserveRemClass(models, subdomain),
  );
  models.SafeRemainderItems = db.model<
    ISafeRemainderItemDocument,
    ISafeRemainderItemModel
  >('safe_remainder_items', loadSafeRemainderItemClass(models, subdomain));
  models.SafeRemainders = db.model<ISafeRemainderDocument, ISafeRemainderModel>(
    'safe_remainders',
    loadSafeRemainderClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
