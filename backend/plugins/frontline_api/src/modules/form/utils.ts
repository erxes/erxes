import { LOG_MAPPINGS } from '../inbox/constants';

type Field = {
  name: string;
  label?: string;
};
export function getSchemaLabels(fields: Field[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    if (!field?.name) return acc;

    acc[field.name] = field.label || field.name;
    return acc;
  }, {});
}

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
