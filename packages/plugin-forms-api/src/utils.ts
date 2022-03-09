import { fetchService } from "./messageBroker";
import { Fields, FieldsGroups } from "./models";

export const getCustomFields = async (contentType: string) => {
  return Fields.find({
    contentType,
    isDefinedByErxes: false,
  });
};

const getFieldGroup = async (_id: string) => {
  return FieldsGroups.findOne({ _id });
};

/**
 * Generates all field choices base on given kind.
 */
export const fieldsCombinedByContentType = async ({
  contentType,
  usageType,
  excludedNames,
  segmentId,
  formId,
}: {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  boardId?: string;
  segmentId?: string;
  formId?: string;
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

  fields = await fetchService(contentType, 'getList', {
    segmentId,
    usageType,
    formId,
  }, []);

  const customFields = await getCustomFields(contentType);

  // extend fields list using custom fields data
  for (const customField of customFields) {
    const group = await getFieldGroup(customField.groupId || "");

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
        type: customField.type,
      });
    }
  }

  fields = [...fields];

  return fields.filter((field) => !(excludedNames || []).includes(field.name));
};
