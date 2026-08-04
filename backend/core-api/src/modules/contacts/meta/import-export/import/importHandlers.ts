import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getCustomPropertyHeaders } from '~/meta/import-export/utils';
import { processCompanyRows } from './companies/processCompanyRows';
import { processCustomerRows } from './customers/processCustomerRows';

const contactImportMap = {
  customers: {
    fileName: 'customers-template.csv',
    headers: [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Middle Name', key: 'middleName' },
      { label: 'Email', key: 'primaryEmail' },
      { label: 'Phone', key: 'primaryPhone' },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Description', key: 'description' },
      { label: 'Code', key: 'code' },
      { label: 'Tags', key: 'tags' },
      { label: 'Sex', key: 'sex' },
      { label: 'Birth Date', key: 'birthDate' },
      { label: 'Status', key: 'status' },
      { label: 'Email Validation Status', key: 'emailValidationStatus' },
      { label: 'Phone Validation Status', key: 'phoneValidationStatus' },
    ],
    propertiesType: 'core:customer',
    processRows: (models: IModels, rows: any[]) =>
      processCustomerRows(models, rows, 'customer'),
  },
  leads: {
    fileName: 'leads-template.csv',
    headers: [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Middle Name', key: 'middleName' },
      { label: 'Email', key: 'primaryEmail' },
      { label: 'Phone', key: 'primaryPhone' },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Description', key: 'description' },
      { label: 'Code', key: 'code' },
      { label: 'Sex', key: 'sex' },
      { label: 'Birth Date', key: 'birthDate' },
      { label: 'Status', key: 'status' },
    ],
    propertiesType: 'core:lead',
    processRows: (models: IModels, rows: any[]) =>
      processCustomerRows(models, rows, 'lead'),
  },
  companies: {
    fileName: 'companies-template.csv',
    headers: [
      { label: 'Name', key: 'primaryName' },
      { label: 'Emails', key: 'emails' },
      { label: 'Phones', key: 'phones' },
      { label: 'Website', key: 'website' },
      { label: 'Industry', key: 'industry' },
      { label: 'Size', key: 'size' },
      { label: 'Status', key: 'status' },
      { label: 'Business Type', key: 'businessType' },
      { label: 'Description', key: 'description' },
      { label: 'Employees', key: 'employees' },
      { label: 'Links', key: 'links' },
      { label: 'Tags', key: 'tags' },
      { label: 'Code', key: 'code' },
      { label: 'Location', key: 'location' },
    ],
    propertiesType: 'core:company',
    processRows: processCompanyRows,
  },
};

export const contactImportHandlers = {
  getImportHeaders: async (
    { collectionName }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const { headers = [], propertiesType } =
      contactImportMap[collectionName] || {};

    return [
      ...headers,
      ...(await getCustomPropertyHeaders(models, propertiesType)),
    ];
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => await contactImportMap[collectionName].processRows(models, rows),
};
