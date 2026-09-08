import { IContext } from '~/connectionResolvers';
import { SeniorityRuleInput } from '../../../db/models/SeniorityRules';
import { validateSeniorityRuleInput } from '../validators';

export const seniorityRuleMutations = {
  async hrmSeniorityRulesCreate(
    _root: undefined,
    { doc }: { doc: SeniorityRuleInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.SeniorityRules.createSeniorityRule(
      validateSeniorityRuleInput(doc),
    );
  },

  async hrmSeniorityRulesUpdate(
    _root: undefined,
    { _id, doc }: { _id: string; doc: SeniorityRuleInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.SeniorityRules.updateSeniorityRule(
      _id,
      validateSeniorityRuleInput(doc),
    );
  },

  async hrmSeniorityRulesArchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.SeniorityRules.archiveSeniorityRule(_id);
  },

  async hrmSeniorityRulesRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsRemove');
    return models.SeniorityRules.removeSeniorityRule(_id);
  },
};
