import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IWebhookModel, loadWebhookClass } from './models/Webhooks';
import { IWebhookDocument } from './models/definitions/webhooks';

export interface IModels {
  Webhooks: IWebhookModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Webhooks = db.model<IWebhookDocument, IWebhookModel>(
    'webhooks',
    loadWebhookClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
