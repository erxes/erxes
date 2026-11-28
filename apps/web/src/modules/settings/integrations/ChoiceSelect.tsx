import { Combobox, Command, Popover, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Choice = { value: string; label: string };

/** Matches every word typed anywhere in the choice ("хүнс", "5411"), not scattered letters. */
const matchWords = (value: string, search: string) =>
  search
    .toLocaleLowerCase()
    .split(/\s+/)
    .every((word) => value.toLocaleLowerCase().includes(word))
    ? 1
    : 0;

type Props = {
  id: string;
  choices: Choice[];
  value: string;
  disabled?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
};

/** A long list, searched by its words (QuickQR's business codes, cities, banks). */
const SearchableChoice = ({ id, choices, value, disabled, placeholder, onChange }: Props) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const [open, setOpen] = useState(false);
  const chosen = choices.find((choice) => choice.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger id={id} className="w-full" disabled={disabled}>
        <Combobox.Value value={chosen?.label ?? ''} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command filter={matchWords}>
          <Command.Input placeholder={t('search', 'Search')} variant="secondary" focusOnMount />
          <Command.List className="max-h-72 overflow-y-auto">
            <Command.Empty>{t('no-match', 'Nothing matches')}</Command.Empty>
            {choices.map((choice) => (
              <Command.Item
                key={choice.value}
                value={`${choice.value} ${choice.label}`}
                onSelect={() => {
                  onChange(choice.value);
                  setOpen(false);
                }}
              >
                <span className="truncate">{choice.label}</span>
                <Combobox.Check checked={choice.value === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

/** A setting picked from a list of choices (codes, connections, accounts); `searchable` for long ones. */
export const ChoiceSelect = ({ searchable, ...props }: Props & { searchable?: boolean }) => {
  const { id, choices, value, disabled, placeholder, onChange } = props;

  if (searchable) return <SearchableChoice {...props} />;

  return (
    <Select value={value || undefined} disabled={disabled} onValueChange={onChange}>
      <Select.Trigger id={id}>
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
      <Select.Content>
        {choices.map((choice) => (
          <Select.Item key={choice.value} value={choice.value}>
            {choice.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
