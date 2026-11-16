import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCheck } from '@tabler/icons-react';
import { Button, Combobox, Popover } from 'erxes-ui';
import { SelectBranches, SelectDepartments } from 'ui-modules';

export const FixedAssetChooserLocationFilter = ({
  kind,
  value,
  onValueChange,
}: {
  kind: 'branch' | 'department';
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const SelectLocation = kind === 'branch' ? SelectBranches : SelectDepartments;
  const emptyLabel = t(
    kind === 'branch'
      ? 'fxa-chooser-unassigned-branch'
      : 'fxa-chooser-unassigned-department',
  );
  const handleChange = (nextValue?: string | string[]) => {
    onValueChange(
      Array.isArray(nextValue) ? nextValue[0] || '' : nextValue || '',
    );
    setOpen(false);
  };
  return (
    <SelectLocation
      mode="single"
      value={value === '_' ? undefined : value}
      onValueChange={handleChange}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className="w-full shadow-xs" aria-label={t(kind)}>
          {value === '_' ? (
            emptyLabel
          ) : (
            <SelectLocation.Value placeholder={t(kind)} />
          )}
        </Combobox.Trigger>
        <Combobox.Content>
          <div className="border-b p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between"
              aria-pressed={value === '_'}
              onClick={() => handleChange(value === '_' ? '' : '_')}
            >
              {emptyLabel}
              {value === '_' && <IconCheck className="size-4" />}
            </Button>
          </div>
          <SelectLocation.Command disableCreateOption />
        </Combobox.Content>
      </Popover>
    </SelectLocation>
  );
};
