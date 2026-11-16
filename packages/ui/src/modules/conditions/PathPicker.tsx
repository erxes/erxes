import { useTranslation } from 'react-i18next';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import type { TConditionField } from './conditions';

const GROUP_LABELS: Record<string, string> = {
  fields: 'Fields',
  lead: 'Lead',
  custom: 'Properties',
  company: 'Company',
  activity: 'Activity',
};

const CUSTOM_PATH = '__custom__';

const groupOf = (field: TConditionField) => field.group ?? 'fields';

const FieldItems = ({ fields }: { fields: TConditionField[] }) =>
  fields.map((field) => (
    <Select.Item key={field.path} value={field.path}>
      {field.label}
    </Select.Item>
  ));

const GroupedFieldItems = ({ fields }: { fields: TConditionField[] }) => {
  const { t } = useTranslation('automations');

  return [...new Set(fields.map(groupOf))].map((group) => (
    <Select.Group key={group}>
      <Select.Label>{t(`field-group.${group}`, GROUP_LABELS[group] ?? group)}</Select.Label>
      <FieldItems fields={fields.filter((field) => groupOf(field) === group)} />
    </Select.Group>
  ));
};

/** A field from the catalog, or any path typed by hand (`event.payload.amount`, `steps.x.output.y`). */
export const PathPicker = ({
  value,
  fields,
  onChange,
  disabled,
}: {
  value: string;
  fields: TConditionField[];
  onChange: (path: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const known = fields.some((field) => field.path === value);
  const grouped = fields.some((field) => field.group);

  return (
    <div className="flex min-w-0 gap-1">
      <Select
        value={known ? value : CUSTOM_PATH}
        onValueChange={(path) => onChange(path === CUSTOM_PATH ? '' : path)}
        disabled={disabled}
      >
        <Select.Trigger className="h-8 w-full min-w-0">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {grouped ? <GroupedFieldItems fields={fields} /> : <FieldItems fields={fields} />}
          {!grouped && (
            <Select.Item value={CUSTOM_PATH}>{t('custom-path', 'Another value…')}</Select.Item>
          )}
        </Select.Content>
      </Select>
      {!known && (
        <Input
          text="code"
          className="h-8 w-full min-w-0"
          placeholder="event.payload.amount"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
};
