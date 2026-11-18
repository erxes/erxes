import { IconPhone, IconWorld } from '@tabler/icons-react';
import { PosPanelRow } from '@/pos/components/pos-edit/PosFieldRow';
import { POS_PANEL_INPUT_CLASS_NAME } from '@/pos/constants/posPanel';
import { Control, Controller } from 'react-hook-form';
import { Input } from 'erxes-ui';
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
      <div className="flex flex-col gap-1">
        <PosPanelRow label={labels.website} icon={IconWorld}>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                className={POS_PANEL_INPUT_CLASS_NAME}
                {...field}
                value={field.value || ''}
                placeholder={t('enter-web-url')}
              />
            )}
          />
        </PosPanelRow>

        <PosPanelRow label={labels.phone} icon={IconPhone}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                className={POS_PANEL_INPUT_CLASS_NAME}
                {...field}
                value={field.value || ''}
                placeholder={t('enter-phone-number')}
              />
            )}
          />
        </PosPanelRow>
      </div>
    </div>
  );
};
