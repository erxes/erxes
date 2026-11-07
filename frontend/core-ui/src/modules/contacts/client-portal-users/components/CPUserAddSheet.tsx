import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, usePermissionCheck, useSidePanel } from 'ui-modules';

export const CPUserAddSheet = () => {
  const { t } = useTranslation('contact');
  const { openNewRecord } = useSidePanel();
  const { hasActionPermission } = usePermissionCheck();
  const create = () => {
    if (hasActionPermission('clientPortalManage')) openNewRecord('core:cpUser');
  };
  useScopedHotkeys('c', create, ContactsHotKeyScope.ClientPortalUsersPage, [
    hasActionPermission,
  ]);
  return (
    <Can action="clientPortalManage">
      <Button onClick={create}>
        <IconPlus />
        {t('clientPortalUser.add._', {
          defaultValue: 'Add client portal user',
        })}
        <Kbd>C</Kbd>
      </Button>
    </Can>
  );
};
