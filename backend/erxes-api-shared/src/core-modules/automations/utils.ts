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

  for (const [actionDataKey, value] of Object.entries(actionData)) {
    if (value === null || value === undefined) continue;

    let processedValue = typeof value === 'string' ? value : String(value);

    // Process target key placeholders
    for (const targetKey of Object.keys(target)) {
      if (processedValue.includes(`{{ ${targetKey} }}`)) {
        let replaceValue = target[targetKey];
        if (isRelated && resolver) {
          replaceValue = await resolver(
            models,
            subdomain,
            target,
            targetKey,
            props,
          );
        }
        processedValue = processedValue.replace(
          `{{ ${targetKey} }}`,
          replaceValue,
        );
      }
    }

    // Process date placeholders
    if (typeof processedValue === 'string') {
      processedValue = processDatePlaceholders(processedValue);
    }

    // Process complex fields
    for (const complexFieldKey of complexFieldKeys) {
      if (processedValue.includes(complexFieldKey)) {
        processedValue = await processComplexField(
          processedValue,
          complexFieldKey,
          target,
          customResolver,
          models,
          subdomain,
          props,
        );
      }
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
  triggerType = '',
  execution,
}: IPerValueProps<TModels>) => {
  let { field = '', operator = '', value } = rule;

  const op1Type = typeof convertOp1(relatedItem, field);

  // replace placeholder if value has attributes from related service
  if (
    value.match(/\{\{\s*([^}]+)\s*\}\}/g) &&
    !(triggerType || '').includes(serviceName)
  ) {
    const [relatedPluginName] = splitType(triggerType);

    if (!relatedPluginName) {
      // Skip placeholder replacement when triggerType is empty
      return value;
    }

    value =
      (
        await sendCoreModuleProducer({
          moduleName: 'automations',
          pluginName: relatedPluginName,
          producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
          input: {
            execution,
            target,
            config: { value },
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
    updatedValue = eval(updatedValue.replace(/{{.*}}/, '0'));
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
    const numberValue = parseInt(value, 10);

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
        ? parseFloat(updatedValue)
        : -1 * parseFloat(updatedValue);
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
  triggerType,
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
        triggerType,
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
            pluginName: 'core',
            method: 'query',
            module: 'fields',
            action: 'findOne',
            input: { _id: fieldId },
          });

          const complexFieldData = await sendTRPCMessage({
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
      await sendTRPCMessage({
        method: 'mutation',
        pluginName: serviceName,
        module: pluralFormation(contentType),
        action: `updateMany`,
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

export const getContentType = (type: string) => type.split(':')[1];
export const getPluginName = (type: string) => type.split(':')[0];
