import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

import {
  IRiskAssessmentCategoryDocument,
  IRiskAssessmentsDocument,
  IRiskAssessmentIndicatorsDocument,
  riskAssessmentIndicatorsGroupsSchema,
  riskAssessmentIndicatorsSchema
} from './models/definitions/riskassessment';
import {
  IIndicatorsGroupsDocument,
  IRiskIndicatorsConfigsDocument,
  IRiskIndicatorsDocument
} from './models/definitions/indicator';
import { IRiskFormSubmissionDocument } from './models/definitions/confimity';
import {
  IRiskFormSubmissionModel,
  loadRiskFormSubmissions
} from './models/FormSubmissions';
import {
  IIndicatorsGroupsModel,
  IRiskIndicatorsModel,
  loadIndicatorsGroups,
  loadRiskIndicators
} from './models/RiskIndicator';
import {
  IRiskAssessmentCategoryModel,
  loadAssessmentCategory
} from './models/Category';
import {
  IRiskIndicatorsConfigModel,
  loadRiskIndicatorConfig
} from './models/Configs';
import {
  IRiskAssessmentsModel,
  loadRiskAssessments
} from './models/RiskAssessment';
import { IOperationsModel, loadOperations } from './models/Operations';
import { IOperationsDocument } from './models/definitions/operations';

export interface IModels {
  RiskIndicators: IRiskIndicatorsModel;
  RiskAssessments: IRiskAssessmentsModel;
  RiskAssessmentIndicators: Model<any>;
  RiskAssessmentGroups: Model<any>;
  RiskAssessmentCategory: IRiskAssessmentCategoryModel;
  RiksFormSubmissions: IRiskFormSubmissionModel;
  RiskIndicatorConfigs: IRiskIndicatorsConfigModel;
  Operations: IOperationsModel;
  IndicatorsGroups: IIndicatorsGroupsModel;
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

  models.RiskAssessments = db.model<
    IRiskAssessmentsDocument,
    IRiskAssessmentsModel
  >('risk_assessments', loadRiskAssessments(models, subdomain));

  models.RiskAssessmentIndicators = db.model<
    IRiskAssessmentIndicatorsDocument,
    any
  >('risk_assessment_indicators', riskAssessmentIndicatorsSchema);
  models.RiskAssessmentGroups = db.model<any, any>(
    'risk_assessment_groups',
    riskAssessmentIndicatorsGroupsSchema
  );

  models.RiksFormSubmissions = db.model<
    IRiskFormSubmissionDocument,
    IRiskFormSubmissionModel
  >('risk_form_submissions', loadRiskFormSubmissions(models, subdomain));

  models.RiskIndicatorConfigs = db.model<
    IRiskIndicatorsConfigsDocument,
    IRiskIndicatorsConfigModel
  >('risk_indicators_configs', loadRiskIndicatorConfig(models, subdomain));

  models.IndicatorsGroups = db.model<
    IIndicatorsGroupsDocument,
    IIndicatorsGroupsModel
  >('risk_indicators_groups', loadIndicatorsGroups(models, subdomain));

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
