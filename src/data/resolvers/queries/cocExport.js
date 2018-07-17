import { createXlsFile, generateXlsx } from '../../utils';
import { CUSTOMER_BASIC_INFOS, COMPANY_BASIC_INFOS } from '../../constants';
import { Fields } from '../../../db/models';
import moment from 'moment';

/**
 * Export customers or companies
 * @param {[Object]} coc - Filtered customers or companies
 *
 * @return {String} - file url
 */
export const cocsExport = async (cocs, cocType) => {
  let basicInfos = CUSTOMER_BASIC_INFOS;

  if (cocType === 'company') {
    basicInfos = COMPANY_BASIC_INFOS;
  }

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const cols = [];

  const addCell = (col, value) => {
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

  let rowIndex = 1;

  for (let coc of cocs) {
    rowIndex++;

    // Iterating through coc basic infos
    for (let info of basicInfos) {
      if (coc[info] && coc[info] !== '') {
        addCell(info, coc[info]);
      }
    }

    // Iterating through coc custom properties
    if (coc.customFieldsData) {
      for (let fieldId in coc.customFieldsData) {
        const propertyObj = await Fields.findOne({ _id: fieldId });

        if (propertyObj) {
          const { text } = propertyObj;

          addCell(text, coc.customFieldsData[fieldId]);
        }
      }
    }
  }
  // Write to file.
  return generateXlsx(workbook, `${cocType} - ${moment().format('YYYY-MM-DD HH:mm')}`);
};
