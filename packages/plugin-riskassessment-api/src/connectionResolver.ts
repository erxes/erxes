import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import {
  IRiskAssessmentCategoryDocument,
  IRiskAssessmentsDocument,
  IRiskAssessmentIndicatorsDocument,
  IRiskAssessmentIndicatorFormsDocument
} from './models/definitions/riskassessment';
import {
  IRiskIndicatorsConfigsDocument,
  IRiskIndicatorsDocument
} from './models/definitions/indicator';
import {
  IRiskConformityDocument,
  IRiskFormSubmissionDocument
} from './models/definitions/confimity';
import {
  IRiskFormSubmissionModel,
  loadRiskFormSubmissions
} from './models/FormSubmissions';
import {
  IRiskIndicatorsModel,
  loadRiskIndicators
} from './models/RiskIndicator';
import {
  IRiskAssessmentCategoryModel,
  loadAssessmentCategory
} from './models/Category';
import { IRiskConformityModel, loadRiskConformity } from './models/Confirmity';
import {
  IRiskIndicatorsConfigModel,
  loadRiskIndicatorConfig
} from './models/Configs';
import {
  IRiskAssessmentsModel,
  loadRiskAssessments,
  IRiskAssessmentIndicatorsModel,
  loadRiskAssessmentIndicator,
  IRiskAssessmentIndicatorFormsModel,
  loadRiskAssessmentIndicatorForms
} from './models/RiskAssessment';
import { IOperationsModel, loadOperations } from './models/Operations';
import { IOperationsDocument } from './models/definitions/operations';

export interface IModels {
  RiskIndicators: IRiskIndicatorsModel;
  RiskAssessments: IRiskAssessmentsModel;
  RiskAssessmentIndicators: IRiskAssessmentIndicatorsModel;
  RiskAssessmentIndicatorForms: IRiskAssessmentIndicatorFormsModel;
  RiskAssessmentCategory: IRiskAssessmentCategoryModel;
  RiskConformity: IRiskConformityModel;
  RiksFormSubmissions: IRiskFormSubmissionModel;
  RiskIndicatorConfigs: IRiskIndicatorsConfigModel;
  Operations: IOperationsModel;
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
  models.RiskIndicators = db.model<
    IRiskIndicatorsDocument,
    IRiskIndicatorsModel
  >('risk_indicator', loadRiskIndicators(models, subdomain));
  models.RiskAssessmentCategory = db.model<
    IRiskAssessmentCategoryDocument,
    IRiskAssessmentCategoryModel
  >('risk_assessment_category', loadAssessmentCategory(models, subdomain));
  models.RiskConformity = db.model<
    IRiskConformityDocument,
    IRiskConformityModel
  >('risk_assessment_conformity', loadRiskConformity(models, subdomain));
  models.RiskAssessments = db.model<
    IRiskAssessmentsDocument,
    IRiskAssessmentsModel
  >('risk_assessments', loadRiskAssessments(models, subdomain));
  models.RiskAssessmentIndicators = db.model<
    IRiskAssessmentIndicatorsDocument,
    IRiskAssessmentIndicatorsModel
  >(
    'risk_assessment_indicators',
    loadRiskAssessmentIndicator(models, subdomain)
  );
  models.RiskAssessmentIndicatorForms = db.model<
    IRiskAssessmentIndicatorFormsDocument,
    IRiskAssessmentIndicatorFormsModel
  >(
    'risk_assessment_indicator_forms',
    loadRiskAssessmentIndicatorForms(models, subdomain)
  );
  models.RiksFormSubmissions = db.model<
    IRiskFormSubmissionDocument,
    IRiskFormSubmissionModel
  >('risk_form_submissions', loadRiskFormSubmissions(models, subdomain));
  models.RiskIndicatorConfigs = db.model<
    IRiskIndicatorsConfigsDocument,
    IRiskIndicatorsConfigModel
  >('risk_indicators_configs', loadRiskIndicatorConfig(models, subdomain));

  models.Operations = db.model<IOperationsDocument, IOperationsModel>(
    'operations',
    loadOperations(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
