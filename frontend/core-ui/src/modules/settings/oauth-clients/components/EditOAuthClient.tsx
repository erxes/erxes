import { IOAuthClientApp } from '../types';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { PanelFormLayout, RecordSidePanel } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconApi } from '@tabler/icons-react';
import { Form, useToast, useQueryState } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { CORE_OAUTH_CLIENT_PANEL_DETAIL } from '@/settings/oauth-clients/graphql/queries/getOAuthClientPanel';
import React from 'react';
import { useAtom } from 'jotai';
import { editingOAuthClientAtom } from '@/settings/oauth-clients/state';
import {
  TOAuthClientsForm,
  useOAuthClientsForm,
} from '@/settings/oauth-clients/hooks/useOAuthClientsForm';
import { useOAuthClientsEdit } from '@/settings/oauth-clients/hooks/useOAuthClientsEdit';
import { OAuthClientForm } from '@/settings/oauth-clients/components/OAuthClientForm';
import { OAuthClientSecretDialog } from '@/settings/oauth-clients/components/OAuthClientSecretDialog';
const getDefaultAccessTokenLifetime = (
  oauthClientApp?: IOAuthClientApp | null,
) => {
  if (oauthClientApp?.type !== 'confidential') {
    return undefined;
  }
  return oauthClientApp.accessTokenLifetime || 'year';
};
export const EditOAuthClient = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'oauth-clients',
  });
  const { toast } = useToast();
  const [selectedClient, setEditingOAuthClient] = useAtom(
    editingOAuthClientAtom,
  );
  const [clientId, setClientId] = useQueryState<string>('oauthClientId');
  const selectedSnapshot =
    selectedClient?._id === clientId ? selectedClient : null;
  const {
    data,
    loading: clientLoading,
    error,
  } = useQuery<{
    oauthClientAppDetail: IOAuthClientApp | null;
  }>(CORE_OAUTH_CLIENT_PANEL_DETAIL, {
    variables: {
      _id: clientId || '',
    },
    skip: !clientId || !!selectedSnapshot,
  });
  const editingOAuthClient =
    selectedSnapshot ||
    (data?.oauthClientAppDetail?._id === clientId
      ? data.oauthClientAppDetail
      : null);
  React.useEffect(() => {
    if (selectedClient && selectedClient._id !== clientId) {
      setEditingOAuthClient(null);
    }
  }, [selectedClient, clientId, setEditingOAuthClient]);
  const { oauthClientAppsEdit, loading } = useOAuthClientsEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useOAuthClientsForm({
    name: editingOAuthClient?.name,
    logo: editingOAuthClient?.logo,
    description: editingOAuthClient?.description,
    type: editingOAuthClient?.type,
    accessTokenLifetime: getDefaultAccessTokenLifetime(editingOAuthClient),
    redirectUrls: editingOAuthClient?.redirectUrls || [],
  });
  const [revealedSecret, setRevealedSecret] = React.useState<{
    clientName: string;
    clientId?: string;
    secret?: string;
  } | null>(null);
  React.useEffect(() => {
    if (editingOAuthClient) {
      reset({
        name: editingOAuthClient.name,
        logo: editingOAuthClient.logo,
        description: editingOAuthClient.description,
        type: editingOAuthClient.type,
        accessTokenLifetime: getDefaultAccessTokenLifetime(editingOAuthClient),
        redirectUrls: editingOAuthClient.redirectUrls || [],
      });
    }
  }, [editingOAuthClient, reset]);
  const onClose = () => {
    reset();
    setEditingOAuthClient(null);
    setClientId(null);
  };
  const submitHandler: SubmitHandler<TOAuthClientsForm> = (data) => {
    if (!editingOAuthClient) return;
    oauthClientAppsEdit({
      variables: {
        _id: editingOAuthClient._id,
        ...data,
        accessTokenLifetime:
          data.type === 'confidential' ? data.accessTokenLifetime : undefined,
      },
      onCompleted: ({ oauthClientAppsEdit: oauthClientApp }) => {
        if (!pagePanel.isCurrent()) return;
        toast({
          variant: 'success',
          title: t('client-updated'),
        });
        if (oauthClientApp?.generatedSecret) {
          setRevealedSecret({
            clientName: oauthClientApp.name,
            clientId: oauthClientApp.clientId,
            secret: oauthClientApp.generatedSecret,
          });
        }
        onClose();
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };
  const pagePanel = usePagePanel({
    name: 'settings/oauth-clients/EditOAuthClient',
    requiredPermission: 'appsManage',
    open: !!clientId,
    onOpenChange: (open) => !open && onClose(),
    identity: clientId || 'new',
  });
  return (
    <>
      {createPortal(
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded &&
          pagePanel.allowed &&
          !clientLoading &&
          !error &&
          !(!clientLoading && !editingOAuthClient) ? (
            <Form {...methods}>
              <form
                className="flex flex-col gap-0 size-full"
                onSubmit={handleSubmit(submitHandler)}
              >
                <RecordSidePanel.Header
                  title={<>{t('edit-oauth-client')}</>}
                  {...pagePanel.headerProps}
                  avatar={<IconApi />}
                />
                <PanelFormLayout
                  onCancel={onClose}
                  saving={loading}
                  saveLabel={t('update-client')}
                >
                  <OAuthClientForm />
                </PanelFormLayout>
              </form>
            </Form>
          ) : (
            <PagePanelStatus
              entry={pagePanel}
              loading={clientLoading}
              error={!!error}
            />
          )}
        </div>,
        pagePanel,
      )}

      <OAuthClientSecretDialog
        open={!!revealedSecret}
        onOpenChange={(nextOpen) => !nextOpen && setRevealedSecret(null)}
        clientName={revealedSecret?.clientName || t('oauth-client')}
        clientId={revealedSecret?.clientId}
        secret={revealedSecret?.secret}
      />
    </>
  );
};
