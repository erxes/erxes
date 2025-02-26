import { IContext } from "../../../connectionResolver";
import { checkPermission } from "@erxes/api-utils/src/permissions";
import { putCreateLog, putUpdateLog } from "../../../logUtils";
import { sendCoreMessage } from "../../../messageBroker";

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
        pipelineId: item.pipelineId
      });
      response.push(one);
    }
    return response;
  },
  async pmsRoomChangeByUser(
    _root,
    { password }: { email: string; password: string },
    { user, models, subdomain }: IContext
  ) {
    const result = await sendCoreMessage({
      subdomain,
      action: "users.checkLoginAuth",
      data: { email: user.email, password },
      isRPC: true
    });

    if (result._id) {
      return "correct";
    }
    return "failed";
  }
};
// users.checkLoginAuth
// checkPermission(configMutations, 'pmsConfigsUpdate', 'manageGeneralSettings');

export default configMutations;
