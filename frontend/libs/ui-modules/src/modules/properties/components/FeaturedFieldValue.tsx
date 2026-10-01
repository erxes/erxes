import { IconLock } from '@tabler/icons-react';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import { IField } from '../types/fieldsTypes';

const formatValue = (field: IField, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  const optionLabel = (option: unknown) =>
    field.options?.find(({ value: optionValue }) => optionValue === option)
      ?.label ?? String(option);

  switch (field.type) {
    case 'number':
      return Number(value).toLocaleString();
    case 'boolean':
      return value ? '✓' : '✗';
    case 'date':
      return new Date(value as string).toLocaleDateString();
    case 'select':
      return optionLabel(value);
    case 'multiSelect':
      return (Array.isArray(value) ? value : [value])
        .map(optionLabel)
        .join(', ');
    default:
      return String(value);
  }
};

// Featured fields are written by the plugin feature that owns them (a loyalty
// balance, a tier); people read them but never edit them here.
export const FeaturedFieldValue = ({
  field,
  value,
  inCell,
}: {
  field: IField;
  value: unknown;
  inCell?: boolean;
}) => {
  const text = formatValue(field, value);
  const title = `Managed by ${field.owner?.plugin}`;

  if (inCell) {
    return (
      <RecordTableInlineCell title={title}>
        <span className="truncate">{text}</span>
      </RecordTableInlineCell>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm"
      title={title}
    >
      <span className="truncate">{text}</span>
      <IconLock className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
    </div>
  );
};
