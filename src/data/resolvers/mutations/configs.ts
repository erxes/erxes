import { Configs } from '../../../db/models';
import { IConfig } from '../../../db/models/definitions/configs';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

const configMutations = {
  /**
   * Create or update config object
   */
  configsInsert(_root, doc: IConfig) {
    return Configs.createOrUpdateConfig(doc);
  },

  engagesConfigSave(_root, args, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesConfigSave(args);
  },
};

moduleCheckPermission(configMutations, 'manageGeneralSettings');

export default configMutations;
