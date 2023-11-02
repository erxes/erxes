import { IContext } from '../../../messageBroker';

const msdynamicQueries = {
  async msdynamicConfigs(_root, _args, { models }: IContext) {
    return await models.Msdynamics.find({});
  },

  async msdynamicsTotalCount(_root, _args, { models }: IContext) {
    return models.Msdynamics.find({}).countDocuments();
  }
};

export default msdynamicQueries;
