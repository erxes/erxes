import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putUpdateLog } from '../../../logUtils';

type ConfigInput = {
  value: string;
  code: string;
  pipelineId: string;
};
const configMutations = {
  /**
   * Create or update config object
   */

  async pmsConfigsUpdate(
    _root,
    { list }: { list: [ConfigInput] },
    { user, models, subdomain }: IContext
  ) {
    const response: any = [];
    for (const item of list) {
      if (!item) {
        continue;
      }

      await models.Configs.createOrUpdateConfig(item);
      const one = await models.Configs.findOne({
        code: item.code,
        pipelineId: item.pipelineId,
      });
      response.push(one);
    }
    return response;
  },
};

// checkPermission(configMutations, 'pmsConfigsUpdate', 'manageGeneralSettings');

export default configMutations;
