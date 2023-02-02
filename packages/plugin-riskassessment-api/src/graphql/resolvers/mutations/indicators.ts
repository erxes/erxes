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

  async removeUnusedRiskIndicatorForm(
    _root,
    { formIds },
    { models }: IContext
  ) {
    return await models.RiskIndicators.removeUnusedRiskIndicatorForm(formIds);
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
  async removeRiskIndicatorsGroups(_root, params, { models }: IContext) {
    return await models.IndicatorsGroups.removeGroups(params);
  },

  async addRiskIndicatorConfig(_root, params, { models }: IContext) {
    return await models.RiskIndicatorConfigs.addConfig(params);
  },

  async updateRiskIndicatorConfig(
    _root,
    { configId, doc },
    { models }: IContext
  ) {
    return await models.RiskIndicatorConfigs.updateConfig(configId, doc);
  },

  async removeRiskIndicatorConfigs(_root, { configIds }, { models }: IContext) {
    return await models.RiskIndicatorConfigs.removeConfigs(configIds);
  }
};

checkPermission(
  RiskIndicatorsMutations,
  'addRiskAssesment',
  'manageRiskIndicators'
);
checkPermission(
  RiskIndicatorsMutations,
  'removeRiskIndicators',
  'manageRiskIndicators'
);
checkPermission(
  RiskIndicatorsMutations,
  'updateRiskIndicators',
  'manageRiskIndicators'
);

export default RiskIndicatorsMutations;
