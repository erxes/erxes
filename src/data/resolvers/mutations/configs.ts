import { Configs } from '../../../db/models';
import { IConfig } from '../../../db/models/definitions/configs';
import { moduleCheckPermission } from '../../permissions';

const configMutations = {
  /**
   * Create or update config object
   */
  configsInsert(_root, doc: IConfig) {
    return Configs.createOrUpdateConfig(doc);
  },
};

moduleCheckPermission(configMutations, 'manageGeneralSettings');

export default configMutations;
