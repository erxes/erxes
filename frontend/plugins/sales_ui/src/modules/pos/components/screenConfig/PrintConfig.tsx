import { Control, Controller } from 'react-hook-form';
import { Label, Switch } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';
import { useTranslation } from 'react-i18next';

interface PrintConfigProps {
  control: Control<ScreenConfigFormData>;
}

export const PrintConfig: React.FC<PrintConfigProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="kitchenIsPrint"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>{t('KITCHEN-PRINT')}</Label>
          </div>
        )}
      />

      <Controller
        name="waitingIsPrint"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>{t('WAITING-PRINT')}</Label>
          </div>
        )}
      />
    </div>
  );
};
