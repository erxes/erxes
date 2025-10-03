import {
  Button,
  DateInput,
  Form,
  Separator,
  Sheet,
  Switch,
  TimeField,
  useQueryState,
} from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { workingHours } from '@/settings/structure/constants/work-days';
import { IWorkhoursForm } from '@/settings/structure/types/workhours';
import { useWorkhoursForm } from '@/settings/structure/hooks/useWorkhoursForm';
import { useFormContext } from 'react-hook-form';
import { Fragment, useEffect } from 'react';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentInlineEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { parseTime } from '@internationalized/date';

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
    const activeDays: Record<string, any> = {};

    Object.entries(values || {}).forEach(([day, data]) => {
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
        <Sheet.View className="p-0 md:max-w-screen-md">
          <div className="flex flex-col gap-0 size-full">
            <Sheet.Header>
              <Sheet.Title>Setup department working hours</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5">
              {Object.entries(workingHours).map(([day, data], index) => {
                return (
                  <Fragment key={day}>
                    {index !== 0 && <Separator />}
                    <WeekDay weekDay={day} />
                  </Fragment>
                );
              })}
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end items-center gap-3">
              <Button variant={'secondary'} onClick={() => setOpen(null)}>
                Cancel
              </Button>
              <Button
                disabled={loading}
                type="button"
                onClick={form.handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </Sheet.Footer>
          </div>
        </Sheet.View>
      </Sheet>
    </Form>
  );
};

const WeekDay = ({ weekDay }: { weekDay: string }) => {
  const form = useFormContext<IWorkhoursForm>();
  const isInactive = form.watch(`${weekDay}.inactive`) as boolean;

  return (
    <div className="flex items-center gap-3 py-3" id={weekDay}>
      <Form.Field
        control={form.control}
        name={`${weekDay}.inactive`}
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <Switch
                checked={!field.value}
                onCheckedChange={(checked) => field.onChange(!checked)}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <span className="font-semibold">{weekDay}</span>
      {(isInactive && (
        <span className="font-normal text-sm h-8 text-accent-foreground flex items-center">
          Not working on this day
        </span>
      )) || (
        <div className="flex items-center gap-8 ml-auto">
          <div className="flex items-center gap-3">
            <Form.Field
              control={form.control}
              name={`${weekDay}.startFrom`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <TimeField
                      value={field.value ? parseTime(field.value) : null}
                      onChange={(value) => {
                        field.onChange(value?.toString());
                      }}
                    >
                      <Form.Control>
                        <DateInput />
                      </Form.Control>
                    </TimeField>
                  </Form.Control>
                </Form.Item>
              )}
            />
            <span className="font-medium text-sm text-accent-foreground">
              to
            </span>
            <Form.Field
              control={form.control}
              name={`${weekDay}.endTo`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <TimeField
                      value={field.value ? parseTime(field.value) : null}
                      onChange={(value) => {
                        field.onChange(value?.toString());
                      }}
                    >
                      <Form.Control>
                        <DateInput />
                      </Form.Control>
                    </TimeField>
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <div className="flex items-center gap-3">
            <legend className="font-medium text-sm text-accent-foreground">
              Lunch
            </legend>
            <Form.Field
              control={form.control}
              name={`${weekDay}.lunchStartFrom`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <TimeField
                      value={field.value ? parseTime(field.value) : null}
                      onChange={(value) => {
                        field.onChange(value?.toString());
                      }}
                    >
                      <Form.Control>
                        <DateInput />
                      </Form.Control>
                    </TimeField>
                  </Form.Control>
                </Form.Item>
              )}
            />
            <span className="font-medium text-sm text-accent-foreground">
              to
            </span>
            <Form.Field
              control={form.control}
              name={`${weekDay}.lunchEndTo`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <TimeField
                      value={field.value ? parseTime(field.value) : null}
                      onChange={(value) => {
                        field.onChange(value?.toString());
                      }}
                    >
                      <Form.Control>
                        <DateInput />
                      </Form.Control>
                    </TimeField>
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
