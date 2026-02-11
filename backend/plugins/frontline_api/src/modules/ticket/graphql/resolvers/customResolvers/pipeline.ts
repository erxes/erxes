import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITicketPipelineDocument } from '~/modules/ticket/@types/pipeline';

export const Pipeline = {
  async createdUser(
    pipeline: ITicketPipelineDocument,
    _,
    { subdomain, processId, user, cpUser }: IContext,
  ) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { query: { _id: pipeline.userId } },
      context: {
        processId,
        userId: user._id,
        cpUserId: cpUser?._id,
      },
    });
  },
};
