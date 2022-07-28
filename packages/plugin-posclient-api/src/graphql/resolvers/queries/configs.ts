import { IContext } from '../../../connectionResolver';

const configQueries = {
  currentConfig(_root, _args, { models }: IContext) {
    return models.Configs.findOne();
  },

  poscSlots(_root, _args, { models }: IContext) {
    return models.PosSlots.find().lean();
  }
};

export default configQueries;
