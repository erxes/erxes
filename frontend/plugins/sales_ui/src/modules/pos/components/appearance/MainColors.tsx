import { Control, Controller } from 'react-hook-form';
import { Label, ColorPicker } from 'erxes-ui';
import type { AppearanceFormData } from './Appearance';
import { useTranslation } from 'react-i18next';

interface MainColorsProps {
  control: Control<AppearanceFormData>;
}

export const MainColors: React.FC<MainColorsProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="space-y-2">
          <Label>{t('primary')}</Label>
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
          <Label>{t('secondary')}</Label>
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
          <Label>{t('third')}</Label>
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
