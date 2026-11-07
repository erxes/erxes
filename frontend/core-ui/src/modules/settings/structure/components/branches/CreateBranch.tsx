import { SubmitHandler } from 'react-hook-form';
import {
  TBranchForm,
  BranchHotKeyScope,
} from '../../types/branch';
import { ApolloError } from '@apollo/client';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';
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
import { BranchForm } from '@/settings/structure/components/branches/BranchForm';
import { useBranchForm } from '@/settings/structure/hooks/useBranchForm';
import {
  useBranchAdd,
  useBranchEdit,
} from '@/settings/structure/hooks/useBranchActions';
import { useBranchCreateSheet } from '@/settings/structure/hooks/useStructureCreateSheet';
import {
  Can,
  usePermissionCheck,
  RecordSidePanel,
  SidePanelRecordPathContext,
} from 'ui-modules';
export const CreateBranch = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const {
    methods,
    methods: { handleSubmit },
  } = useBranchForm();
  const { target, isOpen, openSheet, closeSheet } = useBranchCreateSheet();
  const { handleAdd, loading } = useBranchAdd();
  const { handleEdit } = useBranchEdit();
  const { toast } = useToast();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageBranches = isLoaded && hasActionPermission('branchesManage');
  const presetParentId = target?.parentId;

  // A chart "+" opens the sheet with its parent already chosen
  useEffect(() => {
    methods.setValue('parentId', presetParentId ?? '');
  }, [presetParentId, methods]);
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageBranches) return;
      openSheet();
    },
    BranchHotKeyScope.BranchSettingsPage,
  );
  useScopedHotkeys(`esc`, () => closeSheet(), BranchHotKeyScope.BranchAddSheet);
  const showError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });
  const submitHandler: SubmitHandler<TBranchForm> = (data) => {
    const insertBefore = target?.insertBefore;
    handleAdd({
      variables: data,
      onCompleted: ({ branchesAdd }) => {
        if (!pagePanel.isCurrent()) return;
        if (insertBefore) {
          // The backend rebuilds `order` from the code, so it must be sent
          handleEdit({
            variables: {
              id: insertBefore._id,
              code: insertBefore.code,
              parentId: branchesAdd._id,
            },
            onError: showError,
          });
        }
        toast({
          title: t('success'),
          variant: 'success',
          description: t('branch-created'),
        });
        methods.reset();
        closeSheet();
      },
      onError: showError,
    });
  };
  const pagePanel = usePagePanel({
    requiredPermission: 'branchesManage',
    name: 'settings/structure/branches/CreateBranch',
    onOpenChange: (open) => (open ? openSheet() : closeSheet()),
    open: isOpen,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Can action="branchesManage">
          <Button onClick={pagePanel.onOpen}>
            <IconPlus /> {t('create-branch')}
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
                              <IconGitBranch size={16} />
                              {t('create-branch-title')}
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
                          <BranchForm />
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
