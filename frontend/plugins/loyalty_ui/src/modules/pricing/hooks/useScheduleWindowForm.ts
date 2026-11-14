import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { IPricingActiveWindow } from '@/pricing/types';
import {
  ScheduleWindowFormValues,
  createScheduleWindowSchema,
  formValuesToWindow,
  runsPastMidnight,
  windowToFormValues,
} from '@/pricing/utils/schedule';

export const useScheduleWindowForm = ({
  open,
  window,
  onSave,
}: {
  open: boolean;
  window: IPricingActiveWindow | null;
  onSave: (window: IPricingActiveWindow) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const schema = useMemo(() => createScheduleWindowSchema(t), [t]);
  const form = useForm<ScheduleWindowFormValues>({
    resolver: zodResolver(schema),
    defaultValues: windowToFormValues(window),
  });

  useEffect(() => {
    if (open) {
      form.reset(windowToFormValues(window));
    }
  }, [open, window, form]);

  const [type, allDay, startTime, endTime, fromMonthDay, toMonthDay] =
    form.watch([
      'type',
      'allDay',
      'startTime',
      'endTime',
      'fromMonthDay',
      'toMonthDay',
    ]);

  const overnight =
    !allDay &&
    !!startTime &&
    !!endTime &&
    runsPastMidnight({ startTime, endTime });

  const submit = form.handleSubmit((values) =>
    onSave(formValuesToWindow(values)),
  );

  return {
    form,
    type,
    allDay,
    startTime,
    endTime,
    fromMonthDay,
    toMonthDay,
    overnight,
    submit,
  };
};
