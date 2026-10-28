import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconApi, IconPlus } from '@tabler/icons-react';
import { Button, Form, Spinner, useToast } from 'erxes-ui';
import React, { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useOAuthClientsForm } from '@/settings/oauth-clients/hooks/useOAuthClientsForm';
import { useOAuthClientsAdd } from '@/settings/oauth-clients/hooks/useOAuthClientsAdd';
import { TOAuthClientsForm } from '@/settings/oauth-clients/hooks/useOAuthClientsForm';
import { OAuthClientForm } from '@/settings/oauth-clients/components/OAuthClientForm';
import { OAuthClientSecretDialog } from '@/settings/oauth-clients/components/OAuthClientSecretDialog';

export const CreateOAuthClient = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'oauth-clients' });
  const { toast } = useToast();
  const { oauthClientAppsAdd, loading } = useOAuthClientsAdd();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useOAuthClientsForm();
  const [open, setOpen] = useState<boolean>(false);
  const [revealedSecret, setRevealedSecret] = useState<{
    clientName: string;
    clientId?: string;
    secret?: string;
  } | null>(null);

  const submitHandler: SubmitHandler<TOAuthClientsForm> = React.useCallback(
    async (data) => {
      oauthClientAppsAdd({
        variables: {
          ...data,
          accessTokenLifetime:
            data.type === 'confidential' ? data.accessTokenLifetime : undefined,
        },
        onCompleted: ({ oauthClientAppsAdd: oauthClientApp }) => {
          toast({
            variant: 'success',
            title: t('client-created'),
          });
          if (oauthClientApp?.generatedSecret) {
            setRevealedSecret({
              clientName: oauthClientApp.name,
              clientId: oauthClientApp.clientId,
              secret: oauthClientApp.generatedSecret,
            });
          }
          reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [oauthClientAppsAdd, toast, reset, t],
  );

  return (
    <>
      <CoreModulePanel
        name={'settings/oauth-clients/CreateOAuthClient'}
        open={open}
        onOpenChange={setOpen}
      >
        <CoreModulePanel.Trigger asChild>
          <Button>
            <IconPlus />
            {t('create-oauth-client')}
          </Button>
        </CoreModulePanel.Trigger>
        <CoreModulePanel.View className="p-0">
          <Form {...methods}>
            <form
              className="flex flex-col gap-0 size-full"
              onSubmit={handleSubmit(submitHandler)}
            >
              <CoreModulePanel.Header>
                <IconApi />
                <CoreModulePanel.Title>
                  {t('create-oauth-client')}
                </CoreModulePanel.Title>
                <CoreModulePanel.Close />
              </CoreModulePanel.Header>
              <CoreModulePanel.Content className="grow size-full flex flex-col px-5 py-4">
                <OAuthClientForm />
              </CoreModulePanel.Content>
              <CoreModulePanel.Footer>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner /> : t('create-client')}
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
