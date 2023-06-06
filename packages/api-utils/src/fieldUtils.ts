export const generateFieldsFromSchema = async (
  queSchema: any,
  namePrefix: string
) => {
  const fields: any = [];

  // field definitions
  const paths = queSchema.paths;

  for (const name of Object.keys(paths)) {
    const path = paths[name];
    const label = path.options.label;
    const type = path.instance;

    const selectOptions = path.options.selectOptions;

    if (['String', 'Number', 'Date', 'Boolean'].includes(type) && label) {
      // add to fields list
      fields.push({
        _id: Math.random(),
        name: `${namePrefix}${name}`,
        label,
        type: path.instance,
        selectOptions
      });
    }
  }

  return fields;
};

export const customFieldsDataByFieldCode = async (
  object,
  subdomain,
  sendMessage
) => {
  const customFieldsData =
    object.customFieldsData && object.customFieldsData.toObject
      ? object.customFieldsData.toObject()
      : object.customFieldsData || [];

  const fieldIds = customFieldsData.map(data => data.field);

  const fields = await sendMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.find',
    data: {
      query: {
        _id: { $in: fieldIds }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  const fieldCodesById = {};

  for (const field of fields) {
    fieldCodesById[field._id] = {
      code: field.code,
      text: field.text
    };
  }

  const results: any = {};

  for (const data of customFieldsData) {
    if (fieldCodesById[data.field]) {
      results[fieldCodesById[data.field].code] = {
        ...data,
        text: fieldCodesById[data.field].text
      };
    }
  }

  return results;
};
