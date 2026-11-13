import { Button, Checkbox, Form, Sheet, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IPricingActiveWindow,
  PricingScheduleWindowType,
} from '@/pricing/types';
import { PricingTimeSelect } from '@/pricing/components/PricingTimeSelect';
import {
  MONTH_DAYS,
  SCHEDULE_WEEK,
  SCHEDULE_WINDOW_TYPES,
  WEEKDAY_KEYS,
  WEEKDAY_PRESETS,
  formatMonthDay,
} from '@/pricing/utils/schedule';
import { useScheduleWindowForm } from '@/pricing/hooks/useScheduleWindowForm';
import { ScheduleMonthDayPicker } from './ScheduleMonthDayPicker';

// The toggle's own pressed style barely shows in the dark theme.
const PRESSED =
  'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground';

interface ScheduleWindowSheetProps {
  open: boolean;
  window: IPricingActiveWindow | null;
  onOpenChange: (open: boolean) => void;
  onSave: (window: IPricingActiveWindow) => void;
}

export const ScheduleWindowSheet = ({
  open,
  window,
  onOpenChange,
  onSave,
}: ScheduleWindowSheetProps) => {
  const { t } = useTranslation('loyalty');
  const {
    form,
    type,
    allDay,
    startTime,
    endTime,
    fromMonthDay,
    toMonthDay,
    overnight,
    submit,
  } = useScheduleWindowForm({ open, window, onSave });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="flex-col h-full p-0 sm:max-w-xl">
        <Sheet.Header>
          <Sheet.Title>
            {window ? t('schedule-edit-window') : t('schedule-add-window')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();
              submit(event);
            }}
            className="flex flex-col flex-1 min-h-0"
            noValidate
          >
            <Sheet.Content className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto rounded-none">
              <Form.Field
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('schedule-repeat')}</Form.Label>
                    <Form.Control>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        className="grid grid-cols-4"
                        value={field.value}
                        onValueChange={(value) =>
                          value &&
                          field.onChange(value as PricingScheduleWindowType)
                        }
                      >
                        {SCHEDULE_WINDOW_TYPES.map((item) => (
                          <ToggleGroup.Item
                            key={item}
                            value={item}
                            className={PRESSED}
                          >
                            {t(`schedule-type-${item}`)}
                          </ToggleGroup.Item>
                        ))}
                      </ToggleGroup>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {type === 'weekly' && (
                <Form.Field
                  control={form.control}
                  name="weekDays"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('schedule-week-days')}</Form.Label>
                      <Form.Control>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="justify-start"
                          value={field.value.map(String)}
                          onValueChange={(values) =>
                            field.onChange(values.map(Number))
                          }
                        >
                          {SCHEDULE_WEEK.map((day) => (
                            <ToggleGroup.Item
                              key={day}
                              value={String(day)}
                              className={`w-10 ${PRESSED}`}
                            >
                              {t(`weekday-short-${WEEKDAY_KEYS[day]}`)}
                            </ToggleGroup.Item>
                          ))}
                        </ToggleGroup>
                      </Form.Control>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(WEEKDAY_PRESETS).map(([key, days]) => (
                          <Button
                            key={key}
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => field.onChange(days)}
                          >
                            {t(`schedule-preset-${key}`)}
                          </Button>
                        ))}
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {type === 'monthly' && (
                <Form.Field
                  control={form.control}
                  name="monthDays"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('schedule-month-days')}</Form.Label>
                      <Form.Control>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="grid justify-start grid-cols-7 gap-1"
                          value={field.value.map(String)}
                          onValueChange={(values) =>
                            field.onChange(values.map(Number))
                          }
                        >
                          {MONTH_DAYS.map((day) => (
                            <ToggleGroup.Item
                              key={day}
                              value={String(day)}
                              className={`h-8 ${PRESSED}`}
                            >
                              {day}
                            </ToggleGroup.Item>
                          ))}
                        </ToggleGroup>
                      </Form.Control>
                      <Form.Description>
                        {t('schedule-month-days-hint')}
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {type === 'yearly' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name="fromMonthDay"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('schedule-year-from')}</Form.Label>
                          <ScheduleMonthDayPicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="toMonthDay"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('schedule-year-to')}</Form.Label>
                          <ScheduleMonthDayPicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {fromMonthDay > toMonthDay
                      ? t('schedule-year-wraps', {
                          from: formatMonthDay(fromMonthDay),
                          to: formatMonthDay(toMonthDay),
                        })
                      : t('schedule-year-range', {
                          from: formatMonthDay(fromMonthDay),
                          to: formatMonthDay(toMonthDay),
                        })}
                  </p>
                </div>
              )}

              <Form.Field
                control={form.control}
                name="allDay"
                render={({ field }) => (
                  <Form.Item className="flex items-center gap-2 space-y-0">
                    <Form.Control>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </Form.Control>
                    <Form.Label variant="peer">
                      {t('schedule-all-day')}
                    </Form.Label>
                  </Form.Item>
                )}
              />

              {!allDay && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('start-time')}</Form.Label>
                          <Form.Control>
                            <PricingTimeSelect
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value || '')
                              }
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('end-time')}</Form.Label>
                          <Form.Control>
                            <PricingTimeSelect
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value || '')
                              }
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                  {overnight && (
                    <p className="px-3 py-2 text-sm rounded-md bg-info/10 text-info">
                      {t('schedule-runs-overnight', {
                        start: startTime,
                        end: endTime,
                      })}
                    </p>
                  )}
                </div>
              )}
            </Sheet.Content>

            <Sheet.Footer className="flex justify-end gap-2 p-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit">{t('save')}</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
