import { IContext } from "../../connectionResolver";
import { IBotDocument } from "../../models/definitions/bots";
import { graphRequest } from "../../utils";

export default {
  async account(bot: IBotDocument, _args, { models }: IContext) {
    return models.Accounts.findOne({ _id: bot.accountId }).select({
      name: 1
    });
  },

  async page({ token, pageId }: IBotDocument, _args, { models }: IContext) {
    try {
      const response: any = await graphRequest.get(
        `/${pageId}?fields=name`,
        token
      );
      return response ? response : null;
    } catch (error) {
      return null;
    }
  },

  async profileUrl({ pageId, token }: IBotDocument) {
    try {
      const response: any = await graphRequest.get(
        `/${pageId}/picture?height=600`,
        token
      );

      if (!response) {
        return null;
      }

      return response?.location || null;
    } catch (err) {
      return null;
    }
  }
};
