import { ChangePasswordForm } from '@/settings/security/components/ChangePasswordForm';
import { ChangePasswordHeader } from '@/settings/security/components/ChangePasswordHeader';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';

// The directory message would mislead a support account
const MANAGED_BY_KEY: Record<string, string> = {
  ldap: 'managed-by-directory',
  erxes_support: 'managed-by-support',
};

export default function ChangePassword() {
  const { t } = useTranslation('settings', { keyPrefix: 'change-password' });
  const currentUser = useAtomValue(currentUserState);

  return (
    <>
      <ChangePasswordHeader />
      {currentUser?.passwordManagedBy ? (
        <p className="mx-auto max-w-2xl w-full px-4 py-8 text-sm text-muted-foreground">
          {t(
            MANAGED_BY_KEY[currentUser.passwordManagedBy] ||
              'managed-by-directory',
          )}
        </p>
      ) : (
        <ChangePasswordForm />
      )}
    </>
  );
}
