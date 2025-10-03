import { IModels } from '~/connectionResolvers';
import { ICombinedParams } from './types';
import {
  getPlugin,
  getRealIdFromElk,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { httpBatchLink, createTRPCUntypedClient } from '@trpc/client';
import { splitType } from 'erxes-api-shared/core-modules';
import { nanoid } from 'nanoid';

export const getCustomFields = async (
  models: IModels,
  contentType: string,
  validation?: string,
) => {
  const qry: any = {
    contentType,
    isDefinedByErxes: false,
  };

  validation && (qry.validation = validation);

  return models.Fields.find(qry);
};
const getFieldGroup = async (models: IModels, _id: string) => {
  return models.FieldsGroups.findOne({ _id });
};
const getGroupWithCache = async (models, groupId, cache) => {
  if (cache.has(groupId)) {
    return cache.get(groupId);
  }
  const group = await getFieldGroup(models, groupId);
  if (!group) {
    return null;
  }
  cache.set(groupId, group);
  return group;
};

const generateSelectOptions = (options) => {
  if (!options || options.length === 0) {
    return [];
  }
  return options.map((option) => ({
    value: option,
    label: option,
  }));
};

export const fetchServiceForms = async (
  subdomain: string,
  contentType: string,
  action: string,
  data,
  defaultValue?,
) => {
  const [pluginName, type] = contentType.split(':');

  const pluginInfo = await getPlugin(pluginName);

  const client = createTRPCUntypedClient({
    links: [httpBatchLink({ url: `${pluginInfo.address}/trpc` })],
  });

  return (
    (await client.query(`${pluginName}.${type}.${action}`, {
      subdomain,
      data: { ...data, type },
    })) || defaultValue
  );
};

export const fieldsCombinedByContentType = async (
  models: IModels,
  subdomain: string,
  {
    contentType,
    usageType,
    excludedNames,
    segmentId,
    config,
    onlyDates,
  }: ICombinedParams,
) => {
  const [pluginName, moduleType, collectionType] = splitType(contentType);
  let fields = await sendTRPCMessage({
    pluginName,
    method: 'query',
    module: 'fields',
    action: 'getFieldList',
    input: {
      segmentId,
      usageType,
      config: config || {},
      moduleType,
      collectionType,
    },
    defaultValue: [],
  });

  let validation;

  if (onlyDates) {
    fields = fields.filter((f) => f.type === 'Date');
    validation = 'date';
  }

  const type = ['core:visitor', 'core:lead', 'core:customer'].includes(
    contentType,
  )
    ? 'core:customer'
    : contentType;

  const customFields = await getCustomFields(models, type, validation);

  const groupCache = new Map();

  const customFieldsWithGroups = await Promise.all(
    customFields.map(async (customField) => {
      const group = await getGroupWithCache(
        models,
        customField.groupId || '',
        groupCache,
      );
      return { customField, group };
    }),
  );

  const extendedFields = customFieldsWithGroups
    .filter(({ group }) => group?.isVisible)
    .map(({ customField, group }) => ({
      _id: nanoid().toString(),
      name: `customFieldsData.${getRealIdFromElk(customField._id)}`,
      label: customField.text,
      options: customField.options,
      selectOptions: generateSelectOptions(customField.options),
      validation: customField.validation,
      type: customField.type,
      group: group._id,
      code: customField.code,
      fieldId: customField._id,
      groupDetail: group
        ? {
            _id: group._id,
            name: group.name,
            contentType: group.contentType,
            code: group.code,
            description: group.description,
          }
        : undefined,
    }));

  fields = [...fields, ...extendedFields];

  return fields.filter((field) => !(excludedNames || []).includes(field.name));
};
