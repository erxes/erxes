import { IconApi } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useAtom } from 'jotai';
import { editingOAuthClientAtom } from '../state';
import { useOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { useOAuthClientsEdit } from '../hooks/useOAuthClientsEdit';
import { TOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { OAuthClientForm } from './OAuthClientForm';
import { OAuthClientSecretDialog } from './OAuthClientSecretDialog';

export const EditOAuthClient = () => {
  const { toast } = useToast();
  const [editingOAuthClient, setEditingOAuthClient] = useAtom(
    editingOAuthClientAtom,
  );
  const { oauthClientAppsEdit, loading } = useOAuthClientsEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useOAuthClientsForm({
    name: editingOAuthClient?.name,
    logo: editingOAuthClient?.logo,
    description: editingOAuthClient?.description,
    type: editingOAuthClient?.type,
    redirectUrls: editingOAuthClient?.redirectUrls || [],
  });
  const [revealedSecret, setRevealedSecret] = React.useState<{
    clientName: string;
    secret?: string;
  } | null>(null);

  React.useEffect(() => {
    if (editingOAuthClient) {
      reset({
        name: editingOAuthClient.name,
        logo: editingOAuthClient.logo,
        description: editingOAuthClient.description,
        type: editingOAuthClient.type,
        redirectUrls: editingOAuthClient.redirectUrls || [],
      });
    }
  }, [editingOAuthClient, reset]);

  const onClose = () => {
    reset();
    setEditingOAuthClient(null);
  };

  const submitHandler: SubmitHandler<TOAuthClientsForm> = React.useCallback(
    async (data) => {
      if (!editingOAuthClient) return;

      oauthClientAppsEdit({
        variables: { _id: editingOAuthClient._id, ...data },
        onCompleted: ({ oauthClientAppsEdit: oauthClientApp }) => {
          toast({
            variant: 'success',
            title: 'OAuth client updated successfully',
          });
          if (oauthClientApp?.generatedSecret) {
            setRevealedSecret({
              clientName: oauthClientApp.name,
              secret: oauthClientApp.generatedSecret,
            });
          }
          onClose();
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [oauthClientAppsEdit, editingOAuthClient, toast],
  );

  return (
    <>
      <Sheet
        open={!!editingOAuthClient}
        onOpenChange={(open) => !open && onClose()}
      >
        <Sheet.View className="p-0">
          <Form {...methods}>
            <form
              className="flex flex-col gap-0 size-full"
              onSubmit={handleSubmit(submitHandler)}
            >
              <Sheet.Header>
                <IconApi />
                <Sheet.Title>Edit OAuth client</Sheet.Title>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
                <OAuthClientForm />
              </Sheet.Content>
              <Sheet.Footer>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner /> : 'Update client'}
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
