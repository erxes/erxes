import { Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** One API document the page can show, and the address that opens it. */
export interface ApiChoice {
  key: string;
  /** In the list, under its group's heading: "Customer API". */
  label: string;
  /** On the closed picker, where the heading isn't shown: "Ecommerce · Customer API". */
  title: string;
  to: string;
}

/** Core's documents, or one plugin's, under its name. */
export interface ApiGroup {
  heading: string;
  choices: ApiChoice[];
}

/**
 * Matches the words typed anywhere in "<group> <label>", so "ecom" finds Ecommerce's APIs and
 * "customer" every customer API. cmdk's default fuzzy match also takes scattered letters,
 * which made "ecom" find "Customer API".
 */
const matchWords = (value: string, search: string) =>
  search
    .toLowerCase()
    .split(/\s+/)
    .every((word) => value.toLowerCase().includes(word))
    ? 1
    : 0;

/**
 * Picks the API to show, searchable since an organisation may install many plugins:
 * core's first, then each plugin's documents under its name.
 */
export const ApiReferencePicker = ({
  value,
  groups,
  onChange,
}: {
  value: string;
  groups: ApiGroup[];
  onChange: (choice: ApiChoice) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });
  const [open, setOpen] = useState(false);

  const chosen = groups.flatMap((group) => group.choices).find((choice) => choice.key === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-64">
        <Combobox.Value value={chosen?.title ?? ''} placeholder={t('pick', 'Choose an API')} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command filter={matchWords}>
          <Command.Input
            placeholder={t('search', 'Search APIs')}
            variant="secondary"
            focusOnMount
          />
          <Command.List className="max-h-96 overflow-y-auto">
            <Command.Empty>{t('no-match', 'No API matches')}</Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group.heading} heading={group.heading}>
                {group.choices.map((choice) => (
                  <Command.Item
                    key={choice.key}
                    value={`${group.heading} ${choice.label}`}
                    onSelect={() => {
                      onChange(choice);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{choice.label}</span>
                    <Combobox.Check checked={choice.key === value} />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
