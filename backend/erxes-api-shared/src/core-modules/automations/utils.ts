import { pluralFormation } from '../../utils';
import { sendTRPCMessage } from '../../utils/trpc';
import { AUTOMATION_PROPERTY_OPERATORS } from './constants';
import {
  IPropertyProps,
  TAutomationSetPropertyChange,
  TAutomationSetPropertyModifier,
  TAutomationSetPropertyRule,
  TAutomationSetPropertyUpdateArgs,
} from './types';
import { getValueByPath, replaceOutputPlaceholders } from './outputResolvers';
import { splitType } from './typeUtils';

export { splitType } from './typeUtils';

type TSetPropertyRecord = Record<string, unknown>;
type TModifierKey = keyof TAutomationSetPropertyModifier;
type TSetPropertyRuleBuildResult = {
  modifier: TAutomationSetPropertyModifier;
  change?: TAutomationSetPropertyChange;
};

const PROPERTY_DATA_PREFIX = 'propertiesData.';

const CURRENT_VALUE_OPERATORS = new Set<string>([
  AUTOMATION_PROPERTY_OPERATORS.ADD,
  AUTOMATION_PROPERTY_OPERATORS.SUBTRACT,
  AUTOMATION_PROPERTY_OPERATORS.MULTIPLY,
  AUTOMATION_PROPERTY_OPERATORS.DIVIDE,
  AUTOMATION_PROPERTY_OPERATORS.PERCENT,
  AUTOMATION_PROPERTY_OPERATORS.CONCAT,
  AUTOMATION_PROPERTY_OPERATORS.ADD_DAY,
  AUTOMATION_PROPERTY_OPERATORS.SUBTRACT_DAY,
]);

const NUMERIC_OPERATORS = new Set<string>([
  AUTOMATION_PROPERTY_OPERATORS.ADD,
  AUTOMATION_PROPERTY_OPERATORS.SUBTRACT,
  AUTOMATION_PROPERTY_OPERATORS.MULTIPLY,
  AUTOMATION_PROPERTY_OPERATORS.DIVIDE,
  AUTOMATION_PROPERTY_OPERATORS.PERCENT,
]);

const DATE_OPERATORS = new Set<string>([
  AUTOMATION_PROPERTY_OPERATORS.ADD_DAY,
  AUTOMATION_PROPERTY_OPERATORS.SUBTRACT_DAY,
]);

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

const getPropertiesDataKey = (fieldPath: string) => {
  if (!fieldPath.startsWith(PROPERTY_DATA_PREFIX)) {
    return '';
  }

  const key = fieldPath.slice(PROPERTY_DATA_PREFIX.length);

  return key.includes('.') ? '' : key;
};

const toPlainRecord = (item?: Record<string, unknown>) => {
  if (!item) {
    return {};
  }

  const toObject = item.toObject;

  if (typeof toObject === 'function') {
    return toObject.call(item) as TSetPropertyRecord;
  }

  return item;
};

const getCurrentValue = (
  relatedItem: Record<string, unknown>,
  fieldPath: string,
) => {
  const item = toPlainRecord(relatedItem);
  const direct = getValueByPath(item, fieldPath);

  if (direct.found) {
    return direct.value;
  }

  const getter = relatedItem.get;

  if (typeof getter === 'function') {
    return getter.call(relatedItem, fieldPath);
  }

  return undefined;
};

const toNumber = (value: unknown) => {
  const numberValue = Number.parseFloat(String(value ?? 0));

  return Number.isNaN(numberValue) ? 0 : numberValue;
};

const evaluateArithmeticValue = (value: unknown) => {
  const stringValue = String(value ?? '');

  if (!stringValue.match(/^[0-9+\-*/\s().]+$/)) {
    return value;
  }

  try {
    return safeArithmeticEval(stringValue);
  } catch {
    return 0;
  }
};

const toArrayValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null);
  }

  return String(value ?? '')
    .trim()
    .replace(/, /g, ',')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toUniqueArrayValue = (value: unknown) =>
  Array.from(new Set(toArrayValue(value)));

const resolveRuleValue = async ({
  subdomain,
  execution,
  rule,
  fieldPath,
}: {
  subdomain: string;
  execution: IPropertyProps<unknown>['execution'];
  rule: TAutomationSetPropertyRule;
  fieldPath: string;
}) => {
  const replacedValues = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { value: rule.value },
    keepUnresolvedPlaceholders: false,
  });

  let updatedValue = evaluateArithmeticValue(replacedValues.value);

  if (rule.operator === AUTOMATION_PROPERTY_OPERATORS.SPLIT) {
    return toArrayValue(updatedValue);
  }

  if (fieldPath.endsWith('Ids')) {
    updatedValue = toUniqueArrayValue(updatedValue);
  }

  return updatedValue;
};

const getPerValue = async ({
  subdomain,
  relatedItem,
  rule,
  execution,
}: {
  subdomain: string;
  relatedItem: Record<string, unknown>;
  rule: TAutomationSetPropertyRule;
  execution: IPropertyProps<unknown>['execution'];
}) => {
  const fieldPath = rule.field || '';
  const operator = rule.operator || AUTOMATION_PROPERTY_OPERATORS.SET;
  const op1 = getCurrentValue(relatedItem, fieldPath);

  let updatedValue = await resolveRuleValue({
    subdomain,
    execution,
    rule,
    fieldPath,
  });

  if (NUMERIC_OPERATORS.has(operator)) {
    const currentValue = toNumber(op1);
    const numberValue = toNumber(updatedValue);

    switch (operator) {
      case AUTOMATION_PROPERTY_OPERATORS.ADD:
        updatedValue = currentValue + numberValue;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.SUBTRACT:
        updatedValue = currentValue - numberValue;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.MULTIPLY:
        updatedValue = currentValue * numberValue;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.DIVIDE:
        updatedValue = currentValue / numberValue || 1;
        break;
      case AUTOMATION_PROPERTY_OPERATORS.PERCENT:
        updatedValue = (currentValue / 100) * numberValue;
        break;
    }
  }

  if (operator === AUTOMATION_PROPERTY_OPERATORS.CONCAT) {
    updatedValue = String(op1 || '').concat(String(updatedValue ?? ''));
  }

  if (DATE_OPERATORS.has(operator)) {
    const currentDate = new Date(String(op1 || new Date()));
    const dateValue = Number.parseFloat(String(updatedValue));
    const dayOffset =
      operator === AUTOMATION_PROPERTY_OPERATORS.ADD_DAY
        ? dateValue
        : -1 * dateValue;

    updatedValue = new Date(
      currentDate.setDate(currentDate.getDate() + dayOffset),
    );
  }

  return updatedValue;
};

const mergeModifier = (
  base: TAutomationSetPropertyModifier,
  next: TAutomationSetPropertyModifier,
) => {
  for (const key of Object.keys(next) as TModifierKey[]) {
    base[key] = {
      ...(base[key] || {}),
      ...(next[key] || {}),
    };
  }

  return base;
};

const buildArrayAddModifierValue = (value: unknown) =>
  Array.isArray(value) ? { $each: value } : value;

const buildArrayPullModifierValue = (value: unknown) =>
  Array.isArray(value) ? { $in: value } : value;

const getRulePlaceholder = (value: unknown) => {
  if (typeof value !== 'string' || !value.includes('{{')) {
    return undefined;
  }

  return value;
};

const buildSetPropertyChange = ({
  rule,
  value,
  status,
}: {
  rule: TAutomationSetPropertyRule;
  value?: unknown;
  status: TAutomationSetPropertyChange['status'];
}): TAutomationSetPropertyChange => ({
  field: rule.field,
  fieldLabel: rule.fieldLabel || rule.field,
  operator: rule.operator || AUTOMATION_PROPERTY_OPERATORS.SET,
  placeholder: getRulePlaceholder(rule.value),
  value: status === 'cleared' || status === 'skipped' ? undefined : value,
  status,
});

const buildRuleUpdate = async ({
  subdomain,
  relatedItem,
  rule,
  execution,
}: {
  subdomain: string;
  relatedItem: Record<string, unknown>;
  rule: TAutomationSetPropertyRule;
  execution: IPropertyProps<unknown>['execution'];
}): Promise<TSetPropertyRuleBuildResult> => {
  const fieldPath = rule.field || '';
  const operator = rule.operator || AUTOMATION_PROPERTY_OPERATORS.SET;

  if (!fieldPath) {
    return { modifier: {} };
  }

  if (operator === AUTOMATION_PROPERTY_OPERATORS.CLEAR) {
    return {
      modifier: { $unset: { [fieldPath]: '' } },
      change: buildSetPropertyChange({
        rule,
        status: 'cleared',
      }),
    };
  }

  const value = await getPerValue({
    subdomain,
    relatedItem,
    rule,
    execution,
  });

  let modifier: TAutomationSetPropertyModifier = {};

  switch (operator) {
    case AUTOMATION_PROPERTY_OPERATORS.PUSH:
      modifier = { $push: { [fieldPath]: buildArrayAddModifierValue(value) } };
      break;
    case AUTOMATION_PROPERTY_OPERATORS.ADD_TO_SET:
      modifier = {
        $addToSet: { [fieldPath]: buildArrayAddModifierValue(value) },
      };
      break;
    case AUTOMATION_PROPERTY_OPERATORS.PULL:
      modifier = { $pull: { [fieldPath]: buildArrayPullModifierValue(value) } };
      break;
    default:
      modifier = { $set: { [fieldPath]: value } };
  }

  return {
    modifier,
    change: buildSetPropertyChange({
      rule,
      value,
      status: 'updated',
    }),
  };
};

const validatePropertiesDataInModifier = async ({
  subdomain,
  modifier,
}: {
  subdomain: string;
  modifier: TAutomationSetPropertyModifier;
}) => {
  if (!modifier.$set) {
    return modifier;
  }

  const propertiesData: Record<string, unknown> = {};

  for (const [fieldPath, value] of Object.entries(modifier.$set)) {
    const fieldId = getPropertiesDataKey(fieldPath);

    if (fieldId) {
      propertiesData[fieldId] = value;
    }
  }

  if (!Object.keys(propertiesData).length) {
    return modifier;
  }

  const validatedPropertiesData = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'fields',
    action: 'validateFieldValues',
    input: { data: propertiesData },
    defaultValue: propertiesData,
  });

  for (const fieldId of Object.keys(propertiesData)) {
    const fieldPath = `${PROPERTY_DATA_PREFIX}${fieldId}`;

    if (
      Object.prototype.hasOwnProperty.call(validatedPropertiesData, fieldId)
    ) {
      modifier.$set[fieldPath] = validatedPropertiesData[fieldId];
    }
  }

  return modifier;
};

export const buildSetPropertyModifier = async ({
  subdomain,
  rules,
  execution,
  relatedItem = {},
}: {
  subdomain: string;
  rules: TAutomationSetPropertyRule[];
  execution: IPropertyProps<unknown>['execution'];
  relatedItem?: Record<string, unknown>;
}) => {
  return (
    await buildSetPropertyUpdatePayload({
      subdomain,
      rules,
      execution,
      relatedItem,
    })
  ).modifier;
};

const syncSetChangeValues = (
  changes: TAutomationSetPropertyChange[],
  modifier: TAutomationSetPropertyModifier,
) =>
  changes.map((change) => {
    if (
      change.status !== 'updated' ||
      !modifier.$set ||
      !Object.prototype.hasOwnProperty.call(modifier.$set, change.field)
    ) {
      return change;
    }

    return {
      ...change,
      value: modifier.$set[change.field],
    };
  });

const buildSetPropertyUpdatePayload = async ({
  subdomain,
  rules,
  execution,
  relatedItem = {},
}: {
  subdomain: string;
  rules: TAutomationSetPropertyRule[];
  execution: IPropertyProps<unknown>['execution'];
  relatedItem?: Record<string, unknown>;
}) => {
  let modifier: TAutomationSetPropertyModifier = {};
  const changes: TAutomationSetPropertyChange[] = [];

  for (const rule of rules || []) {
    const ruleUpdate = await buildRuleUpdate({
      subdomain,
      relatedItem,
      rule,
      execution,
    });

    modifier = mergeModifier(modifier, ruleUpdate.modifier);

    if (ruleUpdate.change) {
      changes.push(ruleUpdate.change);
    }
  }

  const validatedModifier = await validatePropertiesDataInModifier({
    subdomain,
    modifier,
  });

  return {
    modifier: validatedModifier,
    changes: syncSetChangeValues(changes, validatedModifier),
  };
};

const hasCurrentValueOperators = (rules: TAutomationSetPropertyRule[]) =>
  (rules || []).some((rule) => CURRENT_VALUE_OPERATORS.has(rule.operator));

const hasModifierOperations = (modifier: TAutomationSetPropertyModifier) =>
  Object.values(modifier).some((operation) => {
    return operation && Object.keys(operation).length > 0;
  });

const getIdsSelectorFromItems = (items: Record<string, unknown>[]) => {
  const ids = items.map((item) => item._id).filter(Boolean);

  return ids.length ? { _id: { $in: ids } } : {};
};

const getItemSelector = (
  baseSelector: Record<string, unknown>,
  item: Record<string, unknown>,
) => ({
  ...baseSelector,
  ...(item._id ? { _id: item._id } : {}),
});

const getFallbackTRPCModuleName = (module: string) => {
  const [, moduleName, contentType] = splitType(module);
  const collectionType = contentType || moduleName || '';

  if (!collectionType) {
    return '';
  }

  return collectionType.endsWith('s')
    ? collectionType
    : pluralFormation(collectionType);
};

const updateSetPropertyByTRPC = async ({
  subdomain,
  module,
  selector,
  modifier,
}: {
  subdomain: string;
  module: string;
  selector: Record<string, unknown>;
  modifier: TAutomationSetPropertyModifier;
}) => {
  const [serviceName] = splitType(module);
  const moduleName = getFallbackTRPCModuleName(module);

  if (!serviceName || !moduleName) {
    throw new Error(`Invalid set property module: ${module}`);
  }

  return await sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: serviceName,
    module: moduleName,
    action: 'updateMany',
    input: {
      selector,
      modifier,
    },
  });
};

const getUpdateResultCount = (updateResult: unknown, fallback = 0) => {
  if (!updateResult || typeof updateResult !== 'object') {
    return fallback;
  }

  const result = updateResult as Record<string, unknown>;

  for (const key of ['matchedCount', 'modifiedCount', 'n', 'nModified']) {
    const value = result[key];

    if (typeof value === 'number') {
      return value;
    }
  }

  return fallback;
};

const getSetPropertyUpdate = ({
  subdomain,
  module,
  update,
}: {
  subdomain: string;
  module: string;
  update?: (args: TAutomationSetPropertyUpdateArgs) => Promise<unknown>;
}) =>
  update ||
  ((args: TAutomationSetPropertyUpdateArgs) =>
    updateSetPropertyByTRPC({
      subdomain,
      module,
      selector: args.selector,
      modifier: args.modifier,
    }));

const getSelectorCountFallback = (selector: Record<string, unknown>) => {
  const idSelector = selector._id;

  if (typeof idSelector === 'string') {
    return 1;
  }

  if (
    idSelector &&
    typeof idSelector === 'object' &&
    '$in' in idSelector &&
    Array.isArray((idSelector as Record<string, unknown>).$in)
  ) {
    return ((idSelector as Record<string, unknown>).$in as unknown[]).length;
  }

  return 0;
};

const markChangesStatus = (
  changes: TAutomationSetPropertyChange[],
  status: TAutomationSetPropertyChange['status'],
) =>
  changes.map((change) => ({
    ...change,
    status,
    value:
      status === 'cleared' || status === 'skipped' ? undefined : change.value,
  }));

const formatChangeValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return 'empty';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const formatChangeText = (change: TAutomationSetPropertyChange) => {
  if (change.status === 'failed') {
    return `${change.fieldLabel} failed`;
  }

  if (change.status === 'skipped') {
    return `${change.fieldLabel} skipped`;
  }

  if (change.status === 'cleared') {
    return `${change.fieldLabel} cleared`;
  }

  const value = formatChangeValue(change.value);

  switch (change.operator) {
    case AUTOMATION_PROPERTY_OPERATORS.PUSH:
    case AUTOMATION_PROPERTY_OPERATORS.ADD_TO_SET:
      return `${change.fieldLabel} added ${value}`;
    case AUTOMATION_PROPERTY_OPERATORS.PULL:
      return `${change.fieldLabel} removed ${value}`;
    case AUTOMATION_PROPERTY_OPERATORS.ADD:
      return `${change.fieldLabel} increased to ${value}`;
    case AUTOMATION_PROPERTY_OPERATORS.SUBTRACT:
      return `${change.fieldLabel} decreased to ${value}`;
    default:
      return `${change.fieldLabel} set to ${value}`;
  }
};

const buildSetPropertyTarget = ({
  module,
  count,
  setPropertyTarget,
}: {
  module: string;
  count: number;
  setPropertyTarget?: IPropertyProps<unknown>['setPropertyTarget'];
}) => ({
  label: setPropertyTarget?.label || setPropertyTarget?.description || module,
  type: module,
  count,
});

const buildSetPropertySummary = ({
  target,
  changes,
}: {
  target: ReturnType<typeof buildSetPropertyTarget>;
  changes: TAutomationSetPropertyChange[];
}) => {
  if (!changes.length) {
    return `Updated ${target.count} ${target.label}`;
  }

  return `Updated ${target.count} ${target.label}: ${changes
    .map(formatChangeText)
    .join(', ')}`;
};

const buildSetPropertyResult = ({
  module,
  setPropertyTarget,
  count,
  changes,
}: {
  module: string;
  setPropertyTarget?: IPropertyProps<unknown>['setPropertyTarget'];
  count: number;
  changes: TAutomationSetPropertyChange[];
}) => {
  const target = buildSetPropertyTarget({
    module,
    count,
    setPropertyTarget,
  });

  return {
    target,
    changes,
    summary: buildSetPropertySummary({ target, changes }),
  };
};

const getAutomationBaseType = (type: string) => {
  const [pluginName, moduleName, collectionName] = splitType(type || '');

  if (!pluginName || !moduleName) {
    return type || '';
  }

  const normalizedCollectionName =
    collectionName && collectionName.endsWith('s')
      ? collectionName
      : pluralFormation(collectionName || '');

  return collectionName
    ? `${pluginName}:${moduleName}.${normalizedCollectionName}`
    : `${pluginName}:${moduleName}`;
};

export const getSetPropertySelector = async ({
  subdomain,
  module,
  execution,
  targetType,
  relation,
}: {
  subdomain: string;
  module: string;
  execution: IPropertyProps<unknown>['execution'];
  targetType: string;
  relation?: {
    contentType: string;
    relatedContentType: string;
  };
}) => {
  const target = execution.target || {};
  const targetId = String(execution.targetId || target._id || '');

  if (!targetId) {
    return { _id: { $in: [] } };
  }

  if (
    !relation &&
    getAutomationBaseType(module) === getAutomationBaseType(targetType)
  ) {
    return { _id: targetId };
  }

  const { contentType, relatedContentType } = relation || {};

  if (!contentType || !relatedContentType) {
    return { _id: { $in: [] } };
  }

  const relationIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType,
      contentId: targetId,
      relatedContentType,
    },
    defaultValue: [],
  });

  return {
    _id: {
      $in: Array.from(new Set((relationIds || []).filter(Boolean))),
    },
  };
};

export const setProperty = async <TModels>({
  subdomain,
  module,
  rules,
  execution,
  setPropertyTarget,
  relatedItems = [],
  selector,
  fetchItems,
  update,
}: IPropertyProps<TModels>) => {
  const updateRecord = getSetPropertyUpdate({ subdomain, module, update });
  const needsCurrentValue = hasCurrentValueOperators(rules);
  const baseSelector =
    selector ||
    (relatedItems.length ? getIdsSelectorFromItems(relatedItems) : {});

  if (!needsCurrentValue) {
    const { modifier, changes } = await buildSetPropertyUpdatePayload({
      subdomain,
      rules,
      execution,
    });

    if (!Object.keys(baseSelector).length || !hasModifierOperations(modifier)) {
      return buildSetPropertyResult({
        module,
        setPropertyTarget,
        count: 0,
        changes: markChangesStatus(changes, 'skipped'),
      });
    }

    try {
      const updateResult = await updateRecord({
        selector: baseSelector,
        modifier,
      });
      return buildSetPropertyResult({
        module,
        setPropertyTarget,
        count: getUpdateResultCount(
          updateResult,
          getSelectorCountFallback(baseSelector),
        ),
        changes,
      });
    } catch {
      return buildSetPropertyResult({
        module,
        setPropertyTarget,
        count: 0,
        changes: markChangesStatus(changes, 'failed'),
      });
    }
  }

  const items =
    relatedItems.length || !fetchItems
      ? relatedItems
      : await fetchItems(baseSelector);

  let updatedCount = 0;
  const changes: TAutomationSetPropertyChange[] = [];

  for (const relatedItem of items) {
    const ruleUpdate = await buildSetPropertyUpdatePayload({
      subdomain,
      rules,
      execution,
      relatedItem,
    });
    const { modifier } = ruleUpdate;

    if (!hasModifierOperations(modifier)) {
      changes.push(...markChangesStatus(ruleUpdate.changes, 'skipped'));
      continue;
    }

    const itemSelector = getItemSelector(baseSelector, relatedItem);

    try {
      const updateResult = await updateRecord({
        selector: itemSelector,
        modifier,
        item: relatedItem,
      });
      updatedCount += getUpdateResultCount(updateResult, 1);
      changes.push(...ruleUpdate.changes);
    } catch {
      changes.push(...markChangesStatus(ruleUpdate.changes, 'failed'));
      continue;
    }
  }

  return buildSetPropertyResult({
    module,
    setPropertyTarget,
    count: updatedCount,
    changes,
  });
};

export const getContentType = (type: string) => splitType(type)[2];
export const getModuleName = (type: string) => splitType(type)[1];
export const getPluginName = (type: string) => splitType(type)[0];
