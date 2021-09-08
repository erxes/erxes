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

export const setProperty = async ({ triggerType, actionConfig, target }) => {
  const { module, field, operator, value } = actionConfig;

  const conformities = await sendRPCMessage('findConformities', { mainType: triggerType, mainTypeId: target._id, relType: module });

  for (const conformity of conformities) {
    let op1 = conformity[field];

    let updatedValue = await replacePlaceHolders({ actionData: { config: value }, target: target })['config'];

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
      updatedValue = op1.concat(updatedValue)
    }

    if (operator === 'addDay') {
      updatedValue = new Date(op1.setDate(op1.getDate() + updatedValue))
    }

    if (operator === 'subtractDay') {
      updatedValue = new Date(op1.setDate(op1.getDate() - updatedValue))
    }

    await sendRPCMessage('set-property', { module, _id: conformity._id, field, value: updatedValue });
  }
}