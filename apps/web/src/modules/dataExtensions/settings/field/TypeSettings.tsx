import type { DataExtensionFieldSettings } from '@erxes/core-contract';
import { Input } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { numberOf } from '../../form/inputProps';
import { isNumeric } from '../../fieldTypes';
import { SettingRow, SwitchRow } from '../SettingRow';
import type { FieldDraft, SetDraft, SetSettings } from './fieldDraft';
import { FormulaEditor } from './FormulaEditor';
import { OptionsEditor } from './OptionsEditor';
import { RollupSettings } from './RollupSettings';

type NumberSetting = 'min' | 'max' | 'precision' | 'scale' | 'maxLength' | 'digits';

/** One number setting; cleared when emptied. */
const NumberRow = ({
  name,
  label,
  settings,
  setSettings,
}: {
  name: NumberSetting;
  label: string;
  settings: DataExtensionFieldSettings;
  setSettings: SetSettings;
}) => {
  const id = useId();

  const change = (text: string) => {
    const patch: Partial<DataExtensionFieldSettings> = {};

    patch[name] = numberOf(text) ?? undefined;
    setSettings(patch);
  };

  return (
    <SettingRow label={label} htmlFor={id}>
      <Input
        id={id}
        type="number"
        value={settings[name] ?? ''}
        onChange={({ target }) => change(target.value)}
      />
    </SettingRow>
  );
};

/** An auto number's text before it and the digits it pads to: `PRJ-` and 4 give PRJ-0042. */
const AutoNumberSettings = ({
  settings,
  setSettings,
}: {
  settings: DataExtensionFieldSettings;
  setSettings: SetSettings;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const id = useId();

  return (
    <div className="flex gap-3">
      <SettingRow label={t('prefix', 'Prefix')} htmlFor={id}>
        <Input
          id={id}
          value={settings.prefix ?? ''}
          placeholder="PRJ-"
          onChange={({ target }) => setSettings({ prefix: target.value || undefined })}
        />
      </SettingRow>
      <NumberRow
        name="digits"
        label={t('digits', 'Digits')}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
};

/** Bounds and decimals of a number, percent or currency amount; a currency's own code. */
const NumberSettings = ({
  draft,
  setSettings,
}: {
  draft: FieldDraft;
  setSettings: SetSettings;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const currencyId = useId();
  const { settings } = draft;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberRow
        name="min"
        label={t('min', 'Smallest')}
        settings={settings}
        setSettings={setSettings}
      />
      <NumberRow
        name="max"
        label={t('max', 'Largest')}
        settings={settings}
        setSettings={setSettings}
      />
      {draft.type === 'currency' ? (
        <SettingRow label={t('currency', 'Currency')} htmlFor={currencyId}>
          <Input
            id={currencyId}
            value={settings.currency ?? ''}
            maxLength={3}
            placeholder="USD"
            onChange={({ target }) =>
              setSettings({ currency: target.value.toUpperCase() || undefined })
            }
          />
        </SettingRow>
      ) : (
        <NumberRow
          name="precision"
          label={t('precision', 'Decimals')}
          settings={settings}
          setSettings={setSettings}
        />
      )}
    </div>
  );
};

/** What a field of the draft's type takes besides the common settings. */
export const TypeSettings = ({
  recordType,
  draft,
  set,
  setSettings,
}: {
  recordType: string;
  draft: FieldDraft;
  set: SetDraft;
  setSettings: SetSettings;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const { type, settings } = draft;

  if (isNumeric(type)) return <NumberSettings draft={draft} setSettings={setSettings} />;

  switch (type) {
    case 'text':
    case 'longText':
      return (
        <NumberRow
          name="maxLength"
          label={t('max-length', 'Longest text')}
          settings={settings}
          setSettings={setSettings}
        />
      );
    case 'rating':
      return (
        <NumberRow
          name="scale"
          label={t('scale', 'Stars (3 to 10)')}
          settings={settings}
          setSettings={setSettings}
        />
      );
    case 'member':
      return (
        <SwitchRow
          label={t('multiple', 'Several members')}
          checked={Boolean(settings.multiple)}
          onCheckedChange={(multiple) => setSettings({ multiple: multiple || undefined })}
        />
      );
    case 'select':
    case 'multiSelect':
      return <OptionsEditor options={draft.options} onChange={(options) => set({ options })} />;
    case 'autoNumber':
      return <AutoNumberSettings settings={settings} setSettings={setSettings} />;
    case 'formula':
      return (
        <FormulaEditor
          recordType={recordType}
          fieldKey={draft.key}
          expression={settings.formula?.expression ?? ''}
          onChange={(expression) =>
            setSettings({ formula: expression ? { expression } : undefined })
          }
        />
      );
    case 'rollup':
      return (
        <RollupSettings
          recordType={recordType}
          rollup={settings.rollup ?? {}}
          onChange={({ relation, op, ...rest }) =>
            setSettings({ rollup: relation ? { ...rest, relation, op: op ?? 'count' } : undefined })
          }
        />
      );
    default:
      return null;
  }
};
