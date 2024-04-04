import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../connectionResolver';

const notificationMutations = {
  /**
   * Send mail
   */
  async imapSendMail(_root, args: any, { subdomain, models }: IContext) {
    const sendMail = await models.Messages.createSendMail(
      args,
      subdomain,
      models,
    );
    return sendMail;
  },
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
