import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { PopoverScoped } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectStructureEntities } from 'ui-modules';

const toEntityIds = (value?: string[] | string) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const SelectStructureTicketRoot = ({
  variant = 'detail',
  disabled,
  label,
  scope,
  value,
  onValueChange,
  id,
}: {
  variant?: `${SelectTriggerVariant}`;
  disabled?: boolean;
  label?: string;
  scope?: string;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  id?: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const { t: tStructure } = useTranslation('common', {
    keyPrefix: 'structure-entities',
  });
  const { updateTicket } = useUpdateTicket();

  const handleValueChange = (entityIds: string[]) => {
    if (id) {
      updateTicket({ variables: { _id: id, entityIds } });
    }
    onValueChange?.(entityIds);
  };

  return (
    <SelectStructureEntities.Provider
      mode="multiple"
      value={value || []}
      onValueChange={(entityIds) => handleValueChange(toEntityIds(entityIds))}
    >
      <PopoverScoped scope={scope}>
        <SelectTriggerTicket
          variant={variant}
          disabled={disabled}
          label={label}
        >
          <SelectStructureEntities.Value
            placeholder={label ? t('none') : tStructure('structure')}
          />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectStructureEntities.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStructureEntities.Provider>
  );
};

const SelectStructureTicketFormItem = ({
  value,
  onValueChange,
  label,
}: {
  value?: string[];
  onValueChange: (value: string[]) => void;
  label?: string;
}) => (
  <SelectStructureTicketRoot
    value={value}
    variant="form"
    label={label}
    onValueChange={onValueChange}
  />
);

export const SelectStructureTicket = Object.assign(SelectStructureTicketRoot, {
  FormItem: SelectStructureTicketFormItem,
});
