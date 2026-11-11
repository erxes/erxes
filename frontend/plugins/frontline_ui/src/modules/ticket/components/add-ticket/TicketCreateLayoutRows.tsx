import { TicketCreateSystemField } from '@/ticket/components/add-ticket/TicketCreateSystemField';
import { TTicketLayoutCell } from '@/ticket/hooks/useTicketCreateLayout';
import { TAddTicket } from '@/ticket/types';
import { cn } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { PropertyFormField } from 'ui-modules';

export const TicketCreateLayoutRows = ({
  rows,
  form,
  propertiesData,
  missingIds,
  onPropertyChange,
}: {
  rows: TTicketLayoutCell[][];
  form: UseFormReturn<TAddTicket>;
  propertiesData: Record<string, unknown>;
  missingIds: string[];
  onPropertyChange: (fieldId: string, value: unknown) => void;
}) => (
  <div className="flex flex-col gap-2">
    {rows.map((row) => (
      <div
        key={row.map((cell) => cell.id).join('|')}
        className="flex w-full min-w-0 flex-col gap-1"
      >
        {row.map((cell) =>
          cell.kind === 'system' ? (
            <TicketCreateSystemField
              key={cell.id}
              code={cell.code}
              form={form}
              missing={missingIds.includes(cell.id)}
            />
          ) : (
            <div
              key={cell.id}
              className={cn(
                'w-full min-w-0 rounded-md',
                missingIds.includes(cell.id) && 'ring-1 ring-destructive',
              )}
            >
              <PropertyFormField
                field={cell.field}
                value={propertiesData[cell.field._id]}
                idPrefix="ticket_create"
                onFieldChange={onPropertyChange}
              />
            </div>
          ),
        )}
      </div>
    ))}
  </div>
);
