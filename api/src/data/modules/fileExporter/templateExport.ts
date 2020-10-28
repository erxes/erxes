import * as json2csv from 'json2csv';
import { createXlsFile, generateXlsx } from '../../utils';

export const templateExport = async (args: any) => {
  const { configs, type, importType } = args;

  if (importType === 'csv') {
    const { Parser } = json2csv;

    const parser = new Parser({ fields: configs });
    const csv = parser.parse('');

    return {
      name: `${type}-import-template`,
      response: csv
    };
  }

  const { workbook, sheet } = await createXlsFile();

  let rowIndex: number = 1;

  const addCell = (value: string, index: number): void => {
    sheet.cell(1, index).value(value === 'sex' ? 'pronoun' : value);
  };

  for (const config of configs) {
    addCell(config, rowIndex);
    rowIndex++;
  }

  return {
    name: `${type}-import-template`,
    response: await generateXlsx(workbook)
  };
};
