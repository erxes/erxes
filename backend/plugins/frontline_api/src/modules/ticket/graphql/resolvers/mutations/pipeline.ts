import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ChannelMemberRoles } from '@/channel/@types/channel';
import { checkUserRole } from '@/channel/utils';
import { ITicketPipelineUpdate } from '@/ticket/@types/pipeline';
import { validatePipelineCreateLayout } from '@/ticket/utils/pipelineCreateLayout';

// Same rule as channel edits: a pipeline is part of its channel's settings.
const checkCanManageChannels = async (
  { models, user }: IContext,
  channelIds: string[],
) => {
  if (!user) {
    throw new Error('Authentication required');
  }

  if (user.isOwner) {
    return;
  }

  for (const channelId of new Set(channelIds)) {
    await checkUserRole({
      models,
      channelId,
      userId: user._id,
      allowedRoles: [ChannelMemberRoles.ADMIN],
    });
  }
};

export const pipelineMutations = {
  createPipeline: async (
    _parent: undefined,
    params: ITicketPipelineUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    const createLayout = await validatePipelineCreateLayout(
      subdomain,
      params.createLayout,
    );

    const pipeline = await models.Pipeline.addPipeline({
      ...params,
      createLayout,
      userId: user._id,
    });

    graphqlPubsub.publish(`ticketPipelineChanged:${pipeline._id}`, {
      ticketPipelineChanged: { type: 'create', pipeline },
    });
    graphqlPubsub.publish('ticketPipelineListChanged', {
      ticketPipelineListChanged: { type: 'create', pipeline },
    });

    return pipeline;
  },

  updatePipeline: async (
    _parent: undefined,
    params: ITicketPipelineUpdate & { _id: string },
    context: IContext,
  ) => {
    const { models, user, subdomain } = context;
    const pipeline = await models.Pipeline.getPipeline(params._id);

    // Moving it to another channel needs that channel's admin too.
    await checkCanManageChannels(context, [
      pipeline.channelId,
      ...(params.channelId ? [params.channelId] : []),
    ]);

    const createLayout =
      params.createLayout === undefined
        ? undefined
        : await validatePipelineCreateLayout(subdomain, params.createLayout);
    const updatedPipeline = await models.Pipeline.updatePipeline(
      params._id,
      {
        ...params,
        ...(createLayout !== undefined && { createLayout }),
      },
      user,
    );

    graphqlPubsub.publish(`ticketPipelineChanged:${updatedPipeline?._id}`, {
      ticketPipelineChanged: { type: 'update', pipeline: updatedPipeline },
    });
    graphqlPubsub.publish('ticketPipelineListChanged', {
      ticketPipelineListChanged: { type: 'update', pipeline: updatedPipeline },
    });

    return updatedPipeline;
  },

  removePipeline: async (
    _parent: undefined,
    { _id }: { _id: string },
    context: IContext,
  ) => {
    const { models } = context;
    const pipeline = await models.Pipeline.getPipeline(_id);

    await checkCanManageChannels(context, [pipeline.channelId]);

    const deletedPipeline = await models.Pipeline.removePipeline(_id);

    graphqlPubsub.publish(`ticketPipelineChanged:${_id}`, {
      ticketPipelineChanged: { type: 'delete', pipeline },
    });
    graphqlPubsub.publish('ticketPipelineListChanged', {
      ticketPipelineListChanged: { type: 'delete', pipeline },
    });

    return deletedPipeline;
  },
};
