import {
  Button,
  DatePicker,
  Form,
  Input,
  Separator,
  Sheet,
  Switch,
  useQueryState,
} from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { workingHours } from '@/settings/structure/constants/work-days';
import {
  IHoliday,
  IWorkhoursForm,
  WorkDay,
} from '@/settings/structure/types/workhours';
import { useWorkhoursForm } from '@/settings/structure/hooks/useWorkhoursForm';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Can } from 'ui-modules';
import { useBranchById } from 'ui-modules/modules/structure/hooks/useBranchById';
import { Fragment, useEffect, useState } from 'react';
import { useBranchInlineEdit } from '@/settings/structure/hooks/useBranchActions';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { WeekDayRow } from '@/settings/structure/components/workhours/WeekDayRow';
import { WorkTimeField } from '@/settings/structure/components/workhours/WorkTimeField';

export const BranchWorkingHoursSheet = () => {
  const [workingHoursId] = useQueryState('workingHoursId');
  const [searchParams, setSearchParams] = useSearchParams();
  const { form } = useWorkhoursForm();
  const { branchDetail } = useBranchById({
    variables: {
      id: workingHoursId,
    },
    skip: !workingHoursId,
  });

  const { branchesEdit, loading } = useBranchInlineEdit();

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
    const { holidays, ...days } = values || {};
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

    const holidaysPayload = (holidays ?? []).filter(
      (holiday) => holiday?.name || holiday?.startDate || holiday?.endDate,
    );

    branchesEdit(
      {
        variables: {
          id: workingHoursId,
          code: branchDetail?.code,
          workhours: payload,
          holidays: holidaysPayload,
        },
      },
      ['code', 'workhours', 'holidays'],
    );
  };

  useEffect(() => {
    if (branchDetail) {
      const initialValues = branchDetail.workhours ?? {};

      const mergedValues = Object.fromEntries(
        Object.entries(workingHours).map(([day, defaults]) => [
          day,
          {
            ...(defaults || {}),
            ...((initialValues as Record<string, any>)[day] || {}),
          },
        ]),
      ) as IWorkhoursForm;
      form.reset({
        ...mergedValues,
        holidays: (branchDetail.holidays as IHoliday[]) ?? [],
      });
    }
  }, [branchDetail, form]);

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
        <Sheet.View className="p-0 md:max-w-5xl">
          <div className="flex flex-col gap-0 size-full">
            <Sheet.Header>
              <Sheet.Title>Setup branch working hours</Sheet.Title>
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
              <Separator />
              <HolidaysSection />
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end items-center gap-3">
              <Button variant={'secondary'} onClick={() => setOpen(null)}>
                Cancel
              </Button>
              <Can action="branchesManage">
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

const HolidaysSection = () => {
  const form = useFormContext<IWorkhoursForm>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'holidays',
  });

  const addHoliday = () =>
    append({
      _id: nanoid(),
      name: '',
      startDate: '',
      endDate: '',
      inactive: false,
      startFrom: '',
      endTo: '',
    });

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold">Custom holidays</span>
          <span className="text-sm text-accent-foreground">
            Add special non-working periods for this branch
          </span>
        </div>
        <Can action="branchesManage">
          <Button type="button" variant="secondary" onClick={addHoliday}>
            <IconPlus /> Add holiday
          </Button>
        </Can>
      </div>

      {fields.length === 0 ? (
        <span className="text-sm text-accent-foreground py-2">
          No holidays added yet.
        </span>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <HolidayRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HolidayRow = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) => {
  const form = useFormContext<IWorkhoursForm>();
  const isInactive = form.watch(`holidays.${index}.inactive`) as boolean;
  const startDate = form.watch(`holidays.${index}.startDate`);
  const endDate = form.watch(`holidays.${index}.endDate`);
  const startFrom = form.watch(`holidays.${index}.startFrom`);
  const endTo = form.watch(`holidays.${index}.endTo`);
  const [hasWorkHours, setHasWorkHours] = useState(
    Boolean(startFrom || endTo),
  );

  const toggleWorkHours = (checked: boolean) => {
    setHasWorkHours(checked);
    if (checked) {
      // Default to the same hours as a regular working day (09:00–18:00).
      if (!startFrom) form.setValue(`holidays.${index}.startFrom`, '09:00');
      if (!endTo) form.setValue(`holidays.${index}.endTo`, '18:00');
    } else {
      form.setValue(`holidays.${index}.startFrom`, '');
      form.setValue(`holidays.${index}.endTo`, '');
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-md border p-3 ${
        isInactive ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Form.Field
          control={form.control}
          name={`holidays.${index}.inactive`}
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
        <Form.Field
          control={form.control}
          name={`holidays.${index}.name`}
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Control>
                <Input
                  className="w-full"
                  placeholder="Holiday name"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="flex items-center gap-3 shrink-0">
          <DatePicker
            className="w-36"
            mode="single"
            placeholder="Start date"
            value={startDate ? new Date(startDate) : undefined}
            onChange={(date) => {
              form.setValue(
                `holidays.${index}.startDate`,
                date ? (date as Date).toISOString() : '',
              );
            }}
          />
          <span className="font-medium text-sm text-accent-foreground">to</span>
          <DatePicker
            className="w-36"
            mode="single"
            placeholder="End date"
            value={endDate ? new Date(endDate) : undefined}
            onChange={(date) => {
              form.setValue(
                `holidays.${index}.endDate`,
                date ? (date as Date).toISOString() : '',
              );
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove holiday"
        >
          <IconTrash />
        </Button>
      </div>

      <div className="flex items-center gap-3 pl-11">
        <Switch
          checked={hasWorkHours}
          onCheckedChange={toggleWorkHours}
          disabled={isInactive}
        />
        <span className="text-sm text-accent-foreground">Working hours</span>
        {hasWorkHours && (
          <div className="flex items-center gap-3">
            <WorkTimeField name={`holidays.${index}.startFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              to
            </span>
            <WorkTimeField name={`holidays.${index}.endTo`} />
          </div>
        )}
      </div>
    </div>
  );
};
