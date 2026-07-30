import { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Select, Sheet } from 'erxes-ui';
import { type Control, useForm } from 'react-hook-form';
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

interface RepeatFieldProps {
  control: Control<RepeatRuleConfig>;
  label: string;
  requiredMessage: string;
}

interface RepeatDateFieldProps extends RepeatFieldProps {
  name: 'startDate' | 'endDate';
  placeholder: string;
  validate?: (value?: string | null) => boolean | string;
}

const RepeatDateField = ({
  control,
  name,
  label,
  placeholder,
  requiredMessage,
  validate,
}: RepeatDateFieldProps) => (
  <Form.Field
    control={control}
    name={name}
    rules={{
      required: requiredMessage,
      ...(validate ? { validate } : {}),
    }}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <DatePicker
            value={parseDateValue(field.value)}
            placeholder={placeholder}
            onChange={(value) =>
              field.onChange(
                formatDateValue(value instanceof Date ? value : undefined),
              )
            }
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

interface RepeatTimeFieldProps extends RepeatFieldProps {
  name: 'startTime' | 'endTime';
}

const RepeatTimeField = ({
  control,
  name,
  label,
  requiredMessage,
}: RepeatTimeFieldProps) => (
  <Form.Field
    control={control}
    name={name}
    rules={{ required: requiredMessage }}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <PricingTimeSelect
            value={field.value || null}
            onValueChange={(value) => field.onChange(value ?? null)}
            aria-label={label}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

interface RepeatSelectFieldProps extends RepeatFieldProps {
  name: 'weekDay' | 'monthDay';
  placeholder: string;
  options: { value: string; label: string }[];
  translate: (key: string) => string;
}

const RepeatSelectField = ({
  control,
  name,
  label,
  placeholder,
  requiredMessage,
  options,
  translate,
}: RepeatSelectFieldProps) => (
  <Form.Field
    control={control}
    name={name}
    rules={{ required: requiredMessage }}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Select value={field.value || ''} onValueChange={field.onChange}>
            <Select.Trigger className="w-full">
              <Select.Value placeholder={placeholder} />
            </Select.Trigger>
            <Select.Content>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {translate(option.label)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

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

  useEffect(() => {
    form.clearErrors([
      'startDate',
      'endDate',
      'startTime',
      'endTime',
      'weekDay',
      'monthDay',
    ]);
  }, [ruleType, form]);

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
      <Sheet.Trigger asChild>
        <Button type="button" variant="outline" disabled={isEditing}>
          <IconPlus size={16} className="mr-2" /> {t('add-rule')}
        </Button>
      </Sheet.Trigger>

      <Sheet.View className="inset-y-0 right-0 h-dvh rounded-none border-l p-0 sm:max-w-lg">
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
                    <RepeatDateField
                      control={form.control}
                      name="startDate"
                      label={t('start-date')}
                      placeholder={t('select-start-date')}
                      requiredMessage={t('fill-required-fields')}
                    />

                    <RepeatDateField
                      control={form.control}
                      name="endDate"
                      label={t('end-date')}
                      placeholder={t('select-end-date')}
                      requiredMessage={t('fill-required-fields')}
                      validate={(value) => {
                        const startDate = form.getValues('startDate');

                        return (
                          !value ||
                          !startDate ||
                          value > startDate ||
                          t('end-date-after-start')
                        );
                      }}
                    />
                  </div>
                )}

                {ruleType === 'everyDay' && (
                  <div className="grid grid-cols-2 gap-4">
                    <RepeatTimeField
                      control={form.control}
                      name="startTime"
                      label={t('start-time')}
                      requiredMessage={t('fill-required-fields')}
                    />

                    <RepeatTimeField
                      control={form.control}
                      name="endTime"
                      label={t('end-time')}
                      requiredMessage={t('fill-required-fields')}
                    />
                  </div>
                )}

                {ruleType === 'everyWeek' && (
                  <RepeatSelectField
                    control={form.control}
                    name="weekDay"
                    label={t('rule-value')}
                    placeholder={t('select-a-weekday')}
                    requiredMessage={t('fill-required-fields')}
                    options={WEEK_DAYS}
                    translate={t}
                  />
                )}

                {ruleType === 'everyMonth' && (
                  <RepeatSelectField
                    control={form.control}
                    name="monthDay"
                    label={t('rule-value')}
                    placeholder={t('select-a-day')}
                    requiredMessage={t('fill-required-fields')}
                    options={MONTH_DAYS}
                    translate={t}
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
