import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ITicketPipelineDocument } from '~/modules/ticket/@types/pipeline';

export const Pipeline = {
  async createdUser(subdomain: string, pipeline: ITicketPipelineDocument) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { query: { _id: pipeline.userId } },
    });
  },
};
