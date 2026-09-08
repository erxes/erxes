import { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';
import { IHrmConfigDocument } from './modules/settings/@types/config';
import { IContributionProfileDocument } from './modules/settings/@types/contributionProfile';
import { IGradeDocument } from './modules/settings/@types/grade';
import { ISeniorityRuleDocument } from './modules/settings/@types/seniorityRule';
import { ISkillDocument } from './modules/settings/@types/skill';
import {
  IConfigModel,
  loadConfigClass,
} from './modules/settings/db/models/Configs';
import {
  IContributionProfileModel,
  loadContributionProfileClass,
} from './modules/settings/db/models/ContributionProfiles';
import {
  IGradeModel,
  loadGradeClass,
} from './modules/settings/db/models/Grades';
import {
  ISeniorityRuleModel,
  loadSeniorityRuleClass,
} from './modules/settings/db/models/SeniorityRules';
import {
  ISkillModel,
  loadSkillClass,
} from './modules/settings/db/models/Skills';

export interface IModels {
  Configs: IConfigModel;
  ContributionProfiles: IContributionProfileModel;
  Grades: IGradeModel;
  SeniorityRules: ISeniorityRuleModel;
  Skills: ISkillModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  commonQuerySelector: unknown;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventHandlers: ScopedEventHandlers,
): IModels => {
  const models = {} as IModels;
  const hrmEventHandlers = eventHandlers('hrm');

  models.Configs = db.model<IHrmConfigDocument, IConfigModel>(
    'hrm_configs',
    loadConfigClass(
      models,
      subdomain,
      hrmEventHandlers('hrm', 'hrm_configs'),
    ),
  );

  models.ContributionProfiles = db.model<
    IContributionProfileDocument,
    IContributionProfileModel
  >(
    'hrm_contribution_profiles',
    loadContributionProfileClass(
      models,
      hrmEventHandlers('hrm', 'hrm_contribution_profiles'),
    ),
  );

  models.Grades = db.model<IGradeDocument, IGradeModel>(
    'hrm_grades',
    loadGradeClass(models, hrmEventHandlers('hrm', 'hrm_grades')),
  );

  models.SeniorityRules = db.model<
    ISeniorityRuleDocument,
    ISeniorityRuleModel
  >(
    'hrm_seniority_rules',
    loadSeniorityRuleClass(
      models,
      hrmEventHandlers('hrm', 'hrm_seniority_rules'),
    ),
  );

  models.Skills = db.model<ISkillDocument, ISkillModel>(
    'hrm_skills',
    loadSkillClass(models, hrmEventHandlers('hrm', 'hrm_skills')),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
