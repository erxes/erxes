import { IconCheck, IconSettings } from '@tabler/icons-react';
import type { KeyboardEvent } from 'react';
import type { Control } from 'react-hook-form';
import { Button } from '../../../components/button';
import { Form } from '../../../components/form';
import { Input } from '../../../components/input';
import { Popover } from '../../../components/popover';
import { Select } from '../../../components/select';
import type { BarcodeSize } from '../hooks/useBarcodeResize';
import { BARCODE_DIMENSION_LIMITS } from '../hooks/useBarcodeResize';
import { BARCODE_SIZE_PRESETS, useBarcodeSizeForm } from '../hooks/useBarcodeSizeForm';

const DIMENSIONS = [
  { name: 'width', label: 'Width (px)' },
  { name: 'height', label: 'Height (px)' },
] as const;

const DimensionField = ({
  control,
  name,
  label,
  onKeyDown,
}: {
  control: Control<BarcodeSize>;
  name: (typeof DIMENSIONS)[number]['name'];
  label: string;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input
            {...field}
            // An empty input is NaN, which the schema rejects.
            value={Number.isNaN(field.value) ? '' : field.value}
            onChange={(event) => field.onChange(event.target.valueAsNumber)}
            onKeyDown={onKeyDown}
            type="number"
            step={1}
            min={BARCODE_DIMENSION_LIMITS[name].min}
            max={BARCODE_DIMENSION_LIMITS[name].max}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const BarcodeSizeSettings = ({
  size,
  onResize,
}: {
  size: BarcodeSize;
  onResize: (size: BarcodeSize) => void;
}) => {
  const {
    form,
    preset,
    settingsOpen,
    applySize,
    handleSettingsOpenChange,
    handlePresetChange,
    handleInputKeyDown,
  } = useBarcodeSizeForm({ size, onResize });

  return (
    <Popover open={settingsOpen} onOpenChange={handleSettingsOpenChange}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Barcode settings"
          title="Barcode settings"
        >
          <IconSettings />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        className="w-64 text-foreground"
        onClick={(event) => event.stopPropagation()}
      >
        <Form {...form}>
          <div className="space-y-3">
            <p className="text-sm font-medium">Barcode size</p>
            <Select value={preset ? String(preset.width) : ''} onValueChange={handlePresetChange}>
              <Select.Trigger aria-label="Barcode size preset">
                <Select.Value placeholder="Custom size" />
              </Select.Trigger>
              <Select.Content>
                {BARCODE_SIZE_PRESETS.map((option) => (
                  <Select.Item key={option.width} value={String(option.width)}>
                    {option.width} × {option.height} px
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {DIMENSIONS.map(({ name, label }) => (
              <DimensionField
                key={name}
                control={form.control}
                name={name}
                label={label}
                onKeyDown={handleInputKeyDown}
              />
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                size="icon"
                aria-label="Apply barcode size"
                title="Apply barcode size"
                onClick={() => void applySize()}
              >
                <IconCheck />
              </Button>
            </div>
          </div>
        </Form>
      </Popover.Content>
    </Popover>
  );
};
