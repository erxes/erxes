import { createXlsFile, generateXlsx } from '../../utils';
import { CUSTOMER_BASIC_INFOS } from '../../constants';
import { Fields } from '../../../db/models';

/**
 * Export customers
 * @param {[Object]} customers - Filtered customers
 *
 * @return {String} - file url
 */
export const customersExport = async customers => {
  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  let rowIndex = 1;
  const cols = [];

  const addCell = (col, value) => {
    if (cols.includes(col)) {
      sheet.cell(rowIndex, cols.indexOf(col)).value(value);
    } else {
      sheet.cell(1, cols.length + 1).value(col);
      sheet.cell(rowIndex, cols.length + 1).value(value);

      cols.push(col);
    }
  };

  for (let customer of customers) {
    rowIndex++;

    for (let info of CUSTOMER_BASIC_INFOS) {
      if (customer[info] && customer[info] !== '') {
        addCell(info, customer[info]);
      }
    }

    if (customer.customFieldsData) {
      for (let fieldId in customer.customFieldsData) {
        const propertyObj = await Fields.findOne({ _id: fieldId });

        const { text } = propertyObj;
        addCell(text, customer.customFieldsData[fieldId]);
      }
    }
  }

  // Write to file.
  return generateXlsx(workbook, 'customers');
};
