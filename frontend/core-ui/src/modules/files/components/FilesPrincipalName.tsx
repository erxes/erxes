import { useTranslation } from 'react-i18next';
import {
  BranchesInline,
  DepartmentsInline,
  IFilesAccessGrant,
  MembersInline,
  SelectUnit,
} from 'ui-modules';

export const FilesPrincipalName = ({ grant }: { grant: IFilesAccessGrant }) => {
  const { t } = useTranslation('files');
  const id = grant.id || '';

  switch (grant.type) {
    case 'user':
      return <MembersInline memberIds={[id]} />;
    case 'department':
      return <DepartmentsInline departmentIds={[id]} />;
    case 'branch':
      return <BranchesInline branchIds={[id]} />;
    case 'unit':
      return (
        <SelectUnit.Provider value={id}>
          <SelectUnit.Value />
        </SelectUnit.Provider>
      );
    default:
      return <span>{t('principal-everyone')}</span>;
  }
};
