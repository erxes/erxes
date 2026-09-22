import { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Select, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { PricingTimeSelect } from '@/pricing/components/PricingTimeSelect';
import { formatDateValue, parseDateValue } from '@/pricing/utils/date';

export type RepeatRuleType =
  | 'everyYear'
  | 'everyMonth'
  | 'everyWeek'
  | 'everyDay';

export interface RepeatRuleConfig {
  _id?: string;
  ruleType: RepeatRuleType;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  weekDay?: string | null;
  monthDay?: string | null;
}

interface RepeatRuleSheetProps {
  onRuleAdded?: (config: RepeatRuleConfig) => void;
  onRuleUpdated?: (config: RepeatRuleConfig) => void;
  editingRule?: RepeatRuleConfig | null;
  onEditComplete?: () => void;
}

const getRulePayload = (
  values: RepeatRuleConfig,
  id?: string,
): RepeatRuleConfig => {
  const basePayload: RepeatRuleConfig = {
    _id: id,
    ruleType: values.ruleType,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    weekDay: null,
    monthDay: null,
  };

  if (values.ruleType === 'everyYear') {
    return {
      ...basePayload,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    };
  }

  if (values.ruleType === 'everyDay') {
    return {
      ...basePayload,
      startTime: values.startTime || null,
      endTime: values.endTime || null,
    };
  }

  if (values.ruleType === 'everyWeek') {
    return {
      ...basePayload,
      weekDay: values.weekDay || null,
    };
  }

  return {
    ...basePayload,
    monthDay: values.monthDay || null,
  };
};

const WEEK_DAYS = [
  { value: 'monday', label: 'monday' },
  { value: 'tuesday', label: 'tuesday' },
  { value: 'wednesday', label: 'wednesday' },
  { value: 'thursday', label: 'thursday' },
  { value: 'friday', label: 'friday' },
  { value: 'saturday', label: 'saturday' },
  { value: 'sunday', label: 'sunday' },
];

const MONTH_DAYS = [
  { value: 'lastDay', label: 'last-day-of-month' },
  ...Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString();
    return { value: day, label: day };
  }),
];

export const RepeatRuleSheet: React.FC<RepeatRuleSheetProps> = ({
  onRuleAdded,
  onRuleUpdated,
  editingRule,
  onEditComplete,
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);

  const form = useForm<RepeatRuleConfig>({
    defaultValues: {
      ruleType: 'everyDay',
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      weekDay: null,
      monthDay: null,
    },
  });

  const isEditing = !!editingRule;

  const ruleType = form.watch('ruleType');

  useEffect(() => {
    if (editingRule) {
      setOpen(true);
      form.reset(editingRule);
    }
  }, [editingRule, form]);

  const handleClose = () => {
    form.reset();
    setOpen(false);
    if (editingRule) {
      onEditComplete?.();
    }
  };

  const handleSubmit = (values: RepeatRuleConfig) => {
    const payload = getRulePayload(values, editingRule?._id);

    if (editingRule) {
      onRuleUpdated?.(payload);
    } else {
      onRuleAdded?.(payload);
    }

    handleClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) {
          if (editingRule) {
            form.reset(editingRule);
          }
          setOpen(true);
        } else {
          handleClose();
        }
      }}
    >
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button type="button" variant="outline">
            <IconPlus size={16} className="mr-2" /> {t('add-rule')}
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="flex-col h-full p-0 sm:max-w-xl">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? t('edit-repeat-rule') : t('add-repeat-rule')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();
              form.handleSubmit(handleSubmit)(event);
            }}
            className="flex flex-col flex-1 min-h-0"
            noValidate
          >
            <Sheet.Content className="flex-1 min-h-0 p-6 overflow-y-auto rounded-none">
              <div className="space-y-4">
                <Form.Field
                  control={form.control}
                  name="ruleType"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('rule-type')}</Form.Label>
                      <Form.Control>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger className="w-full">
                            <Select.Value placeholder={t('choose-rule-type')} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="everyDay">
                              {t('every-day')}
                            </Select.Item>
                            <Select.Item value="everyWeek">
                              {t('every-week')}
                            </Select.Item>
                            <Select.Item value="everyMonth">
                              {t('every-month')}
                            </Select.Item>
                            <Select.Item value="everyYear">
                              {t('every-year')}
                            </Select.Item>
                          </Select.Content>
                        </Select>
                      </Form.Control>
                    </Form.Item>
                  )}
                />

                {/* Rule value section depends on ruleType */}
                {ruleType === 'everyYear' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('start-date')}</Form.Label>
                          <Form.Control>
                            <DatePicker
                              value={parseDateValue(field.value)}
                              placeholder={t('select-start-date')}
                              onChange={(value) =>
                                field.onChange(
                                  formatDateValue(
                                    value instanceof Date ? value : undefined,
                                  ),
                                )
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('end-date')}</Form.Label>
                          <Form.Control>
                            <DatePicker
                              value={parseDateValue(field.value)}
                              placeholder={t('select-end-date')}
                              onChange={(value) =>
                                field.onChange(
                                  formatDateValue(
                                    value instanceof Date ? value : undefined,
                                  ),
                                )
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}

                {ruleType === 'everyDay' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('start-time')}</Form.Label>
                          <Form.Control>
                            <PricingTimeSelect
                              value={field.value || null}
                              onValueChange={(value) =>
                                field.onChange(value ?? null)
                              }
                            />
                          </Form.Control>
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
                              value={field.value || null}
                              onValueChange={(value) =>
                                field.onChange(value ?? null)
                              }
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                )}

                {ruleType === 'everyWeek' && (
                  <Form.Field
                    control={form.control}
                    name="weekDay"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('rule-value')}</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder={t('select-a-weekday')} />
                            </Select.Trigger>
                            <Select.Content>
                              {WEEK_DAYS.map((day) => (
                                <Select.Item key={day.value} value={day.value}>
                                  {t(day.label)}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}

                {ruleType === 'everyMonth' && (
                  <Form.Field
                    control={form.control}
                    name="monthDay"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('rule-value')}</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder={t('select-a-day')} />
                            </Select.Trigger>
                            <Select.Content>
                              {MONTH_DAYS.map((day) => (
                                <Select.Item key={day.value} value={day.value}>
                                  {t(day.label)}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}
              </div>
            </Sheet.Content>

            <Sheet.Footer className="px-6 py-4 bg-background">
              <Button type="button" variant="outline" onClick={handleClose}>
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
