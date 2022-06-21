import { IContext } from '../../../connectionResolver';

const configQueries = {
  currentConfig(_root, _args, { models }: IContext) {
    return models.Configs.findOne();
  }
};

export default configQueries;
