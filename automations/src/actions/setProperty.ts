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

  // if (Object.keys(target).includes(`${module}Id`)) {
  //   return [await sendRPCMessage('findOneObject', { model: module, selector: { _id: target._id } })];
  // }
  if (triggerType === 'conversation' && ['task', 'ticket', 'deal'].includes(module)) {
    return sendRPCMessage('findObjects', { model: `${module[0].toUpperCase()}${module.substr(1)}s`, selector: { sourceConversationIds: { $in: [target._id] } } })
  }

  if (['customer', 'company'].includes(module) && triggerType === 'conversation') {
    return sendRPCMessage('findObjects', {
      model: module === 'company' ? 'Companies' : 'Customers', selector: { _id: target[`${module}Id`] }
    });
  }

  if (['task', 'ticket', 'deal', 'customer', 'company'].includes(triggerType) && ['task', 'ticket', 'deal', 'customer', 'company'].includes(module)) {
    return sendRPCMessage('findConformities', { mainType: triggerType, mainTypeId: target._id, relType: module });
  }

  return [];
}

export const setProperty = async ({ triggerType, actionConfig, target }) => {
  const { module, field, operator, value } = actionConfig;
  const result = [];
  try {
    const conformities = await getToChangeObjects({ triggerType, target, module });

    for (const conformity of conformities) {
      let op1 = conformity[field];

      let updatedValue = (await replacePlaceHolders({ actionData: { config: value }, target })).config;

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

      const response = await sendRPCMessage('set-property', { module, _id: conformity._id, field, value: updatedValue });
      if (response.error) {
        result.push(response);
      }

      result.push({
        _id: conformity._id,
        value: updatedValue
      })
    }
    return {module, field, result}
  } catch (e) {
    return { error: e.message };
  }
}