import { useWorkhoursPanel } from '@/settings/structure/hooks/useWorkhoursPanel';
import { WorkhoursFormContent } from '@/settings/structure/components/workhours/WorkhoursFormContent';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { createPagePanelPortal as createPortal } from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, Form, Input, Separator, Switch } from 'erxes-ui';
import { workingHours } from '@/settings/structure/constants/work-days';
import {
  IHoliday,
  IWorkDay,
  IWorkhoursForm,
  WorkDay,
} from '@/settings/structure/types/workhours';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Can } from 'ui-modules';
import { useBranchById } from 'ui-modules/modules/structure/hooks/useBranchById';
import { useEffect, useState } from 'react';
import { useBranchInlineEdit } from '@/settings/structure/hooks/useBranchActions';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { WorkTimeField } from '@/settings/structure/components/workhours/WorkTimeField';
export const BranchWorkingHoursSheet = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { workingHoursId, form, pagePanel, close } = useWorkhoursPanel(
    'settings/structure/branches/BranchWorkingHoursSheet',
  );
  const { branchDetail } = useBranchById({
    variables: {
      id: workingHoursId,
    },
    skip: !workingHoursId,
  });
  const { branchesEdit, loading } = useBranchInlineEdit();
  const onSubmit = (values: IWorkhoursForm) => {
    const { holidays } = values;
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
      const initialValues: Partial<Record<WorkDay, IWorkDay>> =
        branchDetail.workhours ?? {};
      const mergedValues = Object.fromEntries(
        Object.values(WorkDay).map((day) => [
          day,
          {
            ...workingHours[day],
            ...initialValues[day],
          },
        ]),
      ) as IWorkhoursForm;
      form.reset({
        ...mergedValues,
        holidays: (branchDetail.holidays as IHoliday[]) ?? [],
      });
    }
  }, [branchDetail, form]);

  return createPortal(
    pagePanel.permissionsLoaded && pagePanel.allowed ? (
      <WorkhoursFormContent
        title={t('setup-branch-working-hours')}
        form={form}
        navigation={pagePanel.headerProps}
        onCancel={close}
        onSave={form.handleSubmit(onSubmit)}
        saving={loading}
        permission="branchesManage"
      >
        <Separator />
        <HolidaysSection />
      </WorkhoursFormContent>
    ) : (
      <PagePanelStatus entry={pagePanel} />
    ),
    pagePanel,
  );
};
const HolidaysSection = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-semibold">{t('custom-holidays')}</span>
          <span className="text-sm text-accent-foreground">
            {t('add-special-periods')}
          </span>
        </div>
        <Can action="branchesManage">
          <Button type="button" variant="secondary" onClick={addHoliday}>
            <IconPlus /> {t('add-holiday')}
          </Button>
        </Can>
      </div>

      {fields.length === 0 ? (
        <span className="text-sm text-accent-foreground py-2">
          {t('no-holidays')}
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
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const form = useFormContext<IWorkhoursForm>();
  const isInactive = form.watch(`holidays.${index}.inactive`) as boolean;
  const startDate = form.watch(`holidays.${index}.startDate`);
  const endDate = form.watch(`holidays.${index}.endDate`);
  const startFrom = form.watch(`holidays.${index}.startFrom`);
  const endTo = form.watch(`holidays.${index}.endTo`);
  const [hasWorkHours, setHasWorkHours] = useState(Boolean(startFrom || endTo));
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
      <div className="flex flex-wrap items-center gap-3">
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
            <Form.Item className="min-w-0 flex-1">
              <Form.Control>
                <Input
                  className="w-full"
                  placeholder={t('holiday-name')}
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="order-1 flex w-full min-w-0 flex-wrap items-center gap-2">
          <DatePicker
            className="w-36"
            mode="single"
            placeholder={t('start-date')}
            value={startDate ? new Date(startDate) : undefined}
            onChange={(date) => {
              form.setValue(
                `holidays.${index}.startDate`,
                date ? (date as Date).toISOString() : '',
              );
            }}
          />
          <span className="font-medium text-sm text-accent-foreground">
            {t('to')}
          </span>
          <DatePicker
            className="w-36"
            mode="single"
            placeholder={t('end-date')}
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
          aria-label={t('remove-holiday')}
        >
          <IconTrash />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Switch
          checked={hasWorkHours}
          onCheckedChange={toggleWorkHours}
          disabled={isInactive}
        />
        <span className="text-sm text-accent-foreground">
          {t('working-hours-label')}
        </span>
        {hasWorkHours && (
          <div className="flex flex-wrap items-center gap-2">
            <WorkTimeField name={`holidays.${index}.startFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              {t('to')}
            </span>
            <WorkTimeField name={`holidays.${index}.endTo`} />
          </div>
        )}
      </div>
    </div>
  );
};
