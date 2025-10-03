import { IContext } from '~/connectionResolvers';

export const imapMutations = {
  /**
   * Send mail
   */
  async imapSendMail(_root, args: any, { subdomain, models }: IContext) {
    const sendMail = await models.ImapMessages.createSendMail(
      args,
      subdomain,
      models,
    );
    return sendMail;
  },
};
