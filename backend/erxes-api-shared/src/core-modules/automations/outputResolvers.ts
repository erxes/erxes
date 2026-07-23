import { getPlugin, sendCoreModuleProducer } from '../../utils';
import { sendTRPCMessage } from '../../utils/trpc';
import { resolveRecordReferenceValue } from '../common/references';
import { IAutomationExecution } from './definitions';
import {
  AutomationConstants,
  IAutomationsActionConfig,
  IAutomationsTriggerConfig,
  TAutomationOutputDefinition,
  TAutomationProducers,
  TAutomationRuntimeOutputDefinition,
} from './types';
import { splitType } from './typeUtils';

type TAutomationNodeConfig =
  | IAutomationsTriggerConfig
  | IAutomationsActionConfig;

type TAutomationOutputSource = Record<string, unknown>;
type TPropertyField = {
  _id: string;
  code?: string;
  name?: string;
};
type TPlaceholderToken = {
  token: string;
  sourceKey: string;
  sourceType: 'trigger' | 'action' | 'input';
  path: string;
};
type TOutputResolveGroup = {
  groupKey: string;
  nodeType: string;
  source: TAutomationOutputSource;
  paths: Set<string>;
};

export const resolveFromSourceField =
  (
    sourceField: string,
    resolver: (args: {
      subdomain: string;
      source: TAutomationOutputSource;
      path: string;
      value: unknown;
      defaultValue?: unknown;
    }) => Promise<unknown>,
  ) =>
  async ({
    subdomain,
    source,
    path,
    defaultValue,
  }: {
    subdomain: string;
    source: TAutomationOutputSource;
    path: string;
    defaultValue?: unknown;
  }) =>
    resolver({
      subdomain,
      source,
      path,
      value: source?.[sourceField],
      defaultValue,
    });

export const matchAutomationResolverKey = (
  resolverKey: string,
  path: string,
) =>
  resolverKey.endsWith('.*')
    ? path.startsWith(resolverKey.slice(0, -1))
    : resolverKey === path;

export const getValueByPath = (
  source: TAutomationOutputSource,
  path: string,
) => {
  const segments = path.split('.');
  let current: unknown = source;

  for (const segment of segments) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object' ||
      !(segment in current)
    ) {
      return { found: false };
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return { found: true, value: current };
};

const getPropertyFields = async (
  subdomain: string,
  propertyType: string,
): Promise<TPropertyField[]> => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { contentType: propertyType },
      projection: { _id: 1, code: 1, name: 1 },
      sort: { order: 1 },
    },
    defaultValue: [],
  }).catch(() => []);
};

const findReferenceVariable = (
  definition: TAutomationRuntimeOutputDefinition,
  head: string,
) =>
  (definition.variables || []).find(
    (variable) =>
      variable.exposure === 'reference' &&
      (variable.key === head || variable.field === head),
  );

const findSourceTypeReferenceVariable = (
  definition: TAutomationRuntimeOutputDefinition,
  head: string,
) =>
  (definition.variables || []).find(
    (variable) =>
      variable.sourceType && (variable.key === head || variable.field === head),
  );

const getOutputSourceType = ({
  propertySource,
}: TAutomationRuntimeOutputDefinition) => propertySource?.propertyType || '';

const getSourceReferenceTarget = (source: TAutomationOutputSource) => {
  const targetId = source.targetId;

  if (typeof targetId === 'string' && targetId) {
    return { targetId };
  }

  return { target: source };
};

const resolveCurrentOutputSource = async ({
  definition,
  path,
  source,
  subdomain,
}: {
  definition: TAutomationRuntimeOutputDefinition;
  path: string;
  source: TAutomationOutputSource;
  subdomain: string;
}) => {
  const sourceType = getOutputSourceType(definition);
  const targetId = source.targetId;

  if (!sourceType || typeof targetId !== 'string' || !targetId) {
    return source;
  }

  const [head] = path.split('.');
  const propertyKey = definition.propertySource?.key;
  const sourceField =
    propertyKey && head === propertyKey ? 'propertiesData' : head;
  const currentValue = await resolveRecordReferenceValue({
    subdomain,
    type: sourceType,
    targetId,
    path: sourceField,
  });

  return currentValue === undefined
    ? source
    : { ...source, [sourceField]: currentValue };
};

const toReferenceIds = (value: unknown) =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => item !== undefined && item !== null && item !== '')
    .map(String);

const resolveNestedFieldsOutputValue = (
  definition: TAutomationRuntimeOutputDefinition,
  source: TAutomationOutputSource,
  path: string,
) => {
  const [head, ...restParts] = path.split('.');
  const restPath = restParts.join('.');

  if (!restPath) {
    return { found: false };
  }

  const variable = (definition.variables || []).find(
    (item) => item.fields?.length && (item.key === head || item.field === head),
  );

  if (!variable) {
    return { found: false };
  }

  const sourceValue = getValueByPath(source, variable.field || variable.key);

  if (!sourceValue.found) {
    return { found: false };
  }

  if (Array.isArray(sourceValue.value)) {
    const values = sourceValue.value
      .map((item) =>
        getValueByPath((item ?? {}) as TAutomationOutputSource, restPath),
      )
      .filter(
        (result) => result.found && result.value != null && result.value !== '',
      )
      .map((result) => result.value);

    return {
      found: true,
      value: values.length ? values.join(', ') : undefined,
    };
  }

  if (sourceValue.value && typeof sourceValue.value === 'object') {
    const nested = getValueByPath(
      sourceValue.value as TAutomationOutputSource,
      restPath,
    );

    return nested.found ? nested : { found: false };
  }

  return { found: false };
};

const resolveReferenceOutputValue = async ({
  definition,
  defaultValue,
  source,
  subdomain,
  path,
}: {
  definition: TAutomationRuntimeOutputDefinition;
  defaultValue?: unknown;
  source: TAutomationOutputSource;
  subdomain: string;
  path: string;
}) => {
  const [head, ...restParts] = path.split('.');
  const restPath = restParts.join('.');

  const sourceTypeVariable = findSourceTypeReferenceVariable(definition, head);

  if (sourceTypeVariable?.sourceType) {
    return {
      found: true,
      value: await resolveRecordReferenceValue({
        subdomain,
        type: sourceTypeVariable.sourceType,
        target: source,
        path,
        defaultValue,
      }),
    };
  }

  if (!restPath) {
    return { found: false };
  }

  const variable = findReferenceVariable(definition, head);

  if (!variable) {
    return { found: false };
  }

  const sourceType = variable.sourceType || getOutputSourceType(definition);
  const sourceField = variable.field || variable.key;
  const sourceValue = getValueByPath(source, sourceField);
  const targetIds = toReferenceIds(
    sourceValue.found ? sourceValue.value : null,
  );

  if (variable.referenceType && targetIds.length) {
    return {
      found: true,
      value: await resolveRecordReferenceValue({
        subdomain,
        type: variable.referenceType,
        targetIds,
        path: restPath,
        defaultValue,
      }),
    };
  }

  if (!sourceType) {
    return { found: true, value: defaultValue };
  }

  return {
    found: true,
    value: await resolveRecordReferenceValue({
      subdomain,
      type: sourceType,
      ...getSourceReferenceTarget(source),
      path,
      defaultValue,
    }),
  };
};

const resolveSourceReferenceOutputValue = async ({
  definition,
  defaultValue,
  source,
  subdomain,
  path,
}: {
  definition: TAutomationRuntimeOutputDefinition;
  defaultValue?: unknown;
  source: TAutomationOutputSource;
  subdomain: string;
  path: string;
}) => {
  const sourceType = getOutputSourceType(definition);

  if (!sourceType) {
    return { found: false };
  }

  return {
    found: true,
    value: await resolveRecordReferenceValue({
      subdomain,
      type: sourceType,
      ...getSourceReferenceTarget(source),
      path,
      defaultValue,
    }),
  };
};

const resolveOutputPathsFromDefinition = async ({
  definition,
  subdomain,
  source,
  paths,
  defaultValue,
}: {
  definition: TAutomationRuntimeOutputDefinition;
  subdomain: string;
  source: TAutomationOutputSource;
  paths: string[];
  defaultValue?: unknown;
}) => {
  const result: Record<string, unknown> = {};

  for (const path of [...new Set(paths)]) {
    const currentSource = await resolveCurrentOutputSource({
      definition,
      path,
      source,
      subdomain,
    });
    const matchedResolver = Object.entries(definition.resolvers || {}).find(
      ([resolverKey]) => matchAutomationResolverKey(resolverKey, path),
    );

    if (matchedResolver) {
      result[path] = await matchedResolver[1]({
        subdomain,
        source: currentSource,
        path,
        defaultValue,
      });
      continue;
    }

    const propertySource = definition.propertySource;

    if (propertySource && path.startsWith(`${propertySource.key}.`)) {
      const propertyCode = path.slice(`${propertySource.key}.`.length);
      const fields = await getPropertyFields(
        subdomain,
        propertySource.propertyType,
      );
      const field = fields.find(
        (item) => item.code === propertyCode || item.name === propertyCode,
      );

      const propertiesData = currentSource.propertiesData as
        | Record<string, unknown>
        | undefined;

      result[path] = field
        ? (propertiesData?.[field._id] ?? defaultValue)
        : defaultValue;
      continue;
    }

    const nestedFields = resolveNestedFieldsOutputValue(
      definition,
      currentSource,
      path,
    );

    if (nestedFields.found) {
      result[path] = nestedFields.value ?? defaultValue;
      continue;
    }

    const reference = await resolveReferenceOutputValue({
      definition,
      defaultValue,
      source: currentSource,
      subdomain,
      path,
    });

    if (reference.found) {
      result[path] = reference.value;
      continue;
    }

    const direct = getValueByPath(currentSource, path);

    if (direct.found) {
      result[path] = direct.value;
      continue;
    }

    const sourceReference = await resolveSourceReferenceOutputValue({
      definition,
      defaultValue,
      source: currentSource,
      subdomain,
      path,
    });

    result[path] = sourceReference.found ? sourceReference.value : defaultValue;
  }

  return result;
};

const resolveDirectOutputValues = (
  source: TAutomationOutputSource,
  paths: string[],
  defaultValue?: unknown,
) => {
  const result: Record<string, unknown> = {};

  for (const path of [...new Set(paths)]) {
    const direct = getValueByPath(source, path);
    result[path] = direct.found ? direct.value : defaultValue;
  }

  return result;
};

const STATIC_OUTPUT_PLACEHOLDERS: Record<string, number> = {
  now: 0,
  tomorrow: 1,
  nextWeek: 7,
  nextMonth: 30,
};

const resolveStaticOutputPlaceholder = (token: string) => {
  const normalized = token.trim();
  const offsetDays = STATIC_OUTPUT_PLACEHOLDERS[normalized];

  if (offsetDays !== undefined) {
    return new Date(
      Date.now() + offsetDays * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  const dynamicDate = normalized.match(/^now\+(\d+)d$/);

  if (dynamicDate) {
    return new Date(
      Date.now() + Number(dynamicDate[1]) * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  return undefined;
};

const ENTITY_PLACEHOLDER_TYPES = [
  'user',
  'tag',
  'product',
  'company',
  'customer',
];

const BRACKET_PLACEHOLDER_REGEX = /\[\[\s*([^\]]+?)\s*\]\]/g;

// [[ user.XCMwd... ]] -> "XCMwd..."   (use split[1] when split[0] is an entity)
// [[ High ]]          -> "High"        (use the full token when split[1] is missing)
const resolveBracketPlaceholderToken = (token: string) => {
  const trimmed = token.trim();
  const parts = trimmed.split('.');

  if (parts[1] !== undefined && ENTITY_PLACEHOLDER_TYPES.includes(parts[0])) {
    return parts.slice(1).join('.');
  }

  return trimmed;
};

const extractOutputPlaceholderTokens = (value: string) => {
  // Token body excludes both braces so malformed nested placeholders like
  // "{{ trigger.{{ trigger.content }} }}" never match as a whole.
  const regex = /{{\s*([^{}]+)\s*}}/g;
  const tokens = new Map<string, TPlaceholderToken>();

  for (const match of value.matchAll(regex)) {
    const token = match[1].trim();

    if (tokens.has(token)) {
      continue;
    }

    // Workflow member scope: resolved from the child execution's frozen inputs
    if (token.startsWith('input.')) {
      tokens.set(token, {
        token,
        sourceKey: 'input',
        sourceType: 'input',
        path: token.slice('input.'.length),
      });
      continue;
    }

    if (token.startsWith('trigger.')) {
      tokens.set(token, {
        token,
        sourceKey: 'trigger',
        sourceType: 'trigger',
        path: token.slice('trigger.'.length),
      });
      continue;
    }

    if (token.startsWith('actions.')) {
      const [, actionId, ...pathParts] = token.split('.');

      if (!actionId || !pathParts.length) {
        continue;
      }

      tokens.set(token, {
        token,
        sourceKey: actionId,
        sourceType: 'action',
        path: pathParts.join('.'),
      });
      continue;
    }

    if (resolveStaticOutputPlaceholder(token) !== undefined) {
      continue;
    }

    tokens.set(token, {
      token,
      sourceKey: 'trigger',
      sourceType: 'trigger',
      path: token,
    });
  }

  return [...tokens.values()];
};

const getOutputPlaceholderTokensByValueKey = (
  values: Record<string, unknown>,
) => {
  const tokensByValueKey: Record<string, TPlaceholderToken[]> = {};

  const collectTokens = (
    value: unknown,
    result = new Map<string, TPlaceholderToken>(),
  ) => {
    if (typeof value === 'string') {
      for (const token of extractOutputPlaceholderTokens(value)) {
        result.set(token.token, token);
      }

      return result;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectTokens(item, result));
      return result;
    }

    if (value && typeof value === 'object') {
      Object.values(value).forEach((item) => collectTokens(item, result));
    }

    return result;
  };

  for (const [key, value] of Object.entries(values)) {
    const tokens = [...collectTokens(value).values()];

    if (tokens.length) {
      tokensByValueKey[key] = tokens;
    }
  }

  return tokensByValueKey;
};

const addPathToOutputResolveGroup = (
  groups: Map<string, TOutputResolveGroup>,
  {
    groupKey,
    nodeType,
    source,
    path,
  }: {
    groupKey: string;
    nodeType: string;
    source: TAutomationOutputSource;
    path: string;
  },
) => {
  if (!path) {
    return;
  }

  const existingGroup = groups.get(groupKey);

  if (existingGroup) {
    existingGroup.paths.add(path);
    return;
  }

  groups.set(groupKey, {
    groupKey,
    nodeType,
    source,
    paths: new Set([path]),
  });
};

const buildOutputResolveGroups = ({
  execution,
  tokensByValueKey,
}: {
  execution: IAutomationExecution;
  tokensByValueKey: Record<string, TPlaceholderToken[]>;
}) => {
  const groups = new Map<string, TOutputResolveGroup>();

  for (const tokens of Object.values(tokensByValueKey)) {
    for (const token of tokens) {
      // Direct lookup on the frozen input values — no plugin definition
      if (token.sourceType === 'input') {
        addPathToOutputResolveGroup(groups, {
          groupKey: 'input',
          nodeType: '',
          source: execution.inputs || {},
          path: token.path,
        });
        continue;
      }

      if (token.sourceType === 'trigger') {
        addPathToOutputResolveGroup(groups, {
          groupKey: 'trigger',
          nodeType: execution.triggerType,
          source: execution.target || {},
          path: token.path,
        });
        continue;
      }

      const action = (execution.actions || []).find(
        (item) =>
          item.actionId === token.sourceKey && item.status === 'success',
      );

      if (!action) {
        continue;
      }

      addPathToOutputResolveGroup(groups, {
        groupKey: `actions.${action.actionId}`,
        nodeType: action.actionType,
        source: action.result || {},
        path: token.path,
      });
    }
  }

  return [...groups.values()];
};

const getAutomationOutputDefinition = async (nodeType: string) => {
  const [pluginName, moduleName, collectionName, relType] = splitType(
    nodeType || '',
  );

  if (!pluginName) {
    return undefined;
  }

  const plugin = await getPlugin(pluginName);
  const constants = plugin.config?.meta?.automations?.constants;
  const outputs = [
    ...(constants?.triggers || []),
    ...(constants?.actions || []),
    ...(constants?.findObjectTargets || []),
  ];

  return outputs.find((output) => {
    if (output.type === nodeType || output.value === nodeType) {
      return true;
    }

    const isMatch =
      output.moduleName === moduleName &&
      output.collectionName === collectionName;

    if (relType) {
      return (
        isMatch &&
        (output.relationType === relType || output.method === relType)
      );
    }

    return isMatch;
  })?.output as TAutomationRuntimeOutputDefinition | undefined;
};

const hasMatchingResolverKey = (
  definition: TAutomationRuntimeOutputDefinition,
  paths: string[],
) => {
  const resolverKeys = [
    ...Object.keys(definition.resolvers || {}),
    ...(definition.resolverKeys || []),
  ];

  return resolverKeys.some((resolverKey) =>
    paths.some((path) => matchAutomationResolverKey(resolverKey, path)),
  );
};

export const resolveOutputPathsByNodeType = async ({
  subdomain,
  nodeType,
  source,
  paths,
  defaultValue,
  runtimeOutputs,
}: {
  subdomain: string;
  nodeType: string;
  source: TAutomationOutputSource;
  paths: string[];
  defaultValue?: unknown;
  runtimeOutputs?: Record<string, TAutomationRuntimeOutputDefinition>;
}) => {
  const [pluginName] = splitType(nodeType || '');
  const runtimeDefinition = runtimeOutputs?.[nodeType];
  const definition =
    runtimeDefinition || (await getAutomationOutputDefinition(nodeType));

  if (!definition) {
    return resolveDirectOutputValues(source, paths, defaultValue);
  }

  if (runtimeDefinition) {
    return resolveOutputPathsFromDefinition({
      definition: runtimeDefinition,
      subdomain,
      source,
      paths,
      defaultValue,
    });
  }

  if (pluginName && hasMatchingResolverKey(definition, paths)) {
    return sendCoreModuleProducer({
      subdomain,
      moduleName: 'automations',
      pluginName,
      producerName: TAutomationProducers.RESOLVE_OUTPUT_PATHS,
      input: {
        nodeType,
        source,
        paths,
        defaultValue,
      },
      defaultValue: resolveDirectOutputValues(source, paths, defaultValue),
    });
  }

  return resolveOutputPathsFromDefinition({
    definition,
    subdomain,
    source,
    paths,
    defaultValue,
  });
};

const resolveOutputGroups = async ({
  subdomain,
  groups,
  defaultValue,
  runtimeOutputs,
}: {
  subdomain: string;
  groups: TOutputResolveGroup[];
  defaultValue?: unknown;
  runtimeOutputs?: Record<string, TAutomationRuntimeOutputDefinition>;
}) => {
  const resolvedByToken: Record<string, unknown> = {};

  for (const group of groups) {
    const resolvedValues = await resolveOutputPathsByNodeType({
      subdomain,
      nodeType: group.nodeType,
      source: group.source,
      paths: [...group.paths],
      defaultValue,
      runtimeOutputs,
    });

    for (const [path, value] of Object.entries(resolvedValues || {})) {
      resolvedByToken[`${group.groupKey}.${path}`] = value;
    }
  }

  return resolvedByToken;
};

// {{ token }} -> resolved raw value (object/number/string), or undefined
const resolveCurlyPlaceholderToken = (
  token: string,
  resolvedByToken: Record<string, unknown>,
) => {
  const trimmedToken = token.trim();
  const staticValue = resolveStaticOutputPlaceholder(trimmedToken);

  return (
    staticValue ??
    resolvedByToken[trimmedToken] ??
    resolvedByToken[`trigger.${trimmedToken}`]
  );
};

// Replace all {{ }} placeholders in a string.
const replaceCurlyPlaceholders = (
  value: string,
  resolvedByToken: Record<string, unknown>,
  defaultValue?: unknown,
) =>
  value.replace(/{{\s*([^{}]+)\s*}}/g, (_, token: string) => {
    const resolved = resolveCurlyPlaceholderToken(token, resolvedByToken);

    if (resolved === undefined || resolved === null) {
      return defaultValue === undefined ? '' : String(defaultValue);
    }

    return String(resolved);
  });

// Replace all [[ ]] placeholders in a string.
const replaceBracketPlaceholders = (value: string) =>
  value.replace(BRACKET_PLACEHOLDER_REGEX, (_, token: string) =>
    resolveBracketPlaceholderToken(token),
  );

const replaceOutputPlaceholderValue = (
  value: string,
  resolvedByToken: Record<string, unknown>,
  defaultValue?: unknown,
  keepUnresolvedPlaceholders = true,
) => {
  const regex = /{{\s*([^{}]+)\s*}}/g;
  const matches = [...value.matchAll(regex)];
  const fullTokenMatch =
    matches.length === 1 && matches[0][0].trim() === value.trim();

  // Return the raw value when the entire string is a single {{ ... }} token.
  if (fullTokenMatch) {
    const resolved = resolveCurlyPlaceholderToken(
      matches[0][1],
      resolvedByToken,
    );

    if (resolved !== undefined) {
      return resolved;
    }

    return keepUnresolvedPlaceholders ? (defaultValue ?? value) : defaultValue;
  }

  // Otherwise replace placeholders in curly -> bracket order.
  return replaceBracketPlaceholders(
    replaceCurlyPlaceholders(value, resolvedByToken, defaultValue),
  );
};

const replaceOutputPlaceholdersInValue = (
  value: unknown,
  resolvedByToken: Record<string, unknown>,
  defaultValue?: unknown,
  keepUnresolvedPlaceholders?: boolean,
): unknown => {
  if (typeof value === 'string') {
    return replaceOutputPlaceholderValue(
      value,
      resolvedByToken,
      defaultValue,
      keepUnresolvedPlaceholders,
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      replaceOutputPlaceholdersInValue(
        item,
        resolvedByToken,
        defaultValue,
        keepUnresolvedPlaceholders,
      ),
    );
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceOutputPlaceholdersInValue(
          item,
          resolvedByToken,
          defaultValue,
          keepUnresolvedPlaceholders,
        ),
      ]),
    );
  }

  return value;
};

export const replaceOutputPlaceholders = async ({
  subdomain,
  execution,
  values,
  defaultValue,
  runtimeOutputs,
  keepUnresolvedPlaceholders = true,
}: {
  subdomain: string;
  execution: IAutomationExecution;
  values: Record<string, unknown>;
  defaultValue?: unknown;
  runtimeOutputs?: Record<string, TAutomationRuntimeOutputDefinition>;
  keepUnresolvedPlaceholders?: boolean;
}) => {
  const tokensByValueKey = getOutputPlaceholderTokensByValueKey(values);
  const resolvedByToken = Object.keys(tokensByValueKey).length
    ? await resolveOutputGroups({
        subdomain,
        groups: buildOutputResolveGroups({ execution, tokensByValueKey }),
        defaultValue,
        runtimeOutputs,
      })
    : {};

  return Object.entries(values).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      acc[key] = replaceOutputPlaceholdersInValue(
        value,
        resolvedByToken,
        defaultValue,
        keepUnresolvedPlaceholders,
      );

      return acc;
    },
    {},
  );
};

export const getAutomationNodeType = ({
  pluginName,
  node,
  kind,
}: {
  pluginName: string;
  node: TAutomationNodeConfig;
  kind: 'trigger' | 'action';
}) => {
  if (node.type) {
    return node.type;
  }

  if (!node.moduleName || !node.collectionName) {
    return '';
  }

  const propertyType = `${pluginName}:${node.moduleName}.${node.collectionName}`;

  if (kind === 'action') {
    const actionNode = node as IAutomationsActionConfig;
    return `${propertyType}.${actionNode.method || 'create'}`;
  }

  const triggerNode = node as IAutomationsTriggerConfig;
  return `${propertyType}${
    triggerNode.relationType ? `.${triggerNode.relationType}` : ''
  }`;
};

export const toTransportOutput = (
  output?: TAutomationRuntimeOutputDefinition,
): TAutomationOutputDefinition | undefined => {
  if (!output) {
    return undefined;
  }

  return {
    variables: output.variables,
    propertySource: output.propertySource,
    resolverKeys: Object.keys(output.resolvers || {}),
  };
};

export const normalizeAutomationConstantsForTransport = (
  pluginName: string,
  constants?: AutomationConstants,
): AutomationConstants => {
  const triggers = (constants?.triggers || []).map((trigger) => ({
    ...trigger,
    type: getAutomationNodeType({
      pluginName,
      node: trigger,
      kind: 'trigger',
    }),
    output: toTransportOutput(trigger.output),
  }));

  const actions = (constants?.actions || []).map((action) => ({
    ...action,
    type: getAutomationNodeType({
      pluginName,
      node: action,
      kind: 'action',
    }),
    output: toTransportOutput(action.output),
  }));

  return {
    ...constants,
    triggers,
    actions,
    findObjectTargets: (constants?.findObjectTargets || []).map((target) => ({
      ...target,
      output: toTransportOutput(target.output),
    })),
  };
};

export const buildRuntimeOutputsIndex = (
  pluginName: string,
  constants?: AutomationConstants,
) => {
  const runtimeOutputs: Record<string, TAutomationRuntimeOutputDefinition> = {};

  for (const trigger of constants?.triggers || []) {
    if (!trigger.output) {
      continue;
    }

    const type = getAutomationNodeType({
      pluginName,
      node: trigger,
      kind: 'trigger',
    });

    if (type) {
      runtimeOutputs[type] = trigger.output;
    }
  }

  for (const action of constants?.actions || []) {
    if (!action.output) {
      continue;
    }

    const type = getAutomationNodeType({
      pluginName,
      node: action,
      kind: 'action',
    });

    if (type) {
      runtimeOutputs[type] = action.output;
    }
  }

  return runtimeOutputs;
};
