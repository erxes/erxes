import * as moment from 'moment';
import { Fields } from '../../../db/models';
import { ICompanyDocument } from '../../../db/models/definitions/companies';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import { COMPANY_BASIC_INFOS, CUSTOMER_BASIC_INFOS } from '../../constants';
import { createXlsFile, generateXlsx } from '../../utils';

type TDocs = ICustomerDocument | ICompanyDocument;

/**
 * Export customers or companies
 */
export const cocsExport = async (cocs: TDocs[], cocType: string): Promise<string> => {
  let basicInfos = CUSTOMER_BASIC_INFOS;

  if (cocType === 'company') {
    basicInfos = COMPANY_BASIC_INFOS;
  }

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const cols: string[] = [];
  let rowIndex: number = 1;

  const addCell = (col: string, value: TDocs): void => {
    // Checking if existing column
    if (cols.includes(col)) {
      // If column already exists adding cell
      sheet.cell(rowIndex, cols.indexOf(col) + 1).value(value);
    } else {
      // Creating column
      sheet.cell(1, cols.length + 1).value(col);
      // Creating cell
      sheet.cell(rowIndex, cols.length + 1).value(value);

      cols.push(col);
    }
  };

  for (const coc of cocs) {
    rowIndex++;

    // Iterating through coc basic infos
    for (const info of basicInfos) {
      if (coc[info] && coc[info] !== '') {
        addCell(info, coc[info]);
      }
    }

    // Iterating through coc custom properties
    if (coc.customFieldsData) {
      for (const fieldId of coc.customFieldsData) {
        const propertyObj = await Fields.findOne({ _id: fieldId });

        if (propertyObj && propertyObj.text) {
          const { text } = propertyObj;
          addCell(text, coc.customFieldsData[fieldId]);
        }
      }
    }
  }
  // Write to file.
  return generateXlsx(workbook, `${cocType} - ${moment().format('YYYY-MM-DD HH:mm')}`);
};
