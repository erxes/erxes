import {
  TCoreModuleProducerContext,
  TGetImportHeadersOutput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getCustomPropertyHeaders } from '~/meta/import-export/utils';
import {
  CONTACT_STATUS_OPTIONS,
  EMAIL_VALIDATION_OPTIONS,
  PHONE_VALIDATION_OPTIONS,
  COMPANY_BUSINESS_TYPE_OPTIONS,
  SEX_OPTIONS,
} from './headerFormats';
import { processCompanyRows } from './companies/processCompanyRows';
import { processCustomerRows } from './customers/processCustomerRows';

const contactImportMap = {
  customers: {
    fileName: 'customers-template.csv',
    headers: [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Middle Name', key: 'middleName' },
      {
        label: 'Email',
        key: 'primaryEmail',
        example: 'name@example.com',
      },
      { label: 'Phone', key: 'primaryPhone' },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Description', key: 'description' },
      { label: 'Code', key: 'code' },
      {
        label: 'Tags',
        key: 'tags',
        dataType: 'multiSelect' as const,
        example: 'VIP, Loyal',
      },
      {
        label: 'Sex',
        key: 'sex',
        dataType: 'select' as const,
        options: SEX_OPTIONS,
        example: SEX_OPTIONS.join(' | '),
      },
      {
        label: 'Birth Date',
        key: 'birthDate',
        dataType: 'date' as const,
        example: 'YYYY-MM-DD',
      },
      {
        label: 'Status',
        key: 'status',
        dataType: 'select' as const,
        options: CONTACT_STATUS_OPTIONS,
        example: CONTACT_STATUS_OPTIONS.join(' | '),
      },
      {
        label: 'Email Validation Status',
        key: 'emailValidationStatus',
        dataType: 'select' as const,
        options: EMAIL_VALIDATION_OPTIONS,
        example: EMAIL_VALIDATION_OPTIONS.slice(0, 3).join(' | '),
      },
      {
        label: 'Phone Validation Status',
        key: 'phoneValidationStatus',
        dataType: 'select' as const,
        options: PHONE_VALIDATION_OPTIONS,
        example: PHONE_VALIDATION_OPTIONS.slice(0, 3).join(' | '),
      },
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
      {
        label: 'Email',
        key: 'primaryEmail',
        example: 'name@example.com',
      },
      { label: 'Phone', key: 'primaryPhone' },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Description', key: 'description' },
      { label: 'Code', key: 'code' },
      {
        label: 'Sex',
        key: 'sex',
        dataType: 'select' as const,
        options: SEX_OPTIONS,
        example: SEX_OPTIONS.join(' | '),
      },
      {
        label: 'Birth Date',
        key: 'birthDate',
        dataType: 'date' as const,
        example: 'YYYY-MM-DD',
      },
      {
        label: 'Status',
        key: 'status',
        dataType: 'select' as const,
        options: CONTACT_STATUS_OPTIONS,
        example: CONTACT_STATUS_OPTIONS.join(' | '),
      },
    ],
    propertiesType: 'core:lead',
    processRows: (models: IModels, rows: any[]) =>
      processCustomerRows(models, rows, 'lead'),
  },
  companies: {
    fileName: 'companies-template.csv',
    headers: [
      { label: 'Name', key: 'primaryName' },
      {
        label: 'Emails',
        key: 'emails',
        dataType: 'multiSelect' as const,
        example: 'first@example.com, second@example.com',
      },
      {
        label: 'Phones',
        key: 'phones',
        dataType: 'multiSelect' as const,
        example: '+97699112233, +97699445566',
      },
      { label: 'Website', key: 'website' },
      { label: 'Industry', key: 'industry' },
      { label: 'Size', key: 'size' },
      {
        label: 'Status',
        key: 'status',
        dataType: 'select' as const,
        options: CONTACT_STATUS_OPTIONS,
        example: CONTACT_STATUS_OPTIONS.join(' | '),
      },
      {
        label: 'Business Type',
        key: 'businessType',
        dataType: 'select' as const,
        options: COMPANY_BUSINESS_TYPE_OPTIONS,
        example: COMPANY_BUSINESS_TYPE_OPTIONS.slice(0, 3).join(' | '),
      },
      { label: 'Description', key: 'description' },
      {
        label: 'Employees',
        key: 'employees',
        dataType: 'number' as const,
        example: '250',
      },
      {
        label: 'Links',
        key: 'links',
        dataType: 'multiSelect' as const,
        example: 'https://example.com, https://example.mn',
      },
      {
        label: 'Tags',
        key: 'tags',
        dataType: 'multiSelect' as const,
        example: 'VIP, Loyal',
      },
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
