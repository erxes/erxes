import { generateFieldsFromSchema } from "@erxes/api-utils/src";
import { generateModels, IModels } from "./connectionResolver";
import {
  USER_EXPORT_EXTENDED_FIELDS,
  USER_EXTENDED_FIELDS,
  USER_PROPERTIES_INFO
} from "./constants";

export const getFormFields = async (models: IModels, formId: string) => {
  return models.Fields.find({
    contentType: "form",
    isDefinedByErxes: false,
    contentTypeId: formId
  });
};

const generateFields = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { usageType, formId } = data;

  const { Users } = models;

  let schema: any;
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

  schema = Users.schema;

  if (usageType && usageType === "import") {
    fields = USER_EXTENDED_FIELDS;
  }

  if (usageType && usageType === "export") {
    fields = USER_EXPORT_EXTENDED_FIELDS;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ""))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  if (formId) {
    const formFieldsValues = await getFormFields(models, formId);
    const form = await models.Forms.findOne({ _id: formId });

    for (const formField of formFieldsValues) {
      fields.push({
        _id: Math.random(),
        name: formField._id,
        group: form ? form.title : "Fields",
        label: formField.text,
        options: formField.options,
        validation: formField.validation,
        type: formField.type
      });
    }
  }

  return fields;
};

export default {
  types: [
    {
      description: "Team member",
      type: "user"
    }
  ],
  fields: generateFields,
  systemFields: ({ data: { groupId } }) =>
    USER_PROPERTIES_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `core:user`,
      isDefinedByErxes: true
    })),
  systemFieldsAvailable: true
};
