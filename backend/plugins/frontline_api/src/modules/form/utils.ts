import { LOG_MAPPINGS } from '../inbox/constants';

export const getSchemaLabels = async (type: string) => {
  let fieldNames: any[] = [];

  const found: any = LOG_MAPPINGS.find((m) => m.name === type);

  if (found) {
    const schemas: any = found.schemas || [];

    for (const schema of schemas) {
      // schema comes as either mongoose schema or plain object
      const names: string[] = Object.getOwnPropertyNames(schema.obj || schema);

      for (const name of names) {
        const field: any = schema.obj ? schema.obj[name] : schema[name];

        if (field && field.label) {
          fieldNames.push({ name, label: field.label });
        }

        // nested object field names
        if (typeof field === 'object' && field.type && field.type.obj) {
          fieldNames = fieldNames.concat(buildLabelList(field.type.obj));
        }
      }
    } // end schema for loop
  } // end schema name mapping

  return fieldNames;
};
export const buildLabelList = (obj = {}): any[] => {
  const list: any[] = [];
  const fieldNames: string[] = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field: any = obj[name];
    const label: string = field && field.label ? field.label : '';

    list.push({ name, label });
  }

  return list;
};

export const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf('_') + 1);
};
