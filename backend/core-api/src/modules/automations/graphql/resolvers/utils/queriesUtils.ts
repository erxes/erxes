import {
  AUTOMATION_STATUSES,
  AutomationConstants,
  IAutomationsActionConfig,
  IAutomationsTriggerConfig,
  TAutomationOutputDefinition,
  TAutomationOutputVariable,
  TAutomationFindObjectTargetDefinition,
  TAutomationSetPropertyTarget,
  TRecordReferencesConfig,
  normalizeAutomationConstantsForTransport,
  splitType,
} from 'erxes-api-shared/core-modules';
import { IListArgs } from '../queries';
import {
  getPlugin,
  getPlugins,
  getRealIdFromElk,
} from 'erxes-api-shared/utils';
import { CORE_AUTOMATION_CONSTANTS } from '~/meta/automations/constants';
import { CORE_REFERENCE_TYPES } from '~/meta/references/referenceTypes';
import { IModels } from '~/connectionResolvers';

type TWithPluginName<T> = T & {
  pluginName?: string;
};

type TMatchedSetPropertyTarget =
  TWithPluginName<TAutomationSetPropertyTarget> & {
    matchRank: number;
  };

type TAutomationConstantsResponse = {
  triggersConst: TWithPluginName<IAutomationsTriggerConfig>[];
  triggerTypesConst: string[];
  actionsConst: TWithPluginName<IAutomationsActionConfig>[];
  findObjectTargetsConst: TAutomationFindObjectTargetDefinition[];
  setPropertyTargetsConst: TWithPluginName<TAutomationSetPropertyTarget>[];
};

type TRecordReferenceType = TRecordReferencesConfig['types'][number];
type TRecordReferenceField = TRecordReferenceType['fields'][number];

export const generateAutomationsFilter = (params: IListArgs) => {
  const {
    status,
    searchValue,
    tagIds,
    triggerTypes,
    ids,
    excludeIds = [],
    createdByIds,
    updatedByIds,
    actionTypes,
    createdAtFrom,
    createdAtTo,
    updatedAtFrom,
    updatedAtTo,
  } = params;

  const filter: any = {
    status: { $nin: [AUTOMATION_STATUSES.ARCHIVED, 'template'] },
  };

  if (status) {
    filter.status = status;
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (tagIds) {
    filter.tagIds = { $in: tagIds };
  }

  if (triggerTypes?.length) {
    filter['triggers.type'] = { $in: triggerTypes };
  }

  if (actionTypes?.length) {
    filter['actions.type'] = { $in: actionTypes };
  }

  if (ids?.length) {
    filter._id = { $in: ids };
  }
  if (excludeIds.length) {
    filter._id = { $nin: excludeIds };
  }
  if (createdByIds?.length) {
    filter.createdBy = { $in: createdByIds };
  }
  if (updatedByIds?.length) {
    filter.updatedBy = { $in: updatedByIds };
  }
  if (createdAtFrom) {
    filter.createdAt = { $gte: createdAtFrom };
  }
  if (createdAtTo) {
    filter.createdAt = { ...(filter.createdAt || {}), $lte: createdAtTo };
  }
  if (updatedAtFrom) {
    filter.updatedAt = { $gte: updatedAtFrom };
  }
  if (updatedAtTo) {
    filter.updatedAt = { ...(filter.updatedAt || {}), $lte: updatedAtTo };
  }

  return filter;
};

export const generateAutomationHistoriesFilter = (params: any) => {
  const {
    automationId,
    triggerType,
    triggerId,
    status,
    beginDate,
    endDate,
    targetId,
    targetIds,
  } = params;
  const filter: any = { automationId };

  if (status) {
    filter.status = status;
  }

  if (triggerId) {
    filter.triggerId = triggerId;
  }

  if (triggerType) {
    filter.triggerType = triggerType;
  }

  if (beginDate) {
    filter.createdAt = { $gte: beginDate };
  }

  if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  if (targetId) {
    filter.targetId = targetId;
  }

  if (targetIds?.length) {
    filter.targetId = { $in: targetIds };
  }

  return filter;
};

export const getAutomationConstants =
  async (): Promise<TAutomationConstantsResponse> => {
    const plugins = await getPlugins();
    const normalizedCoreConstants = normalizeAutomationConstantsForTransport(
      'core',
      CORE_AUTOMATION_CONSTANTS,
    );

    const constants: TAutomationConstantsResponse = {
      triggersConst: [...(normalizedCoreConstants.triggers || [])],
      triggerTypesConst: [],
      actionsConst: [...(normalizedCoreConstants.actions || [])],
      findObjectTargetsConst: [
        ...(normalizedCoreConstants.findObjectTargets || []),
      ],
      setPropertyTargetsConst: [
        ...(normalizedCoreConstants.setPropertyTargets || []),
      ],
    };

    for (const pluginName of plugins) {
      if (pluginName === 'core') {
        continue;
      }

      const plugin = await getPlugin(pluginName);
      const meta = plugin.config?.meta ?? {};

      if (!meta?.automations?.constants) {
        continue;
      }

      const pluginConstants = normalizeAutomationConstantsForTransport(
        pluginName,
        meta.automations.constants as AutomationConstants,
      );
      const {
        triggers = [],
        actions = [],
        findObjectTargets = [],
        setPropertyTargets = [],
      } = pluginConstants as AutomationConstants;
      constants.findObjectTargetsConst.push(...findObjectTargets);
      constants.setPropertyTargetsConst.push(
        ...setPropertyTargets.map((target) => ({ ...target, pluginName })),
      );

      for (const trigger of triggers) {
        constants.triggersConst.push({ ...trigger, pluginName });

        if (
          pluginName !== 'core' &&
          trigger.moduleName &&
          trigger.collectionName
        ) {
          const propertyType = `${pluginName}:${trigger.moduleName}.${trigger.collectionName}`;
          constants.triggerTypesConst = [
            ...new Set([...constants.triggerTypesConst, propertyType]),
          ];
        }
      }
      for (const action of actions) {
        constants.actionsConst.push({ ...action, pluginName });
      }
    }

    constants.findObjectTargetsConst = constants.findObjectTargetsConst.filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.value === item.value) ===
        index,
    );

    return constants;
  };

const getAutomationBaseType = (type: string) => {
  const [pluginName, moduleName, collectionName] = splitType(type || '');

  if (!pluginName || !moduleName || !collectionName) {
    return type;
  }

  return `${pluginName}:${moduleName}.${collectionName}`;
};

const getAutomationSourceMatchRank = (candidate = '', sourceType = '') => {
  if (!candidate || !sourceType) {
    return -1;
  }

  if (candidate === sourceType) {
    return 0;
  }

  if (candidate === getAutomationBaseType(sourceType)) {
    return 1;
  }

  return -1;
};

const toSetPropertyTargetOption = (
  target: TWithPluginName<TAutomationSetPropertyTarget>,
) => ({
  label: target.label,
  type: target.type,
  source: target.source,
  cardinality: target.cardinality,
  sourceType: target.sourceType,
  relation: target.relation,
  resolverKey: target.resolverKey,
  pluginName: target.pluginName,
  value: target.type,
  description: target.label,
});

const getSetPropertyTargetOptionKey = (
  target: TWithPluginName<TAutomationSetPropertyTarget>,
) =>
  [
    target.pluginName || '',
    target.label,
    target.type,
    target.source,
    target.cardinality,
    target.relation?.contentType || '',
    target.relation?.relatedContentType || '',
    target.resolverKey || '',
  ].join(':');

export const getAutomationSetPropertyTargets = async (sourceType: string) => {
  const { triggersConst, actionsConst, setPropertyTargetsConst } =
    await getAutomationConstants();
  const targets: TMatchedSetPropertyTarget[] = [];

  for (const trigger of triggersConst) {
    const matchRank = getAutomationSourceMatchRank(
      trigger.type || '',
      sourceType,
    );

    if (matchRank === -1) {
      continue;
    }

    targets.push(
      ...(trigger.setPropertyTargets || []).map((target) => ({
        ...target,
        sourceType: target.sourceType || trigger.type,
        pluginName: trigger.pluginName,
        matchRank,
      })),
    );
  }

  for (const action of actionsConst) {
    const actionSourceType = action.targetSourceType || action.type || '';
    const matchRank = getAutomationSourceMatchRank(
      actionSourceType,
      sourceType,
    );

    if (matchRank === -1) {
      continue;
    }

    targets.push(
      ...(action.setPropertyTargets || []).map((target) => ({
        ...target,
        sourceType: target.sourceType || actionSourceType,
        pluginName: action.pluginName,
        matchRank,
      })),
    );
  }

  for (const target of setPropertyTargetsConst) {
    const matchRank = getAutomationSourceMatchRank(
      target.sourceType || '',
      sourceType,
    );

    if (matchRank === -1) {
      continue;
    }

    targets.push({ ...target, matchRank });
  }

  return targets
    .sort((a, b) => a.matchRank - b.matchRank)
    .filter(
      (target, index, array) =>
        array.findIndex(
          (candidate) =>
            getSetPropertyTargetOptionKey(candidate) ===
            getSetPropertyTargetOptionKey(target),
        ) === index,
    )
    .map(toSetPropertyTargetOption);
};

const normalizeReferenceType = (pluginName: string, type: string) =>
  type.includes(':') ? type : `${pluginName}:${type}`;

const getReferencePluginName = (type: string) => (type || '').split(':')[0];

const getReferenceLocalType = (type: string) => {
  const [, contentType = type] = (type || '').split(':');

  return contentType.includes('.')
    ? contentType.split('.').pop() || contentType
    : contentType;
};

const normalizeReferenceTypes = (
  pluginName: string,
  types: TRecordReferenceType[] = [],
): TRecordReferenceType[] =>
  types.map((referenceType) => ({
    ...referenceType,
    type: normalizeReferenceType(pluginName, referenceType.type),
    fields: (referenceType.fields || []).map((field) => ({
      ...field,
      reference: field.reference
        ? {
            ...field.reference,
            type: normalizeReferenceType(pluginName, field.reference.type),
          }
        : undefined,
    })),
  }));

const isSameReferenceType = (candidate: string, target: string) =>
  candidate === target ||
  (getReferencePluginName(candidate) === getReferencePluginName(target) &&
    getReferenceLocalType(candidate) === getReferenceLocalType(target));

const findReferenceType = (
  referenceTypes: TRecordReferenceType[],
  type: string,
) => referenceTypes.find((item) => isSameReferenceType(item.type, type));

const findReferenceField = (
  referenceType: TRecordReferenceType | undefined,
  field: string,
) =>
  referenceType?.fields?.find(
    (item) =>
      item.key === field ||
      item.path === field ||
      item.reference?.path === field,
  );

const getAutomationOutputDefinition = async (nodeType: string) => {
  const { triggersConst, actionsConst, findObjectTargetsConst } =
    await getAutomationConstants();

  return (
    triggersConst.find(({ type }) => type === nodeType)?.output ||
    actionsConst.find(({ type }) => type === nodeType)?.output ||
    findObjectTargetsConst.find(({ value }) => value === nodeType)?.output ||
    null
  );
};

const findOutputVariable = (
  output: TAutomationOutputDefinition | null,
  field: string,
) =>
  output?.variables?.find(
    (variable) => variable.key === field || variable.field === field,
  );

const getReferenceTypes = async () => {
  const referenceTypes = normalizeReferenceTypes('core', CORE_REFERENCE_TYPES);
  const plugins = await getPlugins();

  for (const pluginName of plugins) {
    if (pluginName === 'core') {
      continue;
    }

    const plugin = await getPlugin(pluginName);
    const pluginReferenceTypes = plugin.config?.meta?.references?.types || [];

    referenceTypes.push(
      ...normalizeReferenceTypes(pluginName, pluginReferenceTypes),
    );
  }

  return referenceTypes;
};

const resolveSourceReferenceType = (
  nodeType: string,
  output: TAutomationOutputDefinition | null,
  referenceTypes: TRecordReferenceType[],
) => {
  const { propertySource } = output || {};
  const candidates = [propertySource?.propertyType, nodeType].filter(
    Boolean,
  ) as string[];

  for (const candidate of candidates) {
    const matchedType = findReferenceType(referenceTypes, candidate);

    if (matchedType) {
      return matchedType.type;
    }
  }

  return '';
};

const resolveAutomationReferenceType = ({
  field,
  output,
  referenceTypes,
  type,
}: {
  field: string;
  output: TAutomationOutputDefinition | null;
  referenceTypes: TRecordReferenceType[];
  type: string;
}) => {
  const variable = findOutputVariable(output, field);

  if (variable?.referenceType) {
    return (
      findReferenceType(referenceTypes, variable.referenceType)?.type ||
      variable.referenceType
    );
  }

  const sourceReferenceType = resolveSourceReferenceType(
    type,
    output,
    referenceTypes,
  );

  if (!sourceReferenceType) {
    return '';
  }

  const sourceType = findReferenceType(referenceTypes, sourceReferenceType);
  const sourceField = findReferenceField(sourceType, field);

  if (!sourceField?.reference?.type) {
    return '';
  }

  return (
    findReferenceType(referenceTypes, sourceField.reference.type)?.type ||
    sourceField.reference.type
  );
};

const toAutomationReferenceField = (
  field: TRecordReferenceField,
  referenceTypes: TRecordReferenceType[],
): TAutomationOutputVariable => {
  const referenceType = field.reference?.type
    ? findReferenceType(referenceTypes, field.reference.type)?.type ||
      field.reference.type
    : undefined;

  return {
    key: field.key,
    label: field.label,
    exposure: field.reference ? 'reference' : undefined,
    field: field.reference?.path || field.path || field.key,
    referenceType,
  };
};

const toCustomReferenceField = (field: any): TAutomationOutputVariable => ({
  key: `propertiesData.${getRealIdFromElk(field._id.toString())}`,
  label: field.label || field.text || field.name || field.code,
  type: field.type,
});

const getCustomReferenceFields = async (
  models: IModels,
  referenceType: string,
) => {
  const fields = await models.Fields.find({ contentType: referenceType })
    .sort({ order: 1, code: 1 })
    .lean();

  return fields.map(toCustomReferenceField);
};

const uniqOutputVariables = (variables: TAutomationOutputVariable[]) =>
  variables.filter(
    (item, index, array) =>
      array.findIndex((candidate) => candidate.key === item.key) === index,
  );

export const getAutomationReferenceFields = async ({
  field,
  models,
  type,
}: {
  field: string;
  models: IModels;
  type: string;
}) => {
  const [output, referenceTypes] = await Promise.all([
    getAutomationOutputDefinition(type),
    getReferenceTypes(),
  ]);
  const referenceType = resolveAutomationReferenceType({
    field,
    output,
    referenceTypes,
    type,
  });

  if (!referenceType) {
    return [];
  }

  const referenceTypeDefinition = findReferenceType(
    referenceTypes,
    referenceType,
  );

  if (!referenceTypeDefinition) {
    return [];
  }

  const baseFields = referenceTypeDefinition.fields
    .filter((field) => {
      if (!field.reference?.type) {
        return true;
      }

      const fieldReferenceType =
        findReferenceType(referenceTypes, field.reference.type)?.type ||
        field.reference.type;

      return !isSameReferenceType(
        fieldReferenceType,
        referenceTypeDefinition.type,
      );
    })
    .map((item) => toAutomationReferenceField(item, referenceTypes));
  const customFields = await getCustomReferenceFields(
    models,
    referenceTypeDefinition.type,
  );

  return uniqOutputVariables([...baseFields, ...customFields]);
};
