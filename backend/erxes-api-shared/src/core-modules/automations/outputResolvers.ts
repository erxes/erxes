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

const propertyFieldsCache = new Map<string, Promise<any[]>>();

export const resolveFromSourceField =
  <TModels = any>(
    sourceField: string,
    resolver: (args: {
      subdomain: string;
      source: Record<string, any>;
      path: string;
      value: any;
      defaultValue?: any;
    }) => Promise<any>,
  ) =>
  async ({
    subdomain,
    source,
    path,
    defaultValue,
  }: {
    subdomain: string;
    source: Record<string, any>;
    path: string;
    defaultValue?: any;
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

export const getValueByPath = (source: Record<string, any>, path: string) => {
  const segments = path.split('.');
  let current: any = source;

  for (const segment of segments) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object' ||
      !(segment in current)
    ) {
      return { found: false };
    }

    current = current[segment];
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
  source: Record<string, any>;
  paths: string[];
  defaultValue?: any;
}) => {
  const result: Record<string, any> = {};

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
      const fields = await getPropertyFields(subdomain, propertySource.propertyType);
      const field = fields.find(
        (item: any) => item.code === propertyCode || item.name === propertyCode,
      );

      result[path] = field
        ? source?.propertiesData?.[field._id] ?? defaultValue
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
