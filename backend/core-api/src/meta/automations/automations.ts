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
import { coreProductAiKnowledgeProvider } from '~/modules/products/meta/automations';

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

const isCustomerSetPropertyModule = (module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');

  return ['customers', 'leads'].includes(collectionName || moduleName);
};

const CUSTOMER_PRIMARY_FIELD_TO_LIST_FIELD: Record<string, string> = {
  primaryPhone: 'phones',
  primaryEmail: 'emails',
};

type TSetPropertyRules = Parameters<typeof setProperty>[0]['rules'];

const hasCustomerPrimaryFieldRule = (rules: TSetPropertyRules) =>
  (rules || []).some(
    (rule) =>
      CUSTOMER_PRIMARY_FIELD_TO_LIST_FIELD[rule.field] &&
      (rule.operator || 'set') === 'set',
  );

const buildCustomerPrimaryFieldRules = (
  item: Record<string, unknown>,
  rules: TSetPropertyRules,
): TSetPropertyRules =>
  (rules || []).flatMap((rule) => {
    const listField = CUSTOMER_PRIMARY_FIELD_TO_LIST_FIELD[rule.field];

    if (!listField || (rule.operator || 'set') !== 'set') {
      return [rule];
    }

    const listRule = {
      ...rule,
      field: listField,
      fieldLabel: listField,
      operator: 'addToSet',
    };

    return String(item[rule.field] || '').trim()
      ? [listRule]
      : [rule, listRule];
  });

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
    loadAiKnowledgeDocumentBatch: async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      if (data.moduleName === 'products') {
        return coreProductAiKnowledgeProvider.loadAiKnowledgeDocumentBatch(
          models,
          data,
        );
      }

      throw new Error(
        `Unsupported core AI knowledge module: ${data.moduleName}`,
      );
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
        targetPath: setPropertyTarget?.targetPath,
      });

      const runSetProperty = (
        itemRules: TSetPropertyRules,
        itemSelector: Record<string, unknown>,
      ) =>
        setProperty({
          models,
          subdomain,
          module,
          rules: itemRules,
          execution,
          setPropertyTarget,
          selector: itemSelector,
          fetchItems: async (fetchSelector) =>
            await model.find(fetchSelector).lean(),
          update: async ({ selector: updateSelector, modifier }) =>
            await model.updateMany(updateSelector, modifier),
          targetType,
        });

      if (
        !isCustomerSetPropertyModule(module) ||
        !hasCustomerPrimaryFieldRule(rules)
      ) {
        return await runSetProperty(rules, selector);
      }

      // Primary promotion depends on each customer's current value, so the
      // rules are adjusted per record.
      const items = await model.find(selector).lean();
      const results: Awaited<ReturnType<typeof setProperty>>[] = [];

      for (const item of items) {
        results.push(
          await runSetProperty(buildCustomerPrimaryFieldRules(item, rules), {
            _id: item._id,
          }),
        );
      }

      if (results.length === 1) {
        return results[0];
      }

      if (!results.length) {
        return await runSetProperty(rules, { _id: { $in: [] } });
      }

      const [first, ...rest] = results;

      return rest.reduce(
        (merged, result) => ({
          ...merged,
          target: {
            ...merged.target,
            count: (merged.target?.count || 0) + (result.target?.count || 0),
          },
          changes: [...(merged.changes || []), ...(result.changes || [])],
          summary: `${merged.summary}; ${result.summary}`,
        }),
        first,
      );
    },
  });
