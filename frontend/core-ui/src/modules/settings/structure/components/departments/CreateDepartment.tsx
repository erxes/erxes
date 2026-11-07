import {
  TDepartmentForm,
  DepartmentHotKeyScope,
} from '../../types/department';
import { SubmitHandler } from 'react-hook-form';
import { ApolloError } from '@apollo/client';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconFolder, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Spinner,
  useScopedHotkeys,
  useToast,
  cn,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useDepartmentForm } from '@/settings/structure/hooks/useDepartmentForm';
import {
  useDepartmentAdd,
  useDepartmentEdit,
} from '@/settings/structure/hooks/useDepartmentActions';
import { useDepartmentCreateSheet } from '@/settings/structure/hooks/useStructureCreateSheet';
import { DepartmentForm } from '@/settings/structure/components/departments/DepartmentForm';
import {
  Can,
  usePermissionCheck,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
export const CreateDepartment = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const {
    methods,
    methods: { handleSubmit },
  } = useDepartmentForm();
  const { target, isOpen, openSheet, closeSheet } = useDepartmentCreateSheet();
  const { handleAdd, loading } = useDepartmentAdd();
  const { handleEdit } = useDepartmentEdit();
  const { toast } = useToast();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageDepartments =
    isLoaded && hasActionPermission('departmentsManage');
  const presetParentId = target?.parentId;

  // A chart "+" opens the sheet with its parent already chosen
  useEffect(() => {
    methods.setValue('parentId', presetParentId ?? '');
  }, [presetParentId, methods]);
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageDepartments) return;
      openSheet();
    },
    DepartmentHotKeyScope.DepartmentSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => closeSheet(),
    DepartmentHotKeyScope.DepartmentAddSheet,
  );
  const showError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });
  const submitHandler: SubmitHandler<TDepartmentForm> = (data) => {
    const insertBefore = target?.insertBefore;
    handleAdd({
      variables: data,
      onCompleted: ({ departmentsAdd }) => {
        if (!pagePanel.isCurrent()) return;
        if (insertBefore) {
          // The backend rebuilds `order` from the code, so it must be sent
          handleEdit({
            variables: {
              id: insertBefore._id,
              code: insertBefore.code,
              parentId: departmentsAdd._id,
            },
            onError: showError,
          });
        }
        toast({
          title: t('success'),
          variant: 'success',
          description: t('department-created'),
        });
        methods.reset();
        closeSheet();
      },
      onError: showError,
    });
  };
  const pagePanel = usePagePanel({
    requiredPermission: 'departmentsManage',
    name: 'settings/structure/departments/CreateDepartment',
    onOpenChange: (open) => (open ? openSheet() : closeSheet()),
    open: isOpen,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Can action="departmentsManage">
          <Button onClick={pagePanel.onOpen}>
            <IconPlus /> {t('create-department')}
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
                              <IconFolder size={16} />
                              {t('create-department-title')}
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
                          <DepartmentForm />
                        </div>
                        <div
                          className={cn(
                            'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                          )}
                        >
                          <Button variant={'ghost'} onClick={closeSheet}>
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
