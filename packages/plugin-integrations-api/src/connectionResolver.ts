import * as mongoose from "mongoose";
import { IContext as IMainContext } from "@erxes/api-utils/src/types";
import {
  conversationSchema as callProConversationSchema,
  customerSchema as callProCustomerSchema,
  IConversationDocument as ICallProConversationDocument,
  IConversationModel as ICallProConversationModel,
  ICustomerDocument as ICallProCustomerDocument,
  ICustomerModel as ICallProCustomerModel,
  ICallProLogDocument as ICallProLogDocument,
  ICallProLogModel as ICallProLogModel,
  callProLogSchema as callProLogSchema,
} from "./callpro/models";

import {
  IAccountDocument,
  IAccountModel,
  loadAccountClass,
} from "./models/Accounts";
import {
  IConfigDocument,
  IConfigModel,
  loadConfigClass,
} from "./models/Configs";

import {
  IIntegrationDocument,
  IIntegrationModel,
  loadIntegrationClass,
} from "./models/Integrations";
import { ILogDocument, ILogModel, loadLogClass } from "./models/Logs";
import { createGenerateModels } from "@erxes/api-utils/src/core";

export interface IModels {
  Accounts: IAccountModel;
  Configs: IConfigModel;
  Integrations: IIntegrationModel;
  Logs: ILogModel;
  CallProLogs: ICallProLogModel;
  CallProCustomers: ICallProCustomerModel;
  CallProConversations: ICallProConversationModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection) => {
  const models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    "accounts",
    loadAccountClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    "configs",
    loadConfigClass(models),
  );
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    "integrations",
    loadIntegrationClass(models),
  );
  models.Logs = db.model<ILogDocument, ILogModel>("logs", loadLogClass(models));

  models.CallProCustomers = db.model<
    ICallProCustomerDocument,
    ICallProCustomerModel
  >("customers_callpro", callProCustomerSchema);
  models.CallProConversations = db.model<
    ICallProConversationDocument,
    ICallProConversationModel
  >("conversations_callpro", callProConversationSchema);
  models.CallProLogs = db.model<ICallProLogDocument, ICallProLogModel>(
    "logs_callpro",
    callProLogSchema,
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
