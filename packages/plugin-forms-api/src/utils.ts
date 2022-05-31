import { IModels } from './connectionResolver';
import { fetchService, sendInboxMessage } from './messageBroker';
import { IFormSubmissionFilter } from './models/definitions/forms';

export const getCustomFields = async (models: IModels, contentType: string) => {
  return models.Fields.find({
    contentType,
    isDefinedByErxes: false
  });
};

const getFieldGroup = async (models: IModels, _id: string) => {
  return models.FieldsGroups.findOne({ _id });
};

interface ICombinedParams {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  segmentId?: string;
  config?: any;
}

/**
 * Generates all field choices base on given kind.
 */
export const fieldsCombinedByContentType = async (
  models: IModels,
  subdomain: string,
  { contentType, usageType, excludedNames, segmentId, config }: ICombinedParams
) => {
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  fields = await fetchService(
    subdomain,
    contentType,
    'getList',
    {
      segmentId,
      usageType,
      config: config || {}
    },
    []
  );

  const customFields = await getCustomFields(models, contentType);

  const generateSelectOptions = options => {
    const selectOptions: Array<{ label: string; value: any }> = [];

    if (options && options.length > 0) {
      for (const option of options) {
        selectOptions.push({
          value: option,
          label: option
        });
      }
    }

    return selectOptions;
  };

  // extend fields list using custom fields data
  for (const customField of customFields) {
    const group = await getFieldGroup(models, customField.groupId || '');

    if (
      group &&
      group.isVisible
      // (customField.isVisibleDetail || customField.isVisibleDetail === undefined)
    ) {
      fields.push({
        _id: Math.random(),
        name: `customFieldsData.${customField._id}`,
        label: customField.text,
        options: customField.options,
        selectOptions: generateSelectOptions(customField.options),
        validation: customField.validation,
        type: customField.type
      });
    }
  }

  fields = [...fields];

  return fields.filter(field => !(excludedNames || []).includes(field.name));
};

export const formSubmissionsQuery = async (
  subdomain,
  models,
  {
    formId,
    tagId,
    contentTypeIds,
    filters
  }: {
    formId: string;
    tagId: string;
    contentTypeIds: string[];
    filters: IFormSubmissionFilter[];
  }
) => {
  const integrationsSelector: any = { kind: 'lead', isActive: true };
  let conversationIds: string[] = [];

  if (formId) {
    integrationsSelector.formId = formId;
  }

  if (tagId) {
    integrationsSelector.tagIds = tagId;
  }

  if (contentTypeIds && contentTypeIds.length > 0) {
    conversationIds = contentTypeIds;
  }

  const submissionFilters: any[] = [];

  if (filters && filters.length > 0) {
    for (const filter of filters) {
      const { formFieldId, value } = filter;

      switch (filter.operator) {
        case 'eq':
          submissionFilters.push({ formFieldId, value: { $eq: value } });
          break;

        case 'c':
          submissionFilters.push({
            formFieldId,
            value: { $regex: new RegExp(value) }
          });
          break;

        case 'gte':
          submissionFilters.push({
            formFieldId,
            value: { $gte: value }
          });
          break;

        case 'lte':
          submissionFilters.push({
            formFieldId,
            value: { $lte: value }
          });
          break;

        default:
          break;
      }
    }

    const subs = await models.FormSubmissions.find({
      $and: submissionFilters
    }).lean();
    conversationIds = subs.map(e => e.contentTypeId);
  }

  const integration = await sendInboxMessage({
    subdomain,
    action: 'integrations.find',
    data: integrationsSelector,
    isRPC: true,
    defaultValue: []
  });

  if (!integration) {
    return null;
  }

  let convsSelector: any = { integrationId: integration._id };

  if (conversationIds.length > 0) {
    convsSelector = { _id: { $in: conversationIds } };
  }

  return convsSelector;
};
