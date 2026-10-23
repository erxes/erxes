import {
  getSetPropertySelector,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { createDealAction } from '~/modules/sales/meta/automations/action/createDealAction';
import { createChecklist } from '~/modules/sales/meta/automations/action/createChecklist';
import { checkTriggerDealStageChanged } from '~/modules/sales/meta/automations/trigger/checkStageChangedTrigger';
import { checkTriggerDealStageProbality } from '~/modules/sales/meta/automations/trigger/checkStageProbalityTrigger';
import { syncWrittenDealPoints } from '~/modules/sales/utils/dealPoints';
import { assertDealUpdatesAllowed } from '~/modules/sales/utils/archiveGuard';

const getSalesSetPropertyModel = (models: IModels, module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');
  const collectionType = collectionName || moduleName;

  if (['deal', 'deals'].includes(collectionType)) {
    return models.Deals;
  }

  throw new Error(`Unsupported sales set property module: ${module}`);
};

// A contact's deals ("Customer deals" / "Company deals") are the deals
// keeping that contact (`customerId` / `companyId`), not core relations.
const CONTACT_DEAL_FIELDS: Record<string, 'customerId' | 'companyId'> = {
  'core:customer': 'customerId',
  'core:company': 'companyId',
};

const getDealSetPropertySelector = async (
  args: Parameters<typeof getSetPropertySelector>[0],
) => {
  const contactField =
    args.relation?.relatedContentType === 'sales:deal'
      ? CONTACT_DEAL_FIELDS[args.relation.contentType]
      : undefined;

  if (!contactField) {
    return getSetPropertySelector(args);
  }

  // The contact's id: the trigger's (or the target action's) record.
  const { _id } = await getSetPropertySelector({
    ...args,
    relation: undefined,
    targetPath: '_id',
  });

  return { [contactField]: _id };
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
    const selector = await getDealSetPropertySelector({
      subdomain,
      module,
      execution,
      targetType,
      relation: setPropertyTarget?.relation,
      targetPath: setPropertyTarget?.targetPath,
      targetActionId: action.targetActionId,
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
      update: async ({ selector: itemSelector, modifier }) => {
        const before = await model.find(itemSelector).lean();
        await assertDealUpdatesAllowed(models, before, modifier);
        const result = await model.updateMany(itemSelector, modifier);

        await syncWrittenDealPoints({ subdomain, models, before });

        return result;
      },
      targetType,
    };

    return await setProperty(setPropertyArgs);
  },
};
