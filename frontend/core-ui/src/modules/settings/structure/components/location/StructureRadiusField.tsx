import { Input, Label, Slider, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  RADIUS_PRESETS,
  RADIUS_SLIDER_MAX,
  RADIUS_SLIDER_STEP,
} from '../../constants/structureLocation';

const formatRadius = (meters: number) =>
  meters >= 1000 ? `${meters / 1000} km` : `${meters} m`;

type TStructureRadiusFieldProps = {
  radius: number;
  onChange: (value: number) => void;
};

export const StructureRadiusField = ({
  radius,
  onChange,
}: TStructureRadiusFieldProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const sliderMax = Math.max(RADIUS_SLIDER_MAX, radius);

  const handleSlider = ([value]: number[]) => onChange(value);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    onChange(Number.isFinite(value) && value > 0 ? value : 0);
  };

  const handlePreset = (value: string) => {
    if (value) {
      onChange(Number(value));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{t('radius')}</Label>
        <div className="flex items-center gap-1.5">
          <Input
            value={radius}
            onChange={handleInput}
            inputMode="numeric"
            aria-label={t('radius')}
            className="h-7 w-20 text-right"
          />
          <span className="text-xs text-muted-foreground">m</span>
        </div>
      </div>
      <Slider
        value={[radius]}
        max={sliderMax}
        step={RADIUS_SLIDER_STEP}
        onValueChange={handleSlider}
      />
      <ToggleGroup
        type="single"
        size="sm"
        value={String(radius)}
        onValueChange={handlePreset}
        className="flex-wrap justify-start gap-1.5"
      >
        {RADIUS_PRESETS.map((preset) => (
          <ToggleGroup.Item
            key={preset}
            value={String(preset)}
            className="rounded-full border data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          >
            {formatRadius(preset)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </div>
  );
};
