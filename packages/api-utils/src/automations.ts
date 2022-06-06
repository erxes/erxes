import * as moment from 'moment';

export const replacePlaceHolders = async ({
  models,
  subdomain,
  actionData,
  target,
  isRelated = true,
  getRelatedValue
}: {
  models;
  subdomain: string;
  actionData?: any;
  target: any;
  isRelated?: boolean;
  getRelatedValue: any;
}) => {
  if (actionData) {
    const targetKeys = Object.keys(target);
    const actionDataKeys = Object.keys(actionData);

    for (const actionDataKey of actionDataKeys) {
      for (const targetKey of targetKeys) {
        if (actionData[actionDataKey].includes(`{{ ${targetKey} }}`)) {
          const replaceValue =
            (isRelated &&
              (await getRelatedValue(models, subdomain, target, targetKey))) ||
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

        for (const complexFieldKey of ['customFieldsData', 'trackedData']) {
          if (actionData[actionDataKey].includes(complexFieldKey)) {
            const regex = new RegExp(`{{ ${complexFieldKey}.([\\w\\d]+) }}`);
            const match = regex.exec(actionData[actionDataKey]);
            const fieldId = match && match.length === 2 ? match[1] : '';

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
  conformity;
  rule;
  target;
  getRelatedValue;
}) => {
  const { models, subdomain, conformity, rule, target, getRelatedValue } = args;
  const { field, operator, value } = rule;
  const op1Type = typeof conformity[field];

  let op1 = conformity[field];

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

const replaceServiceTypes = value => {
  return value.replace('cards:', '').replace('contacts:', '');
};

const getRelatedTargets = async (
  triggerType,
  action,
  execution,
  sendCommonMessage
) => {
  const { config } = action;
  const { target } = execution;

  const { module } = config;

  if (module === triggerType) {
    return [target];
  }

  if (
    triggerType === 'inbox:conversation' &&
    ['cards:task', 'cards:ticket', 'cards:deal'].includes(module)
  ) {
    return sendCommonMessage({
      serviceName: 'cards',
      action: `${module.replace('cards:', '')}s.find`,
      data: {
        sourceConversationIds: { $in: [target._id] }
      },
      isRPC: true
    });
  }

  if (
    ['contacts:customer', 'contacts:lead'].includes(triggerType) &&
    target.isFormSubmission &&
    ['cards:task', 'cards:ticket', 'cards:deal'].includes(module)
  ) {
    return sendCommonMessage({
      serviceName: 'cards',
      action: `${module.replace('cards:', '')}s.find`,
      data: {
        sourceConversationIds: { $in: [target.conversationId] }
      },
      isRPC: true
    });
  }

  if (
    triggerType === 'inbox:conversation' &&
    ['contacts:customer', 'contacts:company'].includes(module)
  ) {
    return sendCommonMessage({
      serviceName: 'contacts',
      action: `${module.includes('customer') ? 'customers' : 'companies'}.find`,
      data: {
        _id: target[module.includes('customer') ? 'customerId' : 'companyId']
      },
      isRPC: true
    });
  }

  if (
    [
      'cards:task',
      'cards:ticket',
      'cards:deal',
      'contacts:customer',
      'contacts:company'
    ].includes(triggerType) &&
    [
      'cards:task',
      'cards:ticket',
      'cards:deal',
      'contacts:customer',
      'contacts:company'
    ].includes(module)
  ) {
    const relType = replaceServiceTypes(module);

    const relTypeIds = await sendCommonMessage({
      serviceName: 'core',
      action: 'conformities.savedConformity',
      data: {
        mainType: replaceServiceTypes(triggerType),
        mainTypeId: target._id,
        relTypes: [relType]
      },
      isRPC: true
    });

    const [serviceName, collectionType] = module.split(':');

    return sendCommonMessage({
      serviceName,
      action: `${collectionType}s.find`,
      data: { _id: { $in: relTypeIds } },
      isRPC: true
    });
  }

  return [];
};

export const setProperty = async ({
  models,
  subdomain,
  action,
  execution,
  getRelatedValue,
  triggerType,
  sendCommonMessage
}) => {
  const { module, rules } = action.config;
  const { target } = execution;
  const [serviceName, collectionType] = module.split(':');

  const result: any[] = [];

  const conformities = await getRelatedTargets(
    triggerType,
    action,
    execution,
    sendCommonMessage
  );

  for (const conformity of conformities) {
    const setDoc = {};

    for (const rule of rules) {
      setDoc[rule.field] = await getPerValue({
        models,
        subdomain,
        conformity,
        rule,
        target,
        getRelatedValue
      });
    }

    const response = await sendCommonMessage({
      serviceName,
      action: `${collectionType}s.updateMany`,
      data: { selector: { _id: conformity._id }, modifier: setDoc },
      isRPC: true
    });

    if (response.error) {
      result.push(response);
      continue;
    }

    result.push({
      _id: conformity._id,
      rules: (Object as any)
        .values(setDoc)
        .map(v => String(v))
        .join(', ')
    });
  }

  return { module, fields: rules.map(r => r.field).join(', '), result };
};
