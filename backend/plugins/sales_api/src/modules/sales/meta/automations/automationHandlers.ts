import {
  getSetPropertySelector,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { createDealAction } from '~/modules/sales/meta/automations/action/createDealAction';
import { createChecklist } from '~/modules/sales/meta/automations/action/createChecklist';
import { checkTriggerDealStageChanged } from '~/modules/sales/meta/automations/trigger/checkStageChangedTrigger';
import { checkTriggerDealStageProbality } from '~/modules/sales/meta/automations/trigger/checkStageProbalityTrigger';

const getSalesSetPropertyModel = (models: IModels, module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');
  const collectionType = collectionName || moduleName;

  if (['deal', 'deals'].includes(collectionType)) {
    return models.Deals;
  }

  throw new Error(`Unsupported sales set property module: ${module}`);
};

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
          eventUpdateDescription,
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
  setProperties: async (
    data: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { action, execution, targetType } = data;
    const { module, rules, setPropertyTarget } = action.config;
    const model = getSalesSetPropertyModel(models, module);
    const selector = await getSetPropertySelector({
      subdomain,
      module,
      execution,
      targetType,
      relation: setPropertyTarget?.relation,
    });

    const setPropertyArgs = {
      models,
      subdomain,
      module,
      rules,
      execution,
      setPropertyTarget,
      selector,
      fetchItems: async (itemSelector) => await model.find(itemSelector).lean(),
      update: async ({ selector: itemSelector, modifier }) =>
        await model.updateMany(itemSelector, modifier),
      targetType,
    };

    return await setProperty(setPropertyArgs);
  },
  checkTargetMatch: async ({ ...data }, { subdomain }) => {
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
