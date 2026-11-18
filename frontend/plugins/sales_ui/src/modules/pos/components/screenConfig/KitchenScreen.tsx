import { IconClock, IconEye, IconRefresh } from '@tabler/icons-react';
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

interface KitchenScreenProps {
  control: Control<ScreenConfigFormData>;
}

export const KitchenScreen: React.FC<KitchenScreenProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  const kitchenType = useWatch({ control, name: 'kitchenType' });
  const showTypeOptions = [
    { value: 'all', label: t('all-saved-orders') },
    { value: 'paid', label: t('paid-all-orders') },
    { value: 'defined', label: t('defined-orders-only') },
  ];
  const statusChangeOptions = [
    { value: 'manual', label: t('manual') },
    { value: 'time', label: t('time') },
  ];

  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="kitchenIsActive"
        label={t('kitchen-screen')}
        description={labels.kitchenScreenDescription}
      >
        <div className="flex flex-col gap-1">
          <Controller
            name="kitchenShowType"
            control={control}
            render={({ field }) => (
              <PosPanelRow label={labels.showTypes} icon={IconEye}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {showTypeOptions.map((opt) => (
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
            name="kitchenType"
            control={control}
            render={({ field }) => (
              <PosPanelRow label={labels.statusChange} icon={IconRefresh}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {statusChangeOptions.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </PosPanelRow>
            )}
          />
          {kitchenType === 'time' && (
            <Controller
              name="kitchenValue"
              control={control}
              render={({ field }) => (
                <PosPanelRow label={labels.timeMinute} icon={IconClock}>
                  <Input
                    className={POS_PANEL_INPUT_CLASS_NAME}
                    type="number"
                    {...field}
                    value={field.value || ''}
                    placeholder={t('enter-time-in-minutes')}
                  />
                </PosPanelRow>
              )}
            />
          )}
        </div>
      </PosSwitchRow>
    </PosSwitchList>
  );
};
