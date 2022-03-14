import { IModels } from './connectionResolver';
import { fetchService } from './messageBroker';

export const getCustomFields = async (models: IModels, contentType: string) => {
  return models.Fields.find({
    contentType,
    isDefinedByErxes: false
  });
};

const getFieldGroup = async (models: IModels, _id: string) => {
  return models.FieldsGroups.findOne({ _id });
};

/**
 * Generates all field choices base on given kind.
 */
export const fieldsCombinedByContentType = async (models: IModels, {
  contentType,
  usageType,
  excludedNames,
  segmentId,
  config
}: {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  segmentId?: string;
  config?: any;
}) => {
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

  console.log(contentType);

  fields = await fetchService(
    contentType,
    'getList',
    {
      segmentId,
      usageType,
      config
    },
    []
  );

  const customFields = await getCustomFields(models, contentType);

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
        validation: customField.validation,
        type: customField.type
      });
    }
  }

  fields = [...fields];

  return fields.filter(field => !(excludedNames || []).includes(field.name));
};
