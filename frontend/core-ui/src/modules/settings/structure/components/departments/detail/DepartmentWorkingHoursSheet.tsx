import {
  IWorkDay,
  IWorkhoursForm,
  WorkDay,
} from '@/settings/structure/types/workhours';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { Button, Form, Separator, useQueryState, cn } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { workingHours } from '@/settings/structure/constants/work-days';
import { useWorkhoursForm } from '@/settings/structure/hooks/useWorkhoursForm';
import { Fragment, useEffect } from 'react';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentInlineEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { Can, RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import { WeekDayRow } from '@/settings/structure/components/workhours/WeekDayRow';
export const DepartmentWorkingHoursSheet = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [workingHoursId] = useQueryState<string>('workingHoursId');
  const [, setSearchParams] = useSearchParams();
  const { form } = useWorkhoursForm();
  const { departmentDetail } = useDepartmentDetailsById({
    variables: {
      id: workingHoursId,
    },
    skip: !workingHoursId,
  });
  const { departmentsEdit, loading } = useDepartmentInlineEdit();
  const setOpen = (newId: string | null) => {
    setSearchParams((currentParams) => {
      const newSearchParams = new URLSearchParams(currentParams);
      if (newId) {
        newSearchParams.set('workingHoursId', newId);
      } else {
        newSearchParams.delete('workingHoursId');
      }
      return newSearchParams;
    });
  };
  const onSubmit = (values: IWorkhoursForm) => {
    const activeDays: Partial<Record<WorkDay, IWorkDay>> = {};
    Object.values(WorkDay).forEach((day) => {
      const data = values[day];
      if (data && !data.inactive) {
        activeDays[day] = {
          startFrom: data.startFrom,
          endTo: data.endTo,
          lunchStartFrom: data.lunchStartFrom,
          lunchEndTo: data.lunchEndTo,
          inactive: false,
        };
      }
    });
    const payload = Object.keys(activeDays).length ? activeDays : null;
    departmentsEdit(
      {
        variables: {
          id: workingHoursId,
          code: departmentDetail?.code,
          workhours: payload,
        },
      },
      ['code', 'workhours'],
    );
  };
  useEffect(() => {
    if (departmentDetail) {
      const initialValues = departmentDetail.workhours ?? {};
      const mergedValues = Object.fromEntries(
        Object.entries(workingHours).map(([day, defaults]) => [
          day,
          {
            ...(defaults || {}),
            ...((initialValues as Record<string, any>)[day] || {}),
          },
        ]),
      ) as IWorkhoursForm;
      form.reset(mergedValues);
    }
  }, [departmentDetail, form]);
  const pagePanel = usePagePanel({
    name: 'settings/structure/departments/DepartmentWorkingHoursSheet',
    open: !!workingHoursId,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
    identity: workingHoursId || 'new',
  });
  return (
    <Form {...form}>
      <PagePanelContext.Provider value={pagePanel}>
        <SidePanelRecordPathContext.Provider value={pagePanel.path}>
          {pagePanel.open && pagePanel.target
            ? createPortal(
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                  {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                    <>
                      <div className="flex flex-col gap-0 size-full">
                        <RecordSidePanel.Header
                          title={<>{t('setup-department-working-hours')}</>}
                          onBack={pagePanel.onBack}
                          onClose={pagePanel.onClose}
                          expanded={pagePanel.expanded}
                          onExpand={pagePanel.onExpand}
                        />
                        <div
                          className={cn(
                            'flex min-h-0 flex-1 flex-col overflow-y-auto',
                            'flex-1 min-h-0 overflow-y-auto flex flex-col px-5',
                          )}
                        >
                          {Object.entries(workingHours).map(([day], index) => {
                            return (
                              <Fragment key={day}>
                                {index !== 0 && <Separator />}
                                <WeekDayRow weekDay={day as WorkDay} />
                              </Fragment>
                            );
                          })}
                        </div>
                        <div
                          className={cn(
                            'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                            'flex justify-end items-center gap-3',
                          )}
                        >
                          <Button
                            variant={'secondary'}
                            onClick={() => setOpen(null)}
                          >
                            {t('cancel')}
                          </Button>
                          <Can action="departmentsManage">
                            <Button
                              disabled={loading}
                              type="button"
                              onClick={form.handleSubmit(onSubmit)}
                            >
                              {t('save')}
                            </Button>
                          </Can>
                        </div>
                      </div>
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
    </Form>
  );
};
