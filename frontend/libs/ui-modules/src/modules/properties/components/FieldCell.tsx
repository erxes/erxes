import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import { IField } from '../types/fieldsTypes';
import { Badge, PopoverScoped, Switch, Command } from 'erxes-ui';

export const FieldCell = ({
  field,
  value,
}: {
  field: IField;
  value: string;
}) => {
  return (
    <PopoverScoped>
      <RecordTableInlineCell.Trigger>
        <FieldCellValue field={field} value={value} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <FieldCellContent field={field} value={value} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const FieldCellValue = ({ field, value }: { field: IField; value: string }) => {
  const { multiple, type, options } = field;

  if (field.type === 'boolean') {
    return (
      <div>
        <Switch checked={!!value} />
      </div>
    );
  }

  if (field.type === 'select') {
    if (multiple) {
      const values =
        typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
      return values.map((v) => (
        <Badge key={v}>{options?.find((o) => o.value === v)?.label}</Badge>
      ));
    }
    return <div>{value}</div>;
  }
};

export const FieldCellContent = ({
  field,
  value,
}: {
  field: IField;
  value: string;
}) => {
  const { multiple, type, options } = field;

  if (field.type === 'boolean') {
    return (
      <div>
        <Switch checked={!!value} />
      </div>
    );
  }

  if (field.type === 'select') {
    return <FieldSelect field={field} value={value} />;
  }
};

export const FieldSelect = ({
  field,
  value,
}: {
  field: IField;
  value: string;
}) => {
  return (
    <Command>
      <Command.Input placeholder="Search options" />
      <Command.List>
        {field.options?.map((o) => (
          <Command.Item key={o.value} value={String(o.value)}>
            {o.label}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
