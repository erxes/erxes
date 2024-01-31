import { IContext } from '../../connectionResolver';
import { debugError } from '../../debuggers';
import { IBotDocument } from '../../models/definitions/bots';
import {
  getPageAccessTokenFromMap,
  getPageList,
  graphRequest,
} from '../../utils';

export default {
  account(bot: IBotDocument, _args, { models }: IContext) {
    return models.Accounts.findOne({ _id: bot.accountId }).select({
      name: 1,
      kind: 1,
    });
  },

  async page({ accountId, pageId }: IBotDocument, _args, { models }: IContext) {
    const account = await models.Accounts.findOne({ _id: accountId });

    if (!account) {
      return null;
    }

    const accessToken = account.token;

    const pages = await getPageList(models, accessToken, 'facebook-messenger');

    if (!pages?.length) {
      return null;
    }

    const page = pages.find((page) => page.id === pageId);

    return page ? page : null;
  },

  async profileUrl(
    { pageId, integrationId }: IBotDocument,
    _args,
    { models }: IContext,
  ) {
    const integration = await models.Integrations.findOne({
      _id: integrationId,
    });

    if (!integration) {
      return null;
    }

    const { facebookPageTokensMap = {} } = integration;

    let pageAccessToken;
    try {
      pageAccessToken = getPageAccessTokenFromMap(
        pageId,
        facebookPageTokensMap,
      );
    } catch (e) {
      debugError(
        `Error occurred while getting page access token: ${e.message}`,
      );
      throw new Error();
    }
    const response: any = await graphRequest.get(
      `/${pageId}/picture?height=600`,
      pageAccessToken,
    );

    if (!response) {
      return null;
    }

    return response?.location || null;
  },
};
