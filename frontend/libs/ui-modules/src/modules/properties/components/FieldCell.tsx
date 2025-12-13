import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import {
  IField,
  FieldCellProps,
  FieldCellValueProps,
  FieldCellValueContentProps,
} from '../types/fieldsTypes';
import { Badge, PopoverScoped, Switch, Command, Combobox } from 'erxes-ui';
import { FieldRelation } from './FieldRelation';
import { memo, useState } from 'react';

export const FieldCell = ({
  id,
  customFieldsData,
  mutateHook,
  value,
  ...props
}: FieldCellProps) => {
  const { mutate, loading } = mutateHook();
  const [currentValue, setCurrentValue] = useState<unknown>(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (value: unknown) => {
    mutate({
      _id: id,
      customFieldsData: {
        ...customFieldsData,
        [props.field._id]: value,
      },
    });
    setCurrentValue(value);
    setIsOpen(false);
  };

  if (props.field.type === 'relation') {
    return (
      <FieldRelation
        {...props}
        value={currentValue}
        handleChange={handleChange}
        loading={loading}
      />
    );
  }
  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <RecordTableInlineCell.Trigger>
        <FieldCellValue {...props} value={currentValue} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <FieldCellContent
          value={currentValue}
          handleChange={handleChange}
          loading={loading}
          {...props}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const MemoizedFieldCell = memo(FieldCell);

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
    return <div>{value as string}</div>;
  }
};

export const FieldCellContent = ({
  field,
  value,
  handleChange,
}: FieldCellValueContentProps) => {
  // const { multiple, type, options } = field;

  if (field.type === 'boolean') {
    return (
      <div>
        <Switch checked={!!value} />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <FieldSelect
        field={field}
        value={String(value)}
        onChange={handleChange}
      />
    );
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
            value={o.value as string}
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
