import { ChangePasswordForm } from '@/settings/security/components/ChangePasswordForm';
import { ChangePasswordHeader } from '@/settings/security/components/ChangePasswordHeader';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';

export default function ChangePassword() {
  const { t } = useTranslation('settings', { keyPrefix: 'change-password' });
  const currentUser = useAtomValue(currentUserState);

  return (
    <>
      <ChangePasswordHeader />
      {currentUser?.passwordManagedBy ? (
        <p className="mx-auto max-w-2xl w-full px-4 py-8 text-sm text-muted-foreground">
          {t('managed-by-directory')}
        </p>
      ) : (
        <ChangePasswordForm />
      )}
    </>
  );
}
