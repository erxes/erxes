import {
  replacePlaceHolders,
  setProperty
} from '@erxes/api-utils/src/automations';
import { generateModels } from '../connectionResolver';
import { actionCreate } from './createAction';
import { getItems } from './getItems';
import { getRelatedValue } from './getRelatedValue';
import { sendCommonMessage } from '../messageBroker';

export default {
  checkCustomTrigger: async ({ subdomain, data }) => {
    const { collectionType, target, config } = data;
    const models = await generateModels(subdomain);

    if (collectionType === 'task.probability') {
      const { boardId, pipelineId, stageId, probability } = config || {};

      if (!probability) {
        return false;
      }

      const filter = { _id: target?.stageId, probability };
      if (stageId && stageId !== target.stageId) {
        return false;
      }

      if (!stageId && pipelineId) {
        const stageIds = await models.Stages.find({
          pipelineId,
          probability
        }).distinct('_id');

        if (!stageIds.find((stageId) => target.stageId === stageId)) {
          return false;
        }
      }

      if (!stageId && !pipelineId && boardId) {
        const pipelineIds = await models.Pipelines.find({ boardId }).distinct(
          '_id'
        );

        const stageIds = await models.Stages.find({
          pipelineId: { $in: pipelineIds },
          probability
        }).distinct('_id');

        if (!stageIds.find((stageId) => target.stageId === stageId)) {
          return false;
        }
      }

      return !!(await models.Stages.findOne(filter));
    }

    return false;
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, collectionType, triggerType, actionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'create') {
      return actionCreate({
        models,
        subdomain,
        action,
        execution,
        collectionType
      });
    }

    const { module, rules } = action.config;

    const relatedItems = await getItems(
      subdomain,
      module,
      execution,
      triggerType
    );

    return setProperty({
      models,
      subdomain,
      getRelatedValue,
      module,
      rules,
      execution,
      relatedItems,
      sendCommonMessage,
      triggerType
    });
  },
  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, relatedValueProps }
  }) => {
    const models = generateModels(subdomain);

    return await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target: {
        ...target,
        ['createdBy.department']: '-',
        ['createdBy.branch']: '-',
        ['createdBy.phone']: '-',
        ['createdBy.email']: '-',
        ['customers.email']: '-',
        ['customers.phone']: '-',
        ['customers.fullName']: '-',
        link: '-',
        pipelineLabels: '-'
      },
      relatedValueProps,
      complexFields: ['productsData']
    });
  },
  constants: {
    triggers: [
      {
        type: 'tasks:task',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Task',
        description:
          'Start with a blank workflow that enrolls and is triggered off task'
      },
      {
        type: 'tasks:task.probability',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Task stage probability based',
        description:
          'Start with a blank workflow that triggered off task item stage probability',
        isCustom: true
      }
    ],
    actions: [
      {
        type: 'tasks:task.create',
        icon: 'file-plus-alt',
        label: 'Create task',
        description: 'Create task',
        isAvailable: true
      }
    ]
  }
};
