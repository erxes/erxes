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
