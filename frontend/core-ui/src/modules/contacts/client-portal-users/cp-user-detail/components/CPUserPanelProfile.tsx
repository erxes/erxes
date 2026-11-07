import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';

export const CPUserPanelProfile = () => {
  const { cpUser } = useClientPortalUser();
  const { t } = useTranslation('contact');
  if (!cpUser) return null;

  const { type, isVerified, isEmailVerified, isPhoneVerified, fcmTokens } =
    cpUser;
  const fcmCount = fcmTokens?.length ?? 0;
  const fcmPlatforms = fcmTokens?.map((d) => d.platform).filter(Boolean) ?? [];
  const fcmPlatformLabel =
    fcmPlatforms.length > 0
      ? ` (${[...new Set(fcmPlatforms)].join(', ')})`
      : '';

  return (
    <div className="flex shrink-0 flex-wrap gap-2 border-b px-3 py-2">
      {type && <Badge variant="secondary">{type}</Badge>}
      <Badge variant={isVerified ? 'success' : 'secondary'}>
        {isVerified
          ? t('verified', { defaultValue: 'Verified' })
          : t('unverified', { defaultValue: 'Unverified' })}
      </Badge>
      {isEmailVerified && (
        <Badge variant="success">
          {t('emailVerified', { defaultValue: 'Email verified' })}
        </Badge>
      )}
      {isPhoneVerified && (
        <Badge variant="success">
          {t('phoneVerified', { defaultValue: 'Phone verified' })}
        </Badge>
      )}
      <Badge variant={fcmCount > 0 ? 'secondary' : 'default'}>
        {fcmCount > 0
          ? t('clientPortalUser.pushDevices', {
              defaultValue: 'Push: {{count}} device(s)',
              count: fcmCount,
            }) + fcmPlatformLabel
          : t('clientPortalUser.pushNoDevices', {
              defaultValue: 'Push: No devices',
            })}
      </Badge>
    </div>
  );
};
