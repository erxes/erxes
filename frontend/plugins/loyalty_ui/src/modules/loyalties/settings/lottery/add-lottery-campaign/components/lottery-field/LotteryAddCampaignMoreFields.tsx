import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Popover, Combobox } from 'erxes-ui';
import { LotteryFormValues } from '../../../constants/lotteryFormSchema';
import {
  DateSelectTask,
  DateSelectProvider,
  DateSelectVariant,
} from '../selects/SelectLotteryDate';
import { format } from 'date-fns';
import { IconCalendarPlus, IconCalendarTime } from '@tabler/icons-react';

interface LotteryAddCampaignMoreFieldsProps {
  form: UseFormReturn<LotteryFormValues>;
}

/**
 * Prevents "Invalid Date" from being created
 */
const getSafeDate = (value?: Date | string | null): Date | undefined => {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const DateSelectFormField = ({
  value,
  onValueChange,
  placeholder,
}: {
  value?: Date | string;
  onValueChange?: (value?: Date) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = React.useState(false);

  const dateValue = getSafeDate(value);

  const handleValueChange = (date?: Date) => {
    onValueChange?.(date);
    setOpen(false);
  };

  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={handleValueChange}
      variant={DateSelectVariant.FORM}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Popover.Trigger asChild>
            <Combobox.TriggerBase className="w-full h-8">
              {dateValue ? (
                <>
                  <IconCalendarTime className="size-4 text-muted-foreground" />
                  {format(
                    dateValue,
                    dateValue.getFullYear() === new Date().getFullYear()
                      ? 'MMM d'
                      : 'MMM d, yyyy',
                  )}
                </>
              ) : (
                <>
                  <IconCalendarPlus className="text-accent-foreground" />
                  <span className="text-accent-foreground font-medium">
                    {placeholder || 'Select date...'}
                  </span>
                </>
              )}
            </Combobox.TriggerBase>
          </Popover.Trigger>
        </Form.Control>

        <Popover.Content className="w-auto p-0">
          <DateSelectTask.Content />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
};

export const LotteryAddCampaignMoreFields: React.FC<
  LotteryAddCampaignMoreFieldsProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* START DATE */}
      <Form.Field
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Start Date</Form.Label>
            <DateSelectFormField
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select start date"
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      {/* END DATE */}
      <Form.Field
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>End Date</Form.Label>
            <DateSelectFormField
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select end date"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
