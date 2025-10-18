import { requireLogin } from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITicketPipelineUpdate } from '@/ticket/@types/pipeline';

export const PipelineMutations = {
  createPipeline: async (
    _parent: undefined,
    params: ITicketPipelineUpdate,
    { models, user }: IContext,
  ) => {
    const pipeline = await models.Pipeline.addPipeline({
      ...params,
      createdBy: user._id,
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
    { models }: IContext,
  ) => {
    const updatedPipeline = await models.Pipeline.updatePipeline(
      params._id,
      params,
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
    { models }: IContext,
  ) => {
    const pipeline = await models.Pipeline.getPipeline(_id);
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

// Require login
requireLogin(PipelineMutations, 'createPipeline');
requireLogin(PipelineMutations, 'updatePipeline');
requireLogin(PipelineMutations, 'removePipeline');
