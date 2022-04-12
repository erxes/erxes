import * as mongoose from 'mongoose';

import { mainDb } from './configs';
import { IEmailTemplateDocument } from './models/definitions/emailTemplates';
import { IEmailTemplateModel, loadEmailTemplateClass } from './models/EmailTemplates';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface IModels {
  EmailTemplates: IEmailTemplateModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.EmailTemplates = db.model<IEmailTemplateDocument, IEmailTemplateModel>(
    'email_templates',
    loadEmailTemplateClass(models)
  );

  return models;
};
