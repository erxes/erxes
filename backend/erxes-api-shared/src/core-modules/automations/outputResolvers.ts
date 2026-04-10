import { sendTRPCMessage } from '../../utils/trpc';
import {
  AutomationConstants,
  IAutomationsActionConfig,
  IAutomationsTriggerConfig,
  TAutomationOutputDefinition,
  TAutomationRuntimeOutputDefinition,
} from './types';

type TAutomationNodeConfig =
  | IAutomationsTriggerConfig
  | IAutomationsActionConfig;

type TAutomationOutputSource = Record<string, unknown>;
type TPropertyField = {
  _id: string;
  code?: string;
  name?: string;
};

const propertyFieldsCache = new Map<string, Promise<TPropertyField[]>>();

export const resolveFromSourceField =
  <TModels = unknown>(
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

const getPropertyFields = async (subdomain: string, propertyType: string) => {
  const cacheKey = `${subdomain}:${propertyType}`;

  if (!propertyFieldsCache.has(cacheKey)) {
    propertyFieldsCache.set(
      cacheKey,
      sendTRPCMessage({
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
      }).catch(() => []),
    );
  }

  return propertyFieldsCache.get(cacheKey)!;
};

export const resolveOutputValues = async ({
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
    const matchedResolver = Object.entries(definition.resolvers || {}).find(
      ([resolverKey]) => matchAutomationResolverKey(resolverKey, path),
    );

    if (matchedResolver) {
      result[path] = await matchedResolver[1]({
        subdomain,
        source,
        path,
        defaultValue,
      });
      continue;
    }

    const propertySource = definition.propertySources?.find((item) =>
      path.startsWith(`${item.key}.`),
    );

    if (propertySource) {
      const propertyCode = path.slice(`${propertySource.key}.`.length);
      const fields = await getPropertyFields(
        subdomain,
        propertySource.propertyType,
      );
      const field = fields.find(
        (item) => item.code === propertyCode || item.name === propertyCode,
      );

      const propertiesData = source.propertiesData as
        | Record<string, unknown>
        | undefined;

      result[path] = field
        ? (propertiesData?.[field._id] ?? defaultValue)
        : defaultValue;
      continue;
    }

    const direct = getValueByPath(source, path);
    result[path] = direct.found ? direct.value : defaultValue;
  }

  return result;
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
  return `${propertyType}${triggerNode.relationType ? `.${triggerNode.relationType}` : ''}`;
};

export const toTransportOutput = (
  output?: TAutomationRuntimeOutputDefinition,
): TAutomationOutputDefinition | undefined => {
  if (!output) {
    return undefined;
  }

  return {
    variables: output.variables,
    propertySources: output.propertySources,
    resolverKeys: output.resolverKeys || Object.keys(output.resolvers || {}),
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
