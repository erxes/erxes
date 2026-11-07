import {
  IPermissionGroupSchema,
  permissionGroupToInput,
} from '@/settings/permissions/schemas/permissionGroup';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useAddPermissionGroup } from '@/settings/permissions/hooks/useAddPermissionGroup';
import { Button, toast, cn } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { PermissionGroupForm } from '@/settings/permissions/components/form/PermissionGroupForm';
export const PermissionGroupAdd = ({
  text,
  defaultValues,
  trigger,
}: {
  text?: string;
  defaultValues?: Partial<IPermissionGroupSchema>;
  trigger?: React.ReactNode;
}) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'permissions',
  });
  const [open, setOpen] = useState<boolean>(false);
  const { addPermissionGroup, loading } = useAddPermissionGroup();
  const onSubmit = async (data: IPermissionGroupSchema) => {
    if (loading) return;
    addPermissionGroup({
      variables: {
        ...permissionGroupToInput(data),
      },
      onCompleted: () => {
        if (!pagePanel.isCurrent()) return;
        toast({
          title: t('group-added'),
          variant: 'success',
        });
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: t('error-adding-group'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };
  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);
  const pagePanel = usePagePanel({
    name: 'settings/permissions/form/PermissionGroupAdd',
    open: open,
    onOpenChange: setOpen,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {trigger ? (
          <Button asChild onClick={pagePanel.onOpen}>
            {trigger}
          </Button>
        ) : (
          <Button variant="secondary" onClick={pagePanel.onOpen}>
            {text || t('add-custom-group')}
          </Button>
        )}
        {createPortal(
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            {pagePanel.permissionsLoaded && pagePanel.allowed ? (
              <>
                <RecordSidePanel.Header
                  title={
                    defaultValues?.name
                      ? t('edit-group')
                      : t('add-custom-group')
                  }
                  {...pagePanel.headerProps}
                />
                <div
                  className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto')}
                >
                  <PermissionGroupForm
                    key={defaultValues?.name ?? 'new'}
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    isSubmitting={loading}
                    onCancel={onCancel}
                    mode="add"
                  />
                </div>
              </>
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
