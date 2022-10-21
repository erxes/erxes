import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const queries = {
  async zerocodeaiGetConfig(_root, _args, { models }: IContext) {
    return models.Configs.findOne({});
  },

  async zerocodeaiTranings(_root, _args, { models }: IContext) {
    return models.Trainings.find({});
  },

  async zerocodeaiGetAnalysis(
    _root,
    { contentType, contentTypeId },
    { models }: IContext
  ) {
    const analysis = await models.Analysis.findOne({
      contentType,
      contentTypeId
    });

    if (analysis) {
      return analysis.sentiment;
    }

    return '';
  }
};

moduleRequireLogin(queries);

export default queries;
