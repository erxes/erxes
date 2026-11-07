import { TUnitForm } from '@/settings/structure/types/unit';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { Button, Form, Spinner, useToast, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUnitDetailsById } from '@/settings/structure/hooks/useUnitDetailsById';
import { useUnitEdit } from '@/settings/structure/hooks/useUnitActions';
import { useUnitForm } from '@/settings/structure/hooks/useUnitForm';
import { IconUsersGroup } from '@tabler/icons-react';
import { UnitForm } from '@/settings/structure/components/units/UnitForm';
import { Can, RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
export const UnitEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('unit_id');
  const { unitDetail, loading } = useUnitDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useUnitEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useUnitForm();
  const { toast } = useToast();
  const setOpen = (newUnitId: string | null) => {
    setSearchParams((currentParams) => {
      const newSearchParams = new URLSearchParams(currentParams);
      if (newUnitId) {
        newSearchParams.set('unit_id', newUnitId);
      } else {
        newSearchParams.delete('unit_id');
      }
      return newSearchParams;
    });
  };
  const submitHandler: SubmitHandler<TUnitForm> = (data) => {
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
          description: t('unit-updated'),
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
    if (unitDetail) {
      const { __typename, _id, ...rest } = unitDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [unitDetail, reset]);
  const pagePanel = usePagePanel({
    identity: id || 'new',
    name: 'settings/structure/units/UnitEdit',
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
                              <IconUsersGroup size={16} />
                              {unitDetail?.title || ''}
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
                          <UnitForm loading={loading} />
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
                          <Can action="unitsManage">
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
