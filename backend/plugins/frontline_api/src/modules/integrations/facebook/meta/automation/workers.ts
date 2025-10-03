import {
  actionCreateComment,
  checkCommentTrigger,
} from '@/integrations/facebook/meta/automation/comments';
import {
  actionCreateMessage,
  checkMessageTrigger,
} from '@/integrations/facebook/meta/automation/messages';
import {
  IAutomationReceiveActionData,
  IAutomationWorkerContext,
  ICheckTriggerData,
  IReplacePlaceholdersData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import {
  replacePlaceHolders,
  setProperty,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';

const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  triggerType: string,
) => {
  const { target } = execution;
  if (module === triggerType) {
    return [target];
  }
  return [];
};

const getRelatedValue = async () => {
  return false;
};

export const facebookAutomationWorkers = {
  receiveActions: async (
    { models, subdomain }: IAutomationWorkerContext,
    {
      action,
      execution,
      actionType,
      collectionType,
      triggerType,
    }: IAutomationReceiveActionData,
  ) => {
    if (actionType === 'create') {
      switch (collectionType) {
        case 'messages':
          return await actionCreateMessage({
            models,
            subdomain,
            action,
            execution,
          });
        case 'comments':
          return await actionCreateComment(
            models,
            subdomain,
            action,
            execution,
          );

        default:
          return { result: null };
      }
    }

    if (actionType === 'set-property') {
      const { module, rules } = action.config;
      const relatedItems = await getItems(
        subdomain,
        module,
        execution,
        triggerType,
      );
      return {
        result: await setProperty({
          models,
          subdomain,
          getRelatedValue,
          module,
          rules,
          execution,
          relatedItems,
          triggerType,
        }),
      };
    }

    return { result: null };
  },
  replacePlaceHolders: async (
    { subdomain }: IAutomationWorkerContext,
    data: IReplacePlaceholdersData,
  ) => {
    const { target, config, relatedValueProps } = data;
    const models = await generateModels(subdomain);

    return await replacePlaceHolders<IModels>({
      models,
      subdomain,
      customResolver: { resolver: getRelatedValue, props: relatedValueProps },
      actionData: config,
      target,
    });
  },
  checkCustomTrigger: async (
    { subdomain }: IAutomationWorkerContext,
    data: ICheckTriggerData,
  ) => {
    const { collectionType } = data;

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
};
