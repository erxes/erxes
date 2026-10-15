import {
  ManagePropertyCustomInput,
  useManagePropertyCustomInput,
} from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyCustomInput';
import { TConditionProperty } from '@/automations/components/builder/sidebar/components/content/action/conditional/conditionProperties';
import { Input, Select, TPropertyInputMeta } from 'erxes-ui';
import { PlaceholderInput, TPlaceholderInputSuggestion } from 'ui-modules';

/**
 * The compare-with input follows the property: its options as a select, a
 * record field's own picker (stage, status…), a number, or free text with
 * variables.
 */
export const AutomationConditionValueInput = ({
  property,
  value,
  meta,
  onChange,
  onMetaChange,
}: {
  property?: TConditionProperty;
  value: string;
  meta?: TPropertyInputMeta;
  onChange: (value: string) => void;
  onMetaChange: (meta: TPropertyInputMeta) => void;
}) => {
  const CustomInput = useManagePropertyCustomInput(
    property?.propertyType,
    property?.field,
  );

  if (property?.valueKind === 'component' && CustomInput) {
    return (
      <ManagePropertyCustomInput
        CustomInput={CustomInput}
        value={value}
        onChange={onChange}
        meta={meta}
        onMetaChange={onMetaChange}
      />
    );
  }

  if (property?.valueKind === 'options' && property.options?.length) {
    return (
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger className="w-full">
          <Select.Value placeholder="Pick a value" />
        </Select.Trigger>
        <Select.Content>
          {property.options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (property?.valueKind === 'number') {
    return (
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <PlaceholderInput
      value={value}
      onChange={onChange}
      enabled={
        property?.valueKind === 'date'
          ? [TPlaceholderInputSuggestion.Date]
          : undefined
      }
    />
  );
};
