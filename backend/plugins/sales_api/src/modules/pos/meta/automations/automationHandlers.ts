import {
  getSetPropertySelector,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { IPosOrder } from '~/modules/pos/@types/orders';
import { createPosOrderAction } from './action/createPosOrderAction';
import { checkPosOrderEventTrigger } from './trigger/checkPosOrderEventTrigger';

const getPosSetPropertyModel = (models: IModels, module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');
  const collectionType = collectionName || moduleName;

  if (collectionType === 'orders') {
    return models.PosOrders;
  }

  throw new Error(`Unsupported POS set property module: ${module}`);
};

export const posAutomationHandlers = {
  checkCustomTrigger: async ({
    collectionType,
    relationType,
    target,
    config,
    eventUpdateDescription,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) => {
    if (collectionType === 'orders' && relationType === 'event') {
      return checkPosOrderEventTrigger({
        target: target as IPosOrder,
        config,
        eventUpdateDescription,
      });
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
    if (collectionType !== 'orders') {
      throw new Error(`Unsupported POS automation action: ${collectionType}`);
    }

    return await createPosOrderAction({
      models,
      subdomain,
      action,
      execution,
    });
  },
  setProperties: async (
    data: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { action, execution, targetType } = data;
    const { module, rules, setPropertyTarget } = action.config;
    const model = getPosSetPropertyModel(models, module);
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
  checkTargetMatch: async (
    data: TAutomationProducersInput[TAutomationProducers.CHECK_TARGET_MATCH],
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const models = await generateModels(subdomain);
    const { moduleName, collectionType, targetId, selector } = data || {};

    if (collectionType === 'orders' && moduleName === 'pos') {
      return Boolean(
        await models.PosOrders.exists({
          $and: [{ _id: targetId }, selector],
        }),
      );
    }

    return false;
  },
};
