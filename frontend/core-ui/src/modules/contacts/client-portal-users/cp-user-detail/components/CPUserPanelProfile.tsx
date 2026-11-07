import { Avatar, Badge, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';

function displayName(
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  } | null,
) {
  if (!user) return '-';
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.email || user.phone || user.username || '-';
}

export const CPUserPanelProfile = () => {
  const { cpUser } = useClientPortalUser();
  const { t } = useTranslation('contact');
  if (!cpUser) return null;

  const {
    avatar,
    type,
    isVerified,
    isEmailVerified,
    isPhoneVerified,
    fcmTokens,
  } = cpUser;
  const fcmCount = fcmTokens?.length ?? 0;
  const fcmPlatforms = fcmTokens?.map((d) => d.platform).filter(Boolean) ?? [];
  const fcmPlatformLabel =
    fcmPlatforms.length > 0
      ? ` (${[...new Set(fcmPlatforms)].join(', ')})`
      : '';

  return (
    <div className="shrink-0 border-b p-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Avatar size="lg" className="size-11">
          <Avatar.Image src={readImage(avatar)} />
          <Avatar.Fallback>
            {(
              cpUser.firstName ||
              cpUser.lastName ||
              cpUser.email ||
              cpUser.phone
            )?.charAt(0) ?? '-'}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col items-start flex-1">
          <span className="text-base font-semibold">{displayName(cpUser)}</span>
          <div className="flex flex-wrap gap-2 mt-1">
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
        </div>
      </div>
    </div>
  );
};
