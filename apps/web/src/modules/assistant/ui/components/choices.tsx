import { ChoicePickerApi } from '@erxes/assistant-catalog';
import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import { Checkbox, Label, RadioGroup, ToggleGroup } from 'erxes-ui';
import { useId } from 'react';
import { useUiHost } from '../host';
import { numbered } from './children';
import { Field, Problems } from './field';
import { listOf, optionalText, textOf } from './values';

interface Choice {
  label: string;
  value: string;
}

const Chips = ({
  options,
  picked,
  multiple,
  disabled,
  onPick,
}: {
  options: readonly Choice[];
  picked: string[];
  multiple: boolean;
  disabled: boolean;
  onPick: (values: string[]) => void;
}) => (
  <ToggleGroup
    variant="outline"
    className="flex-wrap justify-start self-start"
    multiple={multiple}
    value={picked}
    disabled={disabled}
    onValueChange={(values) => onPick(values)}
  >
    {options.map((option) => (
      <ToggleGroup.Item key={option.value} value={option.value}>
        {option.label}
      </ToggleGroup.Item>
    ))}
  </ToggleGroup>
);

const Checks = ({
  id,
  options,
  picked,
  disabled,
  onPick,
}: {
  id: string;
  options: readonly Choice[];
  picked: string[];
  disabled: boolean;
  onPick: (values: string[]) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    {numbered(options).map(({ item: option, at }) => (
      <div key={option.value} className="flex items-center gap-2">
        <Checkbox
          id={`${id}-${at}`}
          checked={picked.includes(option.value)}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onPick(
              checked
                ? [...picked, option.value]
                : picked.filter((value) => value !== option.value),
            )
          }
        />
        <Label htmlFor={`${id}-${at}`} variant="plain">
          {option.label}
        </Label>
      </div>
    ))}
  </div>
);

const Radios = ({
  id,
  options,
  picked,
  disabled,
  onPick,
}: {
  id: string;
  options: readonly Choice[];
  picked: string[];
  disabled: boolean;
  onPick: (values: string[]) => void;
}) => (
  <RadioGroup
    value={picked[0] ?? ''}
    disabled={disabled}
    onValueChange={(value) => onPick([value])}
  >
    {numbered(options).map(({ item: option, at }) => (
      <div key={option.value} className="flex items-center gap-2">
        <RadioGroup.Item id={`${id}-${at}`} value={option.value} />
        <Label htmlFor={`${id}-${at}`} variant="plain">
          {option.label}
        </Label>
      </div>
    ))}
  </RadioGroup>
);

export const ChoicePicker = createComponentImplementation(ChoicePickerApi, ({ props }) => {
  const id = useId();
  const host = useUiHost();
  const multiple = props.variant !== 'mutuallyExclusive';
  const picked = listOf(props.value);

  const shared = {
    options: props.options.map((option) => ({ label: textOf(option.label), value: option.value })),
    picked,
    disabled: !host.live,
    onPick: (values: string[]) => props.setValue(values),
  };

  const control = multiple ? <Checks id={id} {...shared} /> : <Radios id={id} {...shared} />;

  return (
    <Field label={optionalText(props.label)} weight={props.weight}>
      {props.displayStyle === 'chips' ? <Chips multiple={multiple} {...shared} /> : control}
      <Problems id={`${id}-problems`} messages={props.validationErrors} />
    </Field>
  );
});
