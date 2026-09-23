import { IconQuestionMark } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICONS } from '@/knowledgebase/constants';

export const IconPicker = ({
  value,
  onChange,
  variant = 'form',
  scope,
}: {
  value?: string;
  onChange: (icon: string) => void;
  variant?: 'form' | 'table';
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const selected = ICONS.find((item) => item.value === value);

  const label = (
    <>
      {selected && (
        <span className="flex gap-2 items-center">
          <selected.icon className="size-4" />
          <span className="capitalize">{selected.label}</span>
        </span>
      )}
      {!selected && value && (
        <span className="flex gap-2 items-center">
          <IconQuestionMark className="size-4 text-muted-foreground" />
          <span className="capitalize">{value.replace(/-/g, ' ')}</span>
        </span>
      )}
      {!selected && !value && (
        <span className="text-muted-foreground">
          {t('kb-select-icon', 'Select icon...')}
        </span>
      )}
    </>
  );

  const list = (
    <Command>
      <Command.Input placeholder={t('kb-search-icons', 'Search icons...')} />
      <Command.List className="max-h-64">
        <Combobox.Empty />
        {ICONS.map((item) => (
          <Command.Item
            key={item.value}
            value={item.label}
            onSelect={() => {
              onChange(item.value);
              setOpen(false);
            }}
          >
            <item.icon className="size-4" />
            <span className="capitalize">{item.label}</span>
            <Combobox.Check checked={value === item.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      {variant === 'table' ? (
        <RecordTableInlineCell.Trigger>{label}</RecordTableInlineCell.Trigger>
      ) : (
        <Combobox.Trigger className="w-full h-8 font-medium">
          {label}
        </Combobox.Trigger>
      )}
      <Combobox.Content>{list}</Combobox.Content>
    </PopoverScoped>
  );
};
