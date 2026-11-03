import { Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';

export const ContactPanelPermission = ({
  creating = false,
  children,
}: {
  creating?: boolean;
  children: ReactNode;
}) => {
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  if (!isLoaded) return <Spinner containerClassName="flex-1" />;
  if (creating && !hasActionPermission('contactsCreate')) {
    return <div className="p-4">{t('access-denied', 'Access denied')}</div>;
  }
  return <>{children}</>;
};
