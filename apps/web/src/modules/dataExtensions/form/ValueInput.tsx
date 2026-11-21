import type { DataExtensionFieldType } from '@erxes/core-contract';
import type { ComponentType } from 'react';
import {
  BooleanValueInput,
  DateValueInput,
  JsonValueInput,
  LongTextValueInput,
  NumberValueInput,
  RatingValueInput,
  TextValueInput,
} from './BasicInputs';
import {
  MemberValueInput,
  MultiSelectValueInput,
  RelationValueInput,
  SelectValueInput,
} from './ChoiceInputs';
import {
  AddressValueInput,
  CurrencyValueInput,
  FullNameValueInput,
  ListValueInput,
} from './CompositeInputs';
import { FilesValueInput } from './FilesInput';
import type { ValueInputProps } from './inputProps';
import { useValueText } from './valueText';

type Writable = Exclude<DataExtensionFieldType, 'formula' | 'rollup' | 'autoNumber'>;

/** The input for each type a member types values of. */
const INPUTS = {
  text: TextValueInput,
  email: TextValueInput,
  phone: TextValueInput,
  url: TextValueInput,
  longText: LongTextValueInput,
  number: NumberValueInput,
  percent: NumberValueInput,
  currency: CurrencyValueInput,
  rating: RatingValueInput,
  boolean: BooleanValueInput,
  date: DateValueInput,
  dateTime: DateValueInput,
  select: SelectValueInput,
  multiSelect: MultiSelectValueInput,
  emails: ListValueInput,
  phones: ListValueInput,
  links: ListValueInput,
  fullName: FullNameValueInput,
  address: AddressValueInput,
  member: MemberValueInput,
  files: FilesValueInput,
  relation: RelationValueInput,
  json: JsonValueInput,
} satisfies Record<Writable, ComponentType<ValueInputProps>>;

const isWritable = (type: DataExtensionFieldType): type is Writable => Object.hasOwn(INPUTS, type);

/** A value as text, for a computed or read-only field. */
const ReadOnlyValue = ({ field, value, id }: ValueInputProps) => {
  const text = useValueText();

  return (
    <p id={id} className="min-h-7 py-1 text-sm">
      {text(field, value)}
    </p>
  );
};

/** The control a field's type takes; read-only text for computed fields and `locked` ones. */
export const ValueInput = ({ locked, ...props }: ValueInputProps & { locked: boolean }) => {
  const { type } = props.field;

  if (locked || !isWritable(type)) return <ReadOnlyValue {...props} />;

  const Input = INPUTS[type];

  return <Input {...props} />;
};
