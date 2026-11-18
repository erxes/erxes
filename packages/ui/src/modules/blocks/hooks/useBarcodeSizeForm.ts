import type { KeyboardEvent } from 'react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { BarcodeSize } from './useBarcodeResize';
import { BARCODE_DIMENSION_LIMITS } from './useBarcodeResize';

/** Width and height in whole pixels within their limits, with messages in the UI's language. */
const barcodeSizeSchema = (t: TFunction<'ui', 'editor'>) => {
  const dimension = ({ min, max }: { min: number; max: number }) => {
    const range = t('size-range', 'Enter a whole number from {{min}} to {{max}}', { min, max });

    return z
      .number({ error: t('size-number', 'Enter a number') })
      .int({ error: range })
      .min(min, { error: range })
      .max(max, { error: range });
  };

  return z.object({
    width: dimension(BARCODE_DIMENSION_LIMITS.width),
    height: dimension(BARCODE_DIMENSION_LIMITS.height),
  });
};

export const BARCODE_SIZE_PRESETS: BarcodeSize[] = [
  { width: 113, height: 78 },
  { width: 141, height: 98 },
  { width: 169, height: 118 },
  { width: 211, height: 147 },
  { width: 282, height: 196 },
];

/** The settings popover's size form: a preset or an exact width and height. */
export const useBarcodeSizeForm = ({
  size,
  onResize,
}: {
  size: BarcodeSize;
  onResize: (size: BarcodeSize) => void;
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation('ui', { keyPrefix: 'editor' });

  const form = useForm<BarcodeSize>({
    resolver: zodResolver(barcodeSizeSchema(t)),
    defaultValues: size,
  });

  const values = useWatch({ control: form.control });

  const preset = BARCODE_SIZE_PRESETS.find(
    (candidate) => candidate.width === values.width && candidate.height === values.height,
  );

  const applySize = form.handleSubmit((submitted) => {
    onResize(submitted);
    setSettingsOpen(false);
  });

  const handleSettingsOpenChange = (open: boolean) => {
    if (open) form.reset(size);
    setSettingsOpen(open);
  };

  const handlePresetChange = (value: string) => {
    const selected = BARCODE_SIZE_PRESETS.find((candidate) => String(candidate.width) === value);

    if (selected) form.reset(selected);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    void applySize();
  };

  return {
    form,
    preset,
    settingsOpen,
    applySize,
    handleSettingsOpenChange,
    handlePresetChange,
    handleInputKeyDown,
  };
};
