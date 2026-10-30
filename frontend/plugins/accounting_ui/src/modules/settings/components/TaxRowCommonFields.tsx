import { useTranslation } from 'react-i18next';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelField, PanelFormRow } from 'ui-modules';
import {
  SettingsPanelNumberField,
  SettingsPanelSelect,
  SettingsPanelTextField,
} from '@/settings/components/panel/SettingsPanelFields';

type TTaxRowOptions = {
  kinds: string[];
  kindLabels: Record<string, string>;
  statuses: string[];
  statusLabels: Record<string, string>;
};

export interface ITaxRowPanelValues {
  number?: string | null;
  name?: string | null;
  kind?: string | null;
  percent?: number | null;
  status?: string | null;
}

export type TTaxRowPanelChange = Partial<{
  number: string;
  name: string;
  kind: string;
  percent: number;
  status: string;
}>;

const toOptions = (
  values: string[],
  labels: Record<string, string>,
  t: (key: string) => string,
) => values.map((value) => ({ value, label: t(labels[value]) }));

export const TaxRowCommonFields = <T extends FieldValues>({
  control,
  kinds,
  kindLabels,
  statuses,
  statusLabels,
}: TTaxRowOptions & { control: Control<T> }) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      <Form.Field
        control={control}
        name={'number' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('number')}
            required
            error={fieldState.error?.message}
          >
            <Input
              {...field}
              value={field.value ?? ''}
              autoFocus
              autoComplete="off"
              placeholder={t('number')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name={'name' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('name')}
            required
            error={fieldState.error?.message}
          >
            <Input
              {...field}
              value={field.value ?? ''}
              autoComplete="off"
              placeholder={t('name')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name={'kind' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('type')}
            required
            error={fieldState.error?.message}
          >
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-type')}
              options={toOptions(kinds, kindLabels, t)}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name={'percent' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('percentage')}
            required
            error={fieldState.error?.message}
          >
            <Input
              type="number"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              min={0}
              max={100}
              placeholder={t('percentage')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={control}
        name={'status' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('status')}
            required
            error={fieldState.error?.message}
          >
            <SettingsPanelSelect
              value={field.value}
              placeholder={t('select-status')}
              options={toOptions(statuses, statusLabels, t)}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />
    </>
  );
};

export const TaxRowCommonPanelFields = ({
  scope,
  row,
  kinds,
  kindLabels,
  statuses,
  statusLabels,
  onSave,
}: TTaxRowOptions & {
  scope: string;
  row: ITaxRowPanelValues;
  onSave: (fields: TTaxRowPanelChange) => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <>
      <PanelField label={t('number')}>
        <SettingsPanelTextField
          scope={`${scope}.number`}
          value={row.number || ''}
          placeholder={t('number')}
          onSave={(number) => number.trim() && onSave({ number })}
        />
      </PanelField>
      <PanelField label={t('name')}>
        <SettingsPanelTextField
          scope={`${scope}.name`}
          value={row.name || ''}
          placeholder={t('name')}
          onSave={(name) => name.trim() && onSave({ name })}
        />
      </PanelField>
      <PanelField label={t('type')}>
        <SettingsPanelSelect
          value={row.kind || ''}
          placeholder={t('select-type')}
          options={toOptions(kinds, kindLabels, t)}
          onValueChange={(kind) => onSave({ kind })}
        />
      </PanelField>
      <PanelField label={t('percentage')}>
        <SettingsPanelNumberField
          scope={`${scope}.percent`}
          value={row.percent}
          min={0}
          max={100}
          placeholder={t('percentage')}
          onSave={(percent) => onSave({ percent })}
        />
      </PanelField>
      <PanelField label={t('status')}>
        <SettingsPanelSelect
          value={row.status || ''}
          placeholder={t('select-status')}
          options={toOptions(statuses, statusLabels, t)}
          onValueChange={(status) => onSave({ status })}
        />
      </PanelField>
    </>
  );
};
