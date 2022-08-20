import { generateModels, IModels } from './connectionResolver';

export const getFormFields = async (models: IModels, formId: string) => {
  return models.Fields.find({
    contentType: 'form',
    isDefinedByErxes: false,
    contentTypeId: formId
  });
};

export default {
  fields: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { config = {} } = data;
    const { formId } = config;

    const fields: Array<{
      _id: number;
      name: string;
      group?: string;
      label?: string;
      type?: string;
      validation?: string;
      options?: string[];
      selectOptions?: Array<{ label: string; value: string }>;
    }> = [];

    if (formId) {
      const formFieldsValues = await getFormFields(models, formId);
      const form = await models.Forms.findOne({ _id: formId });

      for (const formField of formFieldsValues) {
        fields.push({
          _id: Math.random(),
          name: formField._id,
          group: form ? form.title : 'Fields',
          label: formField.text,
          options: formField.options,
          validation: formField.validation,
          type: formField.type
        });
      }
    }

    return fields;
  }
};
