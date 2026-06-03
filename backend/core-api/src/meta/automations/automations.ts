import {
  getSetPropertySelector,
  setProperty,
  startAutomations,
} from 'erxes-api-shared/core-modules';
import { Express } from 'express';
import { generateModels, IModels } from '~/connectionResolvers';
import { checkTargetMatch } from './checkTargetMatch';
import { CORE_AUTOMATION_CONSTANTS } from './constants';
import { findObject } from './findObject';

type TSetPropertyModel = {
  find: (selector: Record<string, unknown>) => {
    lean: () => Promise<Record<string, unknown>[]>;
  };
  updateMany: (
    selector: Record<string, unknown>,
    modifier: unknown,
  ) => Promise<unknown>;
};

const getCoreSetPropertyModel = (models: IModels, module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');
  const collectionType = collectionName || moduleName;

  if (['customers', 'leads'].includes(collectionType)) {
    return models.Customers as unknown as TSetPropertyModel;
  }

  if (collectionType === 'companies') {
    return models.Companies as unknown as TSetPropertyModel;
  }

  if (collectionType === 'users') {
    return models.Users as unknown as TSetPropertyModel;
  }

  throw new Error(`Unsupported core set property module: ${module}`);
};

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
      const { module, rules, setPropertyTarget } = action.config;
      const model = getCoreSetPropertyModel(models, module);
      const selector = await getSetPropertySelector({
        subdomain,
        module,
        execution,
        targetType,
        relation: setPropertyTarget?.relation,
      });

      return await setProperty({
        models,
        subdomain,
        module,
        rules,
        execution,
        setPropertyTarget,
        selector,
        fetchItems: async (itemSelector) =>
          await model.find(itemSelector).lean(),
        update: async ({ selector: itemSelector, modifier }) =>
          await model.updateMany(itemSelector, modifier),
        targetType,
      });
    },
  });
