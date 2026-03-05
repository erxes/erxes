import {
  TimeField,
  DateInput,
  Switch,
  ScrollArea,
  Form,
  RadioGroup,
  Button,
  cn,
  TimezoneSelect,
  detectTimeZone,
} from 'erxes-ui';
import { EMLayout, EMLayoutPreviousStepButton } from './EMLayout';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { EMHOURS_SCHEMA, ScheduleDay } from '@/integrations/erxes-messenger/constants/emHoursSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseTime } from '@internationalized/date';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';
import { useSetAtom } from 'jotai';
import {
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';

type EMHoursAvailabilityFormValues = z.infer<typeof EMHOURS_SCHEMA>;

export const EMHoursAvailability = () => {
  const form = useForm<EMHoursAvailabilityFormValues>({
    resolver: zodResolver(EMHOURS_SCHEMA),
    defaultValues: {
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
          title="Hours availability"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">Next step</Button>
            </>
          }
        >
          <div className="p-4 pt-0 space-y-6 overflow-auto styled-scroll flex-1">
            <Form.Field
              name="availabilityMethod"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">
                    Availability switch type
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
                          Turn online/offline manually
                        </Form.Label>
                      </Form.Item>
                      <Form.Item className="flex items-center gap-3 space-y-0">
                        <Form.Control>
                          <RadioGroup.Item value="auto" />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Set to follow your schedule
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
                  <Form.Label>Response rate</Form.Label>
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
                          <Form.Label variant="peer">few {rate}</Form.Label>
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
                  <Form.Label>Timezone</Form.Label>
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
                      Display operator timezone
                    </Form.Label>
                  </div>
                  <Form.Description>
                    Display chat operator timezone set in their location in team
                    member profiles
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
                      Hide messenger during offline hours
                    </Form.Label>
                  </div>
                  <Form.Description>
                    Forcibly hide the messenger when you're offline. This will
                    hide the messenger from your website visitors.
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

/** Set a day's work flag + default times if turning on */
const setDayWork = (
  form: UseFormReturn<z.infer<typeof EMHOURS_SCHEMA>>,
  day: Weekday | ScheduleDay,
  checked: boolean,
) => {
  form.setValue(`onlineHours.${day}.work` as never, checked as never);
  if (checked) {
    form.setValue(`onlineHours.${day}.from` as never, DEFAULT_FROM as never);
    form.setValue(`onlineHours.${day}.to` as never, DEFAULT_TO as never);
  }
};

export const EMHoursTimeTable = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof EMHOURS_SCHEMA>>;
}) => {
  const availabilityMethod = useWatch({
    control: form.control,
    name: 'availabilityMethod',
  });

  // Watch all individual days to derive group states
  const onlineHours = useWatch({ control: form.control, name: 'onlineHours' });

  const isDayOn = (day: Weekday | ScheduleDay) => !!onlineHours?.[day]?.work;

  const allOn = ALL_DAYS.every(isDayOn);
  const weekdaysOn = WEEKDAYS.every(isDayOn);
  const weekendOn = WEEKEND_DAYS.every(isDayOn);

  /** Recomputes and syncs the three group keys based on current day states */
  const syncGroupKeys = (updatedDay?: Weekday | ScheduleDay, updatedValue?: boolean) => {
    const isOn = (day: Weekday | ScheduleDay) =>
      day === updatedDay ? (updatedValue ?? isDayOn(day)) : isDayOn(day);

    const nextAllOn = ALL_DAYS.every(isOn);
    const nextWeekdaysOn = WEEKDAYS.every(isOn);
    const nextWeekendOn = WEEKEND_DAYS.every(isOn);

    form.setValue(
      `onlineHours.${ScheduleDay.DAILY}.work` as never,
      nextAllOn as never,
    );
    form.setValue(
      `onlineHours.${ScheduleDay.WEEKDAY}.work` as never,
      nextWeekdaysOn as never,
    );
    form.setValue(
      `onlineHours.${ScheduleDay.WEEKEND}.work` as never,
      nextWeekendOn as never,
    );
  };

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
                Visible online to visitor or customer
              </Form.Label>
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  }

  return (
    <ScrollArea className="w-full ">
      {/* ── Group quick-selectors ─────────────────────────────── */}
      {(
        [
          {
            key: ScheduleDay.DAILY,
            label: 'Everyday',
            days: ALL_DAYS,
            checked: allOn,
          },
          {
            key: ScheduleDay.WEEKDAY,
            label: 'Weekdays',
            days: WEEKDAYS,
            checked: weekdaysOn,
          },
          {
            key: ScheduleDay.WEEKEND,
            label: 'Weekend',
            days: WEEKEND_DAYS,
            checked: weekendOn,
          },
        ] as const
      ).map(({ key, label, days, checked }) => (
        <div
          key={key}
          className="flex items-center border-b gap-3 py-3 px-1"
        >
          <Switch
            checked={checked}
            onCheckedChange={(value) => {
              // Fan-out to individual days
              (days as readonly (Weekday | ScheduleDay)[]).forEach((day) =>
                setDayWork(form, day, value),
              );
              // Re-sync the other group keys
              syncGroupKeys();
              // Set this group key itself
              form.setValue(
                `onlineHours.${key}.work` as never,
                value as never,
              );
            }}
          />
          <span
            className={cn(
              'font-semibold capitalize leading-7 min-w-20',
              checked && 'mr-auto',
            )}
          >
            {label}
          </span>
          {!checked && (
            <span className="text-sm text-accent-foreground">
              Not working on {label.toLowerCase()}
            </span>
          )}
        </div>
      ))}

      {/* ── Individual day rows ───────────────────────────────── */}
      {ALL_DAYS.map((day, index) => (
        <Form.Field
          name={`onlineHours.${day}.work`}
          key={index}
          render={({ field }) => (
            <Form.Item className="flex items-center border-b gap-3 py-3 px-1 space-y-0">
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      form.setValue(
                        `onlineHours.${day}.from`,
                        DEFAULT_FROM as never,
                      );
                      form.setValue(
                        `onlineHours.${day}.to`,
                        DEFAULT_TO as never,
                      );
                    }
                    // Sync group keys after updating this day
                    syncGroupKeys(day, checked);
                  }}
                />
              </Form.Control>
              <Form.Label
                className={cn(
                  'font-semibold capitalize leading-7 min-w-20',
                  !!field.value && 'mr-auto',
                )}
                variant="peer"
              >
                {day}
              </Form.Label>

              {field.value ? (
                <div className="inline-flex gap-3 items-center text-accent-foreground text-sm">
                  <Form.Field
                    name={`onlineHours.${day}.from`}
                    render={({ field }) => (
                      <Form.Item>
                        <TimeField
                          value={field.value ? safeParseTime(field.value) : null}
                          onChange={(value) => {
                            field.onChange(value?.toString());
                          }}
                          aria-label={day + ' from'}
                        >
                          <Form.Control>
                            <DateInput />
                          </Form.Control>
                        </TimeField>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <span>to</span>
                  <Form.Field
                    name={`onlineHours.${day}.to`}
                    render={({ field }) => (
                      <Form.Item>
                        <TimeField
                          value={field.value ? safeParseTime(field.value) : null}
                          onChange={(value) => {
                            field.onChange(value?.toString());
                          }}
                          aria-label={day + ' to'}
                        >
                          <Form.Control>
                            <DateInput />
                          </Form.Control>
                        </TimeField>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              ) : (
                <Form.Label variant="peer" className="text-accent-foreground">
                  Not working on this day
                </Form.Label>
              )}
            </Form.Item>
          )}
        />
      ))}
      <ScrollArea.Bar orientation="horizontal" />
    </ScrollArea>
  );
};
