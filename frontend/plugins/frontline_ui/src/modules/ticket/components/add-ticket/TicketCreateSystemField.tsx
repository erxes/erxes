import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectBranchTicket } from '@/ticket/components/ticket-selects/SelectBranchTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectDepartmentTicket } from '@/ticket/components/ticket-selects/SelectDepartmentTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectTagsTicket } from '@/ticket/components/ticket-selects/SelectTagsTicket';
import {
  TICKET_LAYOUT_SYSTEM_LABELS,
  TTicketLayoutSystemCode,
} from '@/ticket/constants/createLayout';
import { TAddTicket } from '@/ticket/types';
import { Form, cn } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PanelFormRow } from 'ui-modules';

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
          <PanelFormRow
            label={
              <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
                {label}
              </Form.Label>
            }
          >
            {code === 'priority' && (
              <SelectPriorityTicket.FormItem
                variant="table"
                value={typeof field.value === 'number' ? field.value : 0}
                onValueChange={(value) => field.onChange(value)}
              />
            )}
            {code === 'assigneeId' && (
              <SelectAssigneeTicket.FormItem
                variant="table"
                value={typeof field.value === 'string' ? field.value : ''}
                onValueChange={(value: string) => field.onChange(value)}
              />
            )}
            {code === 'branchId' && (
              <SelectBranchTicket.FormItem
                variant="table"
                value={typeof field.value === 'string' ? field.value : ''}
                onValueChange={(value) => field.onChange(value || undefined)}
              />
            )}
            {code === 'departmentId' && (
              <SelectDepartmentTicket.FormItem
                variant="table"
                value={typeof field.value === 'string' ? field.value : ''}
                onValueChange={(value) => field.onChange(value || undefined)}
              />
            )}
            {(code === 'startDate' || code === 'targetDate') && (
              <SelectDateTicket.FormItem
                value={field.value instanceof Date ? field.value : undefined}
                onValueChange={(value) => field.onChange(value)}
              />
            )}
            {code === 'tagIds' && (
              <SelectTagsTicket.FormItem
                variant="table"
                value={Array.isArray(field.value) ? field.value : []}
                onValueChange={(value) => field.onChange(value)}
              />
            )}
          </PanelFormRow>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
