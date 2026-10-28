import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconApi } from '@tabler/icons-react';
import { Button, Form, Spinner, useToast, useQueryState } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { CORE_OAUTH_CLIENT_PANEL_DETAIL } from '@/settings/oauth-clients/graphql/queries/getOAuthClientPanel';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useAtom } from 'jotai';
import { editingOAuthClientAtom } from '@/settings/oauth-clients/state';
import { useOAuthClientsForm } from '@/settings/oauth-clients/hooks/useOAuthClientsForm';
import { useOAuthClientsEdit } from '@/settings/oauth-clients/hooks/useOAuthClientsEdit';
import { TOAuthClientsForm } from '@/settings/oauth-clients/hooks/useOAuthClientsForm';
import { IOAuthClientApp } from '@/settings/oauth-clients/types';
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
  const { t } = useTranslation('settings', { keyPrefix: 'oauth-clients' });
  const { toast } = useToast();
  const [selectedClient, setEditingOAuthClient] = useAtom(
    editingOAuthClientAtom,
  );
  const [clientId, setClientId] = useQueryState<string>('oauthClientId');
  const {
    data,
    loading: clientLoading,
    error,
  } = useQuery<{ oauthClientAppDetail: IOAuthClientApp | null }>(
    CORE_OAUTH_CLIENT_PANEL_DETAIL,
    {
      variables: { _id: clientId || '' },
      skip: !clientId || !!selectedClient,
    },
  );
  const editingOAuthClient =
    selectedClient || (clientId ? data?.oauthClientAppDetail : null);
  React.useEffect(() => {
    if (selectedClient && selectedClient._id !== clientId)
      setClientId(selectedClient._id);
  }, [selectedClient, clientId, setClientId]);
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

  const submitHandler: SubmitHandler<TOAuthClientsForm> = React.useCallback(
    async (data) => {
      if (!editingOAuthClient) return;

      oauthClientAppsEdit({
        variables: {
          _id: editingOAuthClient._id,
          ...data,
          accessTokenLifetime:
            data.type === 'confidential' ? data.accessTokenLifetime : undefined,
        },
        onCompleted: ({ oauthClientAppsEdit: oauthClientApp }) => {
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
    },
    [oauthClientAppsEdit, editingOAuthClient, toast, t],
  );

  return (
    <>
      <CoreModulePanel
        name={'settings/oauth-clients/EditOAuthClient'}
        open={!!editingOAuthClient}
        onOpenChange={(open) => !open && onClose()}
      >
        <CoreModulePanel.View
          className="p-0"
          loading={clientLoading}
          error={!!error}
          notFound={!clientLoading && !editingOAuthClient}
        >
          <Form {...methods}>
            <form
              className="flex flex-col gap-0 size-full"
              onSubmit={handleSubmit(submitHandler)}
            >
              <CoreModulePanel.Header>
                <IconApi />
                <CoreModulePanel.Title>
                  {t('edit-oauth-client')}
                </CoreModulePanel.Title>
                <CoreModulePanel.Close />
              </CoreModulePanel.Header>
              <CoreModulePanel.Content className="grow size-full flex flex-col px-5 py-4">
                <OAuthClientForm />
              </CoreModulePanel.Content>
              <CoreModulePanel.Footer>
                <Button variant="secondary" onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner /> : t('update-client')}
                </Button>
              </CoreModulePanel.Footer>
            </form>
          </Form>
        </CoreModulePanel.View>
      </CoreModulePanel>

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
