import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { IStructureEntityTypeDetail } from '../../types/structureEntity';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';

export const StructureDraftTypePicker = ({
  types,
  value,
  disabled,
  onChange,
  onNewType,
}: {
  types: IStructureEntityTypeDetail[];
  value?: string;
  disabled?: boolean;
  onChange: (typeId: string) => void;
  onNewType: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canManageTypes } = useStructureWorkspace();
  const [open, setOpen] = useState(false);
  const selected = types.find(({ _id }) => _id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          className="h-7 max-w-24 shrink-0 gap-1 rounded-full px-2 text-xs"
          aria-label={t('type')}
          title={selected?.name ?? t('select-type')}
        >
          <StructureEntityTypeIcon
            icon={selected?.icon}
            className="size-3.5 shrink-0"
          />
          <span className="truncate">{selected?.name ?? t('select-type')}</span>
          <IconChevronDown className="size-3 shrink-0 opacity-60" />
        </Button>
      </Popover.Trigger>
      <Combobox.Content
        className="min-w-60"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Command>
          <Command.Input placeholder={t('search-types')} />
          <Command.List>
            {types.length === 0 && (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                {t('no-allowed-types')}
              </p>
            )}
            {types.map((type) => (
              <Command.Item
                key={type._id}
                value={`${type.name} ${type._id}`}
                onSelect={() => {
                  onChange(type._id);
                  setOpen(false);
                }}
              >
                <StructureEntityTypeIcon
                  icon={type.icon}
                  className="text-muted-foreground"
                />
                {type.name}
                <Combobox.Check checked={type._id === value} />
              </Command.Item>
            ))}
            {canManageTypes && (
              <Command.Item
                value="new-type"
                onSelect={() => {
                  setOpen(false);
                  onNewType();
                }}
              >
                <IconPlus />
                {t('new-type')}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
