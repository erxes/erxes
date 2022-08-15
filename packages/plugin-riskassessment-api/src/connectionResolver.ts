import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IRiskAssessmentModel, loadRiskAssessment } from './models/RiskAssessment';
import { IRiskAssessmentCategoryDocument, IRiskAssessmentDocument } from './models/definitions/riskassessment';
import { IRiskConfirmityModel, loadRiskConfirmity } from './models/RiskConfirmity';
import { IRiskAnswerModel, loadRiskAnswer } from './models/RiskAnswer';
import { IRiskAnswerDocument } from './models/definitions/riskAnswer';
import { IRiskConfirmityDocument } from './models/definitions/riskConfimity';
import { IRiskAssessmentCategoryModel, loadAssessmentCategory } from './models/RiskAsssessmentCategory';

export interface IModels {
  RiskAssessment: IRiskAssessmentModel;
  RiskAssessmentCategory: IRiskAssessmentCategoryModel;
  RiskAnswer: IRiskAnswerModel;
  RiskConfimity: IRiskConfirmityModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  models.RiskAssessment = db.model<IRiskAssessmentDocument, IRiskAssessmentModel>('risk_assessment', loadRiskAssessment(models, subdomain));
  models.RiskAssessmentCategory = db.model<IRiskAssessmentCategoryDocument, IRiskAssessmentCategoryModel>('risk_assessment_category', loadAssessmentCategory(models, subdomain));
  models.RiskAnswer = db.model<IRiskAnswerDocument, IRiskAnswerModel>('risk_answer', loadRiskAnswer(models, subdomain));
  models.RiskConfimity = db.model<IRiskConfirmityDocument, IRiskConfirmityModel>('risk_confirmity', loadRiskConfirmity(models, subdomain));

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses);
