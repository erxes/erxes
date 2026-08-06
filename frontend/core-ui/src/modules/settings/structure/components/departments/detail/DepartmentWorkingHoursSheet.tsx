import { Button, Form, Separator, Sheet, useQueryState } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { workingHours } from '@/settings/structure/constants/work-days';
import { IWorkhoursForm, WorkDay } from '@/settings/structure/types/workhours';
import { useWorkhoursForm } from '@/settings/structure/hooks/useWorkhoursForm';
import { Fragment, useEffect } from 'react';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentInlineEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { Can } from 'ui-modules';
import { WeekDayRow } from '@/settings/structure/components/workhours/WeekDayRow';

export const DepartmentWorkingHoursSheet = () => {
  const [workingHoursId] = useQueryState('workingHoursId');
  const [searchParams, setSearchParams] = useSearchParams();
  const { form } = useWorkhoursForm();
  const { departmentDetail } = useDepartmentDetailsById({
    variables: {
      id: workingHoursId,
    },
    skip: !workingHoursId,
  });

  const { departmentsEdit, loading } = useDepartmentInlineEdit();

  const setOpen = (newId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newId) {
      newSearchParams.set('workingHoursId', newId);
    } else {
      newSearchParams.delete('workingHoursId');
    }
    setSearchParams(newSearchParams);
  };

  const onSubmit = (values: IWorkhoursForm) => {
    const { holidays: _holidays, ...days } = values || {};
    const activeDays: Record<string, any> = {};

    Object.entries(days).forEach(([day, data]) => {
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

  return (
    <Form {...form}>
      <Sheet
        open={!!workingHoursId}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null);
          }
        }}
      >
        <Sheet.View className="p-0 md:max-w-4xl">
          <div className="flex flex-col gap-0 size-full">
            <Sheet.Header>
              <Sheet.Title>Setup department working hours</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5">
              {Object.entries(workingHours).map(([day], index) => {
                return (
                  <Fragment key={day}>
                    {index !== 0 && <Separator />}
                    <WeekDayRow weekDay={day as WorkDay} />
                  </Fragment>
                );
              })}
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end items-center gap-3">
              <Button variant={'secondary'} onClick={() => setOpen(null)}>
                Cancel
              </Button>
              <Can action="departmentsManage">
                <Button
                  disabled={loading}
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Save
                </Button>
              </Can>
            </Sheet.Footer>
          </div>
        </Sheet.View>
      </Sheet>
    </Form>
  );
};
