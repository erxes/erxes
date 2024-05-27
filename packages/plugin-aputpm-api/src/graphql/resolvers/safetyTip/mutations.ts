import { IContext } from '../../../connectionResolver';

const SafetyTipMutations = {
  async addSafetyTip(_root, params, { models }: IContext) {
    return await models.SafetyTips.addSafetyTip(params);
  },
  async updateSafetyTip(_root, params, { models }: IContext) {
    return await models.SafetyTips.updateSafetyTip(params);
  },
  async removeSafetyTip(_root, params, { models }: IContext) {
    return await models.SafetyTips.removeSafetyTip(params._id);
  }
};

export default SafetyTipMutations;
