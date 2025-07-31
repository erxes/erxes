import {
  replacePlaceHolders,
  setProperty
} from '@erxes/api-utils/src/automations';
import { generateModels, IModels } from '../connectionResolver';
import { actionCreate } from './createAction';
import { createChecklist } from './createChecklist';
import { getItems } from './getItems';
import { sendCommonMessage } from '../messageBroker';
import { getRelatedValue } from './getRelatedValue';
import { IDeal } from '../models/definitions/deals';

export default {
  checkCustomTrigger: async ({ subdomain, data }) => {
    const { collectionType, target, config } = data;
    const models = await generateModels(subdomain);

    if (collectionType === 'deal.probability') {
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
      if (collectionType === 'checklist') {
        return createChecklist(models, execution, action);
      }

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
        type: 'sales:deal',
        img: 'automation3.svg',
        icon: 'piggy-bank',
        label: 'Sales pipeline',
        description:
          'Start with a blank workflow that enrolls and is triggered off sales pipeline item'
      },
      {
        type: 'sales:deal.probability',
        img: 'automation3.svg',
        icon: 'piggy-bank',
        label: 'Sales pipelines stage probability based',
        description:
          'Start with a blank workflow that triggered off sales pipeline item stage probability',
        isCustom: true
      }
    ],
    actions: [
      {
        type: 'sales:deal.create',
        icon: 'piggy-bank',
        label: 'Create deal',
        description: 'Create deal',
        isAvailable: true,
        isAvailableOptionalConnect: true
      },
      {
        type: 'sales:checklist.create',
        icon: 'piggy-bank',
        label: 'Create sales checklist',
        description: 'Create sales checklist',
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
  target: IDeal;
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
