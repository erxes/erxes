import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskIndicatorsField } from '../../../models/definitions/common';

const RiskIndicatorsMutations = {
  async addRiskIndicator(
    _root,
    params: IRiskIndicatorsField,
    { models }: IContext
  ) {
    const result = await models.RiskIndicators.riskIndicatorAdd(params);
    return result;
  },
  async removeRiskIndicators(_root, { _ids }, { models }: IContext) {
    return await models.RiskIndicators.riskIndicatorRemove(_ids);
  },

  async updateRiskIndicator(
    _root,
    { _id, ...doc }: IRiskIndicatorsField,
    { models }: IContext
  ) {
    const result = await models.RiskIndicators.riskIndicatorUpdate(_id, doc);
    return result;
  },

  async removeRiskIndicatorUnusedForms(
    _root,
    { formIds },
    { models }: IContext
  ) {
    return await models.RiskIndicators.removeRiskIndicatorUnusedForms(formIds);
  },

  async addRiskIndicatorsGroups(_root, params, { models }: IContext) {
    return await models.IndicatorsGroups.addGroup(params);
  },
  async updateRiskIndicatorsGroups(
    _root,
    { _id, ...doc },
    { models }: IContext
  ) {
    return await models.IndicatorsGroups.updateGroup(_id, doc);
  },
  async removeRiskIndicatorsGroups(_root, { ids }, { models }: IContext) {
    return await models.IndicatorsGroups.removeGroups(ids);
  },

  async addRiskAssessmentConfig(_root, params, { models }: IContext) {
    return await models.RiskAssessmentsConfigs.addConfig(params);
  },

  async updateRiskAssessmentConfig(
    _root,
    { configId, doc },
    { models }: IContext
  ) {
    return await models.RiskAssessmentsConfigs.updateConfig(configId, doc);
  },

  async removeRiskAssessmentConfigs(
    _root,
    { configIds },
    { models }: IContext
  ) {
    return await models.RiskAssessmentsConfigs.removeConfigs(configIds);
  }
};

checkPermission(
  RiskIndicatorsMutations,
  'addRiskAssesment',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'removeRiskIndicators',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'updateRiskIndicators',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'updateRiskIndicatorsGroups',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'removeRiskIndicatorsGroups',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'addRiskIndicatorsGroups',
  'manageRiskAssessment'
);

checkPermission(
  RiskIndicatorsMutations,
  'addRiskIndicatorConfig',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'updateRiskIndicatorConfig',
  'manageRiskAssessment'
);
checkPermission(
  RiskIndicatorsMutations,
  'removeRiskIndicatorConfigs',
  'manageRiskAssessment'
);
export default RiskIndicatorsMutations;
