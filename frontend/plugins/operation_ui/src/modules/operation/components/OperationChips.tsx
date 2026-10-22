import { useState } from 'react';
import { Combobox, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember, TagsSelect } from 'ui-modules';

export const OperationMembersChip = ({
  value,
  onValueChange,
  label,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  label: string;
}) => {
  const { t } = useTranslation('operation');
  const [open, setOpen] = useState(false);

  return (
    <SelectMember.Provider
      mode="multiple"
      value={value}
      onValueChange={(next) => onValueChange(Array.isArray(next) ? next : [])}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.ChipTrigger label={label}>
          <SelectMember.Value placeholder={t('not-specified')} />
        </Combobox.ChipTrigger>
        <Combobox.Content>
          <SelectMember.Content />
        </Combobox.Content>
      </Popover>
    </SelectMember.Provider>
  );
};

export const OperationTagsChip = ({
  type,
  value,
  label,
  targetIds,
  onValueChange,
}: {
  type: 'operation:task' | 'operation:project';
  value: string[];
  label: string;
  targetIds?: string[];
  onValueChange?: (value: string[]) => void;
}) => {
  const { t } = useTranslation('operation');

  return (
    <TagsSelect.Provider
      mode="multiple"
      type={type}
      value={value}
      targetIds={targetIds}
      onValueChange={onValueChange}
    >
      <Combobox.ChipTrigger label={label}>
        <TagsSelect.Value placeholder={t('not-specified')} showValue />
      </Combobox.ChipTrigger>
      <Combobox.Content>
        <TagsSelect.Content />
      </Combobox.Content>
    </TagsSelect.Provider>
  );
};
