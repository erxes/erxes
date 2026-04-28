import { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Select, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { PricingTimeSelect } from '@/pricing/components/PricingTimeSelect';

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

const WEEK_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const MONTH_DAYS = [
  { value: 'lastDay', label: 'Last day of month' },
  ...Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString();
    return { value: day, label: day };
  }),
];

const formatDateValue = (value?: Date) => {
  if (!value) {
    return null;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateValue = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
};

export const RepeatRuleSheet: React.FC<RepeatRuleSheetProps> = ({
  onRuleAdded,
  onRuleUpdated,
  editingRule,
  onEditComplete,
}) => {
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
    const payload: RepeatRuleConfig = {
      _id: editingRule?._id,
      ...values,
    };

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
            <IconPlus size={16} className="mr-2" /> Add rule
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="flex-col h-full p-0 sm:max-w-xl">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? 'Edit repeat rule' : 'Add repeat rule'}
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
                      <Form.Label>Rule type</Form.Label>
                      <Form.Control>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger className="w-full">
                            <Select.Value placeholder="Choose rule type" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="everyDay">
                              Every Day
                            </Select.Item>
                            <Select.Item value="everyWeek">
                              Every Week
                            </Select.Item>
                            <Select.Item value="everyMonth">
                              Every Month
                            </Select.Item>
                            <Select.Item value="everyYear">
                              Every Year
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
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control>
                            <DatePicker
                              value={parseDateValue(field.value)}
                              placeholder="Select start date"
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
                          <Form.Label>End Date</Form.Label>
                          <Form.Control>
                            <DatePicker
                              value={parseDateValue(field.value)}
                              placeholder="Select end date"
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
                          <Form.Label>Start Time</Form.Label>
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
                          <Form.Label>End Time</Form.Label>
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
                        <Form.Label>Rule value</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder="Select a weekday" />
                            </Select.Trigger>
                            <Select.Content>
                              {WEEK_DAYS.map((day) => (
                                <Select.Item key={day.value} value={day.value}>
                                  {day.label}
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
                        <Form.Label>Rule value</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder="Select a day" />
                            </Select.Trigger>
                            <Select.Content>
                              {MONTH_DAYS.map((day) => (
                                <Select.Item key={day.value} value={day.value}>
                                  {day.label}
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
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
