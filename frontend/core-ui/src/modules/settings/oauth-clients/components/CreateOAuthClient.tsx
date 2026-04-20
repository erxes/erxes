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
  const { toast } = useToast();
  const { oauthClientAppsAdd, loading } = useOAuthClientsAdd();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useOAuthClientsForm();
  const [open, setOpen] = useState<boolean>(false);
  const [revealedSecret, setRevealedSecret] = useState<{
    clientName: string;
    secret?: string;
  } | null>(null);

  const submitHandler: SubmitHandler<TOAuthClientsForm> = React.useCallback(
    async (data) => {
      oauthClientAppsAdd({
        variables: data,
        onCompleted: ({ oauthClientAppsAdd: oauthClientApp }) => {
          toast({
            variant: 'success',
            title: 'OAuth client created successfully',
          });
          if (oauthClientApp?.generatedSecret) {
            setRevealedSecret({
              clientName: oauthClientApp.name,
              secret: oauthClientApp.generatedSecret,
            });
          }
          reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [oauthClientAppsAdd, toast, reset],
  );

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Create OAuth client
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
                <Sheet.Title>Create OAuth client</Sheet.Title>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
                <OAuthClientForm />
              </Sheet.Content>
              <Sheet.Footer>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner /> : 'Create client'}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>

      <OAuthClientSecretDialog
        open={!!revealedSecret}
        onOpenChange={(nextOpen) => !nextOpen && setRevealedSecret(null)}
        clientName={revealedSecret?.clientName || 'OAuth client'}
        secret={revealedSecret?.secret}
      />
    </>
  );
};
