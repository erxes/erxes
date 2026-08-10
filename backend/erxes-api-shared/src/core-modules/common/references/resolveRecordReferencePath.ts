import { sendCoreModuleProducer } from '../../../utils/trpc/sendCoreModuleProducer';
import { getPlugin, getPlugins } from '../../../utils/service-discovery';
import {
  TRecordReferenceField,
  TRecordReferencesConfig,
  TRecordReferenceProducers,
} from './types';
import { resolveRecordRelationIds } from './resolveRecordRelationIds';
import {
  asArray,
  getLocalRecordReferenceType,
  getRecordReferencePluginName,
  isBlankReferenceValue,
  isSameRecordReferenceType,
  normalizeRecordReferenceType,
  readRecordReferencePath,
  uniq,
} from './utils';

type TRecordReferenceTarget = unknown;

type TResolveRecordReferencePathProps = {
  config: TRecordReferencesConfig;
  defaultValue?: unknown;
  models: unknown;
  path: string;
  pluginName: string;
  subdomain: string;
  target: TRecordReferenceTarget;
  type: string;
};

const getRecordReferenceTargetId = (target: TRecordReferenceTarget) => {
  if (!target || typeof target !== 'object' || !('_id' in target)) {
    return '';
  }

  const id = target._id;

  return id ? String(id) : '';
};

export const resolveRecordReferencePath = async ({
  config,
  defaultValue,
  models,
  path,
  pluginName,
  subdomain,
  target,
  type,
}: TResolveRecordReferencePathProps): Promise<unknown> => {
  if (!target || !path) {
    return defaultValue;
  }

  const [head, ...restParts] = path.split('.');
  const restPath = restParts.join('.');
  const localType = getLocalRecordReferenceType(pluginName, type);
  const referenceType = (config.types || []).find(
    ({ type: itemType }) => itemType === localType || itemType === type,
  );
  const field = findRecordReferenceField(referenceType?.fields || [], head);

  if (!field) {
    const extensionField = findLocalRecordReferenceExtensionField({
      config,
      head,
      pluginName,
      type,
    });

    if (extensionField) {
      return resolveRecordReferenceFieldValue({
        config,
        defaultValue,
        field: extensionField,
        models,
        path,
        pluginName,
        restPath,
        subdomain,
        target,
        type: normalizeRecordReferenceType(pluginName, type),
      });
    }

    const extension = await resolveExternalRecordReferenceExtensionPath({
      defaultValue,
      path,
      pluginName,
      subdomain,
      target,
      type,
    });

    if (extension.found) {
      return extension.value;
    }

    return readRecordReferencePath(target, path) ?? defaultValue;
  }

  return resolveRecordReferenceFieldValue({
    config,
    defaultValue,
    field,
    models,
    path,
    pluginName,
    restPath,
    subdomain,
    target,
    type,
  });
};

export const resolveRecordReferenceExtensionPath = async ({
  config,
  defaultValue,
  models,
  path,
  pluginName,
  subdomain,
  target,
  type,
}: TResolveRecordReferencePathProps): Promise<unknown> => {
  if (!target || !path) {
    return defaultValue;
  }

  const [head, ...restParts] = path.split('.');
  const restPath = restParts.join('.');
  const field = findLocalRecordReferenceExtensionField({
    config,
    head,
    pluginName,
    type,
  });

  if (!field) {
    return readRecordReferencePath(target, path) ?? defaultValue;
  }

  return resolveRecordReferenceFieldValue({
    config,
    defaultValue,
    field,
    models,
    path,
    pluginName,
    restPath,
    subdomain,
    target,
    type: normalizeRecordReferenceType(pluginName, type),
  });
};

const resolveRecordReferenceFieldValue = async ({
  config,
  defaultValue,
  field,
  models,
  path,
  pluginName,
  restPath,
  subdomain,
  target,
  type,
}: TResolveRecordReferencePathProps & {
  field: TRecordReferenceField;
  restPath: string;
}): Promise<unknown> => {
  if (field.resolver) {
    const resolver = config.resolvers?.[field.resolver];

    if (!resolver) {
      return defaultValue;
    }

    const value = await resolver({
      models,
      target,
      subdomain,
      type,
      path,
      field,
    });

    if (!restPath) {
      return value ?? defaultValue;
    }

    if (!field.reference?.type) {
      return resolveNestedRecordReferencePath({
        config,
        defaultValue,
        fields: field.fields || [],
        models,
        path: restPath,
        pluginName,
        subdomain,
        target: value,
        type,
      });
    }

    return resolveRemoteRecordReferencePath({
      defaultValue,
      path: restPath,
      subdomain,
      targetIds: uniq(asArray(value)),
      type: normalizeRecordReferenceType(pluginName, field.reference.type),
    });
  }

  if (!field.reference) {
    const value = readRecordReferencePath(target, field.path || field.key);

    if (!restPath) {
      return value ?? defaultValue;
    }

    return resolveNestedRecordReferencePath({
      config,
      defaultValue,
      fields: field.fields || [],
      models,
      path: restPath,
      pluginName,
      subdomain,
      target: value,
      type,
    });
  }

  if (field.reference.kind === 'field') {
    const value = readRecordReferencePath(
      target,
      field.reference.path || field.path || field.key,
    );

    if (!restPath) {
      return value ?? defaultValue;
    }

    return resolveRemoteRecordReferencePath({
      defaultValue,
      path: restPath,
      subdomain,
      targetIds: uniq(asArray(value)),
      type: normalizeRecordReferenceType(pluginName, field.reference.type),
    });
  }

  if (field.reference.kind === 'relation') {
    const relationIds = await resolveRecordRelationIds({
      defaultValue: [],
      pluginName,
      relatedContentType: normalizeRecordReferenceType(
        pluginName,
        field.reference.type,
      ),
      relType: field.reference.relType,
      sourceId: getRecordReferenceTargetId(target),
      sourceType: type,
      subdomain,
    });

    if (!restPath) {
      return relationIds ?? defaultValue;
    }

    return resolveRemoteRecordReferencePath({
      defaultValue,
      path: restPath,
      subdomain,
      targetIds: uniq(asArray(relationIds)),
      type: normalizeRecordReferenceType(pluginName, field.reference.type),
    });
  }

  return defaultValue;
};

const resolveNestedRecordReferencePath = async ({
  config,
  defaultValue,
  fields,
  models,
  path,
  pluginName,
  subdomain,
  target,
  type,
}: {
  config: TRecordReferencesConfig;
  defaultValue?: unknown;
  fields: TRecordReferenceField[];
  models: unknown;
  path: string;
  pluginName: string;
  subdomain: string;
  target: unknown;
  type: string;
}): Promise<unknown> => {
  if (!target || !path) {
    return target ?? defaultValue;
  }

  if (!fields.length) {
    return readRecordReferencePath(target, path) ?? defaultValue;
  }

  const [head, ...restParts] = path.split('.');
  const nestedField = findRecordReferenceField(fields, head);

  if (!nestedField) {
    return readRecordReferencePath(target, path) ?? defaultValue;
  }

  return resolveRecordReferenceFieldValue({
    config,
    defaultValue,
    field: nestedField,
    models,
    path,
    pluginName,
    restPath: restParts.join('.'),
    subdomain,
    target,
    type,
  });
};

const findRecordReferenceField = (
  fields: TRecordReferenceField[],
  key: string,
) =>
  fields.find(
    (field) =>
      field.key === key || field.path === key || field.reference?.path === key,
  );

const resolveRemoteRecordReferencePath = async ({
  defaultValue,
  path,
  subdomain,
  targetIds,
  type,
}: {
  defaultValue?: any;
  path: string;
  subdomain: string;
  targetIds: string[];
  type: string;
}) => {
  const ids = targetIds.filter((targetId) => !isBlankReferenceValue(targetId));

  if (!ids.length) {
    return defaultValue;
  }

  return sendCoreModuleProducer({
    subdomain,
    moduleName: 'references',
    pluginName: getRecordReferencePluginName(type),
    producerName: TRecordReferenceProducers.RESOLVE,
    input: {
      type,
      targetIds: ids,
      path,
      defaultValue,
    },
    defaultValue,
  });
};

const findLocalRecordReferenceExtensionField = ({
  config,
  head,
  pluginName,
  type,
}: {
  config: TRecordReferencesConfig;
  head: string;
  pluginName: string;
  type: string;
}) => {
  const normalizedType = normalizeRecordReferenceType(pluginName, type);
  const extension = (config.extensions || []).find(({ type: extensionType }) =>
    isSameRecordReferenceType(extensionType, normalizedType),
  );

  return findRecordReferenceField(extension?.fields || [], head);
};

const findRecordReferenceExtensionField = async ({
  head,
  pluginName,
  type,
}: {
  head: string;
  pluginName: string;
  type: string;
}) => {
  const normalizedType = normalizeRecordReferenceType(pluginName, type);
  const providerPluginNames = await getPlugins();

  for (const providerPluginName of providerPluginNames) {
    const plugin = await getPlugin(providerPluginName);
    const extensions = plugin.config?.meta?.references?.extensions as
      | Array<{
          type: string;
          fields?: TRecordReferenceField[];
        }>
      | undefined;

    const extension = (extensions || []).find(({ type: extensionType }) =>
      isSameRecordReferenceType(extensionType, normalizedType),
    );
    const field = findRecordReferenceField(extension?.fields || [], head);

    if (field) {
      return { pluginName: providerPluginName, type: normalizedType };
    }
  }

  return null;
};

const resolveExternalRecordReferenceExtensionPath = async ({
  defaultValue,
  path,
  pluginName,
  subdomain,
  target,
  type,
}: {
  defaultValue?: unknown;
  path: string;
  pluginName: string;
  subdomain: string;
  target: TRecordReferenceTarget;
  type: string;
}) => {
  const [head] = path.split('.');
  const extension = await findRecordReferenceExtensionField({
    head,
    pluginName,
    type,
  });

  if (!extension) {
    return { found: false };
  }

  const result = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'references',
    pluginName: extension.pluginName,
    producerName: TRecordReferenceProducers.RESOLVE,
    input: {
      type: extension.type,
      target,
      path,
      defaultValue,
    },
    defaultValue,
  }).catch(() => defaultValue);

  return { found: true, value: result ?? defaultValue };
};
