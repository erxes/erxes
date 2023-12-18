import { IBotDocument } from '../../models/definitions/bots';
import { IContext } from '../../connectionResolver';
import { getPageList } from '../../utils';

export default {
  account(bot: IBotDocument, _args, { models }: IContext) {
    return models.Accounts.findOne({ _id: bot.accountId }).select({
      name: 1,
      kind: 1
    });
  },

  async page({ accountId, pageId }: IBotDocument, _args, { models }: IContext) {
    const account = await models.Accounts.getAccount({ _id: accountId });
    const accessToken = account.token;

    const pages = await getPageList(models, accessToken, 'facebook-messenger');

    if (!pages?.length) {
      return null;
    }

    const page = pages.find(page => page.id === pageId);

    return page ? page : null;
  }
};
