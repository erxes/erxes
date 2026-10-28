import { useTranslation } from 'react-i18next';
import {
  IFilesAccessGrant,
  MembersInline,
  StructureEntitiesInline,
} from 'ui-modules';

export const FilesPrincipalName = ({ grant }: { grant: IFilesAccessGrant }) => {
  const { t } = useTranslation('files');
  const id = grant.id || '';

  switch (grant.type) {
    case 'user':
      return <MembersInline memberIds={[id]} />;
    case 'entity':
      return <StructureEntitiesInline entityIds={[id]} />;
    default:
      return <span>{t('principal-everyone')}</span>;
  }
};
