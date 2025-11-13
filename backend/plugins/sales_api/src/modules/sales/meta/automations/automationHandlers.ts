import {
  replacePlaceHolders,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { actionCreate } from '~/modules/sales/meta/automations/action/createAction';
import { createChecklist } from '~/modules/sales/meta/automations/action/createChecklist';
import { getItems } from '~/modules/sales/meta/automations/action/getItems';
import { getRelatedValue } from '~/modules/sales/meta/automations/action/getRelatedValue';
import { checkTriggerDealStageProbality } from '~/modules/sales/meta/automations/trigger/checkStageProbalityTrigger';

export const salesAutomationHandlers = {
  checkCustomTrigger: async (
    {
      collectionType,
      relationType,
      target,
      config,
    }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    console.log({ collectionType, relationType });
    if (collectionType === 'deal' && relationType === 'probability') {
      return await checkTriggerDealStageProbality({
        models,
        target: target as IDeal,
        config,
      });
    }

    return false;
  },
  receiveActions: async (
    {
      action,
      execution,
      actionType,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType === 'checklist') {
      return createChecklist(models, execution, action);
    }

    return await actionCreate({
      models,
      subdomain,
      action,
      execution,
      collectionType,
    });
  },
  replacePlaceHolders: async (
    data: TAutomationProducersInput[TAutomationProducers.REPLACE_PLACEHOLDERS],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
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
  setProperties: async (
    data: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { action, execution, targetType } = data;
    const { module, rules } = action.config;

    const relatedItems = await getItems(
      subdomain,
      module,
      execution,
      targetType.split('.')[0],
    );

    return await setProperty({
      models,
      subdomain,
      getRelatedValue,
      module,
      rules,
      execution,
      relatedItems,
      targetType,
    });
  },
};
