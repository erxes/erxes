import {
    ImportHeaderDefinition,
    IImportExportContext,
  } from 'erxes-api-shared/core-modules';
  
  export async function getUserExportHeaders(
    _data: any,
    _ctx: IImportExportContext,
  ): Promise<ImportHeaderDefinition[]> {
    return [
      { label: 'Username', key: 'username', isDefault: true },
      { label: 'Email', key: 'email', isDefault: true },
      { label: 'Employee ID', key: 'employeeId', isDefault: true },
      { label: 'Is Active', key: 'isActive', isDefault: true },

      { label: 'First Name', key: 'details.firstName' },
      { label: 'Middle Name', key: 'details.middleName' },
      { label: 'Last Name', key: 'details.lastName' },
      { label: 'Short Name', key: 'details.shortName' },
      { label: 'Full Name', key: 'details.fullName' },
      { label: 'Birth Date', key: 'details.birthDate' },
      { label: 'Work Started Date', key: 'details.workStartedDate' },
      { label: 'Location', key: 'details.location' },
      { label: 'Description', key: 'details.description' },
      { label: 'Operator Phone', key: 'details.operatorPhone' },

      { label: 'Brands', key: 'brandIds', isDefault: true },
      { label: 'Departments', key: 'departmentIds', isDefault: true },
      { label: 'Branches', key: 'branchIds', isDefault: true },
  
      { label: 'Created At', key: 'createdAt' },
    ];
  }
  