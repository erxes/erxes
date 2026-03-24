import {
  replacePlaceHolders,
  setProperty,
  startAutomations,
} from 'erxes-api-shared/core-modules';
import { Express } from 'express';
import { generateModels, IModels } from '~/connectionResolvers';
import { getItems, getRelatedValue } from './utils';

export const initAutomation = (app: Express) =>
  startAutomations(app, 'core', {
    replacePlaceHolders: async ({ subdomain, data }) => {
      const { target, config, relatedValueProps } = data || {};
      const models = await generateModels(subdomain);

      return await replacePlaceHolders<IModels>({
        models,
        subdomain,
        target,
        actionData: config,
        customResolver: {
          resolver: getRelatedValue,
          props: relatedValueProps,
        },
      });
    },
    setProperties: async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { action, execution, targetType } = data;
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
        module: module.includes('lead') ? 'core:customer' : module,
        rules,
        execution,
        relatedItems,
        targetType,
      });
    },
  });
