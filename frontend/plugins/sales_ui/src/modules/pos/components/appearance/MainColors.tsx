import { Control, Controller } from 'react-hook-form';
import { Label, ColorPicker } from 'erxes-ui';
import type { AppearanceFormData } from './Appearance';

interface MainColorsProps {
  control: Control<AppearanceFormData>;
}

export const MainColors: React.FC<MainColorsProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="space-y-2">
          <Label>PRIMARY</Label>
          <Controller
            name="bodyColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="w-20 h-8"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>SECONDARY</Label>
          <Controller
            name="headerColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="w-20 h-8"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>THIRD</Label>
          <Controller
            name="footerColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="w-20 h-8"
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
