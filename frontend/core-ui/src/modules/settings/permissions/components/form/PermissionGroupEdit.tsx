import { IPermissionGroup } from '@/settings/permissions/types';
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
import { useEditPermissionGroup } from '@/settings/permissions/hooks/useEditPermissionGroup';
import { Button, toast, cn } from 'erxes-ui';
import { useState } from 'react';
import { PermissionGroupForm } from '@/settings/permissions/components/form/PermissionGroupForm';
export const PermissionGroupEdit = ({
  group,
  trigger,
}: {
  group: IPermissionGroup;
  trigger?: React.ReactNode;
}) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'permissions',
  });
  const [open, setOpen] = useState<boolean>(false);
  const { editPermissionGroup, loading } = useEditPermissionGroup();
  const onSubmit = async (data: IPermissionGroupSchema) => {
    if (loading) return;
    editPermissionGroup({
      variables: {
        _id: group._id,
        ...permissionGroupToInput(data),
      },
      onCompleted: () => {
        if (!pagePanel.isCurrent()) return;
        toast({
          title: t('group-updated'),
          variant: 'success',
        });
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: t('error-updating-group'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };
  const defaultValues: Partial<IPermissionGroupSchema> = {
    name: group.name,
    description: group.description || '',
    permissions: group.permissions,
  };
  const pagePanel = usePagePanel({
    name: `settings/permissions/${group._id}/edit`,
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
          <Button variant="ghost" size="sm" onClick={pagePanel.onOpen}>
            {t('edit')}
          </Button>
        )}
        {createPortal(
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            {pagePanel.permissionsLoaded && pagePanel.allowed ? (
              <>
                <RecordSidePanel.Header
                  title={t('edit-permission-group')}
                  {...pagePanel.headerProps}
                />
                <div
                  className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto')}
                >
                  <PermissionGroupForm
                    key={group._id}
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    onCancel={() => setOpen(false)}
                    isSubmitting={loading}
                    mode="edit"
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
