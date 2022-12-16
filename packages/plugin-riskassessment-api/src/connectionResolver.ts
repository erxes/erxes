import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import {
  IRiskAssessmentCategoryDocument,
  IRiskAssessmentsConfigDocument,
  IRiskAssessmentDocument
} from './models/definitions/riskassessment';
import {
  IRiskConformityDocument,
  IRiskFormSubmissionDocument
} from './models/definitions/confimity';
import {
  IRiskFormSubmissionModel,
  loadRiskFormSubmissions
} from './models/FormSubmissions';
import {
  IRiskAssessmentModel,
  loadRiskAssessment
} from './models/RiskAssessment';
import {
  IRiskAssessmentCategoryModel,
  loadAssessmentCategory
} from './models/Category';
import { IRiskConformityModel, loadRiskConformity } from './models/Confirmity';
import {
  IRiskAssessmentsConfigModel,
  loadRiskAssessmentConfig
} from './models/Configs';

export interface IModels {
  RiskAssessment: IRiskAssessmentModel;
  RiskAssessmentCategory: IRiskAssessmentCategoryModel;
  RiskConformity: IRiskConformityModel;
  RiksFormSubmissions: IRiskFormSubmissionModel;
  RiskAssessmentConfigs: IRiskAssessmentsConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;
  models.RiskAssessment = db.model<
    IRiskAssessmentDocument,
    IRiskAssessmentModel
  >('risk_assessment', loadRiskAssessment(models, subdomain));
  models.RiskAssessmentCategory = db.model<
    IRiskAssessmentCategoryDocument,
    IRiskAssessmentCategoryModel
  >('risk_assessment_category', loadAssessmentCategory(models, subdomain));
  models.RiskConformity = db.model<
    IRiskConformityDocument,
    IRiskConformityModel
  >('risk_assessment_conformity', loadRiskConformity(models, subdomain));
  models.RiksFormSubmissions = db.model<
    IRiskFormSubmissionDocument,
    IRiskFormSubmissionModel
  >('risk_form_submissions', loadRiskFormSubmissions(models, subdomain));
  models.RiskAssessmentConfigs = db.model<
    IRiskAssessmentsConfigDocument,
    IRiskAssessmentsConfigModel
  >('risk_assessments_configs', loadRiskAssessmentConfig(models, subdomain));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
