import { replacePlaceHolders } from '../helpers';

export const OPERATORS = {
  ADD: "add",
  SUBTRACT: "subtract",
  MULTIPLY: "multiply",
  DIVIDE: "divide",
  PERCENT: "percent",
  ALL: [
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

export const performMath = async ({ action, execution }) => {
  const { firstOperand, operator, secondOperand } = action.config;

  // replacePlaceHolders({ actionData: { firstOperand, secondOperand }, triggerData: { ...execution.triggerData, } })
  const replaced = await replacePlaceHolders({ actionData: { firstOperand, secondOperand }, triggerData: { ...execution.triggerData, ...execution.actionsData } });

  let op1 = 0;
  let op2 = 0;

  if (!isNaN(parseFloat(replaced.firstOperand))) {
    op1 = firstOperand
  }

  if (!isNaN(parseFloat(replaced.secondOperand))) {
    op2 = secondOperand
  }

  let result = 0;

  switch (operator) {
    case OPERATORS.ADD:
      result = op1 + op2;
      break;
    case OPERATORS.SUBTRACT:
      result = op1 - op2;
      break;
    case OPERATORS.MULTIPLY:
      result = op1 * op2;
      break;
    case OPERATORS.DIVIDE:
      result = op1 / op2 || 1;
      break;
    case OPERATORS.PERCENT:
      result = op1 / 100 * op2;
      break;
  }

  return {
    result
  }

}