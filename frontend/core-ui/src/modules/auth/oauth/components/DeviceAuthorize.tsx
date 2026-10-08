import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

import { Avatar, Badge, Button, Card } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';

import { useDeviceAuthorize } from '../hooks/useDeviceAuthorize';
import { DeviceAuthorizeApproved } from './DeviceAuthorizeApproved';
import { DeviceAuthorizeDenied } from './DeviceAuthorizeDenied';
import { DeviceAuthorizeScopes } from './DeviceAuthorizeScopes';
import { useTranslation } from 'react-i18next';

export const DeviceAuthorize = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const currentUser = useAtomValue(currentUserState);
  const {
    userCode,
    loading,
    loadingDetails,
    approved,
    denied,
    details,
    selectedScopes,
    actionGroups,
    toggleScopes,
    approve,
    deny,
  } = useDeviceAuthorize();

  const isCodeMissing = !loadingDetails && !userCode;
  const isReady = !loadingDetails && !!userCode && !!details;

  if (approved) {
    return <DeviceAuthorizeApproved clientName={details?.client.name} />;
  }

  if (denied) {
    return <DeviceAuthorizeDenied />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <Card className="w-full max-w-2xl rounded-lg border">
        <Card.Header className="space-y-5 px-8 py-8">
          <div className="flex items-start gap-4">
            <Avatar size="xl" className="size-12 rounded-lg bg-primary/5">
              {details?.client.logo ? (
                <Avatar.Image
                  src={readImage(details.client.logo, 48)}
                  alt={details.client.name}
                  className="rounded-lg object-contain"
                />
              ) : null}
              <Avatar.Fallback className="rounded-lg bg-primary/10 text-base font-semibold text-primary">
                {details?.client.logoText || 'ER'}
              </Avatar.Fallback>
            </Avatar>

            <div className="space-y-2">
              <Card.Title className="text-2xl font-semibold leading-tight">
                {t('wants-access', {
                  name: details?.client.name || t('application'),
                })}
              </Card.Title>
              <Card.Description className="text-sm leading-6">
                {t('signed-in-as', { email: currentUser?.email })}
              </Card.Description>
              {details?.client.description ? (
                <p className="text-sm text-muted-foreground">
                  {details.client.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">
              {details?.client.id || 'oauth-client'}
            </Badge>
            {userCode ? <Badge variant="ghost">{userCode}</Badge> : null}
          </div>
        </Card.Header>

        <Card.Content className="space-y-6 px-8 pb-8">
          <DeviceAuthorizeScopes
            loadingDetails={loadingDetails}
            isCodeMissing={isCodeMissing}
            isReady={isReady}
            actionGroups={actionGroups}
            selectedScopes={selectedScopes}
            loading={loading}
            onToggle={toggleScopes}
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={loading || loadingDetails || !details}
              onClick={deny}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={
                loading ||
                loadingDetails ||
                !details ||
                selectedScopes.length === 0
              }
              onClick={approve}
            >
              {loading
                ? t('authorizing')
                : t('authorize-application', {
                    name: details?.client.name || t('application-lowercase'),
                  })}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
