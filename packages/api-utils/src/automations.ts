import * as moment from 'moment';
import { pluralFormation } from './commonUtils';

export const replacePlaceHolders = async ({
  models,
  subdomain,
  actionData,
  target,
  isRelated = true,
  getRelatedValue,
  relatedValueProps,
  complexFields
}: {
  models;
  subdomain: string;
  actionData?: any;
  target: any;
  isRelated?: boolean;
  getRelatedValue: any;
  relatedValueProps?: any;
  complexFields?: string[];
}) => {
  if (actionData) {
    const targetKeys = Object.keys(target);
    const actionDataKeys = Object.keys(actionData);

    for (const actionDataKey of actionDataKeys) {
      for (const targetKey of targetKeys) {
        if (actionData[actionDataKey].includes(`{{ ${targetKey} }}`)) {
          const replaceValue =
            (isRelated &&
              (await getRelatedValue(
                models,
                subdomain,
                target,
                targetKey,
                relatedValueProps
              ))) ||
            target[targetKey];

          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ ${targetKey} }}`,
            replaceValue
          );
        }

        // some text {{now+3d }} some text
        const nowRegex = new RegExp(/{{ now\+(\d+)d }}/g);
        const regexResult = nowRegex.exec(actionData[actionDataKey]);

        if (regexResult && regexResult.length === 2) {
          const dayValue = regexResult[1];
          actionData[actionDataKey] = moment()
            .add(dayValue, 'day')
            .toDate()
            .toString();
        }

        if (actionData[actionDataKey].includes(`{{ now }}`)) {
          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ now }}`,
            new Date()
          );
        }

        if (actionData[actionDataKey].includes(`{{ tomorrow }}`)) {
          const today = new Date();
          const tomorrow = today.setDate(today.getDate() + 1);
          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ tomorrow }}`,
            tomorrow
          );
        }
        if (actionData[actionDataKey].includes(`{{ nextWeek }}`)) {
          const today = new Date();
          const nextWeek = today.setDate(today.getDate() + 7);
          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ nextWeek }}`,
            nextWeek
          );
        }
        if (actionData[actionDataKey].includes(`{{ nextMonth }}`)) {
          const today = new Date();
          const nextMonth = today.setDate(today.getDate() + 30);
          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ nextMonth }}`,
            nextMonth
          );
        }

        for (const complexFieldKey of [
          'customFieldsData',
          'trackedData'
        ].concat(complexFields || [])) {
          if (actionData[actionDataKey].includes(complexFieldKey)) {
            const regex = new RegExp(`{{ ${complexFieldKey}.([\\w\\d]+) }}`);
            const match = regex.exec(actionData[actionDataKey]);
            const fieldId = match && match.length === 2 ? match[1] : '';

            if ((complexFields || [])?.includes(complexFieldKey)) {
              const replaceValue =
                (await getRelatedValue(
                  models,
                  subdomain,
                  target,
                  `${complexFieldKey}.${fieldId}`,
                  relatedValueProps
                )) || target[targetKey];

              actionData[actionDataKey] = actionData[actionDataKey].replace(
                `{{ ${complexFieldKey}.${fieldId} }}`,
                replaceValue
              );
            } else {
              const complexFieldData = target[complexFieldKey].find(
                cfd => cfd.field === fieldId
              );

              actionData[actionDataKey] = actionData[actionDataKey].replace(
                `{{ ${complexFieldKey}.${fieldId} }}`,
                complexFieldData ? complexFieldData.value : ''
              );
            }
          }
        }
      }

      actionData[actionDataKey] = actionData[actionDataKey]
        .replace(/\[\[ /g, '')
        .replace(/ \]\]/g, '');
    }
  }

  return actionData;
};

export const OPERATORS = {
  SET: 'set',
  CONCAT: 'concat',
  ADD: 'add',
  SUBTRACT: 'subtract',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  PERCENT: 'percent',
  ALL: ['set', 'concat', 'add', 'subtract', 'multiply', 'divide', 'percent']
};

const getPerValue = async (args: {
  models;
  subdomain;
  relatedItem;
  rule;
  target;
  getRelatedValue;
}) => {
  const {
    models,
    subdomain,
    relatedItem,
    rule,
    target,
    getRelatedValue
  } = args;
  const { field, operator, value } = rule;
  const op1Type = typeof relatedItem[field];

  let op1 = relatedItem[field];

  let updatedValue = (
    await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: { config: value },
      target,
      isRelated: op1Type === 'string' ? true : false
    })
  ).config;

  if (field.includes('Ids')) {
    //
    const set = [
      new Set(
        (updatedValue || '')
          .trim()
          .replace(/, /g, ',')
          .split(',') || []
      )
    ];
    updatedValue = [...set];
  }

  if (
    [
      OPERATORS.ADD,
      OPERATORS.SUBTRACT,
      OPERATORS.MULTIPLY,
      OPERATORS.DIVIDE,
      OPERATORS.PERCENT
    ].includes(operator)
  ) {
    op1 = op1 || 0;
    const numberValue = parseInt(value, 10);

    switch (operator) {
      case OPERATORS.ADD:
        updatedValue = op1 + numberValue;
        break;
      case OPERATORS.SUBTRACT:
        updatedValue = op1 - numberValue;
        break;
      case OPERATORS.MULTIPLY:
        updatedValue = op1 * numberValue;
        break;
      case OPERATORS.DIVIDE:
        updatedValue = op1 / numberValue || 1;
        break;
      case OPERATORS.PERCENT:
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

export const setProperty = async ({
  models,
  subdomain,
  module,
  rules,
  execution,
  getRelatedValue,
  relatedItems,
  sendCommonMessage
}) => {
  const { target } = execution;
  const [serviceName, collectionType] = module.split(':');

  const result: any[] = [];

  for (const relatedItem of relatedItems) {
    const setDoc = {};
    const pushDoc = {};
    const servicesToForward: string[] = [];

    for (const rule of rules) {
      const value = await getPerValue({
        models,
        subdomain,
        relatedItem,
        rule,
        target,
        getRelatedValue
      });

      if (rule.forwardTo) {
        servicesToForward.push(rule.forwardTo);
      }

      if (
        !rule.field.includes('customFieldsData') &&
        !rule.field.includes('trackedData')
      ) {
        setDoc[rule.field] = value;
        continue;
      }

      for (const complexFieldKey of ['customFieldsData', 'trackedData']) {
        if (rule.field.includes(complexFieldKey)) {
          const fieldId = rule.field.replace(`${complexFieldKey}.`, '');

          pushDoc[complexFieldKey] = await sendCommonMessage({
            subdomain,
            serviceName: 'forms',
            action: 'fields.generateTypedItem',
            data: {
              field: fieldId,
              value
            },
            isRPC: true
          });
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

    const response = await sendCommonMessage({
      subdomain,
      serviceName,
      action: `${pluralFormation(collectionType)}.updateMany`,
      data: { selector: { _id: relatedItem._id }, modifier },
      isRPC: true
    });

    for (const service of servicesToForward) {
      await sendCommonMessage({
        subdomain,
        serviceName: service,
        action: 'automations.receiveSetPropertyForwardTo',
        data: {
          target,
          collectionType,
          setDoc,
          pushDoc
        }
      });
    }

    if (response.error) {
      result.push(response);
      continue;
    }

    result.push({
      _id: relatedItem._id,
      rules: (Object as any)
        .values(setDoc)
        .map(v => String(v))
        .join(', ')
    });
  }

  return { module, fields: rules.map(r => r.field).join(', '), result };
};
