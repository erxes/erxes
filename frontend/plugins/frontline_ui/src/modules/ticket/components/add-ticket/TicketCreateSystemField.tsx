import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStructureTicket } from '@/ticket/components/ticket-selects/SelectStructureTicket';
import { SelectTagsTicket } from '@/ticket/components/ticket-selects/SelectTagsTicket';
import {
  TICKET_LAYOUT_SYSTEM_LABELS,
  TTicketLayoutSystemCode,
} from '@/ticket/constants/createLayout';
import { TAddTicket } from '@/ticket/types';
import { Form, cn } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// One placeable system field of the create form, as the chip it always was.
export const TicketCreateSystemField = ({
  code,
  form,
  missing,
}: {
  code: TTicketLayoutSystemCode;
  form: UseFormReturn<TAddTicket>;
  missing?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const label = t(
    TICKET_LAYOUT_SYSTEM_LABELS[code].key,
    TICKET_LAYOUT_SYSTEM_LABELS[code].fallback,
  );

  return (
    <Form.Field
      name={code}
      control={form.control}
      render={({ field }) => (
        <Form.Item
          className={cn(missing && 'rounded-md ring-1 ring-destructive')}
        >
          <Form.Label className="sr-only">{label}</Form.Label>
          {code === 'priority' && (
            <SelectPriorityTicket.FormItem
              label={label}
              value={(field.value as number) || 0}
              onValueChange={(value) => field.onChange(value)}
            />
          )}
          {code === 'assigneeId' && (
            <SelectAssigneeTicket.FormItem
              label={label}
              value={(field.value as string) || ''}
              onValueChange={(value: string) => field.onChange(value)}
            />
          )}
          {code === 'entityIds' && (
            <SelectStructureTicket.FormItem
              label={label}
              value={field.value as string[] | undefined}
              onValueChange={(value) => field.onChange(value)}
            />
          )}
          {(code === 'startDate' || code === 'targetDate') && (
            <SelectDateTicket.FormItem
              label={label}
              value={field.value as Date | undefined}
              onValueChange={(value) => field.onChange(value)}
            />
          )}
          {code === 'tagIds' && (
            <SelectTagsTicket.FormItem
              label={label}
              value={(field.value as string[]) || []}
              onValueChange={(value) => field.onChange(value)}
            />
          )}
        </Form.Item>
      )}
    />
  );
};
