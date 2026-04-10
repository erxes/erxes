import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const salesBoardQueries = {
  async salesBoards(_root: undefined, _args: undefined, { subdomain }: IContext) {
    const result = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'boards',
      action: 'find',
      input: {},
      defaultValue: [],
    });

    return Array.isArray(result) ? result : [];
  },

  async salesPipelines(
    _root: undefined,
    { boardId }: { boardId?: string },
    { subdomain }: IContext,
  ) {
    const result = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'pipelines',
      action: 'find',
      input: boardId ? { boardId } : {},
      defaultValue: [],
    });

    return Array.isArray(result) ? result : [];
  },

  async salesStages(
    _root: undefined,
    { pipelineId }: { pipelineId: string },
    { subdomain }: IContext,
  ) {
    const result = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'stages',
      action: 'find',
      input: { pipelineId },
      defaultValue: [],
    });

    return Array.isArray(result) ? result : [];
  },
};
