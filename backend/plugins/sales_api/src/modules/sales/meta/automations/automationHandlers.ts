import {
  replacePlaceHolders,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { createDealAction } from '~/modules/sales/meta/automations/action/createDealAction';
import { createChecklist } from '~/modules/sales/meta/automations/action/createChecklist';
import { getItems } from '~/modules/sales/meta/automations/action/getItems';
import { getRelatedValue } from '~/modules/sales/meta/automations/action/getRelatedValue';
import { checkTriggerDealStageChanged } from '~/modules/sales/meta/automations/trigger/checkStageChangedTrigger';
import { checkTriggerDealStageProbality } from '~/modules/sales/meta/automations/trigger/checkStageProbalityTrigger';

export const salesAutomationHandlers = {
  checkCustomTrigger: async (
    {
      collectionType,
      relationType,
      target,
      config,
      eventUpdateDescription,
    }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType === 'deals') {
      if (relationType === 'probability') {
        return await checkTriggerDealStageProbality({
          models,
          target: target as IDeal,
          config,
        });
      }

      if (relationType === 'stageChanged') {
        return await checkTriggerDealStageChanged({
          models,
          target: target as IDeal,
          config,
          eventUpdateDescription,
        });
      }
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

    return await createDealAction({
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
  checkTargetMatch: async ({ ...data }, { subdomain, ...props }) => {
    const models = await generateModels(subdomain);
    const { moduleName, collectionType, targetId, selector } = data || {};
    if (collectionType === 'deals' && moduleName === 'sales') {
      return Boolean(
        await models.Deals.exists({
          $and: [{ _id: targetId }, selector],
        }),
      );
    }

    return false;
  },
};
