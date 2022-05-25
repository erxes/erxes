import * as moment from 'moment';
import * as xlsxPopulate from 'xlsx-populate';
import { IColumnLabel } from '.';

export const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

/**
 * Generates downloadable xls file on the url
 */
export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

export const getCustomFieldsData = async (getField, item, column, type) => {
  let field;
  let value;

  if (item.customFieldsData && item.customFieldsData.length > 0) {
    for (const customFeild of item.customFieldsData) {
      field = await getField({
        text: column.label.trim(),
        contentType: type === 'lead' ? 'customer' : type
      });

      if (field && field.text) {
        value = customFeild.value;

        if (Array.isArray(value)) {
          value = value.join(', ');
        }

        if (field.validation === 'date') {
          value = moment(value).format('YYYY-MM-DD HH:mm');
        }

        return { field, value };
      }
    }
  }

  return { field, value };
};

export const findSchemaLabels = (
  schema: any,
  basicFields: string[]
): IColumnLabel[] => {
  const fields: IColumnLabel[] = [];

  for (const name of basicFields) {
    const field = schema.obj ? schema.obj[name] : schema[name];

    if (field && field.label) {
      fields.push({ name, label: field.label });
    } else {
      fields.push({ name, label: name });
    }
  }

  return fields;
};
