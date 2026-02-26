import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
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
  IPermissionModel,
  loadPermissionClass,
} from './modules/accounting/db/models/Permissions';
import {
  ITransactionModel,
  loadTransactionClass,
} from './modules/accounting/db/models/Transactions';
import {
  IVatRowModel,
  loadVatRowClass,
} from './modules/accounting/db/models/VatRows';
import {
  IRemainderModel,
  loadRemainderClass,
} from './modules/inventories/db/models/Remainders';
import {
  IReserveRemModel,
  loadReserveRemClass,
} from './modules/inventories/db/models/ReserveRems';
import {
  ISafeRemainderItemModel,
  loadSafeRemainderItemClass,
} from './modules/inventories/db/models/SafeRemainderItems';
import {
  ISafeRemainderModel,
  loadSafeRemainderClass,
} from './modules/inventories/db/models/SafeRemainders';
import { IRemainderDocument } from './modules/inventories/@types/remainders';
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

  Remainders: IRemainderModel;
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
  eventDispatcher: (
    pluginName: string,
    moduleName: string,
    collectionName: string,
  ) => EventDispatcherReturn,
): IModels => {
  const models = {} as IModels;

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'accountings_configs',
    loadConfigClass(
      models,
      subdomain,
      eventDispatcher('accounting', 'accounting', 'accountings_configs'),
    ),
  );

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'accounts',
    loadAccountClass(
      models,
      subdomain,
      eventDispatcher('accounting', 'accounting', 'accounts'),
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
      eventDispatcher('accounting', 'accounting', 'account_categories'),
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

  models.Remainders = db.model<IRemainderDocument, IRemainderModel>(
    'remainders',
    loadRemainderClass(models, subdomain),
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
