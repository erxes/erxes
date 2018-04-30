import { readTemplate, generateXlsx } from '../../utils';

/**
 * Export customers
 * @param {[Object]} customers - Filtered customers
 *
 * @return {String} - file url
 */
export const customersExport = async customers => {
  // Reads default template
  const { workbook, sheet } = await readTemplate('customers');

  let rowIndex = 1;

  for (let customer of customers) {
    rowIndex++;

    sheet.cell(rowIndex, 1).value(customer.firstName);
    sheet.cell(rowIndex, 2).value(customer.lastName);
    sheet.cell(rowIndex, 3).value(customer.email);
    sheet.cell(rowIndex, 4).value(customer.phone);
    sheet.cell(rowIndex, 5).value(customer.position);
    sheet.cell(rowIndex, 6).value(customer.department);
    sheet.cell(rowIndex, 7).value(customer.leadStatus);
    sheet.cell(rowIndex, 8).value(customer.lifecycleState);
    sheet.cell(rowIndex, 9).value(customer.hasAuthority);
    sheet.cell(rowIndex, 10).value(customer.description);
    sheet.cell(rowIndex, 11).value(customer.doNotDisturb);
  }

  // Write to file.
  return generateXlsx(workbook, 'customers');
};
