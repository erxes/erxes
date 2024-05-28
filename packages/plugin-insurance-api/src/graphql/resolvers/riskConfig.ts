import { IContext } from '../../connectionResolver';

const RiskConfig = {
  async risk(config, _params, { models }: IContext) {
    return models.Risks.findOne({ _id: config.riskId }).lean();
  }
};

export { RiskConfig };
