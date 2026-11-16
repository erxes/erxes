import { Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** One API the page can show: core's member or customer API, or an installed plugin's. */
export interface ApiChoice {
  value: string;
  label: string;
}

/**
 * Picks the API to show, searchable since an organisation may install many plugins:
 * core's two first, then the plugins' by name.
 */
export const ApiReferencePicker = ({
  value,
  core,
  plugins,
  onChange,
}: {
  value: string;
  core: ApiChoice[];
  plugins: ApiChoice[];
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-reference' });
  const [open, setOpen] = useState(false);
  const chosen = [...core, ...plugins].find((choice) => choice.value === value);

  const group = (heading: string, choices: ApiChoice[]) =>
    choices.length > 0 && (
      <Command.Group heading={heading}>
        {choices.map((choice) => (
          <Command.Item
            key={choice.value}
            // The search matches what the member reads: with the id too, "ecom" found "customer".
            value={choice.label}
            onSelect={() => {
              onChange(choice.value);
              setOpen(false);
            }}
          >
            <span className="truncate">{choice.label}</span>
            <Combobox.Check checked={choice.value === value} />
          </Command.Item>
        ))}
      </Command.Group>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-56">
        <Combobox.Value value={chosen?.label ?? ''} placeholder={t('pick', 'Choose an API')} />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input
            placeholder={t('search', 'Search APIs')}
            variant="secondary"
            focusOnMount
          />
          <Command.List className="max-h-80 overflow-y-auto">
            <Command.Empty>{t('no-match', 'No API matches')}</Command.Empty>
            {group(t('core', 'Core'), core)}
            {group(t('plugins', 'Plugins'), plugins)}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
