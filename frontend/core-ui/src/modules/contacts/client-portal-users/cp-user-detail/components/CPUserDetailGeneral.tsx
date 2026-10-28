import { IconKey, IconTrash } from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  readImage,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { CP_USERS_REMOVE } from '@/contacts/client-portal-users/graphql/cpUsersRemove';
import { GET_CLIENT_PORTAL_USERS } from '@/contacts/client-portal-users/graphql/getClientPortalUsers';
import { ApolloError, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CPUserSetPasswordDialog } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserSetPasswordDialog';
import { Can, useSidePanel } from 'ui-modules';

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

export function CPUserDetailGeneral() {
  const { cpUser } = useClientPortalUser();
  const cpUserId = cpUser?._id;
  const { back, canGoBack, close } = useSidePanel();
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('contact');

  const [cpUsersRemove, { loading: removeLoading }] = useMutation(
    CP_USERS_REMOVE,
    {
      refetchQueries: [{ query: GET_CLIENT_PORTAL_USERS }],
    },
  );

  const handleDelete = () => {
    if (!cpUserId) return;
    confirm({
      message: t('clientPortalUser.delete.confirm', {
        defaultValue:
          'Are you sure you want to delete this client portal user?',
      }),
      options: {
        confirmationValue: 'delete',
        okLabel: t('delete', { defaultValue: 'Delete' }),
      },
    }).then(() => {
      cpUsersRemove({
        variables: { ids: [cpUserId] },
        onError: (e: ApolloError) => {
          toast({
            title: t('error', { defaultValue: 'Error' }),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          if (canGoBack) back();
          else close();
          toast({
            title: t('success', { defaultValue: 'Success' }),
            variant: 'success',
            description: t('clientPortalUser.delete.success', {
              defaultValue: 'User deleted',
            }),
          });
        },
      });
    });
  };

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
  const fcmPlatforms = (fcmTokens?.map((d) => d.platform).filter(Boolean) ??
    []) as string[];
  const fcmPlatformLabel =
    fcmPlatforms.length > 0
      ? ` (${[...new Set(fcmPlatforms)].join(', ')})`
      : '';

  return (
    <>
      <div className="p-3 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Avatar size="lg" className="h-12 w-12">
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
            <span className="text-base font-semibold">
              {displayName(cpUser)}
            </span>
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
          <Can action="clientPortalManage">
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSetPasswordOpen(true)}
              >
                <IconKey className="w-4 h-4" />
                {t('clientPortalUser.set-password', {
                  defaultValue: 'Set password',
                })}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-destructive"
                onClick={handleDelete}
                disabled={removeLoading}
              >
                <IconTrash className="w-4 h-4" />
                {t('delete', { defaultValue: 'Delete' })}
              </Button>
            </div>
          </Can>
        </div>
      </div>
      <CPUserSetPasswordDialog
        open={setPasswordOpen}
        onOpenChange={setSetPasswordOpen}
        cpUserId={cpUser._id}
      />
    </>
  );
}
