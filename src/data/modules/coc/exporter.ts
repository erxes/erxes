import * as moment from 'moment';
import { Companies, Customers, Fields } from '../../../db/models';
import { ICompanyDocument } from '../../../db/models/definitions/companies';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import { COMPANY_BASIC_INFOS, CUSTOMER_BASIC_INFOS } from '../../constants';
import { createXlsFile, generateXlsx, paginate } from '../../utils';
import {
  filter as companiesFilter,
  IListArgs as ICompanyListArgs,
  sortBuilder as companiesSortBuilder,
} from './companies';

import { IUserDocument } from '../../../db/models/definitions/users';
import { can } from '../../permissions/utils';
import {
  Builder as BuildQuery,
  IListArgs as ICustomerListArgs,
  sortBuilder as customersSortBuilder,
} from './customers';

type TDocs = ICustomerDocument | ICompanyDocument;

/**
 * Export customers or companies
 */
const cocsExport = async (cocs: TDocs[], cocType: string): Promise<{ name: string; response: string }> => {
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

  const name = `${cocType} - ${moment().format('YYYY-MM-DD HH:mm')}`;

  return {
    name,
    response: await generateXlsx(workbook),
  };
};

/**
 * Export companies to xls file
 */
export const companiesExport = async (params: ICompanyListArgs, user: IUserDocument) => {
  if (!(await can('exportCompanies', user))) {
    throw new Error('Permission denied');
  }

  const selector = await companiesFilter(params);
  const sort = companiesSortBuilder(params);
  const companies = await paginate(Companies.find(selector), params).sort(sort);

  return cocsExport(companies, 'company');
};

/**
 * Export customers to xls file
 */
export const customersExport = async (params: ICustomerListArgs, user: IUserDocument) => {
  if (!(await can('exportCustomers', user))) {
    throw new Error('Permission denied');
  }

  const qb = new BuildQuery(params);

  await qb.buildAllQueries();

  const sort = customersSortBuilder(params);

  const customers = await Customers.find(qb.mainQuery()).sort(sort);

  return cocsExport(customers, 'customer');
};
