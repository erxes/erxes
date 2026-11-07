import { TPositionForm } from '@/settings/structure/types/position';
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
import { IconBriefcase } from '@tabler/icons-react';
import { usePositionDetailsById } from '@/settings/structure/hooks/usePositionDetailsById';
import { usePositionEdit } from '@/settings/structure/hooks/usePositionActions';
import { usePositionForm } from '@/settings/structure/hooks/usePositionForm';
import { PositionForm } from '@/settings/structure/components/positions/PositionForm';
import { Can, RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
export const PositionEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('position_id');
  const { positionDetail, loading } = usePositionDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = usePositionEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = usePositionForm();
  const { toast } = useToast();
  const setOpen = (newPositionId: string | null) => {
    setSearchParams((currentParams) => {
      const newSearchParams = new URLSearchParams(currentParams);
      if (newPositionId) {
        newSearchParams.set('position_id', newPositionId);
      } else {
        newSearchParams.delete('position_id');
      }
      return newSearchParams;
    });
  };
  const submitHandler: SubmitHandler<TPositionForm> = (data) => {
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
          description: t('position-updated'),
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
    if (positionDetail) {
      const { __typename, _id, ...rest } = positionDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [positionDetail, reset]);
  const pagePanel = usePagePanel({
    identity: id || 'new',
    name: 'settings/structure/positions/PositionEdit',
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
                              <IconBriefcase size={16} />
                              {positionDetail?.title || ''}
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
                          <PositionForm loading={loading} />
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
                          <Can action="positionsManage">
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
