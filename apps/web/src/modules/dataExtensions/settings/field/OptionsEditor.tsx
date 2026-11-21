import type { DataExtensionOption } from '@erxes/core-contract';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn, Input, Label, Select, useItemKeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Color = DataExtensionOption['color'];

/** The option colours, each a theme token's swatch. */
const COLORS = {
  gray: 'bg-muted-foreground',
  red: 'bg-destructive',
  orange: 'bg-warning',
  yellow: 'bg-warning/60',
  green: 'bg-success',
  teal: 'bg-info/60',
  blue: 'bg-info',
  purple: 'bg-primary',
  pink: 'bg-primary/60',
} satisfies Record<Color, string>;

const isColor = (value: string): value is Color => Object.hasOwn(COLORS, value);

/** `Very high` → `very_high`: the stored value a new option starts with. */
const valueOf = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[,{}"\\]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100);

const OptionRow = ({
  option,
  onChange,
  onRemove,
}: {
  option: DataExtensionOption;
  onChange: (option: DataExtensionOption) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });

  return (
    <div className="flex items-center gap-2">
      <Select
        value={option.color}
        onValueChange={(color) => isColor(color) && onChange({ ...option, color })}
      >
        <Select.Trigger
          variant="bordered"
          className="w-28"
          aria-label={t('option-color', 'Colour')}
        >
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {Object.entries(COLORS).map(([color, swatch]) => (
            <Select.Item key={color} value={color}>
              <span className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', swatch)} />
                {t(`colors.${color}`, color)}
              </span>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Input
        aria-label={t('option-label', 'Option')}
        value={option.label}
        onChange={({ target }) => onChange({ ...option, label: target.value })}
      />
      <Input
        aria-label={t('option-value', 'Stored value')}
        className="w-36"
        value={option.value}
        onChange={({ target }) => onChange({ ...option, value: target.value })}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('remove-option', 'Remove')}
        onClick={onRemove}
      >
        <IconX />
      </Button>
    </div>
  );
};

/**
 * A select's options: a colour, the label members see and the value records keep. A removed
 * value is cleared on the records that have it.
 */
export const OptionsEditor = ({
  options,
  onChange,
}: {
  options: DataExtensionOption[];
  onChange: (options: DataExtensionOption[]) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'field' });
  const keys = useItemKeys(options.length);

  // A value still made from its label follows the label as it is typed.
  const changeAt = (index: number, next: DataExtensionOption) =>
    onChange(
      options.map((item, at) => {
        if (at !== index) return item;

        const follows = next.label !== item.label && item.value === valueOf(item.label);

        return follows ? { ...next, value: valueOf(next.label) } : next;
      }),
    );

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('options', 'Options')}</Label>
      {options.map((option, index) => (
        <OptionRow
          key={keys.keyAt(index)}
          option={option}
          onChange={(next) => changeAt(index, next)}
          onRemove={() => {
            keys.removed(index);
            onChange(options.filter((_, at) => at !== index));
          }}
        />
      ))}
      <Button
        type="button"
        variant="dashed"
        className="self-start"
        onClick={() => {
          keys.added();
          onChange([...options, { value: '', label: '', color: 'gray' }]);
        }}
      >
        <IconPlus />
        {t('add-option', 'Add option')}
      </Button>
    </div>
  );
};
