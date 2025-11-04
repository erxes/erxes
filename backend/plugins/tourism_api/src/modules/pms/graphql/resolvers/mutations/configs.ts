import { IContext } from '~/connectionResolvers';

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
    { user, models, subdomain }: IContext,
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
  async pmsRoomChangeByUser(
    _root,
    { password, userId }: { userId: string; password: string },
    { user, models, subdomain }: IContext,
  ) {
    return 'changecode';
    //   const manager = await sendCoreMessage({
    //     subdomain,
    //     action: "users.findOne",
    //     data: { _id: userId },
    //     isRPC: true
    //   });

    //   if (manager) {
    //     const result = await sendCoreMessage({
    //       subdomain,
    //       action: "users.checkLoginAuth",
    //       data: { email: manager.email, password },
    //       isRPC: true
    //     });
    //     if (result._id) {
    //       return "correct";
    //     } else {
    //       return "wrong password";
    //     }
    //   } else return "user not found";
  },
};

export default configMutations;
