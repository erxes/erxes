import { Configs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const configMutations = {
  /**
  * Create or update config object
  * @param {String} doc.code
  * @param {[String]} doc.value
  * @return {Promise} newly created config object
  */
  configsInsert(root, doc) {
    return Configs.createOrUpdateConfig(doc);
  },
};

moduleRequireLogin(configMutations);

export default configMutations;
