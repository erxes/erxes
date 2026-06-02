import { pluralFormation } from '../../utils';
import { sendTRPCMessage } from '../../utils/trpc';
import { AUTOMATION_PROPERTY_OPERATORS } from './constants';
import { IPropertyProps } from './types';
import { replaceOutputPlaceholders } from './outputResolvers';
import { splitType } from './typeUtils';

export { splitType } from './typeUtils';

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

const getPerValue = async ({
  subdomain,
  relatedItem,
  rule,
  execution,
}: {
  subdomain: string;
  relatedItem: any;
  rule: any;
  execution: any;
}) => {
  const { field = '', operator = '' } = rule;
  const { value } = rule;

  let op1 = convertOp1(relatedItem, field);

  let updatedValue: any = (
    await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: { value },
    })
  )?.value;

  if (String(updatedValue ?? '').match(/^[0-9+\-*/\s().]+$/)) {
    try {
      updatedValue = safeArithmeticEval(String(updatedValue ?? ''));
    } catch {
      updatedValue = 0;
    }
  }

  if (field.includes('Ids')) {
    const ids: string[] =
      String(updatedValue || '')
        .trim()
        .replace(/, /g, ',')
        .split(',') || [];
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
    } catch {
      op1 = new Date();
    }

    updatedValue =
      operator === 'addDay'
        ? Number.parseFloat(String(updatedValue))
        : -1 * Number.parseFloat(String(updatedValue));
    updatedValue = new Date(op1.setDate(op1.getDate() + updatedValue));
  }

  return updatedValue;
};

export const setProperty = async <TModels>({
  subdomain,
  module,
  rules,
  execution,
  relatedItems,
}: IPropertyProps<TModels>) => {
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
        subdomain,
        relatedItem,
        rule,
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
      result.push(error instanceof Error ? error.message : String(error));
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
