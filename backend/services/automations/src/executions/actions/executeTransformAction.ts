import {
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';

type TTransformMapping = {
  key?: string;
  value?: any;
  type?: 'text' | 'number' | 'boolean' | 'object' | 'array';
  isExpression?: boolean;
};

type TParsedTernaryExpression = {
  condition: string;
  truthy: string;
  falsy: string;
};
type TExpressionLiteral = string | number | boolean;

const EMPTY_EXPRESSION_OPERAND = 0;

const setValueByPath = (
  target: Record<string, any>,
  path: string,
  value: any,
) => {
  const segments = path.split('.').filter(Boolean);
  const lastSegment = segments.pop();

  if (!lastSegment) {
    return;
  }

  let current = target;
  for (const segment of segments) {
    if (
      !current[segment] ||
      typeof current[segment] !== 'object' ||
      Array.isArray(current[segment])
    ) {
      current[segment] = {};
    }

    current = current[segment];
  }

  current[lastSegment] = value;
};

const parseBoolean = (value: any) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(normalized);
};

const parseJsonValue = (value: any, fallback: any) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const coerceValue = (value: any, type: TTransformMapping['type']) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (type === 'number') {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? 0 : numberValue;
  }

  if (type === 'boolean') {
    return parseBoolean(value);
  }

  if (type === 'object') {
    return parseJsonValue(value, {});
  }

  if (type === 'array') {
    const parsed = parseJsonValue(value, []);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  return String(value);
};

const parseExpressionLiteral = (value: string): TExpressionLiteral => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  return trimmed;
};

const parseExpressionOperand = (value: string): TExpressionLiteral => {
  const trimmed = value.trim();

  if (!trimmed) {
    return EMPTY_EXPRESSION_OPERAND;
  }

  return parseExpressionLiteral(trimmed);
};

const splitByOperator = (expression: string, operator: '&&' | '||') =>
  expression
    .split(operator)
    .map((part) => part.trim())
    .filter(Boolean);

const compareExpressionValues = (
  left: TExpressionLiteral,
  right: TExpressionLiteral,
  operator: string,
) => {
  if (['>=', '<=', '>', '<'].includes(operator)) {
    const leftNumber = Number(left);
    const rightNumber = Number(right);

    if (Number.isNaN(leftNumber) || Number.isNaN(rightNumber)) {
      return false;
    }

    switch (operator) {
      case '>=':
        return leftNumber >= rightNumber;
      case '<=':
        return leftNumber <= rightNumber;
      case '>':
        return leftNumber > rightNumber;
      case '<':
        return leftNumber < rightNumber;
      default:
        return false;
    }
  }

  switch (operator) {
    case '===':
      return left === right;
    case '!==':
      return left !== right;
    case '==':
      return String(left) === String(right);
    case '!=':
      return String(left) !== String(right);
    default:
      return false;
  }
};

const evaluateComparisonExpression = (expression: string) => {
  const operators = ['>=', '<=', '===', '!==', '==', '!=', '>', '<'];
  const operator = operators.find((item) => expression.includes(item));

  if (!operator) {
    return Boolean(parseExpressionLiteral(expression));
  }

  const [left, ...rightParts] = expression.split(operator);
  const right = rightParts.join(operator);

  return compareExpressionValues(
    parseExpressionOperand(left || ''),
    parseExpressionOperand(right || ''),
    operator,
  );
};

const evaluateConditionExpression = (expression: string) => {
  const orParts = splitByOperator(expression, '||');

  return orParts.some((orPart) =>
    splitByOperator(orPart, '&&').every(evaluateComparisonExpression),
  );
};

const parseTernaryExpression = (
  expression: string,
): TParsedTernaryExpression | null => {
  const questionIndex = expression.indexOf('?');

  if (questionIndex === -1) {
    return null;
  }

  let nestedTernaryCount = 0;

  for (let index = questionIndex + 1; index < expression.length; index++) {
    const char = expression[index];

    if (char === '?') {
      nestedTernaryCount++;
      continue;
    }

    if (char !== ':') {
      continue;
    }

    if (nestedTernaryCount > 0) {
      nestedTernaryCount--;
      continue;
    }

    return {
      condition: expression.slice(0, questionIndex).trim(),
      truthy: expression.slice(questionIndex + 1, index).trim(),
      falsy: expression.slice(index + 1).trim(),
    };
  }

  return null;
};

const evaluateTransformExpression = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const expression = value.trim();
  const ternaryExpression = parseTernaryExpression(expression);

  if (!ternaryExpression) {
    return parseExpressionLiteral(expression);
  }

  return evaluateTransformExpression(
    evaluateConditionExpression(ternaryExpression.condition)
      ? ternaryExpression.truthy
      : ternaryExpression.falsy,
  );
};

export const executeTransformAction = async ({
  subdomain,
  execution,
  action,
}: {
  subdomain: string;
  triggerType: string;
  targetType: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction;
}) => {
  const mappings: TTransformMapping[] = action.config?.mappings || [];
  const values = mappings.reduce<Record<string, unknown>>((acc, mapping) => {
    if (mapping.key) {
      acc[mapping.key] = mapping.value;
    }

    return acc;
  }, {});
  const resolvedValues = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values,
  });

  const data = mappings.reduce<Record<string, any>>((acc, mapping) => {
    if (!mapping.key) {
      return acc;
    }

    setValueByPath(
      acc,
      mapping.key,
      coerceValue(
        mapping.isExpression
          ? evaluateTransformExpression(resolvedValues?.[mapping.key])
          : resolvedValues?.[mapping.key],
        mapping.type,
      ),
    );
    return acc;
  }, {});

  return { data };
};
