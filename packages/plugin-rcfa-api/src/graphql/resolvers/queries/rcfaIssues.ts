import { generateModels, IContext, IModels } from '../../../connectionResolver';

const RCFAIssuesQueries = {
  async rcfaIssues(_root, { mainType, mainTypeId }, { models }: IContext) {
    const rcfa = await models.RCFA.findOne({ mainType, mainTypeId });

    if (!rcfa) {
      throw new Error('RCFA not found');
    }

    return models.Issues.find({ rcfaId: rcfa._id });
  }
};

export default RCFAIssuesQueries;
