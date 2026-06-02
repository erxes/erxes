import {
  setProperty,
  startAutomations,
} from 'erxes-api-shared/core-modules';
import { Express } from 'express';
import { generateModels } from '~/connectionResolvers';
import { checkTargetMatch } from './checkTargetMatch';
import { CORE_AUTOMATION_CONSTANTS } from './constants';
import { findObject } from './findObject';
import { getItems, getRelatedValue } from './utils';

export const initAutomation = (app: Express) =>
  startAutomations(app, 'core', {
    constants: CORE_AUTOMATION_CONSTANTS,
    checkTargetMatch: async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return checkTargetMatch(models, data);
    },
    findObject: async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return findObject(models, data);
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
