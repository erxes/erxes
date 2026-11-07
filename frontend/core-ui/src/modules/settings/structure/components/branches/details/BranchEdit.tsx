import { TBranchForm } from '@/settings/structure/types/branch';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { useBranchForm } from '@/settings/structure/hooks/useBranchForm';
import { IconGitBranch } from '@tabler/icons-react';
import { Button, Form, Spinner, useToast, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BranchForm } from '@/settings/structure/components/branches/BranchForm';
import { useBranchEdit } from '@/settings/structure/hooks/useBranchActions';
import { Can, RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
export const BranchEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('branch_id');
  const { branchDetail } = useBranchDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useBranchEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBranchForm();
  const { toast } = useToast();
  const setOpen = (newBranchId: string | null) => {
    setSearchParams((currentParams) => {
      const newSearchParams = new URLSearchParams(currentParams);
      if (newBranchId) {
        newSearchParams.set('branch_id', newBranchId);
      } else {
        newSearchParams.delete('branch_id');
      }
      return newSearchParams;
    });
  };
  const submitHandler: SubmitHandler<TBranchForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      onCompleted: () => {
        if (!pagePanel.isCurrent()) return;
        toast({
          title: t('success'),
          variant: 'success',
          description: t('branch-updated'),
        });
        methods.reset();
        setOpen(null);
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };
  useEffect(() => {
    if (branchDetail) {
      const { __typename, _id, ...rest } = branchDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [branchDetail, reset]);
  const pagePanel = usePagePanel({
    identity: id || 'new',
    name: 'settings/structure/branches/BranchEdit',
    open: !!id,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
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
                              {branchDetail?.title || ''}
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
                          <Button
                            variant={'ghost'}
                            onClick={() => setOpen(null)}
                          >
                            {t('cancel')}
                          </Button>
                          <Can action="branchesManage">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? <Spinner /> : t('save')}
                            </Button>
                          </Can>
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
