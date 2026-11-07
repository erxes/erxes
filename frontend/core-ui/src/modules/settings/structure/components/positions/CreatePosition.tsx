import {
  TPositionForm,
  PositionHotKeyScope,
} from '../../types/position';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconBriefcase, IconPlus } from '@tabler/icons-react';
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
import React, { useState } from 'react';
import { usePositionForm } from '@/settings/structure/hooks/usePositionForm';
import { usePositionAdd } from '@/settings/structure/hooks/usePositionActions';
import { PositionForm } from '@/settings/structure/components/positions/PositionForm';
import {
  Can,
  usePermissionCheck,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
export const CreatePosition = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const {
    methods,
    methods: { handleSubmit },
  } = usePositionForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = usePositionAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManagePositions = isLoaded && hasActionPermission('positionsManage');
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PositionHotKeyScope.PositionAddSheet,
    );
  };
  const onClose = () => {
    setHotkeyScope(PositionHotKeyScope.PositionSettingsPage);
    setOpen(false);
  };
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManagePositions) return;
      onOpen();
    },
    PositionHotKeyScope.PositionSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    PositionHotKeyScope.PositionAddSheet,
  );
  const submitHandler: SubmitHandler<TPositionForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          if (!pagePanel.isCurrent()) return;
          toast({
            title: t('success'),
            variant: 'success',
            description: t('position-created'),
          });
          methods.reset();
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
    [handleAdd],
  );
  const pagePanel = usePagePanel({
    requiredPermission: 'positionsManage',
    name: 'settings/structure/positions/CreatePosition',
    onOpenChange: (open) => (open ? onOpen() : onClose()),
    open: open,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Can action="positionsManage">
          <Button onClick={pagePanel.onOpen}>
            <IconPlus /> {t('create-position')}
            <Kbd>C</Kbd>
          </Button>
        </Can>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <Form {...methods}>
                      <form
                        onSubmit={handleSubmit(submitHandler)}
                        className=" flex flex-col gap-0 w-full h-full"
                      >
                        <RecordSidePanel.Header
                          title={
                            <>
                              <IconBriefcase size={16} />
                              {t('create-position-title')}
                            </>
                          }
                          onBack={pagePanel.onBack}
                          onClose={pagePanel.onClose}
                          expanded={pagePanel.expanded}
                          onExpand={pagePanel.onExpand}
                        />
                        <div
                          className={cn(
                            'flex min-h-0 flex-1 flex-col overflow-y-auto',
                            'grow size-full h-auto flex flex-col px-5 py-4',
                          )}
                        >
                          <PositionForm />
                        </div>
                        <div
                          className={cn(
                            'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                          )}
                        >
                          <Button
                            variant={'ghost'}
                            onClick={() => setOpen(false)}
                          >
                            {t('cancel')}
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : t('create')}
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
  );
};
