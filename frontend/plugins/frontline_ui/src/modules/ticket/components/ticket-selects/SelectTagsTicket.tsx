import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { TagsSelect } from 'ui-modules';

const SelectTagsTicketRoot = ({
  value,
  id,
  variant,
  scope,
  disabled,
  onValueChange,
}: {
  value?: string[];
  id?: string;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  disabled?: boolean;
  onValueChange?: (value: string[]) => void;
}) => {
  const { updateTicket } = useUpdateTicket();

  const handleValueChange = (tagIds: string[]) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          tagIds,
        },
      });
    }
    onValueChange?.(tagIds);
  };

  return (
    <TagsSelect.Provider
      type="frontline:ticket"
      mode="multiple"
      value={value || []}
      onValueChange={handleValueChange}
      scope={scope}
    >
      <SelectTriggerTicket variant={variant} disabled={disabled}>
        <TagsSelect.Value showValue />
      </SelectTriggerTicket>
      <SelectTicketContent variant={variant}>
        <TagsSelect.Content />
      </SelectTicketContent>
    </TagsSelect.Provider>
  );
};

const SelectTagsTicketFormItem = ({
  value,
  onValueChange,
}: {
  value?: string[];
  onValueChange: (value: string[]) => void;
}) => (
  <SelectTagsTicketRoot
    value={value}
    variant="form"
    onValueChange={onValueChange}
  />
);

export const SelectTagsTicket = Object.assign(SelectTagsTicketRoot, {
  FormItem: SelectTagsTicketFormItem,
});
