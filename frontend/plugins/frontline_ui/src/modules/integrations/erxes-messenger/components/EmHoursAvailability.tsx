import { useTranslation } from 'react-i18next';
import {
  TimeField,
  DateInput,
  Switch,
  ScrollArea,
  Form,
  RadioGroup,
  Button,
  cn,
  Separator,
  ToggleGroup,
  TimezoneSelect,
  detectTimeZone,
} from 'erxes-ui';
import { EMLayout, EMLayoutPreviousStepButton } from './EMLayout';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  EMHOURS_SCHEMA,
  ScheduleDay,
} from '@/integrations/erxes-messenger/constants/emHoursSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseTime } from '@internationalized/date';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';

type EMHoursAvailabilityFormValues = z.infer<typeof EMHOURS_SCHEMA>;

export const EMHoursAvailability = () => {
  const { t } = useTranslation('frontline');
  const atomValue = useAtomValue(erxesMessengerSetupHoursAtom);
  const form = useForm<EMHoursAvailabilityFormValues>({
    resolver: zodResolver(EMHOURS_SCHEMA),
    defaultValues: atomValue ?? {
      availabilityMethod: 'manual',
      isOnline: false,
      timezone: detectTimeZone(),
      responseRate: EnumResponseRate.MINUTES,
    },
  });

  const setStep = useSetAtom(erxesMessengerSetupStepAtom);

  const onSubmit = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupHoursAtom}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-auto flex flex-col overflow-hidden"
      >
        <EMLayout
          title={t('hours-availability')}
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">{t('next-step')}</Button>
            </>
          }
        >
          <div className="p-4 pt-0 space-y-6 overflow-auto styled-scroll flex-1">
            <Form.Field
              name="availabilityMethod"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">
                    {t('availability-switch-type')}
                  </Form.Label>
                  <Form.Control>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col mt-0!"
                    >
                      <Form.Item className="flex items-center gap-3 space-y-0">
                        <Form.Control>
                          <RadioGroup.Item value="manual" />
                        </Form.Control>
                        <Form.Label variant="peer">
                          {t('turn-online-offline-manually')}
                        </Form.Label>
                      </Form.Item>
                      <Form.Item className="flex items-center gap-3 space-y-0">
                        <Form.Control>
                          <RadioGroup.Item value="auto" />
                        </Form.Control>
                        <Form.Label variant="peer">
                          {t('set-to-follow-your-schedule')}
                        </Form.Label>
                      </Form.Item>
                    </RadioGroup>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <EMHoursTimeTable form={form} />
            <Form.Field
              name="responseRate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('response-rate')}</Form.Label>
                  <Form.Control>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      {Object.values(EnumResponseRate).map((rate) => (
                        <Form.Item
                          className="flex items-center gap-3 space-y-0"
                          key={rate}
                        >
                          <Form.Control>
                            <RadioGroup.Item value={rate} />
                          </Form.Control>
                          <Form.Label variant="peer">
                            {t(`few-rate.${rate}`)}
                          </Form.Label>
                        </Form.Item>
                      ))}
                    </RadioGroup>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="timezone"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('timezone')}</Form.Label>
                  <Form.Control>
                    <TimezoneSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      className="max-w-96"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="displayOperatorTimezone"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      {t('display-operator-timezone')}
                    </Form.Label>
                  </div>
                  <Form.Description>
                    {t('display-operator-timezone-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="hideMessengerDuringOfflineHours"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      {t('hide-messenger-during-offline-hours')}
                    </Form.Label>
                  </div>
                  <Form.Description>
                    {t('hide-messenger-during-offline-hours-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};

const safeParseTime = (value: string) => {
  try {
    return parseTime(value);
  } catch {
    return null;
  }
};

const WEEKDAYS = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
] as const;

const WEEKEND_DAYS = [Weekday.SATURDAY, Weekday.SUNDAY] as const;
const ALL_DAYS = [...WEEKDAYS, ...WEEKEND_DAYS] as const;

const DEFAULT_FROM = '09:00:00';
const DEFAULT_TO = '18:00:00';

const DAY_GROUPS = [
  { key: ScheduleDay.DAILY, label: 'everyday', days: ALL_DAYS },
  { key: ScheduleDay.WEEKDAY, label: 'weekdays', days: WEEKDAYS },
  { key: ScheduleDay.WEEKEND, label: 'weekend', days: WEEKEND_DAYS },
] as const;

type EMHoursFormValues = z.infer<typeof EMHOURS_SCHEMA>;
type OnlineHours = EMHoursFormValues['onlineHours'];

/**
 * Writes the given work-flag overrides, fills in default hours for days that
 * are switched on without times, and keeps the derived group keys
 * (everyday/weekday/weekend) in sync with the individual days.
 */
const applyDayWork = (
  form: UseFormReturn<EMHoursFormValues>,
  onlineHours: OnlineHours,
  overrides: Partial<Record<Weekday, boolean>>,
) => {
  const nextOnlineHours: OnlineHours = { ...onlineHours };

  ALL_DAYS.forEach((day) => {
    const work = overrides[day];
    if (work === undefined) {
      return;
    }

    const current = onlineHours?.[day];
    nextOnlineHours[day] = {
      ...current,
      work,
      from: work ? current?.from || DEFAULT_FROM : current?.from,
      to: work ? current?.to || DEFAULT_TO : current?.to,
    };
  });

  DAY_GROUPS.forEach(({ key, days }) => {
    nextOnlineHours[key] = {
      ...onlineHours?.[key],
      work: days.every((day) => !!nextOnlineHours?.[day]?.work),
    };
  });

  form.setValue('onlineHours', nextOnlineHours, { shouldDirty: true });
};

export const EMHoursTimeTable = ({
  form,
}: {
  form: UseFormReturn<EMHoursFormValues>;
}) => {
  const { t } = useTranslation('frontline');
  const availabilityMethod = useWatch({
    control: form.control,
    name: 'availabilityMethod',
  });

  // Watch all individual days to derive group states
  const onlineHours = useWatch({ control: form.control, name: 'onlineHours' });

  if (availabilityMethod === 'manual') {
    return (
      <Form.Field
        name="isOnline"
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center gap-3">
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>

              <Form.Label variant="peer" className="leading-6">
                {t('visible-online-to-visitor-or-customer')}
              </Form.Label>
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  }

  const activeGroup =
    DAY_GROUPS.find(({ days }) => {
      const selected = new Set<Weekday>(days);
      return ALL_DAYS.every(
        (day) => !!onlineHours?.[day]?.work === selected.has(day),
      );
    })?.key ?? '';

  return (
    <div className="flex flex-col gap-4">
      <Separator />

      {/* ── Quick set presets ─────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('quick-set')}
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={activeGroup}
          onValueChange={(value) => {
            const group = DAY_GROUPS.find(({ key }) => key === value);
            if (!group) {
              return;
            }
            const selected = new Set<Weekday>(group.days);
            applyDayWork(
              form,
              onlineHours,
              Object.fromEntries(
                ALL_DAYS.map((day) => [day, selected.has(day)]),
              ),
            );
          }}
          className="w-fit"
        >
          {DAY_GROUPS.map(({ key, label }) => (
            <ToggleGroup.Item key={key} value={key} aria-label={t(label)}>
              {t(label)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>

      <Separator />

      {/* ── Individual day rows ───────────────────────────────── */}
      <ScrollArea className="w-full">
        <div className="flex flex-col">
          {ALL_DAYS.map((day) => (
            <Form.Field
              name={`onlineHours.${day}.work`}
              key={day}
              render={({ field }) => (
                <Form.Item
                  className={cn(
                    'flex items-center gap-3 border-b py-2.5 space-y-0 transition-opacity',
                    !field.value && 'opacity-50',
                  )}
                >
                  <Form.Control>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        applyDayWork(form, onlineHours, { [day]: checked })
                      }
                    />
                  </Form.Control>
                  <Form.Label
                    className="w-24 flex-none font-medium capitalize"
                    variant="peer"
                  >
                    {day}
                  </Form.Label>
                  <div className="flex flex-1 items-center justify-end gap-2">
                    <EMHoursTimeField
                      day={day}
                      boundary="from"
                      disabled={!field.value}
                    />
                    <span className="text-sm text-muted-foreground">
                      {t('to')}
                    </span>
                    <EMHoursTimeField
                      day={day}
                      boundary="to"
                      disabled={!field.value}
                    />
                  </div>
                </Form.Item>
              )}
            />
          ))}
        </div>
        <ScrollArea.Bar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

const EMHoursTimeField = ({
  day,
  boundary,
  disabled,
}: {
  day: Weekday;
  boundary: 'from' | 'to';
  disabled: boolean;
}) => (
  <Form.Field
    name={`onlineHours.${day}.${boundary}`}
    render={({ field }) => (
      <Form.Item className="space-y-0">
        <TimeField
          value={field.value ? safeParseTime(field.value) : null}
          onChange={(value) => field.onChange(value?.toString())}
          isDisabled={disabled}
          aria-label={`${day} ${boundary}`}
        >
          <Form.Control>
            <DateInput className="w-24 justify-center" />
          </Form.Control>
        </TimeField>
        <Form.Message />
      </Form.Item>
    )}
  />
);
