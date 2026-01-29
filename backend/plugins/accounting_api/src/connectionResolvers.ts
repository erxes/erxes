import mongoose from 'mongoose';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IAccountCategoryDocument } from './modules/accounting/@types/accountCategory';
import { IAccountDocument } from './modules/accounting/@types/account';
import { IAdjustInvDetailDocument, IAdjustInventoryDocument } from './modules/accounting/@types/adjustInventory';
import {
  IAdjustInvDetailsModel,
  IAdjustInventoriesModel,
  loadAdjustInvDetailsClass,
  loadAdjustInventoriesClass
} from './modules/accounting/db/models/AdjustInventories';
import { IConfigDocument } from './modules/accounting/@types/config';
import { ICtaxRowDocument } from './modules/accounting/@types/ctaxRow';
import { ICtaxRowModel, loadCtaxRowClass } from './modules/accounting/db/models/CtaxRows';
import { IMainContext } from 'erxes-api-shared/core-types';
import { IPermissionDocument } from './modules/accounting/@types/permission';
import { IPermissionModel, loadPermissionClass } from './modules/accounting/db/models/Permissions';
import { ITransactionDocument } from './modules/accounting/@types/transaction';
import { IVatRowDocument } from './modules/accounting/@types/vatRow';
import { IVatRowModel, loadVatRowClass } from './modules/accounting/db/models/VatRows';
import {
  IAccountCategoryModel,
  loadAccountCategoryClass,
} from './modules/accounting/db/models/AccountCategories';
import {
  IAccountModel,
  loadAccountClass,
} from './modules/accounting/db/models/Accounts';
import {
  IConfigModel,
  loadConfigClass,
} from './modules/accounting/db/models/Configs';
import {
  ITransactionModel,
  loadTransactionClass,
} from './modules/accounting/db/models/Transactions';

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
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  commonQuerySelector: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventDispatcher: (
    pluginName: string,
    moduleName: string,
    collectionName: string,
  ) => EventDispatcherReturn,
): IModels => {
  const models = {} as IModels;

  models.Configs = db.model<
    IConfigDocument,
    IConfigModel
  >('accountings_configs', loadConfigClass(
    models,
    subdomain,
    eventDispatcher('accounting', 'accounting', 'accountings_configs')
  ));

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accounts',
    loadConfigClass(
      models,
      subdomain,
      eventDispatcher('accounting', 'accounting', 'accounts')
    ),
  );

  models.AccountCategories = db.model<
    IAccountCategoryDocument,
    IAccountCategoryModel
  >('account_categories',  loadConfigClass(
    models,
    subdomain,
    eventDispatcher('accounting', 'accounting', 'account_categories')
  ));

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