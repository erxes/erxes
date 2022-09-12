import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { IRiskAnswerDocument } from './models/definitions/riskAnswer';
import {
  IRiskAssessmentCategoryDocument,
  IRiskAssessmentDocument,
} from './models/definitions/riskassessment';
import {
  IRiskConfirmityDocument,
  IRiskFormSubmissionDocument,
} from './models/definitions/riskConfimity';
import { IRiskFormSubmissionModel, loadRiskFormSubmissions } from './models/FormSubmissions';
import { IRiskAnswerModel, loadRiskAnswer } from './models/RiskAnswer';
import { IRiskAssessmentModel, loadRiskAssessment } from './models/RiskAssessment';
import {
  IRiskAssessmentCategoryModel,
  loadAssessmentCategory,
} from './models/RiskAsssessmentCategory';
import { IRiskConfirmityModel, loadRiskConfirmity } from './models/RiskConfirmity';

export interface IModels {
  RiskAssessment: IRiskAssessmentModel;
  RiskAssessmentCategory: IRiskAssessmentCategoryModel;
  RiskAnswer: IRiskAnswerModel;
  RiskConfimity: IRiskConfirmityModel;
  RiksFormSubmissions: IRiskFormSubmissionModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  models.RiskAssessment = db.model<IRiskAssessmentDocument, IRiskAssessmentModel>(
    'risk_assessment',
    loadRiskAssessment(models, subdomain)
  );
  models.RiskAssessmentCategory = db.model<
    IRiskAssessmentCategoryDocument,
    IRiskAssessmentCategoryModel
  >('risk_assessment_category', loadAssessmentCategory(models, subdomain));
  models.RiskAnswer = db.model<IRiskAnswerDocument, IRiskAnswerModel>(
    'risk_answer',
    loadRiskAnswer(models, subdomain)
  );
  models.RiskConfimity = db.model<IRiskConfirmityDocument, IRiskConfirmityModel>(
    'risk_assessment_confirmity',
    loadRiskConfirmity(models, subdomain)
  );
  models.RiksFormSubmissions = db.model<IRiskFormSubmissionDocument, IRiskFormSubmissionModel>(
    'risk_form_submissions',
    loadRiskFormSubmissions(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses);
