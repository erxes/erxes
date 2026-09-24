import {
  getFieldOptionUsedValuesFromModel,
  IFieldOptionUsageCount,
  IFieldOptionUsageModel,
  toPropertyGroupKey,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { FieldOption } from '../../@types';

export const CORE_CONTENT_TYPE_MODELS: Record<string, keyof IModels> = {
  'core:customer': 'Customers',
  'core:company': 'Companies',
  'core:product': 'Products',
  'core:user': 'Users',
};

export const PLUGIN_CONTENT_TYPE_OWNERS: Record<string, string> = {
  'frontline:ticket': 'frontline',
  'sales:deal': 'sales',
};

export const extractOptionValues = (
  options?: Array<FieldOption | string>,
): string[] =>
  (options || [])
    .map((option) => (typeof option === 'string' ? option : option?.value))
    .filter((value): value is string => typeof value === 'string');

const resolveMultipleGroupKey = async (
  models: IModels,
  groupId?: string,
): Promise<string | null> => {
  if (!groupId) {
    return null;
  }

  const group = await models.FieldsGroups.findOne({
    _id: groupId,
    'configs.isMultiple': true,
  }).lean();

  return group ? toPropertyGroupKey(group._id) : null;
};

export const getFieldOptionUsedValues = async (
  models: IModels,
  subdomain: string,
  field: { _id: string; contentType?: string; groupId?: string },
  values: string[],
): Promise<IFieldOptionUsageCount[] | null> => {
  if (!values.length) {
    return [];
  }

  const groupKey = await resolveMultipleGroupKey(models, field.groupId);

  const modelName = CORE_CONTENT_TYPE_MODELS[field.contentType || ''];

  if (!modelName) {
    const pluginName = PLUGIN_CONTENT_TYPE_OWNERS[field.contentType || ''];

    if (!pluginName) {
      return null;
    }

    return sendTRPCMessage({
      subdomain,
      pluginName,
      method: 'query',
      module: 'fields',
      action: 'fieldOptionUsedValues',
      input: {
        contentType: field.contentType,
        fieldId: field._id,
        values,
        groupKey,
      },
      defaultValue: null,
    });
  }

  const model = models[modelName] as unknown as IFieldOptionUsageModel;

  return getFieldOptionUsedValuesFromModel(model, field._id, values, groupKey);
};
