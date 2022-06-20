import { Configs } from '../../../models/Configs';

const configQueries = {
  currentConfig() {
    return Configs.findOne();
  }
};

export default configQueries;
