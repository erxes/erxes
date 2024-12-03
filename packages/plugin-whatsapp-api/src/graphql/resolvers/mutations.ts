import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateConfigs } from '../../helpers';
import { sendInboxMessage } from '../../messageBroker';
import { sendReply } from '../../utils';

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

    return { status: 'ok' };
  },
  async whatsappRepair(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext
  ) {
    await repairIntegrations(subdomain, models, _id);

    return 'success';
  }
};

export default whatsappMutations;
