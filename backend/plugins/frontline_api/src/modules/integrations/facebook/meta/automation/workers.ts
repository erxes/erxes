import {
  actionCreateComment,
  checkCommentTrigger,
} from '@/integrations/facebook/meta/automation/comments';
import {
  actionCreateMessage,
  checkMessageTrigger,
} from '@/integrations/facebook/meta/automation/messages';
import {
  ICheckTriggerData,
  IReplacePlaceholdersData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import {
  replacePlaceHolders,
  setProperty,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';

const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  targetType: string,
) => {
  const { target } = execution;
  if (module === targetType) {
    return [target];
  }
  return [];
};

const getRelatedValue = async () => {
  return false;
};

export const facebookAutomationWorkers = {
  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain },
  ) => {
    switch (collectionType) {
      case 'messages':
        return await actionCreateMessage({
          models,
          subdomain,
          action,
          execution,
        });
      case 'comments':
        return await actionCreateComment(models, subdomain, action, execution);

      default:
        return { result: null };
    }
  },
  replacePlaceHolders: async (
    data: IReplacePlaceholdersData,
    { models, subdomain },
  ) => {
    const { target, config, relatedValueProps } = data;

    return await replacePlaceHolders<IModels>({
      models,
      subdomain,
      customResolver: { resolver: getRelatedValue, props: relatedValueProps },
      actionData: config,
      target,
    });
  },
  checkCustomTrigger: async (data: ICheckTriggerData, { subdomain }) => {
    const { collectionType } = data;
    console.log(collectionType);
    switch (collectionType) {
      case 'messages':
        return await checkMessageTrigger(subdomain, data);

      case 'comments':
        return await checkCommentTrigger(subdomain, data);
      // case "ads":
      //   return await checkAdsTrigger(subdomain, data);
      default:
        return false;
    }
  },

  setProperties: async (
    {
      action,
      execution,
      targetType,
    }: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    { models, subdomain },
  ) => {
    const { module, rules } = action.config;
    const relatedItems = await getItems(
      subdomain,
      module,
      execution,
      targetType,
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
