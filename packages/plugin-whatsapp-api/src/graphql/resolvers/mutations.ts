import { IContext } from "../../connectionResolver";
import { repairIntegrations, updateConfigs } from "../../helpers";
import { sendInboxMessage } from "../../messageBroker";
import { sendReply } from "../../utils";

interface ICommentStatusParams {
  commentId: string;
}

interface IReplyParams extends ICommentStatusParams {
  conversationId: string;
  content: string;
  attachments: any;
}

const whatsappMutations = {
  async whatsappUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: "ok" };
  },
  async whatsappRepair(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext
  ) {
    await repairIntegrations(subdomain, models, _id);

    return "success";
  },
  async whatsappMessengerAddBot(_root, args, { models }: IContext) {
    return await models.Bots.addBot(args);
  },
  async whatsappMessengerUpdateBot(
    _root,
    { _id, ...args },
    { models }: IContext
  ) {
    return await models.Bots.updateBot(_id, args);
  },
  async whatsappMessengerRemoveBot(_root, { _id }, { models }: IContext) {
    return await models.Bots.removeBot(_id);
  },
  async whatsappMessengerRepairBot(_root, { _id }, { models }: IContext) {
    return await models.Bots.repair(_id);
  }
};

export default whatsappMutations;
