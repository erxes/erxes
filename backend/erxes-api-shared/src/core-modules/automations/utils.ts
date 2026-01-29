import moment from 'moment';
import { pluralFormation, sendCoreModuleProducer } from '../../utils';
import { sendTRPCMessage } from '../../utils/trpc';
import { AUTOMATION_PROPERTY_OPERATORS, STATIC_PLACEHOLDER } from './constants';
import {
  IPerValueProps,
  IPropertyProps,
  IReplacePlaceholdersProps,
  TAutomationProducers,
} from './types';

export const splitType = (type: string) => {
  return type.replace(/\./g, ':').split(':');
};

const safeArithmeticEval = (expr: string): number => {
  const tokens = expr.match(/(\d+\.?\d*|[+\-*/()])/g) || [];
  let pos = 0;

  const parseNumber = (): number => {
    if (tokens[pos] === '(') {
      pos++;
      const result = parseAddSub();
      pos++;
      return result;
    }
    if (tokens[pos] === '-') {
      pos++;
      return -parseNumber();
    }
    if (tokens[pos] === '+') {
      pos++;
      return parseNumber();
    }
    return parseFloat(tokens[pos++]) || 0;
  };

  const parseMulDiv = (): number => {
    let result = parseNumber();
    while (tokens[pos] === '*' || tokens[pos] === '/') {
      const op = tokens[pos++];
      const right = parseNumber();
      result = op === '*' ? result * right : result / right;
    }
    return result;
  };

  const parseAddSub = (): number => {
    let result = parseMulDiv();
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos++];
      const right = parseMulDiv();
      result = op === '+' ? result + right : result - right;
    }
    return result;
  };

  return parseAddSub();
};

const processDatePlaceholders = (value: string): string => {
  // Handle dynamic dates: {{ now+Xd }}
  let processed = value.replace(/{{ now\+(\d+)d }}/g, (_, days) =>
    moment().add(Number(days), 'days').toISOString(),
  );

  // Handle static date placeholders
  Object.entries(STATIC_PLACEHOLDER).forEach(([placeholder, offsetDays]) => {
    if (processed.includes(placeholder)) {
      processed = processed.replace(
        placeholder,
        moment().add(offsetDays, 'days').toISOString(),
      );
    }
  });

  return processed;
};

const processComplexField = async (
  value: string,
  complexFieldKey: string,
  target: Record<string, any>,
  customResolver: IReplacePlaceholdersProps<any>['customResolver'],
  models: any,
  subdomain: string,
  props: any,
): Promise<string> => {
  const regex = new RegExp(`{{ ${complexFieldKey}\\.([\\w\\d]+) }}`);
  const match = regex.exec(value);
  if (!match) return value;

  const fieldId = match[1];
  let replaceValue = '';

  if (customResolver?.isRelated && customResolver?.resolver) {
    replaceValue = await customResolver.resolver(
      models,
      subdomain,
      target,
      `${complexFieldKey}.${fieldId}`,
      props,
    );
  } else {
    const complexFieldData = (target[complexFieldKey] || []).find(
      (cfd: any) => cfd?.field === fieldId,
    );
    replaceValue = complexFieldData?.value ?? '';
  }

  return value.replace(`{{ ${complexFieldKey}.${fieldId} }}`, replaceValue);
};

const cleanValue = (value: string): string =>
  value.replace(/\[\[ /g, '').replace(/ \]\]/g, '');

const processBracketPlaceholders = async (
  value: string,
  subdomain: string,
  complexFieldKeys: string[] = ['customFieldsData', 'trackedData'],
): Promise<string> => {
  const bracketRegex = /\[\[\s*([^\]]+)\s*\]\]/g;
  const bracketMatches = [...value.matchAll(bracketRegex)];

  let processed = value;

  for (const match of bracketMatches) {
    const fullMatch = match[0];
    const content = match[1].trim();

    // Check if content matches collection pattern with complex field:
    // <collectionName>.<objectId>.<complexFieldKey>.<fieldId>
    const complexFieldPattern = new RegExp(
      `^(user|tag|product|company|customer)\\.([\\w\\d]+)\\.(${complexFieldKeys.join(
        '|',
      )})\\.([\\w\\d]+)$`,
    );
    const complexFieldMatch = content.match(complexFieldPattern);

    if (complexFieldMatch) {
      const [, collectionName, objectId, complexFieldKey, fieldId] =
        complexFieldMatch;

      // Map collection names to module names
      const moduleMap: Record<string, string> = {
        user: 'users',
        tag: 'tags',
        product: 'products',
        company: 'companies',
        customer: 'customers',
      };

      const moduleName = moduleMap[collectionName];

      try {
        const result = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: moduleName,
          action: 'findOne',
          input: { query: { _id: objectId } },
        });

        // Find the complex field value
        const complexFieldData = (result?.[complexFieldKey] || []).find(
          (cfd: any) => cfd?.field === fieldId,
        );

        const replaceValue = complexFieldData?.value || '';
        processed = processed.replace(fullMatch, String(replaceValue));
      } catch (error) {
        // If tRPC request fails, just remove the brackets
        processed = processed.replace(fullMatch, '');
      }
      continue;
    }

    // Check if content matches simple collection pattern: <collectionName>.<objectId>.<fieldKey>
    const collectionPattern =
      /^(user|tag|product|company|customer)\.([\w\d]+)\.([\w\d]+)$/;
    const collectionMatch = content.match(collectionPattern);

    if (collectionMatch) {
      const [, collectionName, objectId, fieldKey] = collectionMatch;

      // Map collection names to module names
      const moduleMap: Record<string, string> = {
        user: 'users',
        tag: 'tags',
        product: 'products',
        company: 'companies',
        customer: 'customers',
      };

      const moduleName = moduleMap[collectionName];

      try {
        const result = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: moduleName,
          action: 'findOne',
          input: { query: { _id: objectId } },
        });

        const replaceValue = (result || {})[fieldKey ?? '_id'] || '';
        processed = processed.replace(fullMatch, String(replaceValue));
      } catch (error) {
        // If tRPC request fails, just remove the brackets
        processed = processed.replace(fullMatch, '');
      }
    } else {
      // Not a collection pattern, just clean the brackets
      processed = processed.replace(fullMatch, content);
    }
  }

  return processed;
};

export const replacePlaceHolders = async <TModels>({
  models,
  subdomain,
  actionData,
  target,
  customResolver,
  complexFields = [],
}: IReplacePlaceholdersProps<TModels>): Promise<
  Record<string, any> | undefined
> => {
  if (!actionData) return actionData;

  const complexFieldKeys = [
    'customFieldsData',
    'trackedData',
    ...complexFields,
  ];
  const { isRelated = true, resolver, props } = customResolver || {};
  const targetMap = new Map(Object.entries(target));

  for (const [actionDataKey, value] of Object.entries(actionData)) {
    if (value === null || value === undefined) continue;

    let processedValue = typeof value === 'string' ? value : String(value);
    const regex = /{{\s*([\w\d]+(?:\.[\w\d\-]+)*)\s*}}/g;
    const fieldKeys = [...processedValue.matchAll(regex)].map(
      (match) => match[1],
    );
    // Process each placeholder found
    for (const fieldKey of fieldKeys) {
      // First, try to get related value
      let replacedValue = null;
      if (isRelated && resolver) {
        replacedValue = await resolver(
          models,
          subdomain,
          target,
          fieldKey,
          props,
        );
      }
      if (replacedValue) {
        processedValue = processedValue.replace(
          `{{ ${fieldKey} }}`,
          replacedValue,
        );
        continue;
      }

      // Check if it's a targetKey
      const targetKeyValue = targetMap.get(fieldKey);
      if (targetKeyValue) {
        const replaceValue =
          (isRelated &&
            resolver &&
            (await resolver(models, subdomain, target, fieldKey, props))) ||
          targetKeyValue;
        processedValue = processedValue.replace(
          `{{ ${fieldKey} }}`,
          replaceValue,
        );
        continue;
      }

      // Check if it's a complex field
      for (const complexFieldKey of complexFieldKeys) {
        if (fieldKey.includes(`${complexFieldKey}.`)) {
          const [, fieldId] = fieldKey.split('.');

          let replaceValue = '';
          if (isRelated && resolver) {
            replaceValue =
              (await resolver(
                models,
                subdomain,
                target,
                `${complexFieldKey}.${fieldId}`,
                props,
              )) || '';
          } else {
            const complexFieldData = (target[complexFieldKey] || []).find(
              (cfd: any) => cfd?.field === fieldId,
            );
            replaceValue = complexFieldData?.value || '-';
          }

          processedValue = processedValue.replace(
            `{{ ${complexFieldKey}.${fieldId} }}`,
            replaceValue,
          );
          break;
        }
      }
    }

    // Process remaining date placeholders (for non-targetKey placeholders)
    if (typeof processedValue === 'string') {
      processedValue = processDatePlaceholders(processedValue);
    }

    // Process bracket placeholders [[ ]]
    if (typeof processedValue === 'string') {
      processedValue = await processBracketPlaceholders(
        processedValue,
        subdomain,
        complexFieldKeys,
      );
    }

    actionData[actionDataKey] = cleanValue(processedValue);
  }

  return actionData;
};

const convertOp1 = (relatedItem: any, field: string) => {
  if (
    ['customFieldsData', 'trackedData'].some((complexField) =>
      field.includes(complexField),
    )
  ) {
    const [complexFieldKey, nestedComplexFieldKey] = field.split('.');
    return (relatedItem[complexFieldKey] || []).find(
      (nestedObj: any) => nestedObj?.field === nestedComplexFieldKey,
    )?.value;
  }

  return relatedItem[field];
};

const getPerValue = async <TModels>({
  models,
  subdomain,
  relatedItem,
  rule,
  target,
  getRelatedValue,
  serviceName = '',
  targetType = '',
  execution,
}: IPerValueProps<TModels>) => {
  const { field = '', operator = '' } = rule;
  let { value } = rule;

  const op1Type = typeof convertOp1(relatedItem, field);

  // replace placeholder if value has attributes from related service
  if (
    value.match(/\{\{\s*([^}]+)\s*\}\}/g) &&
    !(targetType || '').includes(serviceName)
  ) {
    const [relatedPluginName, moduleName] = splitType(targetType);

    if (!relatedPluginName) {
      return value;
    }

    value =
      (
        await sendCoreModuleProducer({
          subdomain,
          moduleName: 'automations',
          pluginName: relatedPluginName,
          producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
          input: {
            target,
            config: { value },
            moduleName,
          },
          defaultValue: value,
        })
      )?.value || value;
  }

  let op1 = convertOp1(relatedItem, field);

  let updatedValue = (
    await replacePlaceHolders({
      models,
      subdomain,
      customResolver: {
        resolver: getRelatedValue,
        isRelated: op1Type === 'string' ? true : false,
      },
      actionData: { config: value },
      target,
    })
  )?.config;

  if (updatedValue.match(/^[0-9+\-*/\s().]+$/)) {
    try {
      updatedValue = safeArithmeticEval(updatedValue);
    } catch {
      updatedValue = 0;
    }
  }

  if (field.includes('Ids')) {
    const ids: string[] =
      (updatedValue || '').trim().replace(/, /g, ',').split(',') || [];
    updatedValue = Array.from(new Set(ids));
  }

  if (
    [
      AUTOMATION_PROPERTY_OPERATORS.ADD,
      AUTOMATION_PROPERTY_OPERATORS.SUBTRACT,
      AUTOMATION_PROPERTY_OPERATORS.MULTIPLY,
      AUTOMATION_PROPERTY_OPERATORS.DIVIDE,
      AUTOMATION_PROPERTY_OPERATORS.PERCENT,
    ].includes(operator)
  ) {
    op1 = op1 || 0;
    const numberValue = Number.parseInt(value, 10);

    switch (operator) {
      case AUTOMATION_PROPERTY_OPERATORS.ADD:
        updatedValue = op1 + numberValue;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.SUBTRACT:
        updatedValue = op1 - numberValue;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.MULTIPLY:
        updatedValue = op1 * numberValue;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.DIVIDE:
        updatedValue = op1 / numberValue || 1;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.PERCENT:
        updatedValue = (op1 / 100) * numberValue;
        break;
    }
  }

  if (operator === 'concat') {
    updatedValue = (op1 || '').concat(updatedValue);
  }

  if (['addDay', 'subtractDay'].includes(operator)) {
    op1 = op1 || new Date();

    try {
      op1 = new Date(op1);
    } catch (e) {
      op1 = new Date();
    }

    updatedValue =
      operator === 'addDay'
        ? Number.parseFloat(updatedValue)
        : -1 * Number.parseFloat(updatedValue);
    updatedValue = new Date(op1.setDate(op1.getDate() + updatedValue));
  }

  return updatedValue;
};

export const setProperty = async <TModels>({
  models,
  subdomain,
  module,
  rules,
  execution,
  getRelatedValue,
  relatedItems,
  targetType,
}: IPropertyProps<TModels>) => {
  const { target } = execution;
  const [serviceName, contentType] = splitType(module);

  const result: any[] = [];

  const complexFields = ['customFieldsData', 'trackedData'];

  for (const relatedItem of relatedItems) {
    const setDoc: { [key: string]: any } = {};
    const pushDoc: any = {};
    const selectorDoc: any = {};

    for (const rule of rules) {
      const { field = '' } = rule;

      const value = await getPerValue({
        models,
        subdomain,
        relatedItem,
        rule,
        target,
        getRelatedValue,
        targetType,
        serviceName,
        execution,
      });
      if (
        !complexFields.every((complexField) => field.includes(complexField))
      ) {
        setDoc[field] = value;
        continue;
      }

      for (const complexFieldKey of complexFields) {
        if (field.includes(complexFieldKey)) {
          const fieldId = field.replace(`${complexFieldKey}.`, '');

          const fieldDetail = await sendTRPCMessage({
            subdomain,

            pluginName: 'core',
            method: 'query',
            module: 'fields',
            action: 'findOne',
            input: { _id: fieldId },
          });
          const complexFieldData = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'fields',
            action: 'generateTypedItem',
            input: {
              field: fieldId,
              value,
              type: fieldDetail?.type,
            },
          });
          if (
            (relatedItem[complexFieldKey] || []).find(
              (obj: any) => obj.field === fieldId,
            )
          ) {
            selectorDoc[`${complexFieldKey}.field`] = fieldId;
            const complexFieldDataKeys = Object.keys(complexFieldData).filter(
              (key) => key !== 'field',
            );
            for (const complexFieldDataKey of complexFieldDataKeys) {
              setDoc[`${complexFieldKey}.$.${complexFieldDataKey}`] =
                complexFieldData[complexFieldDataKey];
            }
          } else {
            pushDoc[complexFieldKey] = complexFieldData;
          }
        }
      }
    }

    const modifier: any = {};

    if (Object.keys(setDoc).length > 0) {
      modifier.$set = setDoc;
    }

    if (Object.keys(pushDoc).length > 0) {
      modifier.$push = pushDoc;
    }

    try {
      const moduleName = pluralFormation(contentType);
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: serviceName,
        module: moduleName,
        action: 'updateMany',
        input: {
          selector: { _id: relatedItem._id, ...selectorDoc },
          modifier,
        },
      });
    } catch (error) {
      result.push(error.message);
      continue;
    }

    result.push({
      _id: relatedItem._id,
      rules: (Object as any)
        .values(setDoc)
        .map((v: any) => String(v))
        .join(', '),
    });
  }

  return { module, fields: rules.map((r) => r.field).join(', '), result };
};

export const getContentType = (type: string) => splitType(type)[2];
export const getModuleName = (type: string) => splitType(type)[1];
export const getPluginName = (type: string) => splitType(type)[0];
