import { IconClock, IconLink, IconRefresh } from '@tabler/icons-react';
import { PosPanelRow } from '@/pos/components/pos-edit/PosFieldRow';
import { POS_PANEL_INPUT_CLASS_NAME } from '@/pos/constants/posPanel';
import { Control, Controller, useWatch } from 'react-hook-form';
import { Input, Select } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';
import { useTranslation } from 'react-i18next';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface WaitingScreenProps {
  control: Control<ScreenConfigFormData>;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  const waitingType = useWatch({ control, name: 'waitingType' });
  const isTime = waitingType === 'time';
  const changeTypeOptions = [
    { value: 'time', label: t('time') },
    { value: 'count', label: t('count') },
  ];

  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="waitingIsActive"
        label={t('waiting-screen')}
        description={labels.waitingScreenDescription}
      >
        <div className="flex flex-col gap-1">
          <Controller
            name="waitingType"
            control={control}
            render={({ field }) => (
              <PosPanelRow label={labels.changeType} icon={IconRefresh}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {changeTypeOptions.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </PosPanelRow>
            )}
          />
          <Controller
            name="waitingValue"
            control={control}
            render={({ field }) => (
              <PosPanelRow
                label={isTime ? labels.changeTime : labels.changeCount}
                icon={IconClock}
              >
                <Input
                  className={POS_PANEL_INPUT_CLASS_NAME}
                  type="number"
                  {...field}
                  value={field.value || ''}
                  placeholder={
                    isTime ? t('enter-time-in-minutes') : t('enter-count')
                  }
                />
              </PosPanelRow>
            )}
          />
          <Controller
            name="waitingContentUrl"
            control={control}
            render={({ field }) => (
              <PosPanelRow label={labels.contentUrl} icon={IconLink}>
                <Input
                  className={POS_PANEL_INPUT_CLASS_NAME}
                  type="text"
                  {...field}
                  value={field.value || ''}
                  placeholder={t('enter-content-url')}
                />
              </PosPanelRow>
            )}
          />
        </div>
      </PosSwitchRow>
    </PosSwitchList>
  );
};
