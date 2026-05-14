import {
    ImportHeaderDefinition,
    IImportExportContext,
  } from 'erxes-api-shared/core-modules';
  
  export async function getCompanyExportHeaders(
    _data: any,
    _ctx: IImportExportContext,
  ): Promise<ImportHeaderDefinition[]> {
    return [
        { label: 'Name', key: 'primaryName', isDefault: true },
        { label: 'Emails', key: 'primaryEmail', isDefault: true },
        // { label: 'Emails', key: 'emails' },
        { label: 'Phones', key: 'primaryPhone', isDefault: true },
        // { label: 'Phones', key: 'phones' },
      
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
  }
  