import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getCustomPropertyHeaders } from '~/meta/import-export/utils';

export async function getCompanyExportHeaders(
  _data: any,
  { models }: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  const systemFields: ImportHeaderDefinition[] = [
    { label: 'Name', key: 'primaryName', isDefault: true },
    { label: 'Emails', key: 'primaryEmail', isDefault: true },
    { label: 'Phones', key: 'primaryPhone', isDefault: true },
    { label: 'Website', key: 'website' },
    { label: 'Industry', key: 'industry' },
    { label: 'Size', key: 'size' },
    { label: 'Status', key: 'status' },
    { label: 'Business Type', key: 'businessType' },
    { label: 'Description', key: 'description' },
    { label: 'Employees', key: 'employees' },
    { label: 'Links', key: 'links' },
    { label: 'Tags', key: 'tagIds', isDefault: true },
    { label: 'Code', key: 'code' },
    { label: 'Location', key: 'location' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
  ];

  if (!models) return systemFields;

  const customFields = await getCustomPropertyHeaders(models, 'core:company');

  return [...systemFields, ...customFields];
}
