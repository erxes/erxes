import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getCustomPropertyHeaders } from '~/meta/import-export/utils';

export async function getCustomerExportHeaders(
  _data: any,
  { models }: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  const systemFields: ImportHeaderDefinition[] = [
    { label: 'First Name', key: 'firstName', isDefault: true },
    { label: 'Last Name', key: 'lastName', isDefault: true },
    { label: 'Middle Name', key: 'middleName' },
    { label: 'Email', key: 'primaryEmail', isDefault: true },
    { label: 'Phone', key: 'primaryPhone', isDefault: true },
    { label: 'Position', key: 'position' },
    { label: 'Department', key: 'department' },
    { label: 'Description', key: 'description' },
    { label: 'Code', key: 'code' },
    { label: 'Sex', key: 'sex' },
    { label: 'Birth Date', key: 'birthDate' },
    { label: 'Status', key: 'status' },
    { label: 'Email Validation Status', key: 'emailValidationStatus' },
    { label: 'Phone Validation Status', key: 'phoneValidationStatus' },
    { label: 'Tags', key: 'tagIds', isDefault: true },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
  ];

  const customFields = models
    ? await getCustomPropertyHeaders(models, 'core:customer')
    : [];

  return [...systemFields, ...customFields];
}
