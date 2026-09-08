import { IContext } from '~/connectionResolvers';
import {
  SeniorityRuleListParams,
  seniorityRuleSelector,
} from '../../../db/models/SeniorityRules';
import { pager } from '../utils';

export const seniorityRuleQueries = {
  async hrmSeniorityRuleDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.SeniorityRules.getSeniorityRule(_id);
  },

  async hrmSeniorityRuleByCode(
    _root: undefined,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.SeniorityRules.getSeniorityRuleByCode(code);
  },

  async hrmSeniorityRules(
    _root: undefined,
    params: SeniorityRuleListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    const pagination = pager(params);

    return models.SeniorityRules.find(seniorityRuleSelector(params))
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
  },

  async hrmSeniorityRulesCount(
    _root: undefined,
    params: SeniorityRuleListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.SeniorityRules.find(
      seniorityRuleSelector(params),
    ).countDocuments();
  },
};
