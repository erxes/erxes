import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { IRCFAQuestionModel, loadRCFAIssuesClass } from './models/rcfaIssues';
import { IRCFAModel, loadRCFAClass } from './models/rcfaModel';
import { IRCFAIssuesDocument } from './models/definitions/issues';
import { IRCFADocument } from './models/definitions/rcfa';

export interface IModels {
  Issues: IRCFAQuestionModel;
  RCFA: IRCFAModel;
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

  models.RCFA = db.model<IRCFADocument, IRCFAModel>(
    'rcfa_conformities',
    loadRCFAClass(models, subdomain),
  );

  models.Issues = db.model<IRCFAIssuesDocument, IRCFAQuestionModel>(
    'rcfa_issues',
    loadRCFAIssuesClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
