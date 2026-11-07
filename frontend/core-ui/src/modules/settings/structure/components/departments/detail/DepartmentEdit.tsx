import { TDepartmentForm } from '@/settings/structure/types/department';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconFolder } from '@tabler/icons-react';
import { Button, Form, Spinner, useToast, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { useDepartmentForm } from '@/settings/structure/hooks/useDepartmentForm';
import { DepartmentForm } from '@/settings/structure/components/departments/DepartmentForm';
import { Can, RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
export const DepartmentEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('department_id');
  const { departmentDetail } = useDepartmentDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useDepartmentEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useDepartmentForm();
  const { toast } = useToast();
  const setOpen = (newDepartmentId: string | null) => {
    setSearchParams((currentParams) => {
      const newSearchParams = new URLSearchParams(currentParams);
      if (newDepartmentId) {
        newSearchParams.set('department_id', newDepartmentId);
      } else {
        newSearchParams.delete('department_id');
      }
      return newSearchParams;
    });
  };
  const submitHandler: SubmitHandler<TDepartmentForm> = (data) => {
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
          description: t('department-updated'),
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
    if (departmentDetail) {
      const { __typename, _id, ...rest } = departmentDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [departmentDetail, reset]);
  const pagePanel = usePagePanel({
    identity: id || 'new',
    name: 'settings/structure/departments/DepartmentEdit',
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
                              <IconFolder size={16} />
                              {departmentDetail?.title || ''}
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
                          <Button
                            variant={'ghost'}
                            onClick={() => setOpen(null)}
                          >
                            {t('cancel')}
                          </Button>
                          <Can action="departmentsManage">
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
