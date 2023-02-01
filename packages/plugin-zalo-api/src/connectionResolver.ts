import * as mongoose from "mongoose";
import { IContext as IMainContext } from "@erxes/api-utils/src";
import { createGenerateModels } from "@erxes/api-utils/src/core";

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
import {
    IConversationDocument,
    IConversationModel,
    loadConversationClass,
} from "./models/Conversations";
import {
    IConversationMessageDocument,
    IConversationMessageModel,
    loadConversationMessageClass
  } from './models/ConversationMessages';

import { ICustomerDocument, ICustomerModel, loadCustomerClass } from './models/Customers';
export interface IModels {
    Accounts: IAccountModel;
    Configs: IConfigModel;
    Integrations: IIntegrationModel;
    Conversations: IConversationModel;
    ConversationMessages: IConversationMessageModel;
    Customers: ICustomerModel
}

export interface IContext extends IMainContext {
    subdomain: string;
    models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
    models = {} as IModels;

    models.Accounts = db.model<IAccountDocument, IAccountModel>(
        "zalo_accounts",
        loadAccountClass(models)
    );
    models.Configs = db.model<IConfigDocument, IConfigModel>(
        "zalo_configs",
        loadConfigClass(models)
    );
    models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
        "zalo_integrations",
        loadIntegrationClass(models)
    );
    models.Conversations = db.model<IConversationDocument, IConversationModel>(
        "zalo_conversations",
        loadConversationClass(models)
    );
    models.ConversationMessages = db.model<IConversationMessageDocument, IConversationMessageModel>(
        "zalo_conversation_messages",
        loadConversationMessageClass(models)
    );
    models.Customers = db.model<ICustomerDocument, ICustomerModel>(
        "zalo_customers",
        loadCustomerClass(models)
    );
    return models;
};

export const generateModels = createGenerateModels<IModels>(
    models,
    loadClasses
);
