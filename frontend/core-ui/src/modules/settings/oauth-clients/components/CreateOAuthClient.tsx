import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconApi, IconPlus } from '@tabler/icons-react';
import { Button, Form, Spinner, useToast, cn } from 'erxes-ui';
import React, { useState } from 'react';
import {
  TOAuthClientsForm,
  useOAuthClientsForm,
} from '@/settings/oauth-clients/hooks/useOAuthClientsForm';
import { useOAuthClientsAdd } from '@/settings/oauth-clients/hooks/useOAuthClientsAdd';
import { OAuthClientForm } from '@/settings/oauth-clients/components/OAuthClientForm';
import { OAuthClientSecretDialog } from '@/settings/oauth-clients/components/OAuthClientSecretDialog';
export const CreateOAuthClient = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'oauth-clients',
  });
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
          if (!pagePanel.isCurrent()) return;
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
  const pagePanel = usePagePanel({
    name: 'settings/oauth-clients/CreateOAuthClient',
    open: open,
    onOpenChange: setOpen,
  });
  return (
    <>
      <PagePanelContext.Provider value={pagePanel}>
        <SidePanelRecordPathContext.Provider value={pagePanel.path}>
          <Button onClick={pagePanel.onOpen}>
            <IconPlus />
            {t('create-oauth-client')}
          </Button>
          {pagePanel.open && pagePanel.target
            ? createPortal(
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                  {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                    <>
                      <Form {...methods}>
                        <form
                          className="flex flex-col gap-0 size-full"
                          onSubmit={handleSubmit(submitHandler)}
                        >
                          <RecordSidePanel.Header
                            title={<>{t('create-oauth-client')}</>}
                            onBack={pagePanel.onBack}
                            onClose={pagePanel.onClose}
                            expanded={pagePanel.expanded}
                            onExpand={pagePanel.onExpand}
                            avatar={<IconApi />}
                          />
                          <div
                            className={cn(
                              'flex min-h-0 flex-1 flex-col overflow-y-auto',
                              'grow size-full flex flex-col px-5 py-4',
                            )}
                          >
                            <OAuthClientForm />
                          </div>
                          <div
                            className={cn(
                              'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                            )}
                          >
                            <Button
                              variant="secondary"
                              onClick={() => setOpen(false)}
                            >
                              {t('cancel')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                              {loading ? <Spinner /> : t('create-client')}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <PagePanelStatus entry={pagePanel} />
                  )}
                </div>,
                pagePanel.target,
              )
            : null}
        </SidePanelRecordPathContext.Provider>
      </PagePanelContext.Provider>

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
