import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import {
  Button,
  Form,
  Kbd,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
  cn,
} from 'erxes-ui';
import { IconChessKnight, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import {
  useClientPortalForm,
  TClientPortalAddForm,
} from '@/client-portal/hooks/useClientPortalForm';
import { ClientPortalCreateForm } from '@/client-portal/components/ClientPortalCreateForm';
import { ClientPortalHotKeyScope } from '@/client-portal/types/clientPortal';
import { useCreateClientPortal } from '@/client-portal/hooks/useCreateClientPortal';
import { useNavigate } from 'react-router-dom';
import {
  Can,
  usePermissionCheck,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
export const CreateClientPortalSheet = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'client-portals',
  });
  const { toast } = useToast();
  const { clientPortalAdd, loading } = useCreateClientPortal();
  const {
    methods,
    methods: { handleSubmit },
  } = useClientPortalForm();
  const navigate = useNavigate();
  const [_open, _setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const onOpen = () => {
    _setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      ClientPortalHotKeyScope.ClientPortalAddSheet,
    );
  };
  const onClose = () => {
    setHotkeyScope(ClientPortalHotKeyScope.ClientPortalSettingsPage);
    _setOpen(false);
  };
  const { hasActionPermission } = usePermissionCheck();
  const canManageClientPortal = hasActionPermission('clientPortalManage');
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageClientPortal) return;
      onOpen();
    },
    ClientPortalHotKeyScope.ClientPortalSettingsPage,
    [canManageClientPortal],
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    ClientPortalHotKeyScope.ClientPortalAddSheet,
  );
  const submitHandler: SubmitHandler<TClientPortalAddForm> = (data) => {
    clientPortalAdd({
      variables: data,
      onCompleted: (data) => {
        if (!pagePanel.isCurrent()) return;
        toast({
          title: t('success-exclamation'),
          variant: 'success',
          description: t('client-portal-created'),
        });
        navigate(`${data.clientPortalAdd._id}`);
      },
    });
  };
  const pagePanel = usePagePanel({
    expandable: false,
    requiredPermission: 'clientPortalManage',
    name: 'client-portal/ClientPortalAddSheet',
    open: _open,
    onOpenChange: (open) => (open ? onOpen() : onClose()),
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Can action="clientPortalManage">
          <Button onClick={pagePanel.onOpen}>
            <IconPlus />
            {t('create-client-portal')}
            <Kbd>C</Kbd>
          </Button>
        </Can>
        {createPortal(
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            {pagePanel.permissionsLoaded && pagePanel.allowed ? (
              <Form {...methods}>
                <form
                  className="flex flex-col gap-0 size-full"
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <RecordSidePanel.Header
                    title={<>{t('create-client-portal')}</>}
                    {...pagePanel.headerProps}
                    avatar={<IconChessKnight />}
                  />
                  <div
                    className={cn(
                      'flex min-h-0 flex-1 flex-col overflow-y-auto',
                      'grow size-full flex flex-col px-5 py-4',
                    )}
                  >
                    <ClientPortalCreateForm />
                  </div>
                  <div
                    className={cn(
                      'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                    )}
                  >
                    <Button
                      variant={'secondary'}
                      onClick={onClose}
                      disabled={loading}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit">
                      {loading ? <Spinner /> : t('create')}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <PagePanelStatus entry={pagePanel} />
            )}
          </div>,
          pagePanel,
        )}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
