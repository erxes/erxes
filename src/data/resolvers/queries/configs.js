import { Configs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const configQueries = {
  /**
   * Config object
   * @param {Object} args
   * @param {Strign} args.code
   * @return {Promise} filtered config object by code
   */
  configsDetail(root, { code }) {
    return Configs.findOne({ code });
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
