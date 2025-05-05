import { IColumnLabel } from '@erxes/api-utils/src/types';
import * as moment from 'moment';
import * as xlsxPopulate from 'xlsx-populate';
import { IContractDocument } from './models/definitions/contracts';
import { REPAYMENT } from './models/definitions/constants';
import { IModels } from './connectionResolver';
import { sendSalesMessage } from './messageBroker';
import { customFieldToObject } from './graphql/resolvers/utils';
import { generateSchedules } from './models/utils/scheduleUtils';

export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

export const buildFile = async (
  data: any
): Promise<{ name: string; response: string }> => {
  if (!data || !data.length) {
    return {
      name: 'No data',
      response: 'No data',
    };
  }

  const workbook = await xlsxPopulate.fromBlankAsync();
  const sheet = workbook.sheet(0);

  const columnNames: string[] = [];
  let rowIndex: number = 1;

  const headers = [
    { name: 'payDate', label: 'Date' },
    { name: 'transactionType', label: 'Type' },
    { name: 'payment', label: 'Amount' },
    { name: 'interestEve', label: 'Interest' },
    { name: 'loss', label: 'Loss' },
    { name: 'total', label: 'Total' },
  ];

  for (const item of data) {
    rowIndex++;
    // Iterating through basic info columns
    for (const column of headers) {
      const cellValue = await fillCellValue(column.name, item);

      addCell(column, cellValue, sheet, columnNames, rowIndex);
    }

    // customer or company checking
  } // end items for loop

  return {
    name: `saving transactions ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook),
  };
};

const addCell = (
  col: IColumnLabel,
  value: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number
): void => {
  // Checking if existing column
  if (columnNames.includes(col.name)) {
    // If column already exists adding cell
    sheet.cell(rowIndex, columnNames.indexOf(col.name) + 1).value(value);
  } else {
    // Creating column
    sheet.cell(1, columnNames.length + 1).value(col.label || col.name);
    // Creating cell
    sheet.cell(rowIndex, columnNames.length + 1).value(value);

    columnNames.push(col.name);
  }
};

const getCellValue = (item, colName) => {
  const names = colName.split('.');

  if (names.length === 1) {
    return item[colName];
  } else {
    const value = item[names[0]];

    return value ? value[names[1]] : '';
  }
};

const fillCellValue = async (colName: string, item: any): Promise<string> => {
  const emptyMsg = '-';

  if (!item) {
    return emptyMsg;
  }

  if (colName === 'payDate') {
    return moment(item[colName]).format('YYYY-MM-DD');
  }

  let cellValue: any = getCellValue(item, colName);
  return cellValue || emptyMsg;
};

export const dealContract = async (
  dealId: string,
  args: any,
  models: IModels,
  subdomain: string
) => {
  let fakeContract: IContractDocument = {
    _id: 'tempFakeContract',
    contractDate: new Date(),
    startDate: new Date(),
    endDate: new Date(
      moment(new Date())
        .add(args?.tenor || 1, 'M')
        .format('YYYY-MM-DD')
    ),
    tenor: 1,
    scheduleDays: [new Date().getDate()],
    interestRate: 0,
    repayment: REPAYMENT.FIXED,
    ...(args || {}),
  };

  if (dealId) {
    const contract = await models.Contracts.findOne({ dealId }).lean();
    if (contract?._id) {
      return {
        contract,
        schedules: await models.Schedules.find({ contractId: contract._id }),
        firstSchedules: await models.FirstSchedules.find({
          contractId: contract._id,
        }),
      };
    }

    const deal = await sendSalesMessage({
      subdomain,
      action: 'deals.findOne',
      data: { _id: dealId },
      isRPC: true,
    });

    if (!deal?._id) {
      throw new Error('deal not found');
    }

    const contractData = await customFieldToObject(
      models,
      subdomain,
      'sales:deal',
      deal
    );

    fakeContract = {
      ...fakeContract,
      endDate: moment(new Date()).add(contractData.tenor || 1, 'M'),
      ...contractData,
    };
  }
  const bulkEntries = await generateSchedules(subdomain, models, fakeContract);

  return {
    contract: { ...fakeContract },
    schedules: [],
    firstSchedules: bulkEntries,
  };
};
