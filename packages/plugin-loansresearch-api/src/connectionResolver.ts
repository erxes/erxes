import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  ILoansResearchModel,
  loadLoansResearchClass,
} from './models/LoanResearch';
import { ILoanResearchDocument } from './models/definitions/loansResearch';

export interface IModels {
  LoansResearch: ILoansResearchModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.LoansResearch = db.model<ILoanResearchDocument, ILoansResearchModel>(
    'loansresearch',
    loadLoansResearchClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
