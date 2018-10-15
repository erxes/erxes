import { Configs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const configQueries = {
  /**
   * Config object
   */
  configsDetail(_root, { code }: { code: string }) {
    return Configs.findOne({ code });
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
