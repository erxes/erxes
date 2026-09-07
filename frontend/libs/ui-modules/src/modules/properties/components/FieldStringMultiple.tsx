import { Badge, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { getStringArray } from '../propertyUtils';
import { SpecificFieldProps } from './Field';
import { StringListEditor } from './StringListEditor';

export const FieldStringMultiple = (props: SpecificFieldProps) => {
  const { inCell } = props;
  if (inCell) {
    return <FieldStringMultipleInCell {...props} />;
  }
  return <FieldStringMultipleDetail {...props} />;
};

export const FieldStringMultipleInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;
  const currentValue = getStringArray(value);

  return (
    <PopoverScoped scope={props.id}>
      <RecordTableInlineCell.Trigger>
        {currentValue.map((item, index) => (
          <Badge key={`${item}-${index}`} variant="secondary">
            {item}
          </Badge>
        ))}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-64 p-1">
        <StringListEditor value={currentValue} onChange={handleChange} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldStringMultipleDetail = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;

  return (
    <StringListEditor value={getStringArray(value)} onChange={handleChange} />
  );
};
