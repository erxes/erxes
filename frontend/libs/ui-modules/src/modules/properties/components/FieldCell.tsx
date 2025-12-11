import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import {
  IField,
  FieldCellProps,
  FieldCellValueProps,
  FieldCellValueContentProps,
} from '../types/fieldsTypes';
import { Badge, PopoverScoped, Switch, Command, Combobox } from 'erxes-ui';

export const FieldCell = ({ mutateHook, ...props }: FieldCellProps) => {
  const { mutate, loading } = mutateHook();
  return (
    <PopoverScoped>
      <RecordTableInlineCell.Trigger>
        <FieldCellValue {...props} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <FieldCellContent mutate={mutate} loading={loading} {...props} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const FieldCellValue = ({ field, value }: FieldCellValueProps) => {
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
  customFieldsData,
  mutate,
  id,
}: FieldCellValueContentProps) => {
  // const { multiple, type, options } = field;

  const handleChange = (value: unknown) => {
    mutate({
      _id: id,
      customFieldsData: {
        ...customFieldsData,
        [field._id]: value,
      },
    });
  };

  if (field.type === 'boolean') {
    return (
      <div>
        <Switch checked={!!value} />
      </div>
    );
  }

  if (field.type === 'select') {
    return <FieldSelect field={field} value={value} onChange={handleChange} />;
  }
};

export const FieldSelect = ({
  field,
  value,
  onChange,
}: {
  field: IField;
  value: string;
  onChange: (value: unknown) => void;
}) => {
  return (
    <Command>
      <Command.Input placeholder="Search options" />
      <Command.List>
        {field.options?.map((o) => (
          <Command.Item
            key={o.value}
            value={String(o.value)}
            onSelect={() => onChange(o.value)}
          >
            {o.label}
            <Combobox.Check checked={value === o.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
