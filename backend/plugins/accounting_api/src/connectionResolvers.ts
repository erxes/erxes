import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';
import { IAccountDocument } from './modules/accounting/@types/account';
import { IAccountCategoryDocument } from './modules/accounting/@types/accountCategory';
import { IAdjustInvDetailDocument, IAdjustInventoryDocument } from './modules/accounting/@types/adjustInventory';
import { IAccountingConfigDocument } from './modules/accounting/@types/config';
import { ICtaxRowDocument } from './modules/accounting/@types/ctaxRow';
import { IPermissionDocument } from './modules/accounting/@types/permission';
import { ITransactionDocument } from './modules/accounting/@types/transaction';
import { IVatRowDocument } from './modules/accounting/@types/vatRow';
import {
  IAccountCategoryModel,
  loadAccountCategoryClass,
} from './modules/accounting/db/models/AccountCategories';
import {
  IAccountModel,
  loadAccountClass,
} from './modules/accounting/db/models/Accounts';
import { IAdjustInvDetailsModel, IAdjustInventoriesModel, loadAdjustInvDetailsClass, loadAdjustInventoriesClass } from './modules/accounting/db/models/AdjustInventories';
import {
  IAccountingConfigModel,
  loadAccountingConfigClass,
} from './modules/accounting/db/models/Configs';
import { ICtaxRowModel, loadCtaxRowClass } from './modules/accounting/db/models/CtaxRows';
import { IPermissionModel, loadPermissionClass } from './modules/accounting/db/models/Permissions';
import {
  ITransactionModel,
  loadTransactionClass,
} from './modules/accounting/db/models/Transactions';
import { IVatRowModel, loadVatRowClass } from './modules/accounting/db/models/VatRows';

export interface IModels {
  Accounts: IAccountModel;
  Transactions: ITransactionModel;
  AccountCategories: IAccountCategoryModel;
  AccountingConfigs: IAccountingConfigModel;
  VatRows: IVatRowModel;
  CtaxRows: ICtaxRowModel;
  Permissions: IPermissionModel;
  AdjustInventories: IAdjustInventoriesModel;
  AdjustInvDetails: IAdjustInvDetailsModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accounts',
    loadAccountClass(models, subdomain),
  );
  models.AccountingConfigs = db.model<
    IAccountingConfigDocument,
    IAccountingConfigModel
  >('accountings_configs', loadAccountingConfigClass(models));

  models.AccountCategories = db.model<
    IAccountCategoryDocument,
    IAccountCategoryModel
  >('account_categories', loadAccountCategoryClass(models));

  models.AdjustInventories = db.model<
    IAdjustInventoryDocument,
    IAdjustInventoriesModel
  >('adjust_inventories', loadAdjustInventoriesClass(models, subdomain));

  models.AdjustInvDetails = db.model<
    IAdjustInvDetailDocument,
    IAdjustInvDetailsModel
  >('adjust_inv_details', loadAdjustInvDetailsClass(models, subdomain));

  models.Permissions = db.model<IPermissionDocument, IPermissionModel>(
    'accounting_permissions',
    loadPermissionClass(models, subdomain),
  );

  models.Transactions = db.model<ITransactionDocument, ITransactionModel>(
    'accountings_transactions',
    loadTransactionClass(models, subdomain),
  );

  models.VatRows = db.model<IVatRowDocument, IVatRowModel>(
    'vat_rows',
    loadVatRowClass(models, subdomain),
  );
  models.CtaxRows = db.model<ICtaxRowDocument, ICtaxRowModel>(
    'ctax_rows',
    loadCtaxRowClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
