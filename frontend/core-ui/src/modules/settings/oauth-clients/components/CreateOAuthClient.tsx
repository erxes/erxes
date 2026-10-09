import { useTranslation } from 'react-i18next';
import { IconApi, IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import React, { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { useOAuthClientsAdd } from '../hooks/useOAuthClientsAdd';
import { TOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { OAuthClientForm } from './OAuthClientForm';
import { OAuthClientSecretDialog } from './OAuthClientSecretDialog';

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
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('create-oauth-client')}
          </Button>
        </Sheet.Trigger>
        <Sheet.View className="p-0">
          <Form {...methods}>
            <form
              className="flex flex-col gap-0 size-full"
              onSubmit={handleSubmit(submitHandler)}
            >
              <Sheet.Header>
                <IconApi />
                <Sheet.Title>{t('create-oauth-client')}</Sheet.Title>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
                <OAuthClientForm />
              </Sheet.Content>
              <Sheet.Footer>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner /> : t('create-client')}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>

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
