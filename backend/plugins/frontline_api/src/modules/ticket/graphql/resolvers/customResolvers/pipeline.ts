import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ITicketPipelineDocument } from '~/modules/ticket/@types/pipeline';

export const Pipeline = {
  async createdUser(pipeline: ITicketPipelineDocument) {
    return sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { query: { _id: pipeline.userId } },
    });
  },
};
