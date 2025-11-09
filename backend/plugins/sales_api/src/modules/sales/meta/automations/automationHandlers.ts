import {
  replacePlaceHolders,
  setProperty,
} from 'erxes-api-shared/core-modules';
import {
  IAutomationReceiveActionData,
  IAutomationWorkerContext,
  ICheckTriggerData,
  IReplacePlaceholdersData,
} from 'erxes-api-shared/core-types';
import { generateModels, IModels } from '~/connectionResolvers';
import { actionCreate } from '~/modules/sales/meta/automations/action/createAction';
import { createChecklist } from '~/modules/sales/meta/automations/action/createChecklist';
import { getItems } from '~/modules/sales/meta/automations/action/getItems';
import { getRelatedValue } from '~/modules/sales/meta/automations/action/getRelatedValue';
import { checkTriggerDealStageProbality } from '~/modules/sales/meta/automations/trigger/checkStageProbalityTrigger';

export const salesAutomationHandlers = {
  checkCustomTrigger: async (
    { subdomain }: IAutomationWorkerContext,
    data: ICheckTriggerData,
  ) => {
    const { collectionType, target, config } = data;
    const models = await generateModels(subdomain);

    if (collectionType === 'deal.probability') {
      return checkTriggerDealStageProbality({ models, target, config });
    }

    return false;
  },
  receiveActions: async (
    { models, subdomain }: IAutomationWorkerContext<IModels>,
    {
      action,
      execution,
      actionType,
      collectionType,
      targetType,
    }: IAutomationReceiveActionData,
  ) => {
    if (actionType === 'create') {
      if (collectionType === 'checklist') {
        return createChecklist(models, execution, action);
      }

      return await actionCreate({
        models,
        subdomain,
        action,
        execution,
        collectionType,
        targetType,
      });
    }

    const { module, rules } = action.config;

    const relatedItems = await getItems(
      subdomain,
      module,
      execution,
      targetType.split('.')[0],
    );

    const result = await setProperty({
      models,
      subdomain,
      getRelatedValue,
      module,
      rules,
      execution,
      relatedItems,
      targetType,
    });

    return { result };
  },
  replacePlaceHolders: async (
    { models, subdomain }: IAutomationWorkerContext<IModels>,
    data: IReplacePlaceholdersData,
  ) => {
    const { relatedValueProps, config, target } = data;

    return await replacePlaceHolders({
      models,
      subdomain,
      customResolver: { resolver: getRelatedValue, props: relatedValueProps },
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
        pipelineLabels: '-',
      },
      complexFields: ['productsData'],
    });
  },
};
