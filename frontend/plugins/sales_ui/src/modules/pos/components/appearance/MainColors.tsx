import { Control, Controller } from 'react-hook-form';
import { Label, ColorPicker } from 'erxes-ui';
import type { AppearanceFormData } from './Appearance';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface MainColorsProps {
  control: Control<AppearanceFormData>;
}

export const MainColors: React.FC<MainColorsProps> = ({ control }) => {
  const labels = usePosSettingsLabels();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2 rounded-lg border p-3">
          <Label variant="peer" className="text-sm font-medium">
            {labels.primary}
          </Label>
          <Controller
            name="bodyColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="w-24 h-8"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <Label variant="peer" className="text-sm font-medium">
            {labels.secondary}
          </Label>
          <Controller
            name="headerColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="w-24 h-8"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <Label variant="peer" className="text-sm font-medium">
            {labels.third}
          </Label>
          <Controller
            name="footerColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="w-24 h-8"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};
