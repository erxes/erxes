import { IOrderInput } from 'erxes-api-shared/core-types';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  IPipeline,
  IPipelineDocument,
  IStageDocument,
} from '~/modules/sales/@types';
import { checkNumberConfig } from '~/modules/sales/utils';
import { validatePipelinePropertyIds } from '~/modules/sales/utils/pipelineProperties';

export const pipelineMutations = {
  /**
   * Create new pipeline
   */
  async salesPipelinesAdd(
    _root,
    { stages, ...doc }: IPipeline & { stages: IStageDocument[] },
    { user, models, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('pipelinesAdd');
    if (doc.numberConfig || doc.numberSize) {
      await checkNumberConfig(doc.numberConfig || '', doc.numberSize || '');
    }

    // await sendCoreMessage({
    //   subdomain,
    //   action: "registerOnboardHistory",
    //   data: {
    //     type: `${doc.type}PipelineConfigured`,
    //     user
    //   }
    // });

    const propertyIds = await validatePipelinePropertyIds(
      subdomain,
      doc.propertyIds,
    );

    return await models.Pipelines.createPipeline(
      {
        userId: user._id,
        ...doc,
        propertyIds,
        isPropertySelectionConfigured: doc.propertyIds !== undefined,
      },
      stages,
    );
  },

  /**
   * Edit pipeline
   */
  async salesPipelinesEdit(
    _root,
    { _id, stages, ...doc }: IPipelineDocument & { stages: IStageDocument[] },
    { models, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('pipelinesEdit');
    if (doc.numberConfig || doc.numberSize) {
      await checkNumberConfig(doc.numberConfig || '', doc.numberSize || '');
    }

    const propertyIds =
      doc.propertyIds === undefined
        ? undefined
        : await validatePipelinePropertyIds(subdomain, doc.propertyIds);

    return await models.Pipelines.updatePipeline(
      _id,
      {
        ...doc,
        ...(propertyIds !== undefined && {
          propertyIds,
          isPropertySelectionConfigured: true,
        }),
      },
      stages,
    );
  },

  /**
   * Update pipeline orders
   */
  async salesPipelinesUpdateOrder(
    _root,
    { orders }: { orders: IOrderInput[] },
    { models }: IContext,
  ) {
    return models.Pipelines.updateOrder(orders);
  },

  /**
   * Watch pipeline
   */
  async salesPipelinesWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('pipelinesWatch');
    return models.Pipelines.watchPipeline(_id, isAdd, user._id);
  },

  /**
   * Remove pipeline
   */
  async salesPipelinesRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) {
    const pipeline = await models.Pipelines.getPipeline(_id);

    const relatedFieldsGroups = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'fieldsGroups',
      action: 'find',
      input: {
        query: {
          pipelineIds: pipeline._id,
        },
      },
      defaultValue: [],
    });

    for (const fieldGroup of relatedFieldsGroups) {
      const pipelineIds = fieldGroup.pipelineIds || [];
      fieldGroup.pipelineIds = pipelineIds.filter((e) => e !== pipeline._id);

      await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'mutation',
        module: 'fieldsGroups', // ??
        action: 'updateGroup',
        input: {
          groupId: fieldGroup._id,
          fieldGroup,
        },
      });
    }

    return await models.Pipelines.removePipeline(_id);
  },

  /**
   * Archive pipeline
   */
  async salesPipelinesArchive(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    await models.Pipelines.archivePipeline(_id, user._id);

    const pipeline = await models.Pipelines.getPipeline(_id);

    await graphqlPubsub.publish('salesPipelineListChanged', {
      salesPipelineListChanged: {
        _id,
        action: 'statusChanged',
        data: {
          boardId: pipeline.boardId,
          status: pipeline.status,
        },
      },
    });

    return true;
  },

  /**
   * Duplicate pipeline
   */
  async salesPipelinesCopied(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const sourcePipeline = await models.Pipelines.getPipeline(_id);
    const sourceStages = await models.Stages.find({ pipelineId: _id }).lean();

    const pipelineDoc = {
      ...sourcePipeline.toObject(),
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      __v: undefined,
      status: sourcePipeline.status || 'active',
      name: `${sourcePipeline.name}-copied`,
    };

    const copied = await models.Pipelines.createPipeline(pipelineDoc);

    for (const stage of sourceStages) {
      const { _id, createdAt, updatedAt, __v, ...rest } = stage as any;

      await models.Stages.createStage({
        ...rest,
        probability: stage.probability || '10%',
        pipelineId: copied._id,
        type: stage.type || sourcePipeline.type || 'deal',
      });
    }

    return copied;
  },
};
