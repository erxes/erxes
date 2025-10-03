import { Input } from 'erxes-ui';
import { Attributes } from 'ui-modules/modules/automations/components/Attributes';
import { IField } from 'ui-modules/modules/segments';

type Props = {
  propertyType: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  selectedField?: IField;
  fieldType?: string;
  onlySet?: boolean;
  ref?: any;
};

export const PlaceHolderInput = ({
  propertyType,
  value,
  onChange,
  onlySet,
  ref,
  isDisabled,
  fieldType,
  selectedField,
}: Props) => {
  return (
    <div className="flex flex-row items-end gap-2">
      <Input
        value={value}
        placeholder="Value"
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        ref={ref}
      />
      <Attributes
        ref={ref}
        selectedField={selectedField}
        contentType={propertyType}
        value={value}
        onSelect={onChange}
        isForSelectField={fieldType === 'select'}
      />
    </div>
  );
};
