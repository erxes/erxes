import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const OPERATORS = {
  SET: "set",
  CONCAT: "concat",
  ADD: "add",
  SUBTRACT: "subtract",
  MULTIPLY: "multiply",
  DIVIDE: "divide",
  PERCENT: "percent",
  ALL: [
    'set',
    'concat',
    'add',
    'subtract',
    'multiply',
    'divide',
    'percent',
  ]
};

export interface IPerformMathConfig {
  firstOperand: string;
  operator: string;
  secondOperand: string;
}

export type Output = {
  result: number;
}

const getToChangeObjects = async ({ triggerType, target, module }) => {
  if (module === triggerType) {
    return [target];
  }

  if (triggerType === 'conversation' && ['task', 'ticket', 'deal'].includes(module)) {
    return sendRPCMessage('find-objects', { model: `${module[0].toUpperCase()}${module.substr(1)}s`, selector: { sourceConversationIds: { $in: [target._id] } } })
  }

  if (['customer', 'company'].includes(module) && triggerType === 'conversation') {
    return sendRPCMessage('find-objects', {
      model: module === 'company' ? 'Companies' : 'Customers', selector: { _id: target[`${module}Id`] }
    });
  }

  if (['task', 'ticket', 'deal', 'customer', 'company'].includes(triggerType) && ['task', 'ticket', 'deal', 'customer', 'company'].includes(module)) {
    return sendRPCMessage('find-conformities', { mainType: triggerType, mainTypeId: target._id, relType: module });
  }

  return [];
}

const getPerValue = async (conformity, rule, target) => {
  const { field, operator, value } = rule;
  const op1Type = typeof(conformity[field]);
  let op1 = conformity[field];

  let updatedValue = (
    await replacePlaceHolders({ actionData: { config: value }, target, isRelated: op1Type === 'string' ? true : false })
  ).config;

  if(field.includes('Ids')) {
    updatedValue = [...new Set(updatedValue.replace(/, /g, ',').trim().split(','))];
  }

  if ([OPERATORS.ADD, OPERATORS.SUBTRACT, OPERATORS.MULTIPLY, OPERATORS.DIVIDE, OPERATORS.PERCENT].includes(operator)) {
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
        updatedValue = op1 / 100 * numberValue;
        break;
    }
  }

  if (operator === 'concat') {
    updatedValue = (op1 || '').concat(updatedValue)
  }

  if (['addDay', 'subtractDay'].includes(operator)) {
    op1 = op1 || new Date();
    try {
      op1 = new Date(op1)
    } catch (e) {
      op1 = new Date();
    }
    updatedValue = operator === 'addDay' ? parseFloat(updatedValue) : -1 * parseFloat(updatedValue);

    updatedValue = new Date(op1.setDate(op1.getDate() + updatedValue))
  }
  return updatedValue
}

export const setProperty = async ({ triggerType, actionConfig, target }) => {
  const { module, rules } = actionConfig;
  const result = [];
  const modelBy = {
    customer: 'Customers',
    company: 'Companies',
    deal: 'Deals',
    task: 'Tasks',
    ticket: 'Tickets',
    user: 'Users'
  }

  try {
    const conformities = await getToChangeObjects({ triggerType, target, module });

    for (const conformity of conformities) {
      const setDoc = {}
      for (const rule of rules) {
        setDoc[rule.field] = (await getPerValue(conformity, rule, target));
      }
      const response = await sendRPCMessage('set-property', { model: modelBy[module], _id: conformity._id, setDoc });
      if (response.error) {
        result.push(response);
        continue;
      }

      result.push({
        _id: conformity._id,
        rules: Object.values(setDoc).map(v => String(v)).join(', ')
      })
    }
    return { module, fields: rules.map(r => r.field).join(', '), result }
  } catch (e) {
    return { error: e.message };
  }
}
