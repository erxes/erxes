import {
  replacePlaceHolders,
  setProperty
} from '@erxes/api-utils/src/automations';
import { generateModels, IModels } from '../connectionResolver';
import { ITicket } from '../models/definitions/tickets';
import { actionCreate } from './actionCreate';
import { getRelatedValue } from './getRelatedValue';
import { sendCommonMessage } from '../messageBroker';
import { getItems } from './getItems';

export default {
  checkCustomTrigger: async ({ subdomain, data }) => {
    const { collectionType, target, config } = data;
    const models = await generateModels(subdomain);

    if (collectionType === 'ticket.probability') {
      return checkTriggerDealStageProbality({ models, target, config });
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
      triggerType.split('.')[0]
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
    const models = await generateModels(subdomain);

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
        ['createdBy.fullName']: '-',
        ['createdBy.email']: '-',
        ['customers.email']: '-',
        ['customers.phone']: '-',
        ['customers.fullName']: '-',
        ['branches.title']: '-',
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
        type: 'tickets:ticket',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Ticket',
        description:
          'Start with a blank workflow that enrolls and is triggered off ticket'
      },
      {
        type: 'tickets:ticket.probability',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Ticket stage probability based',
        description:
          'Start with a blank workflow that triggered off ticket item stage probability',
        isCustom: true
      }
    ],
    actions: [
      {
        type: 'tickets:ticket.create',
        icon: 'file-plus-alt',
        label: 'Create ticket',
        description: 'Create ticket',
        isAvailable: true
      }
    ]
  }
};

const checkTriggerDealStageProbality = async ({
  models,
  target,
  config
}: {
  models: IModels;
  target: ITicket;
  config: any;
}) => {
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
};
