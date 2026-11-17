import { Control, Controller } from 'react-hook-form';
import { Label, Input } from 'erxes-ui';
import type { AppearanceFormData } from './Appearance';
import { useTranslation } from 'react-i18next';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface InfosProps {
  control: Control<AppearanceFormData>;
}

export const Infos: React.FC<InfosProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label variant="peer" className="text-sm font-medium">
            {labels.website}
          </Label>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder={t('enter-web-url')}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label variant="peer" className="text-sm font-medium">
            {labels.phone}
          </Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder={t('enter-phone-number')}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};
