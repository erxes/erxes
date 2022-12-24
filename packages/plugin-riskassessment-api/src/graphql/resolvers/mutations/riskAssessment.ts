import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentField } from '../../../models/definitions/common';

const RiskAssessmentMutations = {
  async addRiskAssesment(
    _root,
    params: IRiskAssessmentField,
    { models }: IContext
  ) {
    const result = await models.RiskAssessment.riskAssesmentAdd(params);
    return result;
  },
  async removeRiskAssessment(_root, { _ids }, { models }: IContext) {
    const result = await models.RiskAssessment.riskAssesmentRemove(_ids);
    return result;
  },

  async updateRiskAssessment(
    _root,
    params: { doc: IRiskAssessmentField },
    { models }: IContext
  ) {
    console.log({ params });

    const result = await models.RiskAssessment.riskAssessmentUpdate(params);
    return result;
  },

  async removeUnusedRiskAssessmentForm(
    _root,
    { formIds },
    { models }: IContext
  ) {
    return await models.RiskAssessment.removeUnusedRiskAssessmentForm(formIds);
  },

  async addRiskAssesmentConfig(_root, params, { models }: IContext) {
    return await models.RiskAssessmentConfigs.addConfig(params);
  },
  async updateRiskAssessmentConfig(
    _root,
    { configId, doc },
    { models }: IContext
  ) {
    return await models.RiskAssessmentConfigs.updateConfig(configId, doc);
  },

  async removeRiskAssessmentConfigs(
    _root,
    { configIds },
    { models }: IContext
  ) {
    return await models.RiskAssessmentConfigs.removeConfigs(configIds);
  }
};

checkPermission(
  RiskAssessmentMutations,
  'addRiskAssesment',
  'manageRiskAssessment'
);
checkPermission(
  RiskAssessmentMutations,
  'removeRiskAssessment',
  'manageRiskAssessment'
);
checkPermission(
  RiskAssessmentMutations,
  'updateRiskAssessment',
  'manageRiskAssessment'
);

export default RiskAssessmentMutations;
